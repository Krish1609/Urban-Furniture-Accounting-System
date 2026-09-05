import dotenv from 'dotenv';
dotenv.config();
import prisma from './lib/prisma.js';

const EMAIL_DOMAINS_PERSONAL = [
  'gmail.com', 'outlook.com', 'yahoo.in', 'icloud.com', 'proton.me', 
  'designstudio.in', 'architects.in', 'urbanhome.co.in', 'furniturespace.in'
];

const COMPANY_ROLES = [
  'contact', 'sales', 'procurement', 'orders', 'info', 'billing', 'support', 'b2b', 'corporate', 'inquiry'
];

// Clean company names and domain generation
function sanitizeDomain(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/(pvt|ltd|llp|enterprises|solutions|creations|concepts|partner|hub|works|supply|supplies|co|corp|all)/g, '')
    .slice(0, 15) || 'furnilink';
}

function cleanName(rawName) {
  // Remove trailing #numbers or synthetic tags like "#102"
  return rawName.replace(/#\d+/g, '').replace(/\s+/g, ' ').trim();
}

export async function updateAllContactEmails() {
  console.log('🔄 Updating contact emails to proper, realistic standard formats...');

  const contacts = await prisma.contacts.findMany({
    orderBy: { created_at: 'asc' }
  });

  console.log(`Found ${contacts.length} contacts to update.`);

  let updatedCount = 0;

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    const cleanedDisplayName = cleanName(contact.display_name);

    let properEmail = '';
    const isVendor = contact.contact_type === 'vendor';
    const isCompany = cleanedDisplayName.includes(' ') && (
      cleanedDisplayName.toLowerCase().includes('ltd') ||
      cleanedDisplayName.toLowerCase().includes('pvt') ||
      cleanedDisplayName.toLowerCase().includes('studio') ||
      cleanedDisplayName.toLowerCase().includes('partner') ||
      cleanedDisplayName.toLowerCase().includes('solutions') ||
      cleanedDisplayName.toLowerCase().includes('enterprises') ||
      cleanedDisplayName.toLowerCase().includes('supplies') ||
      cleanedDisplayName.toLowerCase().includes('merchants') ||
      cleanedDisplayName.toLowerCase().includes('furnishings') ||
      cleanedDisplayName.toLowerCase().includes('interio') ||
      cleanedDisplayName.toLowerCase().includes('hospitality') ||
      cleanedDisplayName.toLowerCase().includes('design') ||
      cleanedDisplayName.toLowerCase().includes('alliance') ||
      cleanedDisplayName.toLowerCase().includes('llp') ||
      isVendor
    );

    if (isCompany) {
      const role = COMPANY_ROLES[i % COMPANY_ROLES.length];
      const domainSlug = sanitizeDomain(cleanedDisplayName);
      const ext = i % 3 === 0 ? 'com' : i % 3 === 1 ? 'in' : 'co.in';
      properEmail = `${role}@${domainSlug}.${ext}`;
    } else {
      const parts = cleanedDisplayName.split(' ').filter(Boolean);
      const first = parts[0]?.toLowerCase().replace(/[^a-z]/g, '') || 'client';
      const last = parts[1]?.toLowerCase().replace(/[^a-z]/g, '') || 'kumar';
      const domain = EMAIL_DOMAINS_PERSONAL[i % EMAIL_DOMAINS_PERSONAL.length];
      
      const formatType = i % 4;
      if (formatType === 0) {
        properEmail = `${first}.${last}@${domain}`;
      } else if (formatType === 1) {
        properEmail = `${first}_${last}@${domain}`;
      } else if (formatType === 2) {
        properEmail = `${first}${last[0]}@${domain}`;
      } else {
        properEmail = `${first}.${last}${10 + (i % 89)}@${domain}`;
      }
    }

    const website = isCompany 
      ? `https://www.${sanitizeDomain(cleanedDisplayName)}.${i % 2 === 0 ? 'com' : 'in'}`
      : `https://www.${cleanedDisplayName.toLowerCase().replace(/[^a-z0-9]/g, '')}.me`;

    await prisma.contacts.update({
      where: { id: contact.id },
      data: {
        display_name: cleanedDisplayName,
        legal_name: `${cleanedDisplayName} (Verified)`,
        email: properEmail,
        website: website
      }
    });

    updatedCount++;
  }

  console.log(`✅ Successfully updated ${updatedCount} contacts with proper RFC-compliant email formats!`);
}

updateAllContactEmails()
  .then(async () => {
    // Print sample of 25 updated contacts
    const sample = await prisma.contacts.findMany({ take: 25 });
    console.log('\n📋 Sample of Updated Contact Emails:');
    console.table(sample.map((c, idx) => ({
      '#': idx + 1,
      'Name': c.display_name,
      'Type': c.contact_type,
      'Proper Email': c.email,
      'Website': c.website
    })));
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('❌ Error updating contact emails:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
