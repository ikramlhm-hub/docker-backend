import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const users = [
  { firstname: "Othmane", lastname: "BELMAJDOUB", email: "othmane.belmajdoub@my-digital-school.org", promotion:"MDS - M1 DEV TITRE 7 MANAGER DE PROJET WEB ET DIGITAL"},
  { firstname: "Axel", lastname: "BLANCHARD", email: "axel.blanchard@my-digital-school.org", promotion:"MDS - M1 DEV TITRE 7 MANAGER DE PROJET WEB ET DIGITAL" },
  { firstname: "Benjamin", lastname: "BONNEVIAL", email: "benjamin.bonnevial@my-digital-school.org", promotion:"MDS - M1 DEV TITRE 7 MANAGER DE PROJET WEB ET DIGITAL" },
  { firstname: "Anthony", lastname: "BROSSE", email: "anthony.brosse@my-digital-school.org", promotion:"MDS - M1 DEV TITRE 7 MANAGER DE PROJET WEB ET DIGITAL" },
  { firstname: "Raphaël", lastname: "DUBOST", email: "raphael.dubost@my-digital-school.org" , promotion:"MDS - M1 DEV TITRE 7 MANAGER DE PROJET WEB ET DIGITAL"},
  { firstname: "Bastien", lastname: "FOURNIER", email: "bastien.fournier@my-digital-school.org" , promotion:"MDS - M1 DEV TITRE 7 MANAGER DE PROJET WEB ET DIGITAL"},
  { firstname: "Esteban", lastname: "GASPAR", email: "esteban.gaspar@my-digital-school.org" , promotion:"MDS - M1 DEV TITRE 7 MANAGER DE PROJET WEB ET DIGITAL"},
  { firstname: "Ikram", lastname: "LAHMOURI", email: "ikram.lahmouri@my-digital-school.org" , promotion:"MDS - M1 DEV TITRE 7 MANAGER DE PROJET WEB ET DIGITAL"},
  { firstname: "Hugo", lastname: "MALEZET", email: "hugo.malezet@my-digital-school.org" , promotion:"MDS - M1 DEV TITRE 7 MANAGER DE PROJET WEB ET DIGITAL"},
  { firstname: "Abdelbasir", lastname: "MEFIRE NSANGOU", email: "abdelbasir.mefirensangou@my-digital-school.org" , promotion:"MDS - M1 DEV TITRE 7 MANAGER DE PROJET WEB ET DIGITAL"},
  { firstname: "Said", lastname: "MOHAMED ABDO", email: "said.mohamedabdo@my-digital-school.org" , promotion:"MDS - M1 DEV TITRE 7 MANAGER DE PROJET WEB ET DIGITAL"},
  { firstname: "Sana", lastname: "NAJJAH", email: "sana.najjah@my-digital-school.org" , promotion:"MDS - M1 DEV TITRE 7 MANAGER DE PROJET WEB ET DIGITAL"},
  { firstname: "Mamadou Khaly", lastname: "SOW", email: "mamadoukhaly.sow@my-digital-school.org" , promotion:"MDS - M1 DEV TITRE 7 MANAGER DE PROJET WEB ET DIGITAL"},
  { firstname: "Samantha", lastname: "THIEBAUT", email: "samantha.thiebaut@my-digital-school.org" , promotion:"MDS - M1 DEV TITRE 7 MANAGER DE PROJET WEB ET DIGITAL"},
  { firstname: "Marie", lastname: "TURCO", email: "marie.turco@my-digital-school.org" , promotion:"MDS - M1 DEV TITRE 7 MANAGER DE PROJET WEB ET DIGITAL"},
  { firstname: "Bastien", lastname: "USUBELLI", email: "bastien.usubelli@my-digital-school.org" , promotion:"MDS - M1 DEV TITRE 7 MANAGER DE PROJET WEB ET DIGITAL"},
  { firstname: "Lorenzo", lastname: "VATRIN", email: "lorenzo.vatrin@my-digital-school.org" , promotion:"MDS - M1 DEV TITRE 7 MANAGER DE PROJET WEB ET DIGITAL"},
  { firstname: "Adrien", lastname: "VERWAERDE", email: "adrien.verwaerde@my-digital-school.org", promotion:"MDS - M1 DEV TITRE 7 MANAGER DE PROJET WEB ET DIGITAL" }
];

async function main() {
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        firstname: u.firstname,
        lastname: u.lastname,
        promotion: u.promotion
      }
    });
  }
  console.log("Seed terminé ✅");
}

main().catch(e => console.error(e)).finally(async () => await prisma.$disconnect());