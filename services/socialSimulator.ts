
import { addNotification } from '../store/db';
import { feedback } from './audioFeedback';

const FAKE_USERS = ['Mateo', 'Sofía', 'David', 'Esther', 'Samuel', 'Noemí', 'Isaac', 'Rebeca'];
const ACTIVITIES = [
  { title: 'Nueva Reflexión', msg: 'ha compartido una palabra de vida en el muro.' },
  { title: 'Cadena de Oración', msg: 'se ha unido a un clamor en el altar.' },
  { title: 'Misión Cumplida', msg: 'ha alcanzado el nivel de Oro en su meta semanal.' },
  { title: 'Nueva Playlist', msg: 'compartió su mezcla de alabanza: "Vibras de Gloria".' },
  { title: 'Intercesión', msg: 'está orando por tu última petición.' }
];

export const startSocialSimulation = () => {
  // Simular una actividad cada 1-3 minutos
  const scheduleNext = () => {
    const delay = Math.floor(Math.random() * (180000 - 60000) + 60000);
    
    setTimeout(() => {
      const user = FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)];
      const activity = ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
      
      addNotification(
        activity.title,
        `¡${user} ${activity.msg}!`,
        'info'
      );
      
      // Intentar reproducir sonido de notificación si el usuario ha interactuado
      feedback.playNotification();
      
      scheduleNext();
    }, delay);
  };

  scheduleNext();
};
