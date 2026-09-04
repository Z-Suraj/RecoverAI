// Realistic avatar, product thumbnails, and commerce photography assets helper
import { VISUAL_ASSETS } from '../assets/images';
import recoveryOpsImg from '../assets/images/recovery_ops_center_1788018009757.jpg';
import digitalPaymentPosImg from '../assets/images/digital_payment_network_1788018027299.jpg';
import customerDigitalPayImg from '../assets/images/customer_intelligence_1788018043085.jpg';
import fintechAnalyticsOpsImg from '../assets/images/ai_model_experiment_1788018076951.jpg';
import aiDetectionMonitorImg from '../assets/images/fintech_simulation_lab_1788018060107.jpg';
import fintechCopilotAnalystImg from '../assets/images/copilot_financial_ai_1788018127879.jpg';
import fintechBannerImg from '../assets/images/fintech_mission_control_1788017990895.jpg';
import cybersecurityImg from '../assets/images/cybersecurity_audit_center_1788018094479.jpg';
import developerCloudImg from '../assets/images/developer_cloud_terminal_1788018111159.jpg';

export {
  recoveryOpsImg,
  digitalPaymentPosImg,
  customerDigitalPayImg,
  fintechAnalyticsOpsImg,
  aiDetectionMonitorImg,
  fintechCopilotAnalystImg,
  fintechBannerImg,
  cybersecurityImg,
  developerCloudImg,
  VISUAL_ASSETS,
};

export const GATEWAY_LOGOS: Record<string, { name: string; color: string; bg: string; iconUrl?: string }> = {
  RAZORPAY: {
    name: 'Razorpay',
    color: '#0c2340',
    bg: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  STRIPE: {
    name: 'Stripe',
    color: '#635bff',
    bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
  CASHFREE: {
    name: 'Cashfree',
    color: '#34005b',
    bg: 'bg-purple-50 text-purple-800 border-purple-200',
  },
  PHONEPE: {
    name: 'PhonePe',
    color: '#5f259f',
    bg: 'bg-violet-50 text-violet-800 border-violet-200',
  },
  PAYTM: {
    name: 'Paytm',
    color: '#00b9f1',
    bg: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  GPAY: {
    name: 'Google Pay',
    color: '#4285f4',
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  HDFC_PG: {
    name: 'HDFC SmartHub',
    color: '#004c8f',
    bg: 'bg-red-50 text-red-800 border-red-200',
  },
  ICICI_EAZYPAY: {
    name: 'ICICI EazyPay',
    color: '#f37021',
    bg: 'bg-orange-50 text-orange-800 border-orange-200',
  },
};

// Curated high quality authentic real-people photographic portraits from Unsplash
export const AVATAR_MAP: Record<string, string> = {
  'cust_aarav_01': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'cust_priya_02': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'cust_rohan_03': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'cust_ananya_04': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'cust_riya_05': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'cust_aditya_06': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
  'cust_kavita_07': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  'cust_vikram_08': 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
  'cust_meera_09': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  'cust_deepak_10': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
  'cust_neha_11': 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80',
  'cust_suresh_12': 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
  'cust_tanvi_13': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
  'cust_rahul_14': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  'cust_ishaan_15': 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=200&auto=format&fit=crop&q=80',
};

export function getCustomerAvatar(customerId?: string, name?: string): string {
  if (customerId && AVATAR_MAP[customerId]) {
    return AVATAR_MAP[customerId];
  }
  // Fallback to real portrait
  return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80';
}

export function getUserAvatar(): string {
  return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
}

// Curated realistic commercial product catalog with real product photography
export interface ProductItem {
  name: string;
  category: string;
  price: number;
  image: string;
  sku: string;
}

export const COMMERCE_PRODUCTS: ProductItem[] = [
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    category: 'Consumer Electronics',
    price: 4999,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
    sku: 'AUDIO-WH-092',
  },
  {
    name: 'Apple Watch Ultra 2 Titanium GPS',
    category: 'Wearables',
    price: 8499,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80',
    sku: 'WRBL-AP-104',
  },
  {
    name: 'Apple MacBook Pro 16" M3 Max',
    category: 'Computers',
    price: 14500,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80',
    sku: 'COMP-MB-772',
  },
  {
    name: 'Bellroy Premium Full-Grain Leather Backpack',
    category: 'Travel & Lifestyle',
    price: 2499,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80',
    sku: 'BAG-BL-402',
  },
  {
    name: 'Nike Air Zoom Pegasus 40 Pro',
    category: 'Footwear & Apparel',
    price: 3299,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80',
    sku: 'SHOE-NK-381',
  },
  {
    name: 'Breville Barista Touch Espresso Machine',
    category: 'Appliances',
    price: 12400,
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&auto=format&fit=crop&q=80',
    sku: 'COF-BV-218',
  },
  {
    name: 'iPhone 15 Pro Max Titanium 256GB',
    category: 'Smartphones',
    price: 18900,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80',
    sku: 'MOB-IP-993',
  },
];

export function getProductForTransaction(txnId?: string, amount?: number): ProductItem {
  if (!txnId) return COMMERCE_PRODUCTS[0];
  let hash = 0;
  for (let i = 0; i < txnId.length; i++) {
    hash = (hash << 5) - hash + txnId.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % COMMERCE_PRODUCTS.length;
  const prod = { ...COMMERCE_PRODUCTS[idx] };
  if (amount) {
    prod.price = amount;
  }
  return prod;
}

// Centralized image asset map using real photographs from Unsplash
export const imageAssets = {
  hero: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200&auto=format&fit=crop&q=80',
  heroBackground: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=80',
  payment: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1000&auto=format&fit=crop&q=80',
  commerce: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&auto=format&fit=crop&q=80',
  business: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80',
  security: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1000&auto=format&fit=crop&q=80',
  products: {
    headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
    smartwatch: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80',
    laptop: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80',
    laptopBag: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80',
    shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80',
    coffeeMachine: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&auto=format&fit=crop&q=80',
    phone: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80',
  },
  customers: {
    aarav: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    priya: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    rohan: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    ananya: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    vikram: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    neha: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80',
  },
};

// Commercial real-world real-life photography from assets and Unsplash
export const CONTEXT_IMAGES = {
  detectWebhooks: aiDetectionMonitorImg,
  understandAi: fintechAnalyticsOpsImg,
  recoverActions: digitalPaymentPosImg,
  measureRoi: recoveryOpsImg,
  recoveryOperations: recoveryOpsImg,
  ingestedTransactions: digitalPaymentPosImg,
  customerClv: customerDigitalPayImg,
  telemetryAnalytics: fintechAnalyticsOpsImg,
  aiDetection: aiDetectionMonitorImg,
  recoveryCopilot: fintechCopilotAnalystImg,
  merchantDashboard: fintechAnalyticsOpsImg,
  merchantHeroBg: fintechBannerImg,
  merchantOperator: fintechCopilotAnalystImg,
  paymentTerminal: digitalPaymentPosImg,
  onlineShopping: customerDigitalPayImg,
  mobileCheckout: digitalPaymentPosImg,
  businessTeam: recoveryOpsImg,
  enterpriseServer: aiDetectionMonitorImg,
  recoveryInsight: recoveryOpsImg,
};

