import jwt from 'jsonwebtoken';

export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  ACCOUNTANT: 'ACCOUNTANT',
  USER: 'USER',
});

const ROLE_ALIASES = {
  admin: ROLES.ADMIN,
  ADMIN: ROLES.ADMIN,
  accountant: ROLES.ACCOUNTANT,
  ACCOUNTANT: ROLES.ACCOUNTANT,
  contact_portal: ROLES.USER,
  USER: ROLES.USER,
};

export function normalizeRole(role) {
  return ROLE_ALIASES[role] ?? null;
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    req.user.role = normalizeRole(req.user.role);
    if (!req.user.role) return res.status(403).json({ error: 'Invalid role' });
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles) {
  const allowedRoles = roles.map(normalizeRole).filter(Boolean);
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient role' });
    }
    return next();
  };
}

// Forces any contact_id a USER references (params, query, or body) to their
// own contact_id, so they can never read or write another contact's data by passing a different id.
export function scopeToOwnContact(req, res, next) {
  if (req.user?.role !== ROLES.USER) {
    return next();
  }

  if (!req.user.contact_id) {
    return res.status(403).json({ error: 'Account has no linked contact' });
  }

  if (req.params?.contactId) req.params.contactId = req.user.contact_id;
  if (req.query?.contact_id) req.query.contact_id = req.user.contact_id;
  if (req.body && typeof req.body === 'object' && 'contact_id' in req.body) {
    req.body.contact_id = req.user.contact_id;
  }

  req.contactId = req.user.contact_id;
  return next();
}
