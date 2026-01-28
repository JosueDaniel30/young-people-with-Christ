
import React from 'react';
import { Badge, Goal, Study, Playlist, User } from './types';

export const INITIAL_USER: User = {
  id: '1',
  name: 'Joven Ignite',
  email: 'joven@iglesia.com',
  photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=IgniteYouth',
  points: 0,
  streak: 1,
  totalLogins: 1,
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

export const BIBLE_TOPICS: Record<string, { book: string, chapter: number, verse: number, text: string }[]> = {
  'ansiedad': [
    { book: 'Filipenses', chapter: 4, verse: 6, text: 'Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios...' },
    { book: '1 Pedro', chapter: 5, verse: 7, text: 'echando toda vuestra ansiedad sobre él, porque él tiene cuidado de vosotros.' }
  ],
  'paz': [
    { book: 'Juan', chapter: 14, verse: 27, text: 'La paz os dejo, mi paz os doy; yo no os la doy como el mundo la da.' },
    { book: 'Isaías', chapter: 26, verse: 3, text: 'Tú guardarás en completa paz a aquel cuyo pensamiento en ti persevera...' }
  ],
  'fortaleza': [
    { book: 'Isaías', chapter: 40, verse: 31, text: 'pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas...' },
    { book: 'Filipenses', chapter: 4, verse: 13, text: 'Todo lo puedo en Cristo que me fortalece.' }
  ],
  'amor': [
    { book: '1 Corintios', chapter: 13, verse: 4, text: 'El amor es sufrido, es benigno; el amor no tiene envidia...' },
    { book: 'Juan', chapter: 3, verse: 16, text: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito...' }
  ],
  'perdon': [
    { book: 'Efesios', chapter: 4, verse: 32, text: 'Antes sed benignos unos con otros, misericordiosos, perdonándoos unos a otros...' },
    { book: '1 Juan', chapter: 1, verse: 9, text: 'Si confesamos nuestros pecados, él es fiel y justo para perdonar nuestros pecados...' }
  ],
  'miedo': [
    { book: 'Salmos', chapter: 27, verse: 1, text: 'Jehová es mi luz y mi salvación; ¿de quién temeré?' },
    { book: 'Josué', chapter: 1, verse: 9, text: 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes...' }
  ],
  'tristeza': [
    { book: 'Salmos', chapter: 34, verse: 18, text: 'Cercano está Jehová a los quebrantados de corazón; y salva a los contritos de espíritu.' },
    { book: 'Mateo', chapter: 5, verse: 4, text: 'Bienaventurados los que lloran, porque ellos recibirán consolación.' }
  ]
};

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
  { id: 'b1', name: 'Luz Inicial', icon: 'Zap', color: 'bg-amber-500', dateEarned: '', message: '¡Has encendido tu camino en Ignite!' },
  { id: 'b2', name: 'Teólogo Junior', icon: 'BookOpen', color: 'bg-blue-500', dateEarned: '', message: 'Has alcanzado el nivel 2 y profundizado en la Palabra.' },
  
  // Insignias de Misión
  { id: 'm-bronze', name: 'Escudero de Bronce', icon: 'Shield', color: 'bg-orange-700', dateEarned: '', message: 'Completaste 5 misiones básicas de Bronce.' },
  { id: 'm-silver', name: 'Guerrero de Plata', icon: 'Medal', color: 'bg-slate-400', dateEarned: '', message: 'Completaste 5 misiones de constancia nivel Plata.' },
  { id: 'm-gold', name: 'Caballero de Oro', icon: 'Crown', color: 'bg-yellow-500', dateEarned: '', message: 'Superaste 3 desafíos grandes de carácter Oro.' },
  
  // Insignias de Frecuencia
  { id: 'f-7', name: 'Llama Inextinguible', icon: 'Flame', color: 'bg-orange-600', dateEarned: '', message: 'Mantuviste tu racha por 7 días seguidos.' },
  { id: 'f-30', name: 'Peregrino Fiel', icon: 'Star', color: 'bg-indigo-600', dateEarned: '', message: 'Has entrado a la app 30 días en total.' },
  { id: 'f-morning', name: 'Madrugador del Reino', icon: 'Zap', color: 'bg-yellow-400', dateEarned: '', message: 'Iniciaste tu devocional antes de las 7:00 AM.' }
];

export const INITIAL_GOALS: Goal[] = [
  // NIVEL BRONCE (Diario)
  { id: 'b-1', title: 'Disciplina: Hogar Ordenado', description: 'Tiende tu cama al levantarte para honrar tu espacio.', type: 'Bronce', period: 'Diario', progress: 0, total: 1, completed: false },
  { id: 'b-2', title: 'Oración: 5 Minutos de Fuego', description: 'Ora 5 minutos sin falta, un clamor sincero al Padre.', type: 'Bronce', period: 'Diario', progress: 0, total: 1, completed: false },
  { id: 'b-3', title: 'Biblia: Cuaderno Espiritual', description: 'Haz tu cuaderno espiritual: apunta lo que Dios te habló.', type: 'Bronce', period: 'Diario', progress: 0, total: 1, completed: false },
  { id: 'b-4', title: 'Obediencia: Corazón Sumiso', description: 'Obedece a tus padres o líderes a la primera, con alegría.', type: 'Bronce', period: 'Diario', progress: 0, total: 1, completed: false },
  { id: 'b-5', title: 'Pureza: Limpieza Digital', description: 'Borra cualquier contenido sucio de tu celular hoy mismo.', type: 'Bronce', period: 'Diario', progress: 0, total: 1, completed: false },
  { id: 'b-6', title: 'Gratitud: Tres Gracias', description: 'Escribe 3 cosas por las que das gracias antes de dormir.', type: 'Bronce', period: 'Diario', progress: 0, total: 1, completed: false },
  { id: 'b-7', title: 'Responsabilidad: Alerta Roja', description: 'Levántate a la primera alarma, sin pedir "5 minutos más".', type: 'Bronce', period: 'Diario', progress: 0, total: 1, completed: false },
  { id: 'b-8', title: 'Amor: Mensaje de Aliento', description: 'Envía un mensaje a un joven o señorita que lo necesite.', type: 'Bronce', period: 'Diario', progress: 0, total: 1, completed: false },
  { id: 'b-9', title: 'Valentía: Identidad Bautista', description: 'Reconoce abiertamente que eres Bautista con tus amigos.', type: 'Bronce', period: 'Diario', progress: 0, total: 1, completed: false },
  
  // NIVEL PLATA (Semanal) - Hábitos de 7 días
  { id: 's-1', title: 'Memorización: La Palabra viva', description: 'Memoriza un versículo bíblico nuevo esta semana.', type: 'Plata', period: 'Semanal', progress: 0, total: 1, completed: false },
  { id: 's-2', title: 'Servicio: Iniciativa en Casa', description: 'Ayuda en una tarea de casa sin que te lo tengan que pedir.', type: 'Plata', period: 'Semanal', progress: 0, total: 1, completed: false },
  { id: 's-3', title: 'Digital: Comunión Real', description: 'Mantén el celular apagado o lejos durante todas las comidas de la semana.', type: 'Plata', period: 'Semanal', progress: 0, total: 1, completed: false },
  { id: 's-4', title: 'Relaciones: Pescador de Hombres', description: 'Lleva a un invitado nuevo a la iglesia esta semana.', type: 'Plata', period: 'Semanal', progress: 0, total: 1, completed: false },
  { id: 's-5', title: 'Excelencia: Puntualidad Fiel', description: 'Llega puntualmente a tu trabajo o escuela durante toda la semana.', type: 'Plata', period: 'Semanal', progress: 0, total: 1, completed: false },
  { id: 's-6', title: 'Evangelismo: Mensajero de Aliento', description: 'Escribe a un amigo esta semana para animarlo con textos bíblicos.', type: 'Plata', period: 'Semanal', progress: 0, total: 1, completed: false },
  { id: 's-7', title: 'Pureza: Santidad Auditiva', description: 'Escucha solo himnos o música cristiana durante estos 7 días.', type: 'Plata', period: 'Semanal', progress: 0, total: 1, completed: false },
  { id: 's-8', title: 'Constancia: Fiel a la Asamblea', description: 'No faltes a ninguna reunión de la iglesia esta semana.', type: 'Plata', period: 'Semanal', progress: 0, total: 1, completed: false },
  { id: 's-9', title: 'Finanzas: Mayordomía Sabia', description: 'No gastes dinero en cosas innecesarias durante toda la semana.', type: 'Plata', period: 'Semanal', progress: 0, total: 1, completed: false },

  // NIVEL ORO (Mensual) - Desafíos de Carácter y Liderazgo
  { id: 'g-1', title: 'Carácter: Victoria sobre el Hábito', description: 'Identifica y elimina un mal hábito por 30 días seguidos.', type: 'Oro', period: 'Mensual', progress: 0, total: 1, completed: false },
  { id: 'g-2', title: 'Aprendizaje: Escriba del Reino', description: 'Lee un libro completo de la Biblia y haz un resumen.', type: 'Oro', period: 'Mensual', progress: 0, total: 1, completed: false },
  { id: 'g-3', title: 'Desconexión: Ayuno Digital', description: 'Haz un ayuno total de redes sociales por una semana completa.', type: 'Oro', period: 'Mensual', progress: 0, total: 1, completed: false },
  { id: 'g-4', title: 'Comunidad: Siervo de Dones', description: 'Sirve con tus dones durante todo el mes dentro de la iglesia.', type: 'Oro', period: 'Mensual', progress: 0, total: 1, completed: false },
  { id: 'g-5', title: 'Misión: Plan de Salvación', description: 'Explica el plan de salvación completo a una persona no creyente.', type: 'Oro', period: 'Mensual', progress: 0, total: 1, completed: false },
  { id: 'g-6', title: 'Mayordomía: Primicias al Altar', description: 'Entrega tu diezmo fielmente este mes.', type: 'Oro', period: 'Mensual', progress: 0, total: 1, completed: false },
  { id: 'g-7', title: 'Restauración: Embajador de Paz', description: 'Busca a alguien con quien estés peleado y haz las paces.', type: 'Oro', period: 'Mensual', progress: 0, total: 1, completed: false },
  { id: 'g-8', title: 'Cuidado: Templo del Espíritu', description: 'Haz 5 min de ejercicio diario y un tiempo de comida saludable hoy.', type: 'Oro', period: 'Mensual', progress: 0, total: 1, completed: false },
  { id: 'g-9', title: 'Excelencia: Ayuda al Hermano', description: 'Ayuda a un hermano de la iglesia cada domingo (bolsos, gradas, agua).', type: 'Oro', period: 'Mensual', progress: 0, total: 1, completed: false },
  { id: 'g-10', title: 'Humildad: Corazón Enseñable', description: 'Pide a un líder sus consejos sobre tus 3 debilidades y acéptalo.', type: 'Oro', period: 'Mensual', progress: 0, total: 1, completed: false },
];

export const PLAYLISTS: Playlist[] = [
  {
    id: 'p1',
    userId: '1',
    title: 'Adoración y Alabanza',
    creator: 'Ministerio Juvenil',
    spotifyLink: 'https://open.spotify.com',
    likes: 120,
    cover: 'https://images.unsplash.com/photo-1514525253361-b874866075b5?w=400',
    shared: true
  }
];
