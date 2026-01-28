
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

// --- PERSISTENCIA LOCAL (Para estado personal) ---
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

// --- USUARIO Y PUNTOS (Sincronizado) ---
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

  // Sincronizar con Firebase si el usuario está logueado
  if (auth.currentUser) {
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, {
      points: increment(amount),
      level: newLevel
    }).catch(() => console.warn("Puntos guardados solo localmente por ahora."));
  }
};

export const updateUser = async (updater: (u: User) => User) => {
  const state = loadDB();
  state.user = updater(state.user);
  saveDB(state);

  if (auth.currentUser) {
    const userRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(userRef, state.user, { merge: true });
  }
};

// --- NOTIFICACIONES ---
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

export const markNotificationsRead = () => {
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

// --- REFLEXIONES (Firestore) ---
export const addReflection = async (ref: Partial<Reflection>) => {
  const user = auth.currentUser;
  if (!user) return;

  const newRef = {
    userId: user.uid,
    userName: user.displayName || 'Joven',
    userPhoto: user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ignite',
    text: ref.text,
    verseReference: ref.verseReference || '',
    timestamp: new Date().toISOString(),
    likes: 0
  };

  await addDoc(collection(db, "reflections"), newRef);
  addFEPoints(50, 'Nueva reflexión compartida');
};

export const subscribeToReflections = (callback: (refs: Reflection[]) => void) => {
  const q = query(collection(db, "reflections"), orderBy("timestamp", "desc"), limit(50));
  return onSnapshot(q, (snapshot) => {
    const refs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reflection));
    callback(refs);
  });
};

export const likeReflection = async (id: string) => {
  const ref = doc(db, "reflections", id);
  await updateDoc(ref, { likes: increment(1) });
};

// --- PETICIONES DE ORACIÓN (Firestore) ---
export const addPrayerRequest = async (req: { text: string, category: string }) => {
  const user = auth.currentUser;
  if (!user) return;

  const newReq = {
    userId: user.uid,
    userName: user.displayName || 'Joven',
    userPhoto: user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ignite',
    request: req.text,
    category: req.category,
    createdAt: new Date().toISOString(),
    prayersCount: 0,
    prayers: [],
    status: 'active'
  };

  await addDoc(collection(db, "prayerRequests"), newReq);
};

export const subscribeToPrayers = (callback: (prayers: PrayerRequest[]) => void) => {
  const q = query(collection(db, "prayerRequests"), orderBy("createdAt", "desc"), limit(50));
  return onSnapshot(q, (snapshot) => {
    const prayers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PrayerRequest));
    callback(prayers);
  });
};

export const joinPrayer = async (id: string) => {
  const user = auth.currentUser;
  if (!user) return;
  const reqRef = doc(db, "prayerRequests", id);
  await updateDoc(reqRef, {
    prayersCount: increment(1),
    prayers: arrayUnion(user.uid)
  });
};

export const updatePrayerStatus = async (id: string, status: string) => {
  const reqRef = doc(db, "prayerRequests", id);
  await updateDoc(reqRef, { status });
};

// --- LECCIONES DE DISCIPULADO (Firestore) ---
export const addLesson = async (lesson: Partial<Lesson>) => {
  const user = auth.currentUser;
  if (!user) return;

  const newLesson = {
    userId: user.uid,
    userName: user.displayName || 'Líder',
    userPhoto: user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ignite',
    title: lesson.title,
    content: lesson.content,
    category: lesson.category,
    attachment: lesson.attachment || null,
    timestamp: new Date().toISOString(),
    likes: 0
  };

  await addDoc(collection(db, "lessons"), newLesson);
  addFEPoints(150, 'Lección compartida');
};

export const subscribeToLessons = (callback: (lessons: Lesson[]) => void) => {
  const q = query(collection(db, "lessons"), orderBy("timestamp", "desc"), limit(20));
  return onSnapshot(q, (snapshot) => {
    const lessons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lesson));
    callback(lessons);
  });
};

// --- METAS Y FAVORITOS (Local por ahora para rapidez) ---
export const toggleFavorite = (verse: BibleVerse) => {
  const state = loadDB();
  const idx = state.user.favorites.findIndex((f: any) => f.book === verse.book && f.verse === verse.verse && f.chapter === verse.chapter);
  if (idx >= 0) state.user.favorites.splice(idx, 1);
  else state.user.favorites.push(verse);
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

export const fetchGlobalLeaderboard = async () => {
  const q = query(collection(db, "users"), orderBy("points", "desc"), limit(10));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getCachedChapter = (book: string, chapter: number) => {
  return loadDB().bibleCache?.find((c: any) => c.book === book && c.chapter === chapter)?.verses;
};

export const addPlaylist = (pl: Playlist) => {
  const state = loadDB();
  state.playlists.push(pl);
  saveDB(state);
};

export const addGoal = (goal: any) => {
  const state = loadDB();
  state.goals.push({ ...goal, id: Date.now().toString(), progress: 0, completed: false });
  saveDB(state);
};
