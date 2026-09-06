import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from './lib/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const INDIAN_FIRST_NAMES = [
  // Male
  'Aditya', 'Rohan', 'Ayush', 'Devansh', 'Shaurya', 'Atharv', 'Rudra', 'Pratyush', 'Samarth', 'Arnav',
  'Vivaan', 'Viraj', 'Reyansh', 'Vihaan', 'Krish', 'Manav', 'Dhairya', 'Darsh', 'Agastya', 'Yuvan',
  'Ved', 'Advait', 'Anirudh', 'Tanmay', 'Chinmay', 'Tejas', 'Harshil', 'Parthiv', 'Ronit', 'Samar',
  'Shlok', 'Shourya', 'Tanishq', 'Utkarsh', 'Vansh', 'Yashwardhan', 'Divyansh', 'Hardik', 'Mayank', 'Nakul',
  'Naman', 'Nishant', 'Pranay', 'Priyansh', 'Rishabh', 'Rishit', 'Sarthak', 'Shivansh', 'Siddhant', 'Sparsh',
  'Subhranshu', 'Sushant', 'Swastik', 'Tarun', 'Vedant', 'Vidit', 'Yashaswi', 'Yatharth', 'Yug', 'Aakash',
  'Abhay', 'Abhinav', 'Abhishek', 'Alok', 'Aman', 'Amar', 'Aniket', 'Ankit', 'Anshul', 'Anurag',
  'Arav', 'Arijit', 'Arun', 'Ashutosh', 'Bhavesh', 'Chirag', 'Deep', 'Deepak', 'Dev', 'Dhananjay',
  'Gaurav', 'Gopal', 'Harish', 'Harsh', 'Hitesh', 'Ishan', 'Jaideep', 'Jay', 'Jitendra', 'Kabir',
  'Kailash', 'Kalpesh', 'Kamal', 'Kapil', 'Karan', 'Karthik', 'Kaushik', 'Kedar', 'Keshav', 'Kishore',
  'Krunal', 'Kuldeep', 'Kunal', 'Kush', 'Kushal', 'Lalit', 'Lokesh', 'Madhav', 'Madhur', 'Mahesh',
  'Mandar', 'Manish', 'Manoj', 'Mayur', 'Mihir', 'Mitul', 'Mohit', 'Mukesh', 'Naresh', 'Naveen',
  'Neeraj', 'Nikhil', 'Nilesh', 'Nitin', 'Om', 'Pankaj', 'Parag', 'Paresh', 'Parth', 'Piyush',
  'Pradeep', 'Prakash', 'Pramod', 'Pranav', 'Prashant', 'Prateek', 'Pravin', 'Prem', 'Puneet', 'Raghav',
  'Rahul', 'Raj', 'Rajan', 'Rajat', 'Rajeev', 'Rajendra', 'Rajesh', 'Rajiv', 'Rakesh', 'Ram',
  'Ramesh', 'Ranjeet', 'Ravi', 'Ravindra', 'Ritesh', 'Rohit', 'Ronak', 'Roshan', 'Rupesh', 'Sachin',
  'Sagar', 'Sahil', 'Sameer', 'Sandeep', 'Sanjay', 'Sanjeev', 'Santosh', 'Sarvesh', 'Satish', 'Saurabh',
  'Shailesh', 'Sharad', 'Shashi', 'Shivam', 'Shreyas', 'Shyam', 'Siddharth', 'Somesh', 'Sourabh', 'Subhash',
  'Sudhir', 'Sujay', 'Sumeet', 'Sunil', 'Suresh', 'Suraj', 'Swapnil', 'Tushar', 'Uday', 'Umang',
  'Umesh', 'Vaibhav', 'Varun', 'Vicky', 'Vidur', 'Vijay', 'Vikas', 'Vikram', 'Vinay', 'Vinod',
  'Vipin', 'Vipul', 'Vishal', 'Vivek', 'Yash', 'Yogesh',

  // Female
  'Aanya', 'Aaradhya', 'Aarya', 'Aditi', 'Advika', 'Ahana', 'Akshara', 'Amaira', 'Amyra', 'Ananya',
  'Anika', 'Anvi', 'Avni', 'Bhavya', 'Charvi', 'Dia', 'Diya', 'Drithi', 'Gauri', 'Hiya',
  'Ira', 'Isha', 'Ishani', 'Ishita', 'Jhanvi', 'Kaira', 'Kashvi', 'Kavya', 'Kiara', 'Krisha',
  'Kyra', 'Larisa', 'Mahika', 'Manya', 'Meera', 'Mihika', 'Miraya', 'Myra', 'Navya', 'Neha',
  'Nihira', 'Nimrit', 'Nisha', 'Nitya', 'Ovi', 'Paakhi', 'Palak', 'Pari', 'Parina', 'Pihu',
  'Prisha', 'Radhika', 'Rahi', 'Rhea', 'Riya', 'Saanvi', 'Samaira', 'Samiksha', 'Sanvi', 'Sara',
  'Saumya', 'Shanaya', 'Sharanya', 'Shivanya', 'Shreya', 'Siya', 'Sneha', 'Sparsha', 'Tanvi', 'Tara',
  'Trisha', 'Vaani', 'Vamika', 'Vedika', 'Vrinda', 'Zoya', 'Aakanksha', 'Aarti', 'Akanksha', 'Alka',
  'Amita', 'Amrita', 'Anita', 'Anjali', 'Ankita', 'Anu', 'Archana', 'Asha', 'Babita', 'Barkha',
  'Beena', 'Bhagyashree', 'Bharati', 'Bhavna', 'Chhaya', 'Chetna', 'Deepa', 'Deepali', 'Deepti', 'Dimple',
  'Divya', 'Garima', 'Geeta', 'Gayatri', 'Harini', 'Hemali', 'Hina', 'Indira', 'Indu', 'Jagruti',
  'Jaya', 'Jyoti', 'Kajal', 'Kalpana', 'Kamini', 'Kanchan', 'Karishma', 'Kashmira', 'Kavita', 'Kiran',
  'Komal', 'Kranti', 'Kusum', 'Lata', 'Leela', 'Madhu', 'Madhuri', 'Mahima', 'Mala', 'Malini',
  'Mamta', 'Manisha', 'Manju', 'Meena', 'Meenakshi', 'Meghna', 'Mona', 'Monica', 'Monika', 'Naina',
  'Nalini', 'Namrata', 'Nandini', 'Natasha', 'Neelam', 'Nidhi', 'Nikita', 'Pallavi', 'Payal', 'Pooja',
  'Poonam', 'Prachi', 'Pragya', 'Pranali', 'Preeti', 'Priya', 'Priyanka', 'Rachna', 'Radha', 'Rakhi',
  'Rashmi', 'Reena', 'Rekha', 'Renu', 'Renuka', 'Riddhi', 'Ritu', 'Rohini', 'Roma', 'Rupa',
  'Rupal', 'Sakshi', 'Sangeeta', 'Sanjana', 'Sapna', 'Sarita', 'Seema', 'Shailaja', 'Shalini', 'Sharmila',
  'Sheetal', 'Shikha', 'Shilpa', 'Shobha', 'Shweta', 'Simran', 'Smita', 'Snehal', 'Sonali', 'Soni',
  'Sonia', 'Sudha', 'Sujata', 'Suman', 'Sunita', 'Sushma', 'Swati', 'Tanuja', 'Tejal', 'Uma',
  'Urmila', 'Urvashi', 'Vaishali', 'Vandana', 'Varsha', 'Vibha', 'Vidya', 'Vineeta', 'Yamini'
];

const INDIAN_LAST_NAMES = [
  'Acharya', 'Adhikari', 'Agarwal', 'Agnihotri', 'Ahluwalia', 'Ahuja', 'Ambani', 'Amin', 'Anand', 'Apte',
  'Arora', 'Awasthi', 'Bagchi', 'Bajaj', 'Bakshi', 'Balakrishnan', 'Banerjee', 'Bansal', 'Barman', 'Barua',
  'Basu', 'Batra', 'Bedi', 'Bera', 'Bhaduri', 'Bhagat', 'Bhalerao', 'Bhalla', 'Bhandari', 'Bharadwaj',
  'Bhargava', 'Bhat', 'Bhatia', 'Bhatt', 'Bhattacharya', 'Bhowmick', 'Bindra', 'Biswas', 'Bora', 'Bose',
  'Chadda', 'Chahal', 'Chakraborty', 'Chander', 'Chandra', 'Chandrasekhar', 'Chatterjee', 'Chattopadhyay', 'Chaturvedi', 'Chauhan',
  'Chhabra', 'Chopra', 'Choudhary', 'Choudhury', 'Dalal', 'Damle', 'Dani', 'Das', 'Dasgupta', 'Datta',
  'Dave', 'Deol', 'Desai', 'Deshmukh', 'Deshpande', 'Dewan', 'Dey', 'Dhawan', 'Dhillon', 'Dixit',
  'Dubey', 'Dutta', 'Engineer', 'Fernandes', 'Gadkari', 'Gaikwad', 'Gandhi', 'Ganguly', 'Garg', 'Gaur',
  'Gautam', 'Ghosh', 'Ghoshal', 'Gill', 'Goel', 'Goenka', 'Gokhale', 'Gopal', 'Gopalan', 'Goswami',
  'Goyal', 'Grover', 'Guha', 'Gulati', 'Gupta', 'Hegde', 'Hooda', 'Iyengar', 'Iyer', 'Jadhav',
  'Jagtap', 'Jain', 'Jaiswal', 'Jani', 'Jha', 'Jindal', 'Johar', 'Joshi', 'Juneja', 'Kadam',
  'Kakkar', 'Kale', 'Kamath', 'Kapoor', 'Kashyap', 'Kaul', 'Kaur', 'Kaushik', 'Kelkar', 'Khan',
  'Khandelwal', 'Khanna', 'Khatri', 'Khera', 'Khosla', 'Khurana', 'Kohli', 'Kothari', 'Kulkarni', 'Kumar',
  'Kundu', 'Lahiri', 'Lal', 'Lamba', 'Lodha', 'Madan', 'Madhavan', 'Mahajan', 'Maheshwari', 'Malhotra',
  'Malik', 'Mallick', 'Manchanda', 'Mangal', 'Mathur', 'Mazumdar', 'Mehra', 'Mehta', 'Menon', 'Merchant',
  'Mishra', 'Mitra', 'Mittal', 'Modi', 'Mohanty', 'Mukherjee', 'Murthy', 'Nadkarni', 'Nagpal', 'Naidu',
  'Naik', 'Nair', 'Nambiar', 'Nanda', 'Narang', 'Narayan', 'Natarajan', 'Nayak', 'Negi', 'Nigam',
  'Oberoi', 'Pai', 'Pal', 'Pandey', 'Pandit', 'Pandya', 'Panicker', 'Pant', 'Parekh', 'Parikh',
  'Patel', 'Pathak', 'Patil', 'Patnaik', 'Paul', 'Pawar', 'Pillai', 'Poddar', 'Prabhu', 'Pradhan',
  'Prasad', 'Puri', 'Radhakrishnan', 'Raghavan', 'Rai', 'Raina', 'Raj', 'Rajput', 'Raju', 'Ramachandran',
  'Raman', 'Ramaswamy', 'Rana', 'Rao', 'Rastogi', 'Rathore', 'Rawat', 'Ray', 'Reddy', 'Roy',
  'Sabharwal', 'Sachdev', 'Sahni', 'Saini', 'Sandhu', 'Sanyal', 'Saraf', 'Sarin', 'Sarkar', 'Sarma',
  'Saxena', 'Sehgal', 'Sen', 'Sengupta', 'Seth', 'Sethi', 'Shah', 'Sharma', 'Shastri', 'Shetty',
  'Shinde', 'Shukla', 'Singhal', 'Singhania', 'Sinha', 'Somani', 'Soni', 'Sood', 'Srinivasan', 'Srivastava',
  'Subramanian', 'Sundaram', 'Suri', 'Swaminathan', 'Talwar', 'Tandon', 'Tendulkar', 'Thakur', 'Thapar', 'Tiwari',
  'Tripathi', 'Trivedi', 'Tyagi', 'Upadhyay', 'Varma', 'Verma', 'Vora', 'Vyas', 'Wadhwa', 'Walia', 'Yadav'
];

const PORTRAIT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534751516642-a1714f3f0e08?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1584999734482-0361aecad844?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1548142813-c348350df52b?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250&auto=format&fit=crop&q=80'
];

const DOMAINS = ['urbanfurniture.com', 'gmail.com', 'outlook.com', 'yahoo.in', 'icloud.com', 'designarch.in', 'tatamotors.com', 'tcs.co.in'];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomPhone() {
  const p = getRandom(['98', '97', '99', '96', '95', '93', '91', '88', '87', '89', '85', '70', '79']);
  const num = Math.floor(10000000 + Math.random() * 90000000).toString().substring(0, 8);
  return `+91 ${p}${num.substring(0, 3)} ${num.substring(3)}`;
}

async function seedMoreIndianUsers() {
  console.log('🚀 Generating 250 additional Indian user accounts with authentic profile images...');

  const org = await prisma.organizations.findFirst({
    where: { name: 'Urban Furniture' }
  }) || await prisma.organizations.findFirst();

  if (!org) throw new Error('Organization not found.');

  const hashedPassword = await bcrypt.hash('Password@123', 10);

  const existingUsers = await prisma.app_users.findMany({
    select: { login_id: true, email: true }
  });
  const usedLoginIds = new Set(existingUsers.map(u => u.login_id.toLowerCase()));
  const usedEmails = new Set(existingUsers.map(u => u.email.toLowerCase()));

  const TARGET = 250;
  const newUsers = [];

  for (let i = 1; i <= TARGET; i++) {
    const fn = getRandom(INDIAN_FIRST_NAMES);
    const ln = getRandom(INDIAN_LAST_NAMES);
    const displayName = `${fn} ${ln}`;

    let baseSlug = `${fn.toLowerCase()}.${ln.toLowerCase()}`.replace(/[^a-z0-9.]/g, '');
    let loginId = baseSlug;
    let email = `${loginId}@${getRandom(DOMAINS)}`;

    let suffix = 2;
    while (usedLoginIds.has(loginId) || usedEmails.has(email)) {
      loginId = `${baseSlug}${suffix}`;
      email = `${baseSlug}${suffix}@${getRandom(DOMAINS)}`;
      suffix++;
    }

    usedLoginIds.add(loginId);
    usedEmails.add(email);

    // Give some direct Unsplash portrait images, and diverse Dicebear / UI Avatars
    let imageUrl;
    if (i % 3 === 0 && PORTRAIT_AVATARS[i % PORTRAIT_AVATARS.length]) {
      imageUrl = PORTRAIT_AVATARS[i % PORTRAIT_AVATARS.length];
    } else {
      const seed = encodeURIComponent(displayName);
      const styles = ['personas', 'lorelei', 'avataaars', 'bottts'];
      const style = styles[i % styles.length];
      imageUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
    }

    const isAccountant = i % 8 === 0;
    const role = isAccountant ? 'Accountant' : 'User';
    const membershipRole = isAccountant ? 'accountant' : 'user';

    newUsers.push({
      login_id: loginId,
      email,
      display_name: displayName,
      phone: getRandomPhone(),
      role,
      membershipRole,
      image_url: imageUrl
    });
  }

  console.log(`📝 Inserting ${newUsers.length} users into MySQL...`);

  let insertedCount = 0;
  const BATCH_SIZE = 25;

  for (let i = 0; i < newUsers.length; i += BATCH_SIZE) {
    const batch = newUsers.slice(i, i + BATCH_SIZE);

    for (const u of batch) {
      const user = await prisma.app_users.create({
        data: {
          login_id: u.login_id,
          email: u.email,
          password_hash: hashedPassword,
          display_name: u.display_name,
          phone: u.phone,
          role: u.role,
          image_url: u.image_url,
          is_active: true
        }
      });

      await prisma.organization_memberships.create({
        data: {
          organization_id: org.id,
          user_id: user.id,
          role: u.membershipRole,
          is_active: true
        }
      });

      insertedCount++;
    }

    console.log(`   ⏳ Created ${insertedCount} / ${TARGET} users with images...`);
  }

  const finalTotal = await prisma.app_users.count();
  console.log(`\n🎉 SUCCESS: Created ${insertedCount} additional Indian users with photos!`);
  console.log(`📊 Grand total users registered: ${finalTotal}`);
  console.log(`🔑 All accounts can log in with password: "Password@123"`);
}

seedMoreIndianUsers()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('❌ Error creating more users:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
