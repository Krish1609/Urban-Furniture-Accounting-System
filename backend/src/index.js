import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

import prisma from './lib/prisma.js';
import { errorHandler } from './middleware/error.middleware.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import contactsRoutes from './routes/contacts.routes.js';
import productsRoutes from './routes/products.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import invoicesRoutes from './routes/invoices.routes.js';
import accountingRoutes from './routes/accounting.routes.js';
import budgetsRoutes from './routes/budgets.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import portalRoutes from './routes/portal.routes.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Health Check Endpoints
app.get('/api/health', async (_request, response) => {
  try {
    const org = await prisma.organizations.findFirst();
    response.json({
      status: 'ok',
      message: 'FurniLedger Accounting System API is running',
      database: 'connected (XAMPP MySQL)',
      organization: org?.name || 'Urban Furniture'
    });
  } catch (error) {
    response.status(500).json({
      status: 'error',
      message: 'Database connection error',
      error: error.message
    });
  }
});

app.get('/api/md', (_request, response) => {
  response.json({ status: 'ok', message: 'FurniLedger Accounting System API is running' });
});

// Mount All Feature API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/budgets', budgetsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/portal', portalRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`🚀 FurniLedger API listening on http://localhost:${port}`);
});

export default app;