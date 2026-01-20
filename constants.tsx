
import React from 'react';
import { Badge, Goal, Study, Playlist, User } from './types';

export const INITIAL_USER: User = {
  id: '1',
  name: 'Joven Ignite',
  email: 'joven@iglesia.com',
  photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=IgniteYouth',
  points: 0,
  streak: 1,
  level: 0,
  lastLoginDate: new Date().toISOString(),
  badges: [],
  theme: 'light',
  favorites: [],
  notificationsEnabled: false,
  notificationPrefs: {
    dailyVerse: true,
    goals: true,
    community: true
  }
};

export const BAPTIST_STUDIES = [
  {
    id: 'bp1',
    title: 'Principios Bautistas',
    description: 'Estudio sobre la autonomía, el bautismo y la libertad de conciencia.',
    progress: 0,
    lessons: 12
  },
  {
    id: 'bp2',
    title: 'Historia de los Bautistas',
    description: 'Desde los anabautistas hasta las misiones modernas.',
    progress: 0,
    lessons: 8
  },
  {
    id: 'bp3',
    title: 'Doctrina de la Salvación',
    description: 'Enfoque bíblico sobre la gracia y la seguridad eterna.',
    progress: 0,
    lessons: 15
  }
];

export const BIBLE_BOOKS = {
  antiguo: [
    { cat: 'Pentateuco', books: ['Génesis', 'Éxodo', 'Levítico', 'Números', 'Deuteronomio'] },
    { cat: 'Históricos', books: ['Josué', 'Jueces', 'Rut', '1 Samuel', '2 Samuel', '1 Reyes', '2 Reyes', '1 Crónicas', '2 Crónicas', 'Esdras', 'Nehemías', 'Ester'] },
    { cat: 'Poéticos', books: ['Job', 'Salmos', 'Proverbios', 'Eclesiastés', 'Cantares'] },
    { cat: 'Profetas Mayores', books: ['Isaías', 'Jeremías', 'Lamentaciones', 'Ezequiel', 'Daniel'] },
    { cat: 'Profetas Menores', books: ['Oseas', 'Joel', 'Amós', 'Abdías', 'Jonás', 'Miqueas', 'Nahúm', 'Habacuc', 'Sofonías', 'Hageo', 'Zacarías', 'Malaquías'] }
  ],
  nuevo: [
    { cat: 'Evangelios', books: ['Mateo', 'Marcos', 'Lucas', 'Juan'] },
    { cat: 'Historia', books: ['Hechos'] },
    { cat: 'Cartas Paulinas', books: ['Romanos', '1 Corintios', '2 Corintios', 'Gálatas', 'Efesios', 'Filipenses', 'Colosenses', '1 Tesalonicenses', '2 Tesalonicenses', '1 Timoteo', '2 Timoteo', 'Tito', 'Filemón'] },
    { cat: 'Cartas Generales', books: ['Hebreos', 'Santiago', '1 Pedro', '2 Pedro', '1 Juan', '2 Juan', '3 Juan', 'Judas'] },
    { cat: 'Profecía', books: ['Apocalipsis'] }
  ]
};

export const BADGES: Badge[] = [
  { id: 'b1', name: 'Primer Paso', icon: 'Flame', color: 'bg-orange-500', dateEarned: '', message: '¡Comenzaste tu viaje!' },
  { id: 'b2', name: 'Teólogo Junior', icon: 'BookOpen', color: 'bg-blue-500', dateEarned: '', message: 'Dominando los estudios bautistas.' }
];

export const INITIAL_GOALS: Goal[] = [
  { id: 'g1', title: 'Lectura Diaria', type: 'Bronce', period: 'Diario', progress: 0, total: 1, completed: false },
  { id: 'g2', title: 'Estudio Doctrina', type: 'Plata', period: 'Semanal', progress: 0, total: 5, completed: false },
];

export const PLAYLISTS: Playlist[] = [
  {
    id: 'p1',
    // Fix: Added missing userId property to satisfy the Playlist interface requirements
    userId: '1',
    title: 'Adoración y Alabanza',
    creator: 'Ministerio Juvenil',
    spotifyLink: 'https://open.spotify.com',
    likes: 120,
    cover: 'https://images.unsplash.com/photo-1514525253361-b874866075b5?w=400',
    // Fix: Added missing shared property to satisfy the Playlist interface requirements
    shared: true
  }
];
