import { prisma } from './prisma.js';

// Falls back to the sole organization when the caller doesn't specify one;
// returns null when there's ambiguity (zero or multiple organizations) and none was given.
export async function resolveOrganizationId(organizationId) {
  if (organizationId) return organizationId;
  const organizations = await prisma.organizations.findMany({ take: 2, select: { id: true } });
  if (organizations.length === 1) return organizations[0].id;
  return null;
}
