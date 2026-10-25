// Shared domain types for the app (previously duplicated across ~6 screens).

export type TimelineEvent = {
  id: string;
  title: string;
  date: string; // ISO string
  description: string;
  images: string[];
};

export type Timeline = {
  id: string;
  title: string;
  events: TimelineEvent[];
};

export type AuthUser = {
  id: string;
  email: string;
  displayName: string | null;
  emailVerified: boolean;
};
