import { Prisma } from '@prisma/client';

export function handleKnownPrismaErrors(error, res) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const fields = error.meta?.target;
      return res.status(409).json({ error: `Already exists${fields ? ` (conflicting: ${fields})` : ''}` });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Not found' });
    }
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Referenced record does not exist' });
    }
  }
  return null;
}
