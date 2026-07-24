import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Prisma is instantiated once because this script runs as a short-lived seed process.
const prisma = new PrismaClient();

// Each product keeps Bosnian and English content so the public interface can switch language.
const tools = [
  ['DeWalt Aku Bušilica','DeWalt Cordless Drill','Snažna aku bušilica za profesionalne radove.','Powerful cordless drill for professional work.',20,'Aku alati','photo-1504148455328-c376907d081c'],
  ['Makita Aku Bušilica','Makita Cordless Drill','Pouzdan alat za svaki projekat.','Reliable tool for every project.',20,'Aku alati','photo-1586864387967-d02ef85d93e8'],
  ['Einhell Aku Bušilica','Einhell Cordless Drill','Kompaktna i praktična bušilica.','Compact and practical drill.',20,'Aku alati','photo-1530124566582-a618bc2615dc'],
  ['Ugaona Brusilica','Angle Grinder','Precizno rezanje i brušenje metala.','Precise cutting and grinding of metal.',20,'Brusilice','photo-1504917595217-d4dc5ebe6122'],
  ['Kärcher Dubinski Usisivač','Kärcher Deep Cleaner','Dubinsko čišćenje tepiha i namještaja.','Deep cleaning for carpets and furniture.',40,'Usisivači','photo-1558317374-067fb5f30001'],
  ['Industrijski Usisivač','Industrial Vacuum','Snažan usisivač za radionice, prašinu i grube radove.','Heavy-duty vacuum for workshops, dust and demanding work.',35,'Usisivači','photo-1581578731548-c64695cc6952'],
  ['Kärcher Visokotlačna Perilica','Kärcher Pressure Washer','Snažno pranje dvorišta, fasada i vozila.','Powerful cleaning for yards, facades and vehicles.',40,'Perilice','photo-1558618666-fcd25c85cd64'],
  ['Parni Čistač','Steam Cleaner','Higijensko čišćenje tvrdih površina bez hemikalija.','Hygienic hard-surface cleaning without chemicals.',30,'Perilice','photo-1527515637462-cff94eecc1ac'],
  ['Cirkular','Circular Saw','Čist i brz rez drvenih ploča.','Clean and fast cuts through wood panels.',30,'Pile','photo-1503387762-592deb58ef4e'],
  ['Ubodna Testera','Jigsaw','Kontrolisano rezanje krivina i detalja.','Controlled cutting of curves and details.',20,'Testere','photo-1513467655676-561b7d489a88'],
  ['Motorna Testera','Chainsaw','Robusna motorna testera za zahtjevne poslove.','Robust chainsaw for demanding jobs.',35,'Testere','photo-1591006153386-9d4c0de97c1b'],
  ['Čekić Bušilica','Rotary Hammer','Za beton, zidove i građevinske radove.','For concrete, walls and construction work.',30,'Građevinski alati','photo-1572981779307-38b8cabb2407'],
  ['Vibro Ploča','Plate Compactor','Kompaktna vibro ploča za pripremu podloge.','Compact plate compactor for ground preparation.',55,'Građevinski alati','photo-1590479773265-7464e5d48118'],
  ['Motorni Trimer','Petrol Grass Trimmer','Uredite travu, ivice i nepristupačne dijelove dvorišta.','Tidy grass, edges and hard-to-reach areas of the garden.',30,'Vrtni alati','photo-1592417817098-8fd3d9eb14a5'],
  ['Puhač Lišća','Leaf Blower','Brzo čišćenje lišća i sitnog otpada oko objekta.','Fast clearing of leaves and light debris around a property.',25,'Vrtni alati','photo-1600679472829-3044539ce8ed']
];

async function main() {
  // Upsert makes the starter admin available without deleting existing database data.
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'AdminRentAlat2026!', 12);
  await prisma.user.upsert({
    where: { username: process.env.ADMIN_USERNAME || 'admin' },
    update: { passwordHash },
    create: { username: process.env.ADMIN_USERNAME || 'admin', passwordHash, role: 'ADMIN' }
  });

  // New catalogue entries are inserted one by one only if the product does not already exist.
  for (const [name_bs, name_en, description_bs, description_en, price, category, photo] of tools) {
    const existing = await prisma.tool.findFirst({ where: { name_bs } });
    if (!existing) {
      await prisma.tool.create({
        data: { name_bs, name_en, description_bs, description_en, price, category, image: `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=900&q=82` }
      });
    }
  }
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
