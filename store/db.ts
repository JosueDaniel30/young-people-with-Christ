
import { User, Goal, Badge, Playlist, Notification, BibleVerse, Reflection, PrayerRequest } from '../types';
import { INITIAL_USER, INITIAL_GOALS, PLAYLISTS } from '../constants';
import { feedback } from '../services/audioFeedback';
import { notificationService } from '../services/notificationService';

const DB_KEY = 'ignite_youth_db';
const UPDATE_EVENT = 'ignite_db_update';

// Canal para comunicación entre pestañas del mismo navegador
const socialChannel = new BroadcastChannel('ignite_social_sync');

interface AppState {
  user: User;
  goals: Goal[];
  playlists: Playlist[];
  notifications: Notification[];
  reflections: Reflection[];
  prayerRequests: PrayerRequest[];
  bibleCache: any[];
}

export const loadDB = (): AppState => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) return { 
    user: INITIAL_USER, 
    goals: INITIAL_GOALS, 
    playlists: PLAYLISTS, 
    notifications: [], 
    reflections: [], 
    prayerRequests: [],
    bibleCache: [] 
  };
  const parsed = JSON.parse(data);
  if (!parsed.reflections) parsed.reflections = [];
  if (!parsed.prayerRequests) parsed.prayerRequests = [];
  return parsed;
};

export const saveDB = (state: AppState) => {
  localStorage.setItem(DB_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
};

export const addNotification = (title: string, message: string, type: 'info' | 'award' | 'event' = 'info') => {
  const state = loadDB();
  state.notifications.unshift({
    id: Date.now().toString() + Math.random(),
    title,
    message,
    time: 'Ahora',
    read: false,
    type
  });
  saveDB(state);
  
  // Activar notificación nativa si el usuario lo permite
  if (state.user.notificationsEnabled) {
    notificationService.sendLocalNotification(title, message, true);
  }
};

export const addReflection = (reflectionData: Partial<Reflection>) => {
  const state = loadDB();
  const newRef: Reflection = {
    id: Date.now().toString(),
    userId: state.user.id,
    userName: state.user.name,
    userPhoto: state.user.photoUrl,
    text: reflectionData.text || '',
    verseReference: reflectionData.verseReference || 'RVR1960',
    timestamp: new Date().toISOString(),
    likes: 0
  };
  state.reflections.unshift(newRef);
  saveDB(state);
  addFEPoints(50, 'Compartir reflexión');
  
  // Notificar al canal social
  socialChannel.postMessage({
    type: 'NEW_REFLECTION',
    userName: state.user.name
  });
};

export const addPrayerRequest = (data: { text: string, category: string }) => {
  const state = loadDB();
  const newReq: PrayerRequest = {
    id: Date.now().toString(),
    userId: state.user.id,
    userName: state.user.name,
    userPhoto: state.user.photoUrl,
    request: data.text,
    category: data.category as any,
    createdAt: new Date().toISOString(),
    prayersCount: 0,
    prayers: []
  };
  state.prayerRequests.unshift(newReq);
  saveDB(state);
  addFEPoints(30, 'Pedir oración');

  // Notificar al canal social
  socialChannel.postMessage({
    type: 'NEW_PRAYER',
    userName: state.user.name
  });
};

export const addPlaylist = (playlist: Playlist) => {
  const state = loadDB();
  state.playlists.unshift(playlist);
  saveDB(state);

  if (playlist.shared) {
    socialChannel.postMessage({
      type: 'NEW_PLAYLIST',
      userName: state.user.name,
      title: playlist.title
    });
  }
};

export const joinPrayer = (requestId: string) => {
  const state = loadDB();
  const request = state.prayerRequests.find(r => r.id === requestId);
  if (request && !request.prayers.includes(state.user.id)) {
    request.prayers.push(state.user.id);
    request.prayersCount += 1;
    saveDB(state);
    addNotification('Guerrero en Acción', `Te uniste en oración por ${request.userName}`, 'info');
    
    socialChannel.postMessage({
      type: 'PRAYER_JOINED',
      userName: state.user.name,
      targetName: request.userName
    });
  }
};

// Escuchar mensajes de otras pestañas
socialChannel.onmessage = (event) => {
  const { type, userName, targetName, title } = event.data;
  
  switch (type) {
    case 'NEW_REFLECTION':
      addNotification('Nueva Reflexión', `${userName} ha compartido una palabra en el muro.`, 'info');
      break;
    case 'NEW_PRAYER':
      addNotification('Petición de Oración', `${userName} necesita que nos unamos en clamor.`, 'info');
      break;
    case 'NEW_PLAYLIST':
      addNotification('Nueva Mezcla', `${userName} compartió la playlist: "${title}".`, 'info');
      break;
    case 'PRAYER_JOINED':
      addNotification('Intercesión', `${userName} se unió en oración por ${targetName}.`, 'info');
      break;
  }
  feedback.playNotification();
};

// Re-exportar el resto de funciones necesarias
export const updateUser = (updater: (u: User) => User) => {
  const state = loadDB();
  state.user = updater(state.user);
  saveDB(state);
};

export const addFEPoints = (amount: number, reason: string = 'Actividad') => {
  const state = loadDB();
  state.user.points += amount;
  if (!state.user.xpHistory) state.user.xpHistory = [];
  state.user.xpHistory.push({
    date: new Date().toISOString(),
    points: state.user.points
  });
  saveDB(state);
};

export const handleDailyCheckIn = () => {
  const state = loadDB();
  const today = new Date().toISOString().split('T')[0];
  const lastLogin = state.user.lastLoginDate.split('T')[0];
  if (lastLogin !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (lastLogin === yesterday.toISOString().split('T')[0]) {
      state.user.streak += 1;
    } else {
      state.user.streak = 1;
    }
    state.user.lastLoginDate = new Date().toISOString();
    saveDB(state);
    addFEPoints(10, 'Inicio de sesión diario');
  }
};

export const markNotificationsRead = () => {
  const state = loadDB();
  state.notifications = state.notifications.map(n => ({ ...n, read: true }));
  saveDB(state);
};

export const togglePlaylistShared = (id: string) => {
  const state = loadDB();
  const playlist = state.playlists.find(p => p.id === id);
  if (playlist) {
    playlist.shared = !playlist.shared;
    saveDB(state);
  }
};

export const addGoal = (goal: Partial<Goal>) => {
  const state = loadDB();
  const newGoal: Goal = {
    id: Date.now().toString(),
    title: goal.title || 'Nueva Meta',
    type: goal.type || 'Bronce',
    period: goal.period || 'Diario',
    progress: 0,
    total: goal.total || 1,
    completed: false
  };
  state.goals.push(newGoal);
  saveDB(state);
};

export const updateGoalProgress = (id: string, amount: number) => {
  const state = loadDB();
  const goal = state.goals.find(g => g.id === id);
  if (goal && !goal.completed) {
    goal.progress += amount;
    if (goal.progress >= goal.total) {
      goal.progress = goal.total;
      goal.completed = true;
      addFEPoints(200, `Meta completada: ${goal.title}`);
      addNotification('¡Misión Cumplida!', `Has completado: ${goal.title}`, 'award');
      feedback.playSuccess();
    }
    saveDB(state);
  }
};

export const toggleFavorite = (verse: BibleVerse) => {
  const state = loadDB();
  const index = state.user.favorites.findIndex(f => f.book === verse.book && f.chapter === verse.chapter && f.verse === verse.verse);
  if (index >= 0) state.user.favorites.splice(index, 1);
  else state.user.favorites.push(verse);
  saveDB(state);
};

export const likeReflection = (id: string) => {
  const state = loadDB();
  const reflection = state.reflections.find(r => r.id === id);
  if (reflection) {
    reflection.likes += 1;
    saveDB(state);
  }
};

export const getCachedChapter = (book: string, chapter: number) => {
  const state = loadDB();
  return state.bibleCache?.find(c => c.book === book && c.chapter === chapter)?.verses;
};

export const saveChapterToCache = (book: string, chapter: number, verses: BibleVerse[]) => {
  const state = loadDB();
  if (!state.bibleCache) state.bibleCache = [];
  const index = state.bibleCache.findIndex(c => c.book === book && c.chapter === chapter);
  if (index >= 0) state.bibleCache[index].verses = verses;
  else state.bibleCache.push({ book, chapter, verses });
  saveDB(state);
};

export const isChapterCached = (book: string, chapter: number) => {
  const state = loadDB();
  return state.bibleCache?.some(c => c.book === book && c.chapter === chapter);
};

export const fetchGlobalLeaderboard = () => {
  const state = loadDB();
  return [
    { id: state.user.id, name: state.user.name, points: state.user.points, level: state.user.level },
    { id: '2', name: 'Guerrero Pro', points: 1500, level: 4 },
    { id: '3', name: 'Discípulo Digital', points: 800, level: 2 },
    { id: '4', name: 'Heraldo Ignite', points: 450, level: 1 }
  ].sort((a, b) => b.points - a.points);
};
