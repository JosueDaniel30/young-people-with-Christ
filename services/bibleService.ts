
import { BibleVerse } from "../types";
import { fetchFullChapter, searchLocalBible } from "./bibleRepository";
import { BIBLE_TOPICS, BIBLE_BOOKS } from "../constants";

/**
 * bibleService.ts - Motor de búsqueda y versículos 100% LOCAL
 */

const LOCAL_VERSES: BibleVerse[] = [
  { book: 'Josué', chapter: 1, verse: 9, text: 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.' },
  { book: 'Salmos', chapter: 23, verse: 1, text: 'Jehová es mi pastor; nada me faltará.' },
  { book: 'Proverbios', chapter: 3, verse: 5, text: 'Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.' },
  { book: 'Filipenses', chapter: 4, verse: 13, text: 'Todo lo puedo en Cristo que me fortalece.' },
  { book: 'Jeremías', chapter: 29, verse: 11, text: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.' },
  { book: 'Salmos', chapter: 119, verse: 105, text: 'Lámpara es a mis pies tu palabra, y lumbrera a mi camino.' },
  { book: 'Mateo', chapter: 11, verse: 28, text: 'Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.' },
  { book: 'Romanos', chapter: 8, verse: 28, text: 'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien.' },
  { book: '1 Corintios', chapter: 16, verse: 14, text: 'Todas vuestras cosas sean hechas con amor.' },
  { book: 'Salmos', chapter: 46, verse: 1, text: 'Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones.' },
  { book: 'Proverbios', chapter: 4, verse: 23, text: 'Sobre toda cosa guardada, guarda tu corazón; porque de él mana la vida.' },
  { book: 'Juan', chapter: 3, verse: 16, text: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.' }
];

const normalizeText = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export const getRandomVerse = async (): Promise<BibleVerse> => {
  // Rotación basada en el día del año para que sea el mismo para todos cada día sin IA
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const index = dayOfYear % LOCAL_VERSES.length;
  return LOCAL_VERSES[index];
};

const findDirectReference = (query: string) => {
  const normalized = normalizeText(query);
  const allBooks = [...BIBLE_BOOKS.antiguo, ...BIBLE_BOOKS.nuevo].flatMap(g => g.books);
  
  for (const book of allBooks) {
    const bookNorm = normalizeText(book);
    if (normalized.startsWith(bookNorm)) {
      const remaining = normalized.replace(bookNorm, "").trim();
      const chapter = parseInt(remaining.split(/[:\s]/)[0]);
      if (!isNaN(chapter)) {
        return { book, chapter };
      }
    }
  }
  return null;
};

export const searchBible = async (params: any) => {
  if (params.book && params.chapter && !params.query) {
    return await fetchFullChapter(params.book, params.chapter);
  }

  const queryText = normalizeText(typeof params === 'string' ? params : params.query);
  if (!queryText) return [];

  const directRef = findDirectReference(queryText);
  if (directRef) {
    const verses = await fetchFullChapter(directRef.book, directRef.chapter);
    return verses.length > 0 ? verses.slice(0, 5) : [];
  }

  const topicMatch = Object.keys(BIBLE_TOPICS).find(topic => queryText.includes(topic));
  if (topicMatch) {
    return BIBLE_TOPICS[topicMatch];
  }

  return searchLocalBible(queryText);
};
