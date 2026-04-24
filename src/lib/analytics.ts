/**
 * Simple Analytics Utility for GreenBloom
 * In a real production app, this would integrate with Firebase Analytics
 */

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  const timestamp = new Date().toISOString();
  console.log(`[Analytics] ${timestamp} - ${eventName}`, params);
  
  // Example of how to send to Firebase in the future:
  // logEvent(analytics, eventName, params);
};

export const trackPageView = (pageName: string) => {
  trackEvent('page_view', { page: pageName });
};

export const trackAddToCart = (productId: string, productName: string, price: number) => {
  trackEvent('add_to_cart', { product_id: productId, name: productName, value: price });
};

export const trackPurchase = (orderId: string, amount: number, itemsCount: number) => {
  trackEvent('purchase', { order_id: orderId, value: amount, items: itemsCount });
};
