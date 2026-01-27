
import { BibleVerse } from "../types";
import { fetchFullChapter, searchLocalBible } from "./bibleRepository";

/**
 * bibleService.ts - Lógica de Biblia sin IA
 */

const FALLBACK_VERSES: BibleVerse[] = [
  { book: 'Josué', chapter: 1, verse: 9, text: 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.' },
  { book: 'Salmos', chapter: 23, verse: 1, text: 'Jehová es mi pastor; nada me faltará.' },
  { book: 'Proverbios', chapter: 3, verse: 5, text: 'Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.' },
  { book: 'Filipenses', chapter: 4, verse: 13, text: 'Todo lo puedo en Cristo que me fortalece.' },
  { book: 'Jeremías', chapter: 29, verse: 11, text: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.' },
  { book: 'Romanos', chapter: 8, verse: 28, text: 'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien.' }
];

export const getRandomVerse = async (): Promise<BibleVerse> => {
  // Al no usar IA para buscar versículos aleatorios remotos (que es ineficiente por la estructura JSON),
  // rotamos entre una colección premium de versículos inspiracionales que funciona 100% offline.
  const randomIndex = Math.floor(Math.random() * FALLBACK_VERSES.length);
  return FALLBACK_VERSES[randomIndex];
};

export const searchBible = async (params: any) => {
  if (params.book && params.chapter) {
    return await fetchFullChapter(params.book, params.chapter);
  }

  const queryText = typeof params === 'string' ? params : params.query;
  // Búsqueda local en el caché de capítulos leídos
  return searchLocalBible(queryText);
};

export const analyzeVerseLocally = (verseText: string): string => {
  return `Este versículo nos invita a profundizar en nuestra fe. Medita en cómo estas palabras pueden transformar tu día hoy y qué paso práctico puedes dar para vivir conforme a esta verdad.`;
};
