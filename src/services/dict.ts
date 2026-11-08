import { STAGE_DICT_LOADERS } from '@/data/stages';
import type { WordItem } from '@/types';

const cache: Record<string, WordItem[]> = {};

/** 解析词库原始字符串 */
export function parseDict(raw: string): WordItem[] {
  if (!raw) return [];
  return raw
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split('\t');
      const word = (parts[0] || '').trim();
      if (parts.length >= 3) {
        return { word, phonetic: (parts[1] || '').trim(), meaning: parts.slice(2).join('\t').trim() };
      }
      return { word, phonetic: '', meaning: (parts[1] || '').trim() };
    })
    .filter(item => item.word && item.meaning);
}

/** 按阶段加载词库（带内存缓存） */
export async function loadStageWords(stageId: string): Promise<WordItem[]> {
  if (cache[stageId]) {
    return cache[stageId];
  }
  const loader = STAGE_DICT_LOADERS[stageId];
  if (!loader) {
    throw new Error('未找到词库: ' + stageId);
  }
  console.log('[Dict] loading stage dict:', stageId);
  const mod = await loader();
  const raw = (mod && (mod as { default?: string }).default) || '';
  const words = parseDict(raw);
  cache[stageId] = words;
  console.info('[Dict] loaded stage dict:', stageId, 'words:', words.length);
  return words;
}

/** 获取已缓存词库（未加载返回空数组） */
export function getCachedWords(stageId: string): WordItem[] {
  return cache[stageId] || [];
}
