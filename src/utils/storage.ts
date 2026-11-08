import Taro from '@tarojs/taro';
import type {
  AppSettings,
  LevelRecord,
  ProgressMap,
  RoundSummary,
  StageProgress,
  WordItem,
  WrongEntry,
  WrongMap
} from '@/types';

const PROGRESS_KEY = 'wq_progress_v1';
const WRONG_KEY = 'wq_wrong_v1';
const ROUND_KEY = 'wq_last_round_v1';
const SETTINGS_KEY = 'wq_settings_v1';

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = Taro.getStorageSync(key);
    if (value === '' || value === null || value === undefined) return fallback;
    return value as T;
  } catch (error) {
    console.error('[Storage] read failed:', key, error);
    return fallback;
  }
}

function writeStorage(key: string, value: unknown): void {
  try {
    Taro.setStorageSync(key, value);
  } catch (error) {
    console.error('[Storage] write failed:', key, error);
  }
}

// ---------------- 进度 ----------------

export function loadProgress(): ProgressMap {
  return readStorage<ProgressMap>(PROGRESS_KEY, {});
}

export function saveProgress(map: ProgressMap): void {
  writeStorage(PROGRESS_KEY, map);
}

export function getStageProgress(map: ProgressMap, stageId: string): StageProgress {
  return map[stageId] || { levels: {} };
}

/** 当前可挑战的关卡（前面全部通关后的下一关） */
export function getUnlockedLevel(map: ProgressMap, stageId: string): number {
  const stage = getStageProgress(map, stageId);
  let level = 1;
  while (stage.levels[level] && stage.levels[level].passed) {
    level += 1;
  }
  return level;
}

export function getStageStats(map: ProgressMap, stageId: string): { passed: number; stars: number } {
  const stage = getStageProgress(map, stageId);
  let passed = 0;
  let stars = 0;
  Object.keys(stage.levels).forEach(key => {
    const record = stage.levels[key];
    if (record.passed) passed += 1;
    stars += record.stars;
  });
  return { passed, stars };
}

export function getTotalPassed(map: ProgressMap): number {
  return Object.keys(map).reduce((sum, stageId) => sum + getStageStats(map, stageId).passed, 0);
}

export function getTotalStars(map: ProgressMap): number {
  return Object.keys(map).reduce((sum, stageId) => sum + getStageStats(map, stageId).stars, 0);
}

/** 记录一关成绩，仅保留更优结果 */
export function recordLevel(stageId: string, level: number, stars: number, score: number): void {
  const map = loadProgress();
  const stage = map[stageId] || { levels: {} };
  const key = String(level);
  const prev = stage.levels[key];
  const next: LevelRecord = {
    stars: Math.max(prev ? prev.stars : 0, stars),
    score: Math.max(prev ? prev.score : 0, score),
    passed: (prev ? prev.passed : false) || stars > 0,
    updatedAt: Date.now()
  };
  stage.levels[key] = next;
  map[stageId] = stage;
  saveProgress(map);
  console.info('[Storage] record level:', stageId, level, next);
}

/** 最近一次游玩的阶段 */
export function getLastStageId(): string | null {
  const map = loadProgress();
  let latestStage: string | null = null;
  let latestTime = 0;
  Object.keys(map).forEach(stageId => {
    Object.keys(map[stageId].levels).forEach(level => {
      const time = map[stageId].levels[level].updatedAt || 0;
      if (time > latestTime) {
        latestTime = time;
        latestStage = stageId;
      }
    });
  });
  return latestStage;
}

// ---------------- 错词本 ----------------

export function loadWrong(): WrongMap {
  return readStorage<WrongMap>(WRONG_KEY, {});
}

export function saveWrong(map: WrongMap): void {
  writeStorage(WRONG_KEY, map);
}

export function addWrong(stageId: string, word: WordItem): void {
  const map = loadWrong();
  const list = map[stageId] || [];
  if (list.some(item => item.word === word.word)) return;
  list.unshift({ ...word, stageId, at: Date.now() });
  map[stageId] = list.slice(0, 300);
  saveWrong(map);
}

export function removeWrong(stageId: string, word: string): void {
  const map = loadWrong();
  const list = map[stageId] || [];
  const next = list.filter(item => item.word !== word);
  if (next.length) {
    map[stageId] = next;
  } else {
    delete map[stageId];
  }
  saveWrong(map);
}

export function getStageWrong(stageId: string): WrongEntry[] {
  return loadWrong()[stageId] || [];
}

export function countWrongTotal(): number {
  const map = loadWrong();
  return Object.keys(map).reduce((sum, stageId) => sum + map[stageId].length, 0);
}

export function clearWrong(): void {
  saveWrong({});
}

// ---------------- 本局结算 ----------------

export function saveRound(summary: RoundSummary): void {
  writeStorage(ROUND_KEY, summary);
}

export function loadRound(): RoundSummary | null {
  return readStorage<RoundSummary | null>(ROUND_KEY, null);
}

// ---------------- 设置 ----------------

export function loadSettings(): AppSettings {
  return readStorage<AppSettings>(SETTINGS_KEY, { vibrate: true });
}

export function saveSettings(settings: AppSettings): void {
  writeStorage(SETTINGS_KEY, settings);
}

// ---------------- 清空 ----------------

export function resetAllProgress(): void {
  writeStorage(PROGRESS_KEY, {});
  writeStorage(WRONG_KEY, {});
  writeStorage(ROUND_KEY, null);
}
