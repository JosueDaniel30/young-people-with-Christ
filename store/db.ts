
import { User, Goal, Badge, Playlist, Notification, BibleVerse, Reflection } from '../types';
import { INITIAL_USER, INITIAL_GOALS, PLAYLISTS } from '../constants';
import { feedback } from '../services/audioFeedback';
import { db, auth } from '../services/firebaseConfig';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const DB_KEY = 'ignite_youth_db';
const UPDATE_EVENT = 'ignite_db_update';

export const loadDB = () => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) return { user: INITIAL_USER, goals: INITIAL_GOALS, playlists: PLAYLISTS, notifications: [], reflections: [], bibleCache: [] };
  return JSON.parse(data);
};

export const saveDB = (state: any) => {
  localStorage.setItem(DB_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
};

export const updateUser = (updater: (u: User) => User) => {
  const state = loadDB();
  state.user = updater(state.user);
  saveDB(state);
  syncUserToFirebase(state.user);
};

export const togglePlaylistShared = (id: string) => {
  const state = loadDB();
  const playlist = state.playlists.find((p: Playlist) => p.id === id);
  if (playlist) {
    playlist.shared = !playlist.shared;
    saveDB(state);
  }
};

export const markNotificationsRead = () => {
  const state = loadDB();
  state.notifications = state.notifications.map((n: any) => ({ ...n, read: true }));
  saveDB(state);
};

export const handleDailyCheckIn = () => {
  const state = loadDB();
  const today = new Date().toISOString().split('T')[0];
  const lastLogin = state.user.lastLoginDate.split('T')[0];
  
  if (lastLogin !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (lastLogin === yesterdayStr) {
      state.user.streak += 1;
    } else {
      state.user.streak = 1;
    }
    state.user.lastLoginDate = new Date().toISOString();
    saveDB(state);
    addFEPoints(10, 'Inicio de sesión diario');
  }
};

export const syncUserToLeaderboard = async () => {
  const state = loadDB();
  await syncUserToFirebase(state.user);
};

export const addNotification = (title: string, message: string, type: 'info' | 'award' | 'event' = 'info') => {
  const state = loadDB();
  state.notifications.unshift({
    id: Date.now().toString(),
    title,
    message,
    time: 'Ahora',
    read: false,
    type
  });
  saveDB(state);
};

export const addFEPoints = async (amount: number, reason: string = 'Actividad') => {
  const state = loadDB();
  state.user.points += amount;
  
  if (!state.user.xpHistory) state.user.xpHistory = [];
  state.user.xpHistory.push({
    date: new Date().toISOString(),
    points: state.user.points
  });
  
  if (auth.currentUser) {
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, {
      points: state.user.points,
      xpHistory: state.user.xpHistory,
      lastActivity: serverTimestamp()
    });
  }
  
  saveDB(state);
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
  const goal = state.goals.find((g: Goal) => g.id === id);
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
  const index = state.user.favorites.findIndex((f: any) => 
    f.book === verse.book && f.chapter === verse.chapter && f.verse === verse.verse
  );
  if (index >= 0) {
    state.user.favorites.splice(index, 1);
  } else {
    state.user.favorites.push(verse);
  }
  saveDB(state);
};

export const addPlaylist = (playlist: Playlist) => {
  const state = loadDB();
  state.playlists.unshift(playlist);
  saveDB(state);
};

export const likeReflection = async (id: string) => {
  const state = loadDB();
  const reflection = state.reflections.find((r: any) => r.id === id);
  if (reflection) {
    reflection.likes += 1;
    saveDB(state);
  }
  
  if (auth.currentUser) {
    const refDoc = doc(db, "reflections", id);
    const docSnap = await getDoc(refDoc);
    if (docSnap.exists()) {
      await updateDoc(refDoc, { likes: docSnap.data().likes + 1 });
    }
  }
};

export const getCachedChapter = (book: string, chapter: number) => {
  const state = loadDB();
  return state.bibleCache?.find((c: any) => c.book === book && c.chapter === chapter)?.verses;
};

export const saveChapterToCache = (book: string, chapter: number, verses: BibleVerse[]) => {
  const state = loadDB();
  if (!state.bibleCache) state.bibleCache = [];
  const index = state.bibleCache.findIndex((c: any) => c.book === book && c.chapter === chapter);
  if (index >= 0) {
    state.bibleCache[index].verses = verses;
  } else {
    state.bibleCache.push({ book, chapter, verses });
  }
  saveDB(state);
};

export const isChapterCached = (book: string, chapter: number) => {
  const state = loadDB();
  return state.bibleCache?.some((c: any) => c.book === book && c.chapter === chapter);
};

export const fetchGlobalLeaderboard = async () => {
  try {
    const q = query(collection(db, "users"), orderBy("points", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    const leaderboard: any[] = [];
    querySnapshot.forEach((doc) => {
      leaderboard.push({ id: doc.id, ...doc.data() });
    });
    return leaderboard;
  } catch (e) {
    console.error("Error fetching leaderboard:", e);
    return [];
  }
};

export const addReflection = async (reflectionData: Partial<Reflection>) => {
  if (!auth.currentUser) return;

  const newRef = {
    userId: auth.currentUser.uid,
    userName: reflectionData.userName,
    userPhoto: reflectionData.userPhoto,
    text: reflectionData.text,
    verseReference: reflectionData.verseReference,
    createdAt: serverTimestamp(),
    likes: 0
  };

  await addDoc(collection(db, "reflections"), newRef);
  await addFEPoints(50, 'Compartir reflexión');
};

export const syncUserToFirebase = async (user: User) => {
  if (!auth.currentUser) return;
  const userRef = doc(db, "users", auth.currentUser.uid);
  await setDoc(userRef, {
    name: user.name,
    email: user.email,
    photoUrl: user.photoUrl,
    points: user.points,
    level: Math.floor(Math.sqrt(user.points / 100)),
    registered: true,
    lastLoginDate: user.lastLoginDate,
    streak: user.streak,
    xpHistory: user.xpHistory || []
  }, { merge: true });
};
