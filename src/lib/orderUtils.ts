
import { Product } from "@/data/products";
import { ShoppingBag, CreditCard } from "lucide-react";

// Define the Product type using the Database types

export interface CartItem {
  product:  Product;
  quantity: number;
}

export interface OrderDetails {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  order_total: number;
  payment_method: string;
  tracking_code: string;
  items: CartItem[];
}

/**
 * Format order items into a readable text format for WhatsApp
 */
export const formatOrderItemsForWhatsApp = (items: CartItem[]): string => {
  return items.map(item => 
    `${item.quantity}x ${item.product.name} - $${(item.product.price * item.quantity).toFixed(2)}`
  ).join('\n');
};

/**
 * Format the entire order into a WhatsApp message
 */
export const formatOrderForWhatsApp = (order: OrderDetails): string => {
  const orderItems = formatOrderItemsForWhatsApp(order.items);
  const paymentIcon = order.payment_method === 'Hubtel' ? '💳' : '📱';
  
  return (
    `*New Order #${order.tracking_code}* ${paymentIcon}\n\n` +
    `*Customer*: ${order.customer_name}\n` +
    `*Phone*: ${order.customer_phone}\n` +
    `*Email*: ${order.customer_email}\n` +
    `*Address*: ${order.shipping_address}\n\n` +
    `*Order Items*:\n${orderItems}\n\n` +
    `*Total*: $${order.order_total.toFixed(2)}\n` +
    `*Payment Method*: ${order.payment_method === 'Hubtel' ? 'Hubtel (Online)' : 'WhatsApp (Pay on Delivery)'}\n` +
    `*Tracking Code*: ${order.tracking_code}`
  );
};

/**
 * Send order details to WhatsApp
 */
export const sendOrderToWhatsApp = (message: string, phoneNumber: string = '1234567890'): void => {
  // Encode the message for WhatsApp
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  
  // Open WhatsApp in a new tab
  window.open(whatsappUrl, '_blank');
};
