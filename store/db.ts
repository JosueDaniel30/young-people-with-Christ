
import { User, Goal, Badge, Playlist, Notification, BibleVerse, Reflection, PrayerRequest, Lesson } from '../types';
import { INITIAL_USER, INITIAL_GOALS, PLAYLISTS, BADGES } from '../constants';
import { feedback } from '../services/audioFeedback';
import { db, auth } from '../services/firebaseConfig';
import { 
  doc, setDoc, updateDoc, collection, addDoc, query, orderBy, limit, 
  onSnapshot, increment, arrayUnion, Timestamp, where, getDocs, writeBatch 
} from "firebase/firestore";

const DB_KEY = 'ignite_youth_db';
const UPDATE_EVENT = 'ignite_db_update';

export const loadDB = () => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) return { 
    user: INITIAL_USER, goals: INITIAL_GOALS, playlists: PLAYLISTS, 
    notifications: [], reflections: [], prayerRequests: [], lessons: [], bibleCache: [] 
  };
  return JSON.parse(data);
};

export const saveDB = (state: any) => {
  localStorage.setItem(DB_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
};

export const addNotification = (title: string, message: string, type: 'info' | 'award' | 'event' = 'info') => {
  const state = loadDB();
  const newNotif: Notification = {
    id: Date.now().toString(),
    title,
    message,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false,
    type
  };
  state.notifications.unshift(newNotif);
  saveDB(state);
};

export const markNotificationsRead = async () => {
  const state = loadDB();
  state.notifications.forEach((n: any) => n.read = true);
  saveDB(state);
};

export const subscribeToNotifications = (callback: (notifs: Notification[]) => void) => {
  const handler = () => {
    const state = loadDB();
    callback(state.notifications);
  };
  window.addEventListener(UPDATE_EVENT, handler);
  handler();
  return () => window.removeEventListener(UPDATE_EVENT, handler);
};

export const addFEPoints = async (amount: number, reason: string = 'Actividad') => {
  const state = loadDB();
  state.user.points += amount;
  
  if (!state.user.xpHistory) state.user.xpHistory = [];
  state.user.xpHistory.push({ date: new Date().toISOString(), points: state.user.points });

  const newLevel = Math.floor(Math.sqrt(state.user.points / 100));
  if (newLevel > state.user.level) {
    state.user.level = newLevel;
    addNotification('¡Nivel Alcanzado!', `Has subido al nivel ${newLevel}`, 'award');
    feedback.playSuccess();
  }
  saveDB(state);
};

export const handleDailyCheckIn = () => {
  const state = loadDB();
  const today = new Date().toISOString().split('T')[0];
  if (state.user.lastLoginDate?.split('T')[0] !== today) {
    state.user.streak = (state.user.lastLoginDate?.split('T')[0] === new Date(Date.now() - 86400000).toISOString().split('T')[0]) ? state.user.streak + 1 : 1;
    state.user.lastLoginDate = new Date().toISOString();
    state.user.totalLogins = (state.user.totalLogins || 0) + 1;
    addFEPoints(10, 'Inicio de sesión diario');
    saveDB(state);
  }
};

export const addLesson = async (lesson: Partial<Lesson>) => {
  const state = loadDB();
  const newLesson = { ...lesson, id: Date.now().toString(), timestamp: new Date().toISOString(), likes: 0 };
  state.lessons.unshift(newLesson);
  saveDB(state);
  addFEPoints(150, 'Compartir lección');
};

export const subscribeToLessons = (callback: (lessons: Lesson[]) => void) => {
  const handler = () => callback(loadDB().lessons);
  window.addEventListener(UPDATE_EVENT, handler);
  handler();
  return () => window.removeEventListener(UPDATE_EVENT, handler);
};

export const updateUser = (updater: (u: User) => User) => {
  const state = loadDB();
  state.user = updater(state.user);
  saveDB(state);
};

export const toggleFavorite = (verse: BibleVerse) => {
  const state = loadDB();
  const idx = state.user.favorites.findIndex((f: any) => f.book === verse.book && f.verse === verse.verse && f.chapter === verse.chapter);
  if (idx >= 0) state.user.favorites.splice(idx, 1);
  else state.user.favorites.push(verse);
  saveDB(state);
};

export const addGoal = (goal: any) => {
  const state = loadDB();
  state.goals.push({ ...goal, id: Date.now().toString(), progress: 0, completed: false });
  saveDB(state);
};

export const updateGoalProgress = (id: string, amount: number) => {
  const state = loadDB();
  const goal = state.goals.find((g: any) => g.id === id);
  if (goal && !goal.completed) {
    goal.progress += amount;
    if (goal.progress >= goal.total) {
      goal.completed = true;
      addFEPoints(100, 'Meta cumplida');
    }
    saveDB(state);
  }
};

export const addPlaylist = (pl: Playlist) => {
  const state = loadDB();
  state.playlists.push(pl);
  saveDB(state);
};

export const addReflection = async (ref: any) => {
  const state = loadDB();
  const newRef = { ...ref, id: Date.now().toString(), timestamp: new Date().toISOString(), likes: 0, userName: state.user.name, userPhoto: state.user.photoUrl };
  state.reflections.unshift(newRef);
  saveDB(state);
  addFEPoints(50, 'Nueva reflexión');
};

export const likeReflection = (id: string) => {
  const state = loadDB();
  const ref = state.reflections.find((r: any) => r.id === id);
  if (ref) ref.likes++;
  saveDB(state);
};

export const subscribeToReflections = (callback: (refs: Reflection[]) => void) => {
  const handler = () => callback(loadDB().reflections);
  window.addEventListener(UPDATE_EVENT, handler);
  handler();
  return () => window.removeEventListener(UPDATE_EVENT, handler);
};

export const addPrayerRequest = async (req: any) => {
  const state = loadDB();
  const newReq = { ...req, id: Date.now().toString(), createdAt: new Date().toISOString(), prayersCount: 0, userName: state.user.name, userPhoto: state.user.photoUrl };
  state.prayerRequests.unshift(newReq);
  saveDB(state);
};

export const joinPrayer = (id: string) => {
  const state = loadDB();
  const req = state.prayerRequests.find((r: any) => r.id === id);
  if (req) req.prayersCount++;
  saveDB(state);
};

export const updatePrayerStatus = (id: string, status: string) => {
  const state = loadDB();
  const req = state.prayerRequests.find((r: any) => r.id === id);
  if (req) req.status = status;
  saveDB(state);
};

export const subscribeToPrayers = (callback: (prayers: PrayerRequest[]) => void) => {
  const handler = () => callback(loadDB().prayerRequests);
  window.addEventListener(UPDATE_EVENT, handler);
  handler();
  return () => window.removeEventListener(UPDATE_EVENT, handler);
};

export const fetchGlobalLeaderboard = async () => {
  return [{ name: 'Tú', points: loadDB().user.points, level: loadDB().user.level }];
};

export const getCachedChapter = (book: string, chapter: number) => {
  return loadDB().bibleCache.find((c: any) => c.book === book && c.chapter === chapter)?.verses;
};
