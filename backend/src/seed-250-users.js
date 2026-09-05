import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from './lib/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

// Diverse pool of Indian First Names
const FIRST_NAMES = [
  'Aarav', 'Aditi', 'Advik', 'Ajay', 'Akanksha', 'Akhil', 'Alok', 'Amit', 'Amrita', 'Anand',
  'Ananya', 'Anil', 'Aniruddh', 'Anita', 'Anjali', 'Ankita', 'Ansh', 'Anurag', 'Apoorva', 'Arjun',
  'Arvind', 'Ashish', 'Ashwin', 'Avani', 'Ayush', 'Bharat', 'Bhavna', 'Brijesh', 'Chetan', 'Chirag',
  'Deepa', 'Deepak', 'Deepti', 'Dev', 'Dhananjay', 'Dhruv', 'Dinesh', 'Divya', 'Ekta', 'Ganesh',
  'Gaurav', 'Gayatri', 'Geeta', 'Girish', 'Gopal', 'Harish', 'Harsh', 'Harshita', 'Hemant', 'Hina',
  'Indira', 'Isha', 'Ishaan', 'Jaideep', 'Jay', 'Jitendra', 'Jyoti', 'Kabir', 'Kajal', 'Kalpesh',
  'Kamal', 'Kapil', 'Karan', 'Karthik', 'Karuna', 'Kavita', 'Kiran', 'Kishore', 'Komal', 'Krishna',
  'Kriti', 'Kuldeep', 'Kunal', 'Kushal', 'Lalit', 'Lata', 'Lavanya', 'Madhav', 'Madhu', 'Mahesh',
  'Malini', 'Manish', 'Manisha', 'Manoj', 'Mayank', 'Meena', 'Meera', 'Mohit', 'Monica', 'Mukesh',
  'Nandini', 'Naresh', 'Natasha', 'Naveen', 'Neelam', 'Neha', 'Nikhil', 'Nilesh', 'Nimisha', 'Nitin',
  'Omkar', 'Pankaj', 'Parag', 'Paresh', 'Parth', 'Payal', 'Pooja', 'Poonam', 'Pradeep', 'Prakash',
  'Pramod', 'Pranali', 'Pranav', 'Prashant', 'Prateek', 'Pravin', 'Preeti', 'Priya', 'Priyanka', 'Puneet',
  'Radha', 'Rahul', 'Raj', 'Rajan', 'Rajat', 'Rajeev', 'Rajendra', 'Rajesh', 'Rakesh', 'Ramesh',
  'Rashmi', 'Ratan', 'Ravi', 'Ravindra', 'Rekha', 'Renuka', 'Riddhi', 'Ritesh', 'Ritu', 'Rohit',
  'Rohan', 'Roshni', 'Ruchi', 'Rupal', 'Sachin', 'Sagar', 'Sahil', 'Sameer', 'Sandeep', 'Sangeeta',
  'Sanjay', 'Sanjeev', 'Santosh', 'Sarita', 'Saurabh', 'Seema', 'Shailesh', 'Shalini', 'Shankar', 'Sharad',
  'Shashi', 'Sheetal', 'Shikha', 'Shilpa', 'Shivam', 'Shobha', 'Shreya', 'Siddharth', 'Smita', 'Sneha',
  'Snehal', 'Somesh', 'Sonali', 'Sonu', 'Subhash', 'Sudhir', 'Sujata', 'Sukumar', 'Suman', 'Sunil',
  'Sunita', 'Suraj', 'Suresh', 'Sushil', 'Swati', 'Tanmay', 'Tanvi', 'Tarun', 'Tejas', 'Tushar',
  'Uday', 'Uma', 'Umesh', 'Upendra', 'Urmila', 'Utkarsh', 'Vaibhav', 'Vaishali', 'Varun', 'Vedant',
  'Vidya', 'Vijay', 'Vikas', 'Vikram', 'Vinay', 'Vinod', 'Vipul', 'Vishal', 'Vivek', 'Yash', 'Yogesh'
];

// Diverse pool of Indian Last Names
const LAST_NAMES = [
  'Agarwal', 'Ahuja', 'Ambani', 'Anand', 'Arora', 'Bakshi', 'Banerjee', 'Bansal', 'Basu', 'Bhat',
  'Bhatia', 'Bhatt', 'Bhattacharya', 'Biswas', 'Bose', 'Chakraborty', 'Chauhan', 'Chhabra', 'Chopra', 'Choudhary',
  'Das', 'Dasgupta', 'Datta', 'Dave', 'Deol', 'Deshmukh', 'Deshpande', 'Dewan', 'Dey', 'Dhawan',
  'Dhillon', 'Dixit', 'Dubey', 'Dutta', 'Gandhi', 'Ganguly', 'Garg', 'Ghosh', 'Gill', 'Goel',
  'Gokhale', 'Goswami', 'Grover', 'Guha', 'Gulati', 'Gupta', 'Hegde', 'Iyengar', 'Iyer', 'Jadhav',
  'Jain', 'Jaiswal', 'Jha', 'Joshi', 'Juneja', 'Kale', 'Kamath', 'Kapoor', 'Kashyap', 'Kaul',
  'Kaushik', 'Khanna', 'Khatri', 'Khera', 'Khosla', 'Kohli', 'Kothari', 'Kulkarni', 'Kumar', 'Lal',
  'Mahajan', 'Maheshwari', 'Majumdar', 'Malhotra', 'Malik', 'Mathur', 'Mehra', 'Mehta', 'Menon', 'Mishra',
  'Mitra', 'Mittal', 'Modi', 'Mohanty', 'Mukherjee', 'Nagar', 'Nagpal', 'Naidu', 'Nair', 'Nanda',
  'Narang', 'Narayan', 'Natarajan', 'Nayak', 'Negi', 'Nigam', 'Oberoi', 'Pai', 'Pal', 'Pandey',
  'Parekh', 'Parikh', 'Patel', 'Patil', 'Patnaik', 'Paul', 'Pillai', 'Prabhu', 'Prasad', 'Puri',
  'Radhakrishnan', 'Raghavan', 'Rai', 'Raina', 'Rajput', 'Raju', 'Ramachandran', 'Rana', 'Rao', 'Rastogi',
  'Rathore', 'Rawat', 'Ray', 'Reddy', 'Roy', 'Sabharwal', 'Sachdev', 'Sahni', 'Saini', 'Sandhu',
  'Sarin', 'Sarkar', 'Sarma', 'Saxena', 'Sehgal', 'Sen', 'Sengupta', 'Sethi', 'Shah', 'Sharma',
  'Shastri', 'Sheth', 'Shetty', 'Shinde', 'Shukla', 'Singhal', 'Singhania', 'Sinha', 'Soni', 'Sood',
  'Srinivasan', 'Srivastava', 'Subramanian', 'Sundaram', 'Talwar', 'Tandon', 'Tendulkar', 'Thakur', 'Thapar', 'Trivedi',
  'Tyagi', 'Upadhyay', 'Varma', 'Verma', 'Vora', 'Vyas', 'Wadhwa', 'Walia', 'Yadav'
];

const EMAIL_DOMAINS = [
  'gmail.com', 'outlook.com', 'yahoo.co.in', 'urbanfurniture.com', 'icloud.com', 'designstudio.in'
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomPhone() {
  const prefixes = ['98', '97', '99', '96', '95', '93', '91', '88', '87', '89', '85', '70', '79'];
  const p = getRandomItem(prefixes);
  const rest = Math.floor(10000000 + Math.random() * 90000000).toString().substring(0, 8);
  return `+91 ${p}${rest.substring(0, 3)} ${rest.substring(3)}`;
}

async function seed250IndianUsers() {
  console.log('🚀 Starting generation of 250 realistic Indian users...');

  // 1. Fetch organization
  let org = await prisma.organizations.findFirst({
    where: { name: 'Urban Furniture' }
  });

  if (!org) {
    org = await prisma.organizations.findFirst();
  }

  if (!org) {
    throw new Error('No organization found. Please run initial seed first.');
  }

  console.log(`🏢 Associating users with Organization: "${org.name}" (${org.id})`);

  // Hash the default password once
  const hashedPassword = await bcrypt.hash('Password@123', 10);

  // Fetch existing users to avoid login_id and email collisions
  const existingUsers = await prisma.app_users.findMany({
    select: { login_id: true, email: true }
  });

  const usedLoginIds = new Set(existingUsers.map(u => u.login_id.toLowerCase()));
  const usedEmails = new Set(existingUsers.map(u => u.email.toLowerCase()));

  const usersToCreate = [];
  const TARGET_COUNT = 250;

  for (let i = 1; i <= TARGET_COUNT; i++) {
    let firstName = getRandomItem(FIRST_NAMES);
    let lastName = getRandomItem(LAST_NAMES);
    let displayName = `${firstName} ${lastName}`;

    // Base slug
    let baseSlug = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[^a-z0-9.]/g, '');
    let loginId = baseSlug;
    let email = `${loginId}@${getRandomItem(EMAIL_DOMAINS)}`;

    // Handle collision if needed
    let counter = 1;
    while (usedLoginIds.has(loginId) || usedEmails.has(email)) {
      loginId = `${baseSlug}${counter}`;
      email = `${baseSlug}${counter}@${getRandomItem(EMAIL_DOMAINS)}`;
      counter++;
    }

    usedLoginIds.add(loginId);
    usedEmails.add(email);

    // Assign roles: ~25 Accountants, ~225 Standard Users
    const isAccountant = i <= 25;
    const role = isAccountant ? 'Accountant' : 'User';
    const membershipRole = isAccountant ? 'accountant' : 'user';

    usersToCreate.push({
      firstName,
      lastName,
      displayName,
      loginId,
      email,
      phone: getRandomPhone(),
      role,
      membershipRole
    });
  }

  console.log(`📝 Generated ${usersToCreate.length} unique Indian user profiles. Inserting into MySQL...`);

  let createdCount = 0;
  // Insert in batches of 25 for optimal performance
  const BATCH_SIZE = 25;
  for (let i = 0; i < usersToCreate.length; i += BATCH_SIZE) {
    const batch = usersToCreate.slice(i, i + BATCH_SIZE);

    for (const u of batch) {
      const createdUser = await prisma.app_users.create({
        data: {
          login_id: u.loginId,
          email: u.email,
          password_hash: hashedPassword,
          display_name: u.displayName,
          phone: u.phone,
          role: u.role,
          is_active: true
        }
      });

      // Link to organization membership
      await prisma.organization_memberships.create({
        data: {
          organization_id: org.id,
          user_id: createdUser.id,
          role: u.membershipRole,
          is_active: true
        }
      });

      createdCount++;
    }

    console.log(`   ⏳ Inserted ${createdCount} / ${TARGET_COUNT} users...`);
  }

  const totalUsersInDb = await prisma.app_users.count();
  console.log(`\n🎉 SUCCESS: Created ${createdCount} Indian user accounts!`);
  console.log(`📊 Total registered users in database: ${totalUsersInDb}`);
  console.log(`🔑 All generated accounts can sign in with password: "Password@123"`);
}

seed250IndianUsers()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('❌ Error creating 250 users:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
