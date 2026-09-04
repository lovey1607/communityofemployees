// POST /api/rfps/:id/award — the poster awards one bid.
// Runs in a transaction: winner accepted, everyone else rejected, RFP locked.

import { and, eq, isNull, ne } from 'drizzle-orm';
import { db } from '@/lib/db';
import { bids, rfps, users, vendorProfiles } from '@/lib/db/schema';
import { requireActiveUser } from '@/lib/server/guards';
import { recordAudit } from '@/lib/server/audit';
import { sendBidAwardedEmail } from '@/lib/server/email';
import {
  assertSameOrigin,
  badRequest,
  clientIp,
  forbidden,
  jsonOk,
  notFound,
  parseJson,
  route,
} from '@/lib/server/http';
import { awardBidSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const POST = route(async (request: Request, ctx: Ctx) => {
  assertSameOrigin(request);
  const { id: rfpId } = await ctx.params;
  const caller = await requireActiveUser();
  const { bidId } = await parseJson(request, awardBidSchema);

  const [rfp] = await db
    .select()
    .from(rfps)
    .where(and(eq(rfps.id, rfpId), isNull(rfps.deletedAt)))
    .limit(1);
  if (!rfp) throw notFound('That requirement does not exist.');
  if (rfp.corporateUserId !== caller.user.id) throw forbidden('Only the poster can award this.');
  if (rfp.status === 'awarded' || rfp.status === 'completed') {
    throw badRequest('This requirement has already been awarded.');
  }
  if (rfp.status !== 'open' && rfp.status !== 'bid-received') {
    throw badRequest('This requirement is not open for award.');
  }

  const [winner] = await db
    .select({ bid: bids, vendor: vendorProfiles, vendorUser: users })
    .from(bids)
    .innerJoin(vendorProfiles, eq(vendorProfiles.id, bids.vendorId))
    .innerJoin(users, eq(users.id, bids.vendorUserId))
    .where(and(eq(bids.id, bidId), eq(bids.rfpId, rfpId), isNull(bids.deletedAt)))
    .limit(1);
  if (!winner) throw notFound('That bid is not on this requirement.');
  if (winner.bid.status === 'withdrawn') throw badRequest('That bid has been withdrawn.');
  if (winner.bid.validUntil && winner.bid.validUntil.getTime() < Date.now()) {
    throw badRequest('That quote has expired. Ask the vendor to re-submit.');
  }

  const now = new Date();
  await db.transaction(async (tx) => {
    await tx
      .update(bids)
      .set({ status: 'accepted', updatedAt: now })
      .where(eq(bids.id, bidId));
    await tx
      .update(bids)
      .set({ status: 'rejected', updatedAt: now })
      .where(and(eq(bids.rfpId, rfpId), ne(bids.id, bidId), eq(bids.status, 'pending')));
    await tx
      .update(rfps)
      .set({ status: 'awarded', acceptedBidId: bidId, awardedAt: now, updatedAt: now })
      .where(eq(rfps.id, rfpId));
  });

  await recordAudit(caller, {
    action: 'rfp.awarded',
    entityType: 'rfp',
    entityId: rfpId,
    metadata: { bidId, vendorUserId: winner.bid.vendorUserId, amount: winner.bid.totalPrice },
    ip: clientIp(request),
  });

  // Both sides are notified. WhatsApp is the obvious second channel here —
  // see README "Notifications" for where that plugs in.
  const title = `${rfp.companyName} · ${rfp.category}`;
  await Promise.all([
    sendBidAwardedEmail(winner.vendorUser.email, {
      rfpTitle: title,
      amount: winner.bid.totalPrice,
      counterpart: rfp.companyName,
      won: true,
    }),
    sendBidAwardedEmail(caller.user.email, {
      rfpTitle: title,
      amount: winner.bid.totalPrice,
      counterpart: winner.vendor.companyName,
      won: false,
    }),
  ]);

  return jsonOk({ status: 'awarded', bidId, vendorCompany: winner.vendor.companyName });
});
