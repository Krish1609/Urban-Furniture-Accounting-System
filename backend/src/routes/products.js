import { Router } from 'express';

import { prisma } from '../lib/prisma.js';
import { resolveOrganizationId } from '../lib/organization.js';
import { handleKnownPrismaErrors } from '../lib/prismaErrors.js';
import { isNonEmptyString, isNonNegativeNumber } from '../lib/validators.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

const PRODUCT_TYPES = ['goods', 'service', 'combo'];

router.get('/products', requireAuth, async (req, res, next) => {
  try {
    const { organization_id: organizationId } = req.query;
    const products = await prisma.products.findMany({
      where: {
        is_active: true,
        ...(organizationId ? { organization_id: organizationId } : {}),
      },
      orderBy: { name: 'asc' },
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
});

router.post('/products', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const {
      name,
      product_type: productType,
      category_id: categoryId,
      sku,
      sales_price: salesPrice,
      cost_price: costPrice,
      image_url: imageUrl,
      organization_id: organizationId,
    } = req.body ?? {};

    if (!isNonEmptyString(name)) {
      return res.status(400).json({ error: 'name is required' });
    }
    if (!PRODUCT_TYPES.includes(productType)) {
      return res.status(400).json({ error: `product_type must be one of: ${PRODUCT_TYPES.join(', ')}` });
    }
    if (salesPrice !== undefined && !isNonNegativeNumber(salesPrice)) {
      return res.status(400).json({ error: 'sales_price must be a non-negative number' });
    }
    if (costPrice !== undefined && !isNonNegativeNumber(costPrice)) {
      return res.status(400).json({ error: 'cost_price must be a non-negative number' });
    }

    const resolvedOrganizationId = await resolveOrganizationId(organizationId);
    if (!resolvedOrganizationId) {
      return res.status(400).json({ error: 'organization_id is required' });
    }

    if (categoryId) {
      const category = await prisma.product_categories.findFirst({
        where: { id: categoryId, organization_id: resolvedOrganizationId },
        select: { id: true },
      });
      if (!category) {
        return res.status(400).json({ error: 'category_id does not belong to organization_id' });
      }
    }

    const product = await prisma.products.create({
      data: {
        organization_id: resolvedOrganizationId,
        category_id: categoryId ?? null,
        name,
        product_type: productType,
        sku: sku ?? null,
        sales_price: salesPrice ?? 0,
        cost_price: costPrice ?? 0,
        image_url: imageUrl ?? null,
        created_by_user_id: req.user.id,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

router.patch('/products/:id/archive', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const product = await prisma.products.update({
      where: { id: req.params.id },
      data: { is_active: false, updated_by_user_id: req.user.id },
    });
    res.json(product);
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

export default router;
