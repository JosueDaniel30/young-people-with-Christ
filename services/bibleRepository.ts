
import { BibleVerse } from '../types';

/**
 * bibleRepository.ts - MOTOR DE BÚSQUEDA PERSONALIZADO RVR1960
 * Basado en la estructura real del repositorio:
 * Carpeta: 1Reyes, 2Samuel, Juan
 * Archivo: 1_reyes_1.json, 2_samuel_1.json, juan_1.json
 */

const GITHUB_BASE = "https://raw.githubusercontent.com/JosueDaniel30/Biblia_1960_JSON/master";

// --- CONTENIDO DE EMERGENCIA ---
const SEED_BIBLE: Record<string, Record<number, any>> = {
  'Génesis': {
    1: {
      book: 'Génesis', chapter: 1, 
      verses: [
        { verse: 1, text: 'En el principio creó Dios los cielos y la tierra.' },
        { verse: 2, text: 'Y la tierra estaba desordenada y vacía...' }
      ]
    }
  }
};

/**
 * Genera variaciones basadas en tus capturas de pantalla.
 */
const getPathVariations = (book: string) => {
  // Limpiar tildes
  const clean = book.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const variations: {folder: string, file: string}[] = [];

  // CASO ESPECIAL: Libros con número (1 Reyes, 2 Samuel, 1 Pedro)
  const numMatch = clean.match(/^(\d+)\s+(.+)$/);
  
  if (numMatch) {
    const num = numMatch[1];
    const name = numMatch[2].toLowerCase().replace(/\s+/g, '_');
    const nameNoSpaces = numMatch[2].replace(/\s+/g, '');

    // Variación A (La de tu captura): 1Reyes / 1_reyes
    variations.push({
      folder: `${num}${nameNoSpaces}`, // "1Reyes"
      file: `${num}_${name}`          // "1_reyes"
    });

    // Variación B (Respaldo): 1_Reyes / 1_reyes
    variations.push({
      folder: `${num}_${nameNoSpaces}`,
      file: `${num}_${name}`
    });
  }

  // CASO ESTÁNDAR: Libros sin número (Juan, Mateo, Genesis)
  const simple = clean.replace(/\s+/g, '_');
  variations.push({
    folder: simple,                // "Juan"
    file: simple.toLowerCase()      // "juan"
  });

  // Variación Todo Minúsculas
  variations.push({
    folder: clean.replace(/\s+/g, '').toLowerCase(),
    file: clean.replace(/\s+/g, '_').toLowerCase()
  });

  return variations;
};

export const fetchFullChapter = async (book: string, chapter: number): Promise<BibleVerse[]> => {
  const variations = getPathVariations(book);
  const cacheKey = `bible_v5_${book.replace(/\s/g, '')}_${chapter}`;

  // 1. Intentar Caché Local
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try { return parseVerses(JSON.parse(cached), book, chapter); } catch (e) { localStorage.removeItem(cacheKey); }
  }

  // 2. Búsqueda en Cascada (GitHub y Local)
  for (const v of variations) {
    const paths = [
      // Estructura de tu captura en GitHub
      `${GITHUB_BASE}/${v.folder}/${v.file}_${chapter}.json`,
      // Estructura alternativa en subcarpeta
      `${GITHUB_BASE}/biblia/${v.folder}/${v.file}_${chapter}.json`,
      // Intento en local
      `./biblia/${v.folder}/${v.file}_${chapter}.json`
    ];

    for (const path of paths) {
      try {
        if (path.startsWith('http') && !navigator.onLine) continue;
        
        const response = await fetch(path);
        if (response.ok) {
          const data = await response.json();
          const finalData = (data.chapters) 
            ? data.chapters.find((c: any) => (c.chapter || c.number) === chapter) || data
            : data;

          localStorage.setItem(cacheKey, JSON.stringify(finalData));
          return parseVerses(finalData, book, chapter);
        }
      } catch (e) {}
    }
  }

  // 3. Fallback Seed
  if (SEED_BIBLE[book] && SEED_BIBLE[book][chapter]) {
    return parseVerses(SEED_BIBLE[book][chapter], book, chapter);
  }

  console.error(`[BibleRepo] Error crítico: No se halló archivo para ${book} ${chapter}.`);
  console.debug(`Intentado como carpeta: ${variations[0].folder} y archivo: ${variations[0].file}_${chapter}.json`);
  return [];
};

function parseVerses(data: any, book: string, chapter: number): BibleVerse[] {
  if (!data) return [];
  const versesSource = data.verses || (Array.isArray(data) ? data : []);
  return versesSource.map((v: any) => ({
    book: data.book || book,
    chapter: data.chapter || chapter,
    verse: v.verse || v.number,
    text: v.text,
    title: v.title || undefined
  }));
}

export const searchLocalBible = (query: string): BibleVerse[] => {
  const results: BibleVerse[] = [];
  const queryLower = query.toLowerCase();

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('bible_v5_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        (data.verses || []).forEach((v: any) => {
          if (v.text.toLowerCase().includes(queryLower)) {
            results.push({
              book: data.book || 'Libro',
              chapter: data.chapter || 0,
              verse: v.verse || v.number,
              text: v.text
            });
          }
        });
      } catch (e) {}
    }
  }
  return results.slice(0, 15);
};
