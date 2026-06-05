export interface LostItem {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  date: string;
  time: string;
  status: "active" | "recovered" | "closed";
  images: string[];
  contactName: string;
  reward?: string;
  route?: string;
  userId: string;
  isUrgent?: boolean;
}

export interface FoundItem {
  id: string;
  title: string;
  category: string;
  description: string;
  foundLocation: string;
  storageLocation: string;
  date: string;
  time: string;
  images: string[];
  finderName: string;
  finderAvatar?: string;
  isVerified: boolean;
  partnerId?: string;
}

export interface Notification {
  id: string;
  type: "match" | "recovery" | "alert" | "update";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  itemId?: string;
}

export interface RecoveryStory {
  id: string;
  title: string;
  description: string;
  helperName: string;
  helperAvatar?: string;
  ownerName: string;
  date: string;
  category: string;
  likes: number;
}

export interface TopHelper {
  id: string;
  name: string;
  avatar?: string;
  recoveries: number;
  badge: string;
  rating: number;
  location: string;
}

export interface Partner {
  id: string;
  name: string;
  type: "shop" | "school" | "police" | "petrol" | "hospital" | "other";
  address: string;
  distance: string;
  rating: number;
  totalItems: number;
  isVerified: boolean;
  openNow: boolean;
  phone: string;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface MapMarker {
  id: string;
  type: "lost" | "found";
  title: string;
  lat: number;
  lng: number;
  category: string;
}
