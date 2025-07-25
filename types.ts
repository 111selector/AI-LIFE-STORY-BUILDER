export enum SubscriptionTier {
  FREE = "Free",
  BASIC = "Basic",
  PRO = "Pro",
  PREMIUM = "Premium",
}

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  price: number;
  featureKeys: string[];
  features: string[]; // This will be populated dynamically based on language
  storyLimit: number;
  downloadLimit: number;
  commercialLicense: boolean;
  videoExport: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  subscriptionTier: SubscriptionTier;
  storiesCreated: number;
  downloadsUsed: number;
}

export interface StorySegment {
  id: string;
  paragraph: string;
  videoSuggestion: string;
  choices: string[];
  chosenPath?: string;
  generatedImageUrl?: string;
}

export interface Story {
  id: string;
  title: string;
  protagonist: string;
  setting: string;
  segments: StorySegment[];
  createdAt: string;
  isComplete: boolean;
  summary?: string;
  conclusion?: string;
}

export interface StoryChoice {
  paragraph: string;
  videoSuggestion: string;
  choices: string[];
}