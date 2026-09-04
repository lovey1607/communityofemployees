// app/vendors/page.tsx — public directory + "near me" map.

import { NearbyVendors } from '@/components/maps/NearbyVendors';
import { PublicNav } from '@/components/nav/PublicNav';
import { BlurredCyberHubBackground } from '@/components/canvas/BlurredCyberHubBackground';

export const metadata = {
  title: 'Vendors near you — COE',
  description:
    'Approved COE vendors across Gurgaon: Cyber City, Golf Course Road, Sohna Road and Udyog Vihar. Sort by distance from where you are.',
};

export default function VendorsPage() {
  return (
    <>
      <PublicNav />
      <main style={{ minHeight: '100vh', paddingTop: 104, paddingBottom: 64, background: '#0B0F17', position: 'relative' }}>
        <BlurredCyberHubBackground />
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 1180, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ margin: '0 0 6px', fontSize: 11, letterSpacing: '.16em', color: '#f97316', textTransform: 'uppercase' }}>
            Currently live in Gurgaon
          </p>
          <h1 style={{ margin: '0 0 8px', fontSize: 30, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
            Who&apos;s near your office
          </h1>
          <p style={{ margin: '0 0 26px', fontSize: 14.5, color: 'rgba(255,255,255,0.6)', maxWidth: 620, lineHeight: 1.6 }}>
            Every vendor here has been through admin review. Turf near Cyber City, banquets off Golf
            Course Road, caterers who actually deliver to Udyog Vihar by 1pm.
          </p>
          <NearbyVendors />
        </div>
      </main>
    </>
  );
}
