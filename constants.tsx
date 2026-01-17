
import React from 'react';
import { Badge, Goal, Study, Playlist, User } from './types';
import { Trophy, Star, Shield, Flame, BookOpen, Music, Medal, Crown } from 'lucide-react';

export const INITIAL_USER: User = {
  id: '1',
  name: 'Joven Ignite',
  email: 'joven123@gmial.com',
  photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=IgniteYouth',
  points: 1250,
  badges: [],
  theme: 'light',
  favorites: []
};

export const BADGES: Badge[] = [
  { 
    id: 'b1', 
    name: 'Primer Paso', 
    icon: 'Flame', 
    color: 'bg-orange-500', 
    dateEarned: '',
    description: 'Completaste tu primera meta diaria en Ignite.',
    message: '¡El camino de mil millas comienza con un solo paso de fe!'
  },
  { 
    id: 'b2', 
    name: 'Lector Constante', 
    icon: 'BookOpen', 
    color: 'bg-blue-500', 
    dateEarned: '',
    description: 'Has mantenido una racha de lectura bíblica por 7 días.',
    message: 'Tu palabra es lámpara a mis pies y lumbrera a mi camino.'
  },
  { 
    id: 'b3', 
    name: 'Adorador Fiel', 
    icon: 'Music', 
    color: 'bg-purple-500', 
    dateEarned: '',
    description: 'Has compartido o escuchado más de 5 playlists de adoración.',
    message: 'Canta con gozo, porque su presencia habita en la alabanza.'
  },
  { 
    id: 'b4', 
    name: 'Guerrero de Plata', 
    icon: 'Medal', 
    color: 'bg-slate-400', 
    dateEarned: '',
    description: 'Has alcanzado el nivel Plata completando metas semanales.',
    message: 'Sé valiente y esforzado, el Señor está contigo en cada batalla.'
  },
  { 
    id: 'b5', 
    name: 'Maestro de Oro', 
    icon: 'Crown', 
    color: 'bg-yellow-500', 
    dateEarned: '',
    description: 'Logro máximo por completar metas mensuales de alto impacto.',
    message: 'Has sido fiel en lo poco, sobre mucho te pondré. ¡Sigue brillando!'
  },
];

export const INITIAL_GOALS: Goal[] = [
  { id: 'g1', title: 'Lectura Diaria', type: 'Bronce', period: 'Diario', progress: 0, total: 1, completed: false },
  { id: 'g2', title: 'Plan Semanal', type: 'Plata', period: 'Semanal', progress: 3, total: 7, completed: false },
  { id: 'g3', title: 'Estudio Mensual', type: 'Oro', period: 'Mensual', progress: 12, total: 30, completed: false },
];

export const STUDIES: Study[] = [
  {
    id: 's1',
    title: 'Identidad en Cristo',
    description: 'Descubre quién eres según la Palabra.',
    category: 'Jóvenes',
    image: 'https://images.unsplash.com/photo-1504052434139-44b53d63bc31?auto=format&fit=crop&q=80&w=800',
    content: 'En la Biblia Reina Valera 1960, Efesios 2:10 nos dice que somos hechura suya...'
  },
  {
    id: 's2',
    title: 'Propósito y Llamado',
    description: '¿Cuál es el plan de Dios para tu vida?',
    category: 'Crecimiento',
    image: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=800',
    content: 'Jeremías 29:11 es un pilar fundamental para entender los planes de bienestar...'
  }
];

export const PLAYLISTS: Playlist[] = [
  {
    id: 'p1',
    title: 'Adoración 2026',
    creator: 'Ministerio Alabanza',
    spotifyLink: 'https://spotify.com',
    ytMusicLink: 'https://youtube.com',
    likes: 45
  }
];
