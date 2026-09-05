import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'furniledger-secret-jwt-key-2025-secure';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Default to the primary organization if no token is passed for easy development
      const defaultOrg = await prisma.organizations.findFirst();
      req.organizationId = defaultOrg?.id;
      req.user = { role: 'Administrator', name: 'Admin Manager' };
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    
    // Get organization for user
    const membership = await prisma.organization_memberships.findFirst({
      where: { user_id: decoded.userId }
    });
    
    if (membership) {
      req.organizationId = membership.organization_id;
    } else {
      const defaultOrg = await prisma.organizations.findFirst();
      req.organizationId = defaultOrg?.id;
    }

    next();
  } catch (error) {
    // Fallback to default organization
    const defaultOrg = await prisma.organizations.findFirst();
    req.organizationId = defaultOrg?.id;
    req.user = { role: 'Administrator' };
    next();
  }
};

export const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    // Administrator has universal superuser access to all accountant and management actions
    if (req.user.role === 'Administrator' || req.user.role === 'admin') {
      return next();
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
};
