
export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  points: number;
  badges: Badge[];
  theme: 'light' | 'dark';
  favorites: BibleVerse[];
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
}

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
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
  title: string;
  creator: string;
  spotifyLink?: string;
  ytMusicLink?: string;
  likes: number;
  cover?: string;
}
