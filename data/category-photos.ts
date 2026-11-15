// ============================================================
// data/category-photos.ts — representative photos per category.
//
// Source: Unsplash (free photos only; Unsplash+ excluded), collected
// via Firecrawl on 15 Nov 2026 from unsplash.com/s/photos/<topic>.
// The Unsplash License allows free commercial use without permission;
// we still credit the photographer on every image.
//
// These are NOT photos of the listed community. Cards label them
// “Representative photo”. A listing's own `imageUrl` (supplied by the
// organiser) always wins. We deliberately don't copy organisers'
// Instagram/WhatsApp photos or logos without their permission.
// ============================================================
import type { CommunityCategory } from './communities';

export type Photo = { id: string; by: string; page: string; alt: string };
const P = (id: string, by: string, page: string, alt: string): Photo => ({ id, by, page, alt });

const T: Record<string, Photo[]> = {
  run: [
    P('1760315972424-1637530daead', 'Mike Cox', 'a-group-of-runners-participating-in-a-marathon-race-laxDhpYqZZc', 'A group of runners in a marathon'),
    P('1552674605-db6ffd4facb5', 'Fitsum Admasu', 'silhouette-of-three-women-running-on-grey-concrete-road-oGv9xIl7DkY', 'Three women running on a road'),
    P('1758683658297-d7c2512dcb0a', 'Quan-You Zhang', 'a-group-of-runners-in-a-marathon-race-dNle_4cOc38', 'Runners in a race'),
    P('1571008887538-b36bb32f4571', 'sporlab', 'pair-of-blue-and-white-adidas-running-shoes-XiZ7pRvCzro', 'Running shoes'),
  ],
  cycle: [
    P('1517649763962-0c623066013b', 'Markus Spiske', 'group-of-cyclist-on-asphalt-road-WUehAgqO5hE', 'Group of cyclists on a road'),
    P('1735216228027-fe31c23474ce', 'David Dvořáček', 'a-group-of-people-riding-bikes-down-a-road-dsIyg_6406g', 'People riding bikes down a road'),
    P('1713937071114-e94d5f8053a0', 'Diego Rodriguez', 'a-group-of-people-riding-bikes-down-a-road-OlSIZV0AeAw', 'People riding bikes'),
    P('1628440167042-197d8eb88929', 'Brent Olson', 'person-in-green-and-black-shorts-riding-on-black-and-red-bicycle-_aV5y0nLNew', 'Cyclist riding'),
  ],
  sports: [
    P('1659318006095-4d44845f3a1b', 'Brendan Sapp', 'pickleball-paddle-and-balls-on-court-l5UX-BuRc3E', 'Pickleball paddle and balls on a court'),
    P('1786555208106-c89b78ef80de', 'Godspower Abdulahi', 'young-men-playing-soccer-in-park-_JvycaRMWdI', 'Young men playing football in a park'),
    P('1626058914034-25e3ad6fae3c', 'Chuko Cribb', 'group-of-people-playing-soccer-during-daytime-3iQDAOb0438', 'People playing football'),
    P('1761286753703-570ed91dd90e', 'Abror Alarice', 'man-playing-badminton-on-a-court-at-night-xAUuSl7oiY4', 'Badminton at night'),
    P('1785240029703-c37147e77e56', 'Vadim Yefremov', 'group-of-men-playing-soccer-on-a-grassy-field-kCuz72oWC54', 'Football on a grassy field'),
  ],
  fitness: [
    P('1775654792298-797c44f5d439', 'Beta Boulders', 'two-women-high-fiving-after-rock-climbing-2qK9YbtIrc8', 'Two women high-fiving after climbing'),
    P('1591258370814-01609b341790', 'Logan Weaver', 'woman-in-black-tank-top-and-black-leggings-lying-on-black-floor-u76Gd0hP5w4', 'Workout on the floor'),
    P('1607962837359-5e7e89f86776', 'Gabin Vallet', 'man-in-black-t-shirt-and-black-shorts-running-on-road-during-daytime-J154nEkpzlQ', 'Running workout'),
  ],
  hike: [
    P('1770563182367-1e1b5c094b02', 'Timur Shakerzianov', 'group-of-hikers-walking-on-a-path-in-a-forest-Xsit2UbxCec', 'Hikers on a forest path'),
    P('1629185752152-fe65698ddee4', 'Justin Buisson', 'people-hiking-on-mountain-trail-vIluu0IH6Ps', 'Four people hiking a mountain trail'),
    P('1551632811-561732d1e306', 'Toomas Tartes', 'hikers-on-trail-toward-mountain-peaks-Yizrl9N_eDA', 'Hikers walking toward mountains'),
    P('1787240663846-598e1033a919', 'Benjamin Chambon', 'people-hiking-on-mountain-trail-zO0le9E7Ono', 'Group hiking toward a peak'),
  ],
  tech: [
    P('1556761175-5973dc0f32e7', 'Austin Distel', 'man-standing-in-front-of-group-of-men-rxpThOwuVgE', 'Talk in front of a group'),
    P('1558008258-3256797b43f3', 'Stem List', 'audience-in-a-conference-EVgsAbL51Rk', 'Audience at a conference'),
    P('1576085898323-218337e3e43c', 'charlesdeluvio', 'woman-speaking-at-brick-walled-conference-wn7dOzUh3Rs', 'Woman speaking at a meetup'),
    P('1504384764586-bb4cdc1707b0', 'Alex Kotliarskyi', 'man-typing-on-laptop-in-workspace-ourQHRTE2IM', 'Typing on a laptop'),
  ],
  startup: [
    P('1517048676732-d65bc937f952', 'Dylan Gillis', 'people-sitting-on-chair-in-front-of-table-while-holding-pens-during-daytime-KdeqA3aTnBY', 'People meeting around a table'),
    P('1542744173-8e7e53415bb0', 'Campaign Creators', 'man-standing-in-front-of-people-sitting-beside-table-with-laptop-computers-gMsnXqILjp4', 'Founder presenting to a table'),
    P('1568992688065-536aad8a12f6', 'Redd Francisco', 'talking-people-sitting-beside-table-PTRzqc_h1r4', 'People talking at a table'),
  ],
  art: [
    P('1544928147-79a2dbc1f389', 'Hillary Ungson', 'women-crafting-with-greenery-at-workshop-table-TdpSX7XAcKo', 'Women crafting at a workshop'),
    P('1763793426538-db411c27894d', 'Farchan R', 'art-studio-with-easels-and-paintings-54DZkFe3ebI', 'Art studio with easels'),
    P('1459908676235-d5f02a50184b', 'Khara Woods', 'assorted-color-paint-brush-on-brown-wooden-table-top-KR84RpMCb0w', 'Paint brushes on a table'),
    P('1766932901295-d4185660341b', 'Luba Glazunova', 'adults-and-children-crafting-at-tables-with-plants-ukTZrFNqCXU', 'Crafting at tables'),
  ],
  books: [
    P('1763896081109-ed6bf56ae955', 'Bill Ringer', 'hands-holding-open-books-around-a-table-7C2JUQRJ5hE', 'Hands holding open books around a table'),
    P('1457369804613-52c61a468e7d', 'Patrick Tomasso', 'open-book-lot-Oaqk7qqNh_c', 'Open books'),
    P('1495446815901-a7297e633e8d', 'Tom Hermans', 'book-lot-on-table-9BoqXzEeQqM', 'Books on a table'),
    P('1764173039117-e1ef87b26ec4', 'Centre for Ageing Better', 'two-women-looking-at-a-book-in-library-xlG0HM4RG6I', 'Two women looking at a book'),
  ],
  food: [
    P('1764236307312-6ead0505ad3a', 'The Cheeserom', 'people-gathered-around-a-table-with-a-charcuterie-board-H5eCU_xNnsM', 'People gathered around a table'),
    P('1778694277039-5cbf0b9a1fcf', 'Romain Gal', 'people-enjoying-a-candlelit-dinner-at-a-dimly-lit-restaurant-UEjjO-aJtZ8', 'Candlelit dinner'),
    P('1547573854-74d2a71d0826', 'Stefan Vladimirov', 'white-plates-with-assorted-foods-Q_Moi2xjieU', 'Plates of food'),
  ],
  social: [
    P('1582298538104-fe2e74c27f59', 'Toa Heftiba', 'four-friends-laughing-and-high-fiving-over-coffee-l_ExpFwwOEg', 'Friends laughing over coffee'),
    P('1758272134196-1ab895629bce', 'Vitaly Gariev', 'friends-enjoying-a-rooftop-party-with-music-and-drinks-fzD9NYOxjvo', 'Rooftop party'),
    P('1529156069898-49953e39b3ac', 'Duy Pham', 'people-holding-shoulders-sitting-on-wall-Cecb0_8Hx-o', 'Friends sitting on a wall'),
    P('1758272133417-011aebb36018', 'Vitaly Gariev', 'friends-enjoying-drinks-and-snacks-on-a-rooftop-eQlU4-7PGHw', 'Friends on a rooftop'),
  ],
  talk: [
    P('1777464320955-1f884994b3ea', 'Haberdoedas', 'two-women-talking-at-a-cafe-table-EyNU9nims7c', 'Two women talking at a café'),
    P('1758274252296-a63b1d7d4bb8', 'Vitaly Gariev', 'two-women-talking-at-an-outdoor-cafe-table-9ZNNeEUM7Q4', 'Talking at an outdoor café'),
    P('1777464320942-4f080badb8c4', 'Haberdoedas', 'two-women-talking-while-sitting-at-a-cafe-counter-zQie9p_kCZs', 'Conversation at a café counter'),
  ],
  cause: [
    P('1758599668429-121d54188b9c', 'Vitaly Gariev', 'volunteers-cleaning-a-park-with-blue-trash-bags-U20gjfPjtuI', 'Volunteers cleaning a park'),
    P('1652971876875-05db98fab376', 'The Tampa Bay Estuary Program', 'a-group-of-people-standing-next-to-a-river-CxL29J-aM5E', 'Volunteers by a river'),
    P('1783028104792-8506735c0383', 'Hayes', 'volunteers-organize-items-under-a-blue-tent-outdoors-StrmusT8d9Y', 'Volunteers under a tent'),
    P('1578357078586-491adf1aa5ba', 'Austin Kehmeier', 'view-of-two-persons-hands-lyiKExA4zQA', 'Two hands'),
  ],
  yoga: [
    P('1761035190790-aa1a3472f7fc', 'Christian Harb', 'people-practicing-yoga-in-a-studio-OV3PU7FD6Fc', 'People practising yoga'),
    P('1545205597-3d9d02c29597', 'Kaylee Garrett', 'five-woman-standing-on-seashore-GaprWyIw66o', 'Five women on a seashore'),
    P('1787647090390-890c94512cee', 'Vitaly Gariev', 'people-performing-yoga-eagle-pose-pdBgczqe16c', 'Group yoga'),
    P('1588286840104-8957b019727f', 'Dylan Gillis', 'woman-in-white-tank-top-and-pink-leggings-doing-yoga-YJdCZba0TYE', 'Yoga pose'),
  ],
  parents: [
    P('1762291495465-2cc587c180e2', 'Jim Luo', 'adults-watch-child-on-playground-slide-during-autumn-LAZ27ukiaOE', 'Adults at a playground'),
    P('1577897113051-1a0395bfc3e2', 'National Cancer Institute', 'toddler-sliding-on-yellow-slide-YttV1GZuCDo', 'Toddler on a slide'),
    P('1535316228490-e814129b42df', 'Guillaume de Germain', 'toddler-running-on-gray-concrete-floor-8pfI-L-acL4', 'Toddler running'),
  ],
  pets: [
    P('1602684379319-1de467ca74e5', 'Mathew Smith', 'black-short-coated-dog-playing-with-white-ball-on-green-grass-field-during-daytime-gM6QroS17aw', 'Dog playing with a ball'),
    P('1619333774340-3a878585c2e4', 'Jeyakumaran Mayooresan', 'brown-and-white-long-coated-dog-on-green-grass-field-during-daytime-LMNRdfa3QNk', 'Dog on grass'),
    P('1612353413650-314b2f5146ed', 'MChe Lee', 'people-sitting-on-green-grass-field-during-daytime-W-Ta6KgSdnY', 'People in a park'),
  ],
  network: [
    P('1775163560631-6ff15eb2fa1f', 'Olena Kholina', 'people-mingling-at-an-indoor-event-with-warm-lighting-OsuDfn4vtLA', 'People mingling at an event'),
    P('1540575467063-178a50c2df87', 'Headway', 'crowd-of-people-sitting-on-chairs-inside-room-F2KRf_QfCqw', 'Audience in a room'),
    P('1772690445981-78b22eacda4b', 'Riccardi Media', 'panel-discussion-with-speakers-and-audience-at-a-table-3BwoM8zNYwo', 'Panel discussion'),
    P('1531058020387-3be344556be6', 'Jakob Dalbjörn', 'people-inside-conference-cuKJre3nyYc', 'People at a conference'),
  ],
  games: [
    P('1629760946220-5693ee4c46ac', 'Nik Korba', 'game-pieces-and-dice-on-board-3WceTBlUoMs', 'Game pieces and dice'),
    P('1769288361820-898812b71482', 'Zoshua Colah', 'shelves-filled-with-numerous-board-games-and-puzzles-5EFXq5vxfig', 'Shelves of board games'),
    P('1547638375-ebf04735d792', 'Robert Coelho', 'six-assorted-color-dice-laNNTAth9vs', 'Colourful dice'),
    P('1763875067516-e947790c74ac', 'Parinaz Mirhosseini', 'colorful-game-pieces-on-a-board-game-YCRcavcVEFI', 'Game pieces on a board'),
  ],
  dating: [
    P('1513279922550-250c2129b13a', 'Nathan Dumlao', 'people-sitting-with-candles-overlooking-city-EdULZpOKsUE', 'Two people by candlelight over a city'),
    P('1771395999627-a57a7c6739d1', 'Diana Díaz', 'friends-enjoying-cocktails-and-snacks-at-a-table-hJqfore3SH4', 'Cocktails at a table'),
    P('1505771215590-c5fa0aec29b8', 'Biel Morro', 'black-string-lights-J_F_003jcEQ', 'String lights'),
    P('1780817804073-68a7ff0b6f4c', 'Hussein Almukhtar', 'people-sitting-on-a-candlelit-deck-by-water-at-night-GJFnYkymU3k', 'Candlelit deck at night'),
  ],
  men: [
    P('1543807535-eceef0bc6599', 'Jed Villejo', 'three-men-in-jacket-laughing-at-each-other-pumko2FFxY0', 'Three men laughing'),
    P('1490578474895-699cd4e2cf59', 'Matheus Ferrero', 'row-of-four-men-sitting-on-mountain-trail-TkrRvwxjb_8', 'Four men on a mountain trail'),
    P('1761839257349-037aea1d94de', "Land O'Lakes, Inc.", 'three-friends-talking-outdoors-on-a-sunny-day-b4-ubEXfOBI', 'Friends talking outdoors'),
  ],
  women: [
    P('1524601500432-1e1a4c71d692', 'Melissa Askew', 'women-forming-heart-gestures-during-daytime-tSlvoSZK77c', 'Women making heart gestures'),
    P('1765307639918-a99f7f3d9f75', 'Joshua Koblin', 'two-happy-women-hugging-in-a-grassy-field-oAbvkTcystE', 'Two women hugging'),
    P('1530047139082-5435ca3c4614', 'Omar Lopez', 'woman-hugging-other-woman-while-smiling-at-beach-0-uzdU3gUYw', 'Friends at the beach'),
    P('1761839256602-0e28a5ab928d', "Land O'Lakes, Inc.", 'two-smiling-women-in-a-park-vBUGdI7JAvc', 'Two women in a park'),
  ],
  civic: [
    P('1582213782179-e0d53f98f2ca', 'Hannah Busing', 'group-stacking-hands-in-colorful-sweaters-Zyx1bK9mqmA', 'Group stacking hands'),
    P('1760367120301-a6838ae553d7', 'Christian Harb', 'a-diverse-crowd-of-people-gathered-indoors-aeQuYBwBRYQ', 'Crowd gathered indoors'),
    P('1772690445981-78b22eacda4b', 'Riccardi Media', 'panel-discussion-with-speakers-and-audience-at-a-table-3BwoM8zNYwo', 'Panel discussion'),
  ],
  party: [
    P('1768508951262-42931f7ad924', 'Filip Rankovic Grobgaard', 'a-large-group-of-people-waving-at-the-camera-JlU1STfc7m8', 'A large group waving'),
    P('1517263904808-5dc91e3e7044', 'Fidel Fernando', 'lighted-hanging-disco-mirror-balls-249DzAuJTqQ', 'Disco mirror balls'),
    P('1767327142314-f011bc951da9', 'Kaden Taylor', 'a-crowd-of-people-looking-up-in-amazement-Y2kleFmGbV0', 'A crowd looking up'),
  ],
};

export const TOPIC_PHOTOS = T;

export const CATEGORY_PHOTOS: Record<CommunityCategory, Photo[]> = {
  running: T.run, cycling: T.cycle, sports: T.sports, fitness: T.fitness, outdoors: T.hike,
  tech: T.tech, startup: T.startup, creative: T.art, books: T.books, food: T.food, social: T.social,
  language: T.talk, cause: T.cause, wellbeing: T.yoga, parents: T.parents, pets: T.pets,
  professional: T.network, games: T.games, dating: T.dating, men: T.men, women: T.women, civic: T.civic, other: T.social,
};

/** Sized Unsplash URL (their CDN resizes on the fly). */
export const photoSrc = (p: Photo, w = 640, h?: number) =>
  `https://images.unsplash.com/photo-${p.id}?auto=format&fit=crop&q=70&w=${w}${h ? `&h=${h}` : ''}`;
export const photoPage = (p: Photo) => `https://unsplash.com/photos/${p.page}`;

/** Deterministic pick so the same listing always shows the same photo. */
export function photoFor(slug: string, category: CommunityCategory): Photo {
  return photosFor(slug, category)[0];
}
/** The listing's photo first, then the rest of its category, then a few safe generics — used as fallbacks if one fails to load. */
export function photosFor(slug: string, category: CommunityCategory): Photo[] {
  const list = CATEGORY_PHOTOS[category] ?? T.social;
  let h = 0; for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  const k = h % list.length;
  const rot = [...list.slice(k), ...list.slice(0, k)];
  const extra = [T.social[0], T.books[2], T.hike[2]].filter((p) => !rot.includes(p));
  return [...rot, ...extra];
}
