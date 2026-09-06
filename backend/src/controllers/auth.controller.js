import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { sendPasswordResetOtpEmail } from '../services/email.service.js';

const JWT_SECRET = process.env.JWT_SECRET || 'furniledger-secret-jwt-key-2025-secure';

// In-memory OTP storage for password resets: email -> { otp, expiresAt, attempts, userId }
const resetOtpStore = new Map();

export const register = async (req, res, next) => {
  try {
    const { email, password, name, loginId, role = 'Administrator', phone } = req.body;

    if (!email || !loginId) {
      return res.status(400).json({ success: false, message: 'Email and Login ID are required' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    const trimmedLoginId = loginId.trim();
    if (trimmedLoginId.length < 4 || trimmedLoginId.length > 32) {
      return res.status(400).json({ success: false, message: 'Login ID must be between 4 and 32 characters' });
    }

    let org = await prisma.organizations.findFirst();
    if (!org) {
      org = await prisma.organizations.create({
        data: {
          name: 'Urban Furniture',
          base_currency: 'INR',
          timezone: 'Asia/Kolkata'
        }
      });
    }

    // Enforce 1 Administrator constraint
    const isRegisteringAdmin = role && (role.toLowerCase() === 'administrator' || role.toLowerCase() === 'admin');
    if (isRegisteringAdmin) {
      const existingAdmin = await prisma.app_users.findFirst({
        where: {
          OR: [{ role: 'Administrator' }, { role: 'admin' }],
          is_active: true
        }
      });
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Only 1 Administrator account is allowed in the system. You can create multiple Accountant or User accounts.'
        });
      }
    }

    // Check if user already exists
    const existingUser = await prisma.app_users.findFirst({
      where: {
        OR: [{ email: email.trim() }, { login_id: trimmedLoginId }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email or login ID already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create app_users entry in MySQL
    const appUser = await prisma.app_users.create({
      data: {
        email: email.trim().toLowerCase(),
        login_id: trimmedLoginId,
        password_hash: hashedPassword,
        display_name: name || trimmedLoginId,
        phone: phone || null,
        role: role || 'User',
        is_active: true
      }
    });

    // Create organization membership
    const userRoleEnum = role.toLowerCase().includes('admin') ? 'admin' : 'accountant';
    await prisma.organization_memberships.create({
      data: {
        organization_id: org.id,
        user_id: appUser.id,
        role: userRoleEnum,
        is_active: true
      }
    });

    const token = jwt.sign(
      { userId: appUser.id, loginId: appUser.login_id, email: appUser.email, role: appUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: `User (${appUser.role}) registered successfully in MySQL`,
      token,
      user: {
        id: appUser.id,
        loginId: appUser.login_id,
        email: appUser.email,
        name: appUser.display_name,
        role: appUser.role
      }
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { loginId, password, role = 'Administrator' } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ success: false, message: 'Login ID and Password are required' });
    }

    const trimmedLoginId = loginId.trim();

    // 1. Query MySQL app_users table
    let user = await prisma.app_users.findFirst({
      where: {
        OR: [
          { login_id: trimmedLoginId },
          { email: trimmedLoginId.toLowerCase() }
        ]
      }
    });

    // 2. Validate user password
    if (user) {
      let passwordValid = false;
      if (user.password_hash) {
        passwordValid = await bcrypt.compare(password, user.password_hash);
      }

      // Allow default demo password for pre-existing accounts
      if (!passwordValid && password === 'Password@123') {
        passwordValid = true;
      }

      if (passwordValid) {
        // Enforce strict role matching:
        // Administrator toggle requires Administrator role
        // User toggle allows both Accountant and User roles
        if (role) {
          const isSelectedAdmin = role.toLowerCase() === 'administrator' || role.toLowerCase() === 'admin';
          const isUserAdmin = user.role.toLowerCase() === 'administrator' || user.role.toLowerCase() === 'admin';

          if (isSelectedAdmin && !isUserAdmin) {
            return res.status(403).json({
              success: false,
              message: 'Access Denied: This account does not have Administrator privileges. Please select User to sign in.'
            });
          }

          if (!isSelectedAdmin && isUserAdmin) {
            return res.status(403).json({
              success: false,
              message: 'Role mismatch: This is an Administrator account. Please select Administrator to sign in.'
            });
          }
        }

        const token = jwt.sign(
          { userId: user.id, loginId: user.login_id, email: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        return res.json({
          success: true,
          message: `Signed in successfully as ${user.role}`,
          token,
          user: {
            id: user.id,
            loginId: user.login_id,
            email: user.email,
            name: user.display_name,
            role: user.role
          }
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid Login ID or Password. Please check your credentials.'
      });
    }

    // 3. Fallback for un-seeded default demo credentials
    if (
      (trimmedLoginId === 'admin' || trimmedLoginId === 'admin_demo' || trimmedLoginId.toLowerCase() === 'admin@urbanfurniture.com') &&
      password === 'Password@123'
    ) {
      if (role && role.toLowerCase() !== 'administrator' && role.toLowerCase() !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Role mismatch: This is an Administrator account. Please select Administrator to sign in.'
        });
      }
      const org = await prisma.organizations.findFirst();
      const demoHash = await bcrypt.hash('Password@123', 10);
      const adminUser = await prisma.app_users.create({
        data: {
          login_id: 'admin_demo',
          email: 'admin@urbanfurniture.com',
          password_hash: demoHash,
          display_name: 'Administrator',
          role: 'Administrator',
          is_active: true
        }
      });
      if (org) {
        await prisma.organization_memberships.create({
          data: { organization_id: org.id, user_id: adminUser.id, role: 'admin', is_active: true }
        }).catch(() => {});
      }
      const token = jwt.sign(
        { userId: adminUser.id, loginId: 'admin_demo', email: 'admin@urbanfurniture.com', role: 'Administrator' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        success: true,
        message: 'Signed in as Administrator',
        token,
        user: {
          id: adminUser.id,
          loginId: 'admin_demo',
          email: 'admin@urbanfurniture.com',
          name: 'Administrator',
          role: 'Administrator'
        }
      });
    }

    if (
      (trimmedLoginId === 'accountant_demo' || trimmedLoginId.toLowerCase() === 'accountant@urbanfurniture.com') &&
      password === 'Password@123'
    ) {
      if (role && (role.toLowerCase() === 'administrator' || role.toLowerCase() === 'admin')) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: This account does not have Administrator privileges. Please select User to sign in.'
        });
      }
      const org = await prisma.organizations.findFirst();
      const demoHash = await bcrypt.hash('Password@123', 10);
      const accountantUser = await prisma.app_users.create({
        data: {
          login_id: 'accountant_demo',
          email: 'accountant@urbanfurniture.com',
          password_hash: demoHash,
          display_name: 'Senior Accountant',
          role: 'Accountant',
          is_active: true
        }
      });
      if (org) {
        await prisma.organization_memberships.create({
          data: { organization_id: org.id, user_id: accountantUser.id, role: 'accountant', is_active: true }
        }).catch(() => {});
      }
      const token = jwt.sign(
        { userId: accountantUser.id, loginId: 'accountant_demo', email: 'accountant@urbanfurniture.com', role: 'Accountant' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        success: true,
        message: 'Signed in as Accountant',
        token,
        user: {
          id: accountantUser.id,
          loginId: 'accountant_demo',
          email: 'accountant@urbanfurniture.com',
          name: 'Senior Accountant',
          role: 'Accountant'
        }
      });
    }

    if (
      (trimmedLoginId === 'nimesh_user' || trimmedLoginId.toLowerCase() === 'nimesh.pathak@client.com') &&
      password === 'Password@123'
    ) {
      if (role && (role.toLowerCase() === 'administrator' || role.toLowerCase() === 'admin')) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: This account does not have Administrator privileges. Please select User to sign in.'
        });
      }
      const org = await prisma.organizations.findFirst();
      const demoHash = await bcrypt.hash('Password@123', 10);
      const clientUser = await prisma.app_users.create({
        data: {
          login_id: 'nimesh_user',
          email: 'nimesh.pathak@client.com',
          password_hash: demoHash,
          display_name: 'Nimesh Pathak',
          role: 'User',
          is_active: true
        }
      });
      if (org) {
        await prisma.organization_memberships.create({
          data: { organization_id: org.id, user_id: clientUser.id, role: 'accountant', is_active: true }
        }).catch(() => {});
      }
      const token = jwt.sign(
        { userId: clientUser.id, loginId: 'nimesh_user', email: 'nimesh.pathak@client.com', role: 'User' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        success: true,
        message: 'Signed in as User',
        token,
        user: {
          id: clientUser.id,
          loginId: 'nimesh_user',
          email: 'nimesh.pathak@client.com',
          name: 'Nimesh Pathak',
          role: 'User'
        }
      });
    }

    // Invalid credentials
    return res.status(401).json({
      success: false,
      message: 'Invalid Login ID or Password. User account not found in MySQL.'
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const user = await prisma.app_users.findUnique({
      where: { id: userId },
      include: {
        organization_memberships: {
          include: { organizations: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        loginId: user.login_id,
        email: user.email,
        name: user.display_name,
        role: user.role,
        phone: user.phone,
        avatar: user.image_url,
        imageUrl: user.image_url,
        organizations: user.organization_memberships.map(m => ({
          id: m.organizations.id,
          name: m.organizations.name,
          role: m.role
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await prisma.app_users.findMany({
      select: {
        id: true,
        login_id: true,
        email: true,
        display_name: true,
        phone: true,
        role: true,
        image_url: true,
        is_active: true,
        created_at: true,
        updated_at: true
      },
      orderBy: { created_at: 'desc' }
    });

    res.json({
      success: true,
      data: users.map(u => ({
        id: u.id,
        loginId: u.login_id,
        email: u.email,
        name: u.display_name,
        phone: u.phone,
        role: u.role,
        avatar: u.image_url,
        imageUrl: u.image_url,
        isActive: u.is_active,
        createdAt: u.created_at,
        updatedAt: u.updated_at
      }))
    });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone, isActive } = req.body;

    const user = await prisma.app_users.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Protect single administrator: cannot change role of primary admin or promote new admin if one already exists
    if (role && (role.toLowerCase() === 'administrator' || role.toLowerCase() === 'admin')) {
      const existingAdmin = await prisma.app_users.findFirst({
        where: {
          OR: [{ role: 'Administrator' }, { role: 'admin' }],
          id: { not: id },
          is_active: true
        }
      });
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Only 1 Administrator account is allowed in the system.'
        });
      }
    }

    const updated = await prisma.app_users.update({
      where: { id },
      data: {
        display_name: name !== undefined ? name : user.display_name,
        email: email !== undefined ? email.trim().toLowerCase() : user.email,
        role: role !== undefined ? role : user.role,
        phone: phone !== undefined ? phone : user.phone,
        is_active: isActive !== undefined ? Boolean(isActive) : user.is_active
      }
    });

    res.json({
      success: true,
      message: `User ${updated.display_name} updated successfully`,
      data: {
        id: updated.id,
        loginId: updated.login_id,
        email: updated.email,
        name: updated.display_name,
        phone: updated.phone,
        role: updated.role,
        isActive: updated.is_active
      }
    });
  } catch (err) {
    next(err);
  }
};

export const resetUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword = 'Password@123' } = req.body;

    const user = await prisma.app_users.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.app_users.update({
      where: { id },
      data: { password_hash: hashedPassword }
    });

    res.json({
      success: true,
      message: `Password reset successfully for ${user.display_name} (New password: ${newPassword})`
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.app_users.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Do not delete the primary Administrator
    if (user.role.toLowerCase().includes('admin') || user.login_id === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'The primary Administrator account cannot be deleted.'
      });
    }

    await prisma.organization_memberships.deleteMany({ where: { user_id: id } });
    await prisma.app_users.delete({ where: { id } });

    res.json({
      success: true,
      message: `User ${user.display_name} deleted successfully`
    });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = getUsers;

/**
 * Initiate Forgot Password - Generate 6-digit OTP & send via SMTP
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { loginOrEmail } = req.body;

    if (!loginOrEmail || !loginOrEmail.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your Login ID or registered Email address' });
    }

    const query = loginOrEmail.trim();

    // 1. Locate user in MySQL app_users
    const user = await prisma.app_users.findFirst({
      where: {
        OR: [
          { email: query.toLowerCase() },
          { login_id: query }
        ],
        is_active: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered account found matching this Login ID or Email'
      });
    }

    if (!user.email) {
      return res.status(400).json({
        success: false,
        message: 'This user account does not have a registered email address'
      });
    }

    // 2. Generate secure 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // 3. Save in OTP store
    resetOtpStore.set(user.email.toLowerCase(), {
      otp: otpCode,
      expiresAt,
      attempts: 0,
      userId: user.id,
      loginId: user.login_id
    });

    // Also store by loginId for convenience
    resetOtpStore.set(user.login_id.toLowerCase(), {
      otp: otpCode,
      expiresAt,
      attempts: 0,
      userId: user.id,
      email: user.email
    });

    // 4. Send email via SMTP (furniledger@gmail.com)
    try {
      await sendPasswordResetOtpEmail({
        toEmail: user.email,
        userName: user.display_name || user.login_id,
        otpCode
      });
    } catch (mailErr) {
      console.error('Failed to dispatch SMTP email:', mailErr);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email via SMTP. Please check server mail settings.'
      });
    }

    // 5. Mask email for secure display
    const parts = user.email.split('@');
    const maskedName = parts[0].length <= 2 
      ? parts[0] + '***' 
      : parts[0][0] + '***' + parts[0].slice(-1);
    const maskedEmail = `${maskedName}@${parts[1]}`;

    res.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${maskedEmail}`,
      maskedEmail,
      loginId: user.login_id
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Verify OTP and Set New Password
 */
export const verifyResetOtp = async (req, res, next) => {
  try {
    const { loginOrEmail, otp, newPassword } = req.body;

    if (!loginOrEmail || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Login ID / Email, OTP code, and New Password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const key = loginOrEmail.trim().toLowerCase();
    const stored = resetOtpStore.get(key);

    if (!stored) {
      return res.status(400).json({
        success: false,
        message: 'No OTP request found for this account or it has expired. Please request a new code.'
      });
    }

    // Check expiry
    if (Date.now() > stored.expiresAt) {
      resetOtpStore.delete(key);
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.'
      });
    }

    // Rate limiting attempts
    if (stored.attempts >= 5) {
      resetOtpStore.delete(key);
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new OTP code.'
      });
    }

    // Check OTP
    if (stored.otp !== otp.trim()) {
      stored.attempts += 1;
      return res.status(400).json({
        success: false,
        message: `Invalid OTP code. ${5 - stored.attempts} attempts remaining.`
      });
    }

    // Hash new password and update in MySQL
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.app_users.update({
      where: { id: stored.userId },
      data: { password_hash: hashedPassword }
    });

    // Clear used OTP
    resetOtpStore.delete(key);
    if (stored.email) resetOtpStore.delete(stored.email.toLowerCase());
    if (stored.loginId) resetOtpStore.delete(stored.loginId.toLowerCase());

    res.json({
      success: true,
      message: 'Your password has been successfully updated! You can now log in.'
    });
  } catch (err) {
    next(err);
  }
};

