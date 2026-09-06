// Razorpay Payment Gateway Integration for FurniLedger & Urban Furniture
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SZXuirQOMvenHN';

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Trigger Razorpay Standard Checkout Popup
 */
export async function openRazorpayCheckout({
  amount = 0, // Amount in INR
  invoiceId = '',
  customerName = 'Valued Customer',
  customerEmail = 'customer@urbanfurniture.com',
  customerPhone = '9876543210',
  description = 'Payment for Furniture Invoice',
  onSuccess,
  onDismiss
}) {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    alert('Razorpay Payment Gateway failed to load. Please verify your internet connection.');
    return;
  }

  const paiseAmount = Math.max(100, Math.round(Number(amount) * 100)); // Minimum ₹1 = 100 paise

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: paiseAmount,
    currency: 'INR',
    name: 'Urban Furniture Accounting',
    description: description || `Settlement for ${invoiceId}`,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&auto=format&fit=crop&q=80',
    prefill: {
      name: customerName || 'Valued Customer',
      email: customerEmail || 'customer@urbanfurniture.com',
      contact: customerPhone || '9820145892'
    },
    notes: {
      invoiceId: invoiceId || 'INV-DIRECT',
      system: 'FurniLedger Accounting ERP'
    },
    theme: {
      color: '#D4AF37' // Signature FurniLedger Gold
    },
    handler: function (response) {
      console.log('✅ Razorpay payment success:', response);
      if (onSuccess) {
        onSuccess(response);
      }
    },
    modal: {
      ondismiss: function () {
        console.log('Razorpay modal dismissed by user');
        if (onDismiss) {
          onDismiss();
        }
      }
    }
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response) {
      console.error('❌ Razorpay payment failed:', response.error);
      alert(`Razorpay Payment Failed: ${response.error?.description || 'Transaction unsuccessful'}`);
    });
    rzp.open();
  } catch (err) {
    console.error('Error opening Razorpay checkout:', err);
    alert('Could not initialize Razorpay checkout. Please try again.');
  }
}
