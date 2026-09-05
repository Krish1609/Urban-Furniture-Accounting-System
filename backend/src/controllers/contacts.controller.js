import prisma from '../lib/prisma.js';

export const getContacts = async (req, res, next) => {
  try {
    const orgId = req.organizationId || (await prisma.organizations.findFirst())?.id;
    if (!orgId) return res.json({ success: true, data: [] });

    const contacts = await prisma.contacts.findMany({
      where: { organization_id: orgId, deleted_at: null },
      include: {
        contact_addresses: true,
        commercial_documents: {
          where: { deleted_at: null },
          include: { payment_allocations: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const formatted = contacts.map(c => {
      const primaryAddress = c.contact_addresses[0] || {};
      
      // Calculate financial metrics for contact
      let totalBilled = 0;
      let totalPaid = 0;

      c.commercial_documents.forEach(doc => {
        const docTotal = Number(doc.total_amount) || 0;
        if (doc.document_type === 'customer_invoice' || doc.document_type === 'vendor_bill') {
          totalBilled += docTotal;
          const paid = doc.payment_allocations.reduce((sum, alloc) => sum + Number(alloc.allocated_amount), 0);
          totalPaid += paid;
        }
      });

      const dueAmount = Math.max(0, totalBilled - totalPaid);

      return {
        id: c.id,
        name: c.display_name,
        type: c.contact_type === 'customer' ? 'Customer' : c.contact_type === 'vendor' ? 'Vendor' : 'Both',
        email: c.email || '',
        mobile: c.phone || '',
        phone: c.phone || '',
        image: c.image_url || '',
        imageUrl: c.image_url || '',
        street: primaryAddress.line1 || '',
        city: primaryAddress.city || '',
        state: primaryAddress.state || '',
        country: primaryAddress.country_code || 'IN',
        pincode: primaryAddress.postal_code || '',
        status: c.is_active ? 'Active' : 'Inactive',
        totalBilled,
        totalPaid,
        dueAmount,
        createdAt: c.created_at
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
};

export const createContact = async (req, res, next) => {
  try {
    const orgId = req.organizationId || (await prisma.organizations.findFirst())?.id;
    const { name, type = 'Customer', email, mobile, phone, street, city, state, country = 'IN', pincode, image, imageUrl } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Contact name is required' });
    }

    const contactType = type.toLowerCase() === 'vendor' ? 'vendor' : type.toLowerCase() === 'both' ? 'both' : 'customer';

    const newContact = await prisma.contacts.create({
      data: {
        organization_id: orgId,
        display_name: name,
        contact_type: contactType,
        email: email || null,
        phone: mobile || phone || null,
        image_url: image || imageUrl || null,
        is_active: true
      }
    });

    // Create address
    if (street || city || state || pincode || country) {
      await prisma.contact_addresses.create({
        data: {
          contact_id: newContact.id,
          address_type: 'billing',
          line1: street || `${name} Address`,
          city: city || null,
          state: state || null,
          postal_code: pincode || null,
          country_code: country || 'IN',
          is_default: true
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: {
        id: newContact.id,
        name: newContact.display_name,
        type: type,
        email: newContact.email || '',
        mobile: newContact.phone || '',
        phone: newContact.phone || '',
        image: newContact.image_url || '',
        imageUrl: newContact.image_url || '',
        street: street || '',
        city: city || '',
        state: state || '',
        country: country || 'IN',
        pincode: pincode || '',
        status: 'Active',
        totalBilled: 0,
        totalPaid: 0,
        dueAmount: 0
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, email, mobile, city, state, pincode, status } = req.body;

    const contactType = type ? (type.toLowerCase() === 'vendor' ? 'vendor' : 'customer') : undefined;
    const isActive = status ? status === 'Active' : undefined;

    const updated = await prisma.contacts.update({
      where: { id },
      data: {
        display_name: name || undefined,
        contact_type: contactType,
        email: email !== undefined ? email : undefined,
        phone: mobile !== undefined ? mobile : undefined,
        is_active: isActive
      }
    });

    if (city || state || pincode) {
      const existingAddr = await prisma.contact_addresses.findFirst({ where: { contact_id: id } });
      if (existingAddr) {
        await prisma.contact_addresses.update({
          where: { id: existingAddr.id },
          data: { city, state, postal_code: pincode }
        });
      } else {
        await prisma.contact_addresses.create({
          data: {
            contact_id: id,
            address_type: 'billing',
            line1: `${name || updated.display_name} Address`,
            city, state, postal_code: pincode, country_code: 'IN'
          }
        });
      }
    }

    res.json({ success: true, message: 'Contact updated successfully', data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.contacts.update({
      where: { id },
      data: { deleted_at: new Date(), is_active: false }
    });
    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (err) {
    next(err);
  }
};
