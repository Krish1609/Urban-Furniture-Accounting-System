import prisma from '../lib/prisma.js';

export const getProducts = async (req, res, next) => {
  try {
    const orgId = req.organizationId || (await prisma.organizations.findFirst())?.id;
    if (!orgId) return res.json({ success: true, data: [] });

    const products = await prisma.products.findMany({
      where: { organization_id: orgId, deleted_at: null },
      include: {
        product_categories: true,
        inventory_movements: true
      },
      orderBy: { created_at: 'desc' }
    });

    const formatted = products.map(p => {
      // Calculate current stock quantity
      const stockDelta = p.inventory_movements.reduce((sum, m) => sum + Number(m.quantity_delta), 0);
      const stockQty = p.product_type === 'service' ? 999 : Math.max(0, 20 + stockDelta);

      let typeDisplay = 'Goods';
      if (p.product_type === 'service') typeDisplay = 'Service';
      else if (p.product_type === 'combo') typeDisplay = 'Combo';

      return {
        id: p.id,
        name: p.name,
        type: typeDisplay,
        category: p.product_categories?.name || 'General',
        salesPrice: Number(p.sales_price) || 0,
        costPrice: Number(p.cost_price) || 0,
        image: p.image_url || '',
        imageUrl: p.image_url || '',
        taxRate: 18,
        stockQty,
        sku: p.sku || `SKU-${p.id.slice(0, 6).toUpperCase()}`,
        isActive: p.is_active,
        createdAt: p.created_at
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const orgId = req.organizationId || (await prisma.organizations.findFirst())?.id;
    const { name, type = 'Goods', category = 'General', salesPrice, costPrice, sku, stockQty, image, imageUrl } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    // Find or create category on the fly
    let categoryId = null;
    if (category) {
      let cat = await prisma.product_categories.findFirst({
        where: { organization_id: orgId, name: category.trim() }
      });
      if (!cat) {
        cat = await prisma.product_categories.create({
          data: { organization_id: orgId, name: category.trim() }
        });
      }
      categoryId = cat.id;
    }

    const generatedSku = sku || `${name.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const pType = type.toLowerCase() === 'service' ? 'service' : type.toLowerCase() === 'combo' ? 'combo' : 'goods';

    const newProduct = await prisma.products.create({
      data: {
        organization_id: orgId,
        category_id: categoryId,
        name,
        product_type: pType,
        sku: generatedSku,
        sales_price: Number(salesPrice) || 0,
        cost_price: Number(costPrice) || 0,
        image_url: image || imageUrl || null,
        is_active: true
      },
      include: {
        product_categories: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        id: newProduct.id,
        name: newProduct.name,
        type: newProduct.product_type === 'service' ? 'Service' : newProduct.product_type === 'combo' ? 'Combo' : 'Goods',
        category: newProduct.product_categories?.name || category,
        salesPrice: Number(newProduct.sales_price),
        costPrice: Number(newProduct.cost_price),
        image: newProduct.image_url || '',
        imageUrl: newProduct.image_url || '',
        taxRate: 18,
        stockQty: Number(stockQty) || 25,
        sku: newProduct.sku,
        isActive: newProduct.is_active
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, category, salesPrice, costPrice, sku, is_active, image, imageUrl } = req.body;

    const orgId = req.organizationId || (await prisma.organizations.findFirst())?.id;

    let categoryId = undefined;
    if (category) {
      let cat = await prisma.product_categories.findFirst({
        where: { organization_id: orgId, name: category }
      });
      if (!cat) {
        cat = await prisma.product_categories.create({
          data: { organization_id: orgId, name: category }
        });
      }
      categoryId = cat.id;
    }

    const updated = await prisma.products.update({
      where: { id },
      data: {
        name: name || undefined,
        product_type: type ? (type.toLowerCase() === 'service' ? 'service' : type.toLowerCase() === 'combo' ? 'combo' : 'goods') : undefined,
        category_id: categoryId,
        sales_price: salesPrice !== undefined ? Number(salesPrice) : undefined,
        cost_price: costPrice !== undefined ? Number(costPrice) : undefined,
        image_url: (image !== undefined || imageUrl !== undefined) ? (image || imageUrl || null) : undefined,
        sku: sku || undefined,
        is_active: is_active !== undefined ? is_active : undefined
      },
      include: { product_categories: true }
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        id: updated.id,
        name: updated.name,
        type: updated.product_type === 'service' ? 'Service' : updated.product_type === 'combo' ? 'Combo' : 'Goods',
        category: updated.product_categories?.name || category,
        salesPrice: Number(updated.sales_price),
        costPrice: Number(updated.cost_price),
        image: updated.image_url || '',
        imageUrl: updated.image_url || '',
        sku: updated.sku,
        isActive: updated.is_active
      }
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.products.update({
      where: { id },
      data: { deleted_at: new Date(), is_active: false }
    });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};
