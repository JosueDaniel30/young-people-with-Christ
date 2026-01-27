
export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  points: number;
  streak: number;
  level: number;
  lastLoginDate: string; 
  badges: Badge[];
  theme: 'light' | 'dark';
  favorites: BibleVerse[];
  notificationsEnabled: boolean;
  notificationPrefs: {
    dailyVerse: boolean;
    goals: boolean;
    community: boolean;
  };
  xpHistory?: { date: string; points: number }[]; 
}

export interface PrayerRequest {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  request: string;
  category: 'Salud' | 'Familia' | 'Estudios' | 'Provisión' | 'Guía' | 'Otros';
  createdAt: any;
  prayersCount: number;
  prayers: string[]; // IDs de usuarios que están orando
  status?: 'active' | 'answered'; // Nuevo campo
}

export interface Reflection {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  verseReference: string;
  text: string;
  timestamp: string;
  likes: number;
  tags?: string[];
  synced?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'award' | 'event';
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
  dateEarned: string;
  description?: string;
  message?: string;
}

export interface Goal {
  id: string;
  title: string;
  type: 'Bronce' | 'Plata' | 'Oro';
  period: 'Diario' | 'Semanal' | 'Mensual';
  progress: number;
  total: number;
  completed: boolean;
  synced?: boolean;
}

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  title?: string;
}

export interface CachedChapter {
  book: string;
  chapter: number;
  verses: BibleVerse[];
}

export interface Study {
  id: string;
  title: string;
  description: string;
  content: string;
  image: string;
  category: string;
}

export interface Playlist {
  id: string;
  userId: string; // ID del creador
  title: string;
  creator: string;
  spotifyLink?: string;
  ytMusicLink?: string;
  likes: number;
  cover?: string;
  shared: boolean; // Si aparece en el muro público
}
