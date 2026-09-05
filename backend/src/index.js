import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { prisma } from './lib/prisma.js';
import authRouter from './routes/auth.js';
import contactsRouter from './routes/contacts.js';
import productsRouter from './routes/products.js';
import chartOfAccountsRouter from './routes/chartOfAccounts.js';
import analyticAccountsRouter from './routes/analyticAccounts.js';
import budgetsRouter from './routes/budgets.js';
import purchasesRouter from './routes/purchases.js';
import salesRouter from './routes/sales.js';
import journalsRouter from './routes/journals.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check Endpoints
app.get('/api/health', async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    response.json({ status: 'ok', database: 'connected', message: 'FurniLegger Accounting System API is running' });
  } catch (error) {
    console.error('Database health check failed:', error.message);
    response.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

app.get('/api/md', (_request, response) => {
  response.json({ status: 'ok', message: 'FurniLegger Accounting System API is running' });
});

app.use('/api/auth', authRouter);
app.use('/api/master-data', contactsRouter);
app.use('/api/master-data', productsRouter);
app.use('/api/master-data', chartOfAccountsRouter);
app.use('/api', analyticAccountsRouter);
app.use('/api', budgetsRouter);
app.use('/api', purchasesRouter);
app.use('/api', salesRouter);
app.use('/api', journalsRouter);

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`FurniLegger API listening on http://localhost:${port}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);