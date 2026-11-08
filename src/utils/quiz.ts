import type { Question, WordItem } from '@/types';

/** 每关题量 */
export const LEVEL_SIZE = 10;

/** Fisher-Yates 洗牌 */
export function shuffle<T>(list: T[]): T[] {
  const arr = list.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

/** 取某关的单词（按词库顺序切片） */
export function getLevelWords(pool: WordItem[], level: number): WordItem[] {
  const start = (level - 1) * LEVEL_SIZE;
  return pool.slice(start, start + LEVEL_SIZE);
}

function pickOptions(answer: string, pool: string[], count: number): string[] {
  const result: string[] = [answer];
  const seen = new Set<string>([answer]);
  const candidates = shuffle(pool);
  for (const item of candidates) {
    if (!item || seen.has(item)) continue;
    seen.add(item);
    result.push(item);
    if (result.length >= count) break;
  }
  return shuffle(result);
}

/** 生成一道选择题：随机英译中或中译英 */
export function buildQuestion(word: WordItem, pool: WordItem[]): Question {
  const mode = Math.random() < 0.5 ? 'en2cn' : 'cn2en';
  if (mode === 'en2cn') {
    const distractors = pool.map(item => item.meaning);
    return {
      mode,
      word,
      prompt: word.word,
      answer: word.meaning,
      options: pickOptions(word.meaning, distractors, 4)
    };
  }
  const distractors = pool.map(item => item.word);
  return {
    mode,
    word,
    prompt: word.meaning,
    answer: word.word,
    options: pickOptions(word.word, distractors, 4)
  };
}

/** 批量生成题目 */
export function buildQuestions(words: WordItem[], pool: WordItem[]): Question[] {
  return words.map(word => buildQuestion(word, pool));
}
