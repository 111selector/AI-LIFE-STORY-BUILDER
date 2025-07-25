import { User, Story, SubscriptionTier } from '../types';
import { SUBSCRIPTION_PLANS } from '../constants';

const LOGGED_IN_USER_KEY = 'storyBuilderLoggedInUser';
const STORIES_KEY = 'storyBuilderStories';

// --- User Management ---
export const getLoggedInUser = (): User | null => {
  const storedUser = localStorage.getItem(LOGGED_IN_USER_KEY);
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch (e) {
      console.error("Failed to parse user data", e);
      return null;
    }
  }
  return null;
};

export const loginUser = (name: string, email: string): User => {
    const newUser: User = {
        id: `user_${Date.now()}`,
        name: name,
        email: email,
        subscriptionTier: SubscriptionTier.FREE,
        storiesCreated: getStories().length, // Associate with existing stories for simplicity
        downloadsUsed: 0,
    };
    localStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(newUser));
    return newUser;
};

export const logoutUser = (): void => {
    localStorage.removeItem(LOGGED_IN_USER_KEY);
};


export const updateUser = (user: User): void => {
  localStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(user));
};

export const upgradeSubscription = (tier: SubscriptionTier, user: User): User => {
  const updatedUser = { ...user };
  updatedUser.subscriptionTier = tier;
  updatedUser.downloadsUsed = 0;
  updateUser(updatedUser);
  return updatedUser;
};

// --- Story Management ---
export const getStories = (): Story[] => {
  const storedStories = localStorage.getItem(STORIES_KEY);
  return storedStories ? JSON.parse(storedStories) : [];
};

export const getStoryById = (id: string): Story | undefined => {
  return getStories().find(story => story.id === id);
};

export const saveStory = (story: Story): void => {
  const stories = getStories();
  const existingIndex = stories.findIndex(s => s.id === story.id);
  const user = getLoggedInUser();

  if (existingIndex > -1) {
    stories[existingIndex] = story;
  } else {
    stories.push(story);
    if (user) {
        user.storiesCreated = stories.length;
        updateUser(user);
    }
  }
  localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
};

export const canCreateStory = (user: User): boolean => {
    const plan = SUBSCRIPTION_PLANS[user.subscriptionTier];
    return user.storiesCreated < plan.storyLimit;
}

export const canAddStoryStep = (story: Story, user: User): boolean => {
    if (user.subscriptionTier === SubscriptionTier.FREE) {
        return story.segments.length < 5;
    }
    return true;
}

export const canDownloadStory = (user: User): boolean => {
    const plan = SUBSCRIPTION_PLANS[user.subscriptionTier];
    if (plan.downloadLimit === 0) return false;
    return user.downloadsUsed < plan.downloadLimit;
}

export const incrementDownloadsUsed = (user: User): User => {
    const updatedUser = { ...user };
    updatedUser.downloadsUsed += 1;
    updateUser(updatedUser);
    return updatedUser;
}
