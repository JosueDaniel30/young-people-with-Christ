
import { User, Goal, Badge, Playlist, Notification, BibleVerse, Reflection } from '../types';
import { INITIAL_USER, INITIAL_GOALS, PLAYLISTS, BADGES } from '../constants';
import { feedback } from '../services/audioFeedback';

const DB_KEY = 'ignite_youth_db';

interface DBState {
  user: User;
  goals: Goal[];
  playlists: Playlist[];
  notifications: Notification[];
  reflections: Reflection[];
}

const DEFAULT_NOTIFICATIONS: Notification[] = [
  { id: '1', title: '¡Bienvenido!', message: 'Gracias por unirte a Jóvenes con Cristo.', time: 'Reciente', read: false, type: 'info' },
  { id: '2', title: 'Nuevo Estudio', message: 'Se ha publicado "Caminando en su Palabra".', time: 'hace 2h', read: false, type: 'event' }
];

const DEFAULT_REFLECTIONS: Reflection[] = [
  {
    id: 'r1',
    userId: 'system',
    userName: 'Líder Juvenil',
    userPhoto: './logojov.png',
    verseReference: 'Filipenses 4:13',
    text: 'Este versículo me recuerda que mi fuerza no viene de mis habilidades, sino de mi dependencia total en Dios. ¡Bienvenidos a todos!',
    timestamp: 'Hace 2 horas',
    likes: 12
  }
];

export const loadDB = (): DBState => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    const initialState: DBState = {
      user: { ...INITIAL_USER, theme: 'light' } as User,
      goals: INITIAL_GOALS,
      playlists: PLAYLISTS,
      notifications: DEFAULT_NOTIFICATIONS,
      reflections: DEFAULT_REFLECTIONS,
    };
    saveDB(initialState);
    return initialState;
  }
  const parsed = JSON.parse(data);
  if (!parsed.user.favorites) parsed.user.favorites = [];
  if (!parsed.reflections) parsed.reflections = DEFAULT_REFLECTIONS;
  // Asegurar que si no hay foto, se use el logo oficial
  if (!parsed.user.photoUrl || parsed.user.photoUrl.includes('pravatar')) {
    parsed.user.photoUrl = './logojov.png';
  }
  return parsed;
};

export const saveDB = (state: DBState) => {
  localStorage.setItem(DB_KEY, JSON.stringify(state));
};

export const updateUser = (updater: (user: User) => User) => {
  const state = loadDB();
  state.user = updater(state.user);
  saveDB(state);
};

export const addReflection = (reflection: Omit<Reflection, 'id' | 'timestamp' | 'likes'>) => {
  const state = loadDB();
  const newReflection: Reflection = {
    ...reflection,
    id: Date.now().toString(),
    timestamp: 'Ahora mismo',
    likes: 0
  };
  state.reflections.unshift(newReflection);
  state.user.points += 50; // Recompensa por participar
  saveDB(state);
  feedback.playSuccess();
};

export const likeReflection = (id: string) => {
  const state = loadDB();
  const reflection = state.reflections.find(r => r.id === id);
  if (reflection) {
    reflection.likes += 1;
    saveDB(state);
    feedback.playClick();
  }
};

export const toggleFavorite = (verse: BibleVerse) => {
  const state = loadDB();
  const index = state.user.favorites.findIndex(v => 
    v.book === verse.book && v.chapter === verse.chapter && v.verse === verse.verse
  );
  if (index >= 0) {
    state.user.favorites.splice(index, 1);
  } else {
    state.user.favorites.push(verse);
  }
  saveDB(state);
};

export const updateGoalProgress = (goalId: string, amount: number) => {
  const state = loadDB();
  const goal = state.goals.find(g => g.id === goalId);
  if (goal && !goal.completed) {
    goal.progress = Math.min(goal.progress + amount, goal.total);
    if (goal.progress >= goal.total) {
      goal.completed = true;
      feedback.playSuccess();
      const xpAwarded = goal.type === 'Oro' ? 2000 : goal.type === 'Plata' ? 500 : 100;
      state.user.points += xpAwarded;
      let badgeToAward: Badge | undefined;
      if (state.user.badges.length === 0) {
        badgeToAward = BADGES.find(b => b.id === 'b1');
      } else if (goal.type === 'Plata') {
        badgeToAward = BADGES.find(b => b.id === 'b4');
      } else if (goal.type === 'Oro') {
        badgeToAward = BADGES.find(b => b.id === 'b5');
      }
      if (badgeToAward && !state.user.badges.some(b => b.id === badgeToAward?.id)) {
        state.user.badges.push({ ...badgeToAward, dateEarned: new Date().toLocaleDateString() });
        state.notifications.unshift({ id: Date.now().toString(), title: '¡Nueva Insignia!', message: `Has desbloqueado: ${badgeToAward.name}`, time: 'Ahora', read: false, type: 'award' });
      }
      state.notifications.unshift({ id: (Date.now() + 1).toString(), title: 'Meta Completada', message: `¡Felicidades! Ganaste ${xpAwarded} XP por completar "${goal.title}".`, time: 'Ahora', read: false, type: 'award' });
    }
    saveDB(state);
  }
};

export const addPlaylist = (playlist: Playlist) => {
  const state = loadDB();
  state.playlists = [playlist, ...state.playlists];
  saveDB(state);
};

export const markNotificationsRead = () => {
  const state = loadDB();
  state.notifications = state.notifications.map(n => ({ ...n, read: true }));
  saveDB(state);
};
