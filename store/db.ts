
import { User, Goal, Badge, Playlist, Notification, BibleVerse, Reflection, PrayerRequest } from '../types';
import { INITIAL_USER, INITIAL_GOALS, PLAYLISTS } from '../constants';
import { feedback } from '../services/audioFeedback';
import { notificationService } from '../services/notificationService';
import { db, auth } from '../services/firebaseConfig';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  increment,
  arrayUnion,
  Timestamp
} from "firebase/firestore";

const DB_KEY = 'ignite_youth_db';
const UPDATE_EVENT = 'ignite_db_update';

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
  return JSON.parse(data);
};

export const saveDB = (state: AppState) => {
  localStorage.setItem(DB_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
};

export const syncUserProfile = async (userData: Partial<User>) => {
  if (!auth.currentUser) return;
  try {
    const userRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(userRef, userData, { merge: true });
    
    const state = loadDB();
    state.user = { ...state.user, ...userData };
    saveDB(state);
  } catch (e) {
    console.warn("Firestore sync deferred (possible offline or guest rules):", e);
  }
};

export const addReflection = async (reflectionData: Partial<Reflection>) => {
  const state = loadDB();
  const newRef = {
    userId: auth.currentUser?.uid || state.user.id,
    userName: state.user.name,
    userPhoto: state.user.photoUrl,
    text: reflectionData.text || '',
    verseReference: reflectionData.verseReference || 'RVR1960',
    timestamp: Timestamp.now(),
    likes: 0
  };

  try {
    await addDoc(collection(db, "reflections"), newRef);
    addFEPoints(50, 'Compartir reflexión');
  } catch (e) {
    console.error("Error al guardar reflexión:", e);
  }
};

export const addPrayerRequest = async (data: { text: string, category: string }) => {
  const state = loadDB();
  const newReq = {
    userId: auth.currentUser?.uid || state.user.id,
    userName: state.user.name,
    userPhoto: state.user.photoUrl,
    request: data.text,
    category: data.category,
    createdAt: Timestamp.now(),
    prayersCount: 0,
    prayers: []
  };

  try {
    await addDoc(collection(db, "prayers"), newReq);
    addFEPoints(30, 'Pedir oración');
  } catch (e) {
    console.error("Error al guardar petición:", e);
  }
};

export const joinPrayer = async (requestId: string) => {
  const state = loadDB();
  const uid = auth.currentUser?.uid || state.user.id;
  if (!uid) return;

  const prayerRef = doc(db, "prayers", requestId);
  try {
    await updateDoc(prayerRef, {
      prayers: arrayUnion(uid),
      prayersCount: increment(1)
    });
    addNotification('Guerrero en Acción', `Te uniste en oración`, 'info');
    feedback.playSuccess();
  } catch (e) {
    console.error("Error al unirse a oración:", e);
  }
};

export const likeReflection = async (id: string) => {
  try {
    const refDoc = doc(db, "reflections", id);
    await updateDoc(refDoc, { likes: increment(1) });
  } catch (e) {
    console.error("Error al dar like:", e);
  }
};

export const subscribeToReflections = (callback: (data: Reflection[]) => void) => {
  const q = query(collection(db, "reflections"), orderBy("timestamp", "desc"), limit(50));
  return onSnapshot(q, (snapshot) => {
    const reflections = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: (doc.data().timestamp as Timestamp).toDate().toISOString()
    })) as Reflection[];
    
    const state = loadDB();
    state.reflections = reflections;
    saveDB(state);
    callback(reflections);
  }, (err) => console.warn("Reflection subscribe error:", err));
};

export const subscribeToPrayers = (callback: (data: PrayerRequest[]) => void) => {
  const q = query(collection(db, "prayers"), orderBy("createdAt", "desc"), limit(50));
  return onSnapshot(q, (snapshot) => {
    const prayers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp).toDate().toISOString()
    })) as PrayerRequest[];
    
    const state = loadDB();
    state.prayerRequests = prayers;
    saveDB(state);
    callback(prayers);
  }, (err) => console.warn("Prayer subscribe error:", err));
};

export const addFEPoints = async (amount: number, reason: string = 'Actividad') => {
  const state = loadDB();
  state.user.points += amount;
  
  const newLevel = Math.floor(Math.sqrt(state.user.points / 100));
  if (newLevel > state.user.level) {
    state.user.level = newLevel;
    addNotification('¡Nivel Alcanzado!', `Has subido al nivel ${newLevel}`, 'award');
    feedback.playSuccess();
  }

  saveDB(state);
  if (auth.currentUser) {
    await syncUserProfile({ points: state.user.points, level: state.user.level });
  }
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
  if (state.user.notificationsEnabled) {
    notificationService.sendLocalNotification(title, message, true);
  }
};

export const handleDailyCheckIn = () => {
  const state = loadDB();
  const today = new Date().toISOString().split('T')[0];
  const lastLogin = state.user.lastLoginDate?.split('T')[0];
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

export const updateUser = (updater: (u: User) => User) => {
  const state = loadDB();
  state.user = updater(state.user);
  saveDB(state);
  syncUserProfile(state.user);
};

export const markNotificationsRead = () => {
  const state = loadDB();
  state.notifications = state.notifications.map(n => ({ ...n, read: true }));
  saveDB(state);
};

export const toggleFavorite = (verse: BibleVerse) => {
  const state = loadDB();
  const index = state.user.favorites.findIndex(f => f.book === verse.book && f.chapter === verse.chapter && f.verse === verse.verse);
  if (index >= 0) state.user.favorites.splice(index, 1);
  else state.user.favorites.push(verse);
  saveDB(state);
  syncUserProfile({ favorites: state.user.favorites });
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

export const addGoal = (goal: Partial<Goal>) => {
  const state = loadDB();
  const newGoal: Goal = {
    id: Date.now().toString(),
    title: goal.title || 'Misión',
    type: goal.type || 'Bronce',
    period: goal.period || 'Diario',
    progress: 0,
    total: goal.total || 1,
    completed: false
  };
  state.goals.push(newGoal);
  saveDB(state);
  addNotification('Misión Aceptada', `Has activado: ${newGoal.title}`, 'info');
};

export const updateGoalProgress = (id: string, amount: number) => {
  const state = loadDB();
  const goalIndex = state.goals.findIndex(g => g.id === id);
  if (goalIndex === -1) return;

  const goal = state.goals[goalIndex];
  if (goal.completed) return;

  goal.progress += amount;
  if (goal.progress >= goal.total) {
    goal.progress = goal.total;
    goal.completed = true;
    
    const xpRewards: Record<string, number> = { 'Bronce': 100, 'Plata': 350, 'Oro': 1000 };
    const reward = xpRewards[goal.type] || 50;
    
    addFEPoints(reward, `Meta cumplida: ${goal.title}`);
    addNotification('¡Misión Cumplida!', `Has completado "${goal.title}" y ganado ${reward} XP`, 'award');
  }
  
  saveDB(state);
};

export const addPlaylist = (playlist: Playlist) => {
  const state = loadDB();
  if (!state.playlists) state.playlists = [];
  state.playlists.push(playlist);
  saveDB(state);
  addNotification('Nueva Mezcla', `Has compartido "${playlist.title}"`, 'info');
};

export const togglePlaylistShared = (id: string) => {
  const state = loadDB();
  const index = state.playlists.findIndex(p => p.id === id);
  if (index >= 0) {
    state.playlists[index].shared = !state.playlists[index].shared;
    saveDB(state);
  }
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
