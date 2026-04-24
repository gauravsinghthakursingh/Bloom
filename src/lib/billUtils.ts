import { Order } from '../types';

export const generateOrderSummary = (order: Order) => {
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  let summary = `🌱 *GreenBloom Order Invoice* 🌱\n`;
  summary += `Order ID: #${order.id.slice(-6).toUpperCase()}\n`;
  summary += `Date: ${date}\n`;
  summary += `---------------------------\n`;
  
  order.items.forEach((item, index) => {
    const name = item.product?.name || 'Plant';
    const price = item.product?.price || 0;
    summary += `${index + 1}. ${name}\n`;
    summary += `   Qty: ${item.quantity} x ₹${price} = ₹${item.quantity * price}\n`;
  });

  summary += `---------------------------\n`;
  summary += `*Total Amount: ₹${order.totalAmount}*\n`;
  summary += `---------------------------\n`;
  summary += `Delivery to: ${order.shippingAddress.city}\n`;
  summary += `Thank you for shopping with GreenBloom! 🌿`;

  return summary;
};

export const shareViaWhatsApp = (summary: string) => {
  const url = `https://wa.me/?text=${encodeURIComponent(summary)}`;
  window.open(url, '_blank');
};

export const shareViaEmail = (order: Order, summary: string) => {
  const subject = encodeURIComponent(`Invoice for GreenBloom Order #${order.id.slice(-6).toUpperCase()}`);
  const body = encodeURIComponent(summary.replace(/\*/g, '')); // Remove bold markdown for email
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
};

export const shareViaSMS = (summary: string) => {
  const body = encodeURIComponent(summary.replace(/\*/g, ''));
  window.location.href = `sms:?&body=${body}`;
};

export const contactSupportWhatsApp = (message?: string) => {
  const supportNumber = '919000000000'; // Placeholder Indian number, user can update
  const defaultMessage = 'Hello GreenBloom Support, I need help with my plant query.';
  const url = `https://wa.me/${supportNumber}?text=${encodeURIComponent(message || defaultMessage)}`;
  window.open(url, '_blank');
};
