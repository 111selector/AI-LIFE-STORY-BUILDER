import { SubscriptionPlan, SubscriptionTier } from './types';

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, Omit<SubscriptionPlan, 'features'>> = {
  [SubscriptionTier.FREE]: {
    tier: SubscriptionTier.FREE,
    price: 0,
    featureKeys: ["free_feature_1", "free_feature_2", "free_feature_3"],
    storyLimit: 2,
    downloadLimit: 0,
    commercialLicense: false,
    videoExport: false,
  },
  [SubscriptionTier.BASIC]: {
    tier: SubscriptionTier.BASIC,
    price: 10,
    featureKeys: ["basic_feature_1", "basic_feature_2", "basic_feature_3", "basic_feature_4"],
    storyLimit: 5,
    downloadLimit: 3,
    commercialLicense: false,
    videoExport: false,
  },
  [SubscriptionTier.PRO]: {
    tier: SubscriptionTier.PRO,
    price: 20,
    featureKeys: ["pro_feature_1", "pro_feature_2", "pro_feature_3", "pro_feature_4"],
    storyLimit: 10,
    downloadLimit: 6,
    commercialLicense: true,
    videoExport: true,
  },
  [SubscriptionTier.PREMIUM]: {
    tier: SubscriptionTier.PREMIUM,
    price: 30,
    featureKeys: ["premium_feature_1", "premium_feature_2", "premium_feature_3", "premium_feature_4"],
    storyLimit: Infinity,
    downloadLimit: 20,
    commercialLicense: true,
    videoExport: true,
  },
};

export const PAYMENT_METHOD_KEYS = ["creditCard", "mobileMoney", "paypal", "googlePay", "applePay"];

export const APP_NAME = "AI Life Story Builder";