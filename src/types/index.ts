// ============================================
// 全局类型定义
// ============================================

/** 词库文件为单字符串：每行「单词\t音标\t释义」 */
export type DictRaw = string;

/** 运行时单词结构 */
export interface WordItem {
  word: string;
  phonetic: string;
  meaning: string;
}

/** 词库阶段元信息 */
export interface StageMeta {
  id: string;
  name: string;
  short: string;
  desc: string;
  badge: string;
  words: number;
  levels: number;
  gradient: string;
  accent: string;
}

/** 单关最佳成绩 */
export interface LevelRecord {
  stars: number;
  score: number;
  passed: boolean;
  updatedAt: number;
}

/** 单个阶段的进度 */
export interface StageProgress {
  levels: Record<string, LevelRecord>;
}

/** 全量进度 */
export type ProgressMap = Record<string, StageProgress>;

/** 错词条目 */
export interface WrongEntry extends WordItem {
  stageId: string;
  at: number;
}

/** 全量错词 */
export type WrongMap = Record<string, WrongEntry[]>;

/** 题型：英译中 / 中译英 */
export type QuestionMode = 'en2cn' | 'cn2en';

/** 一道选择题 */
export interface Question {
  mode: QuestionMode;
  word: WordItem;
  prompt: string;
  options: string[];
  answer: string;
}

/** 一局结算数据 */
export interface RoundSummary {
  stageId: string;
  stageName: string;
  level: number;
  review: boolean;
  passed: boolean;
  stars: number;
  score: number;
  correct: number;
  total: number;
  wrongWords: WordItem[];
}

/** 本地设置 */
export interface AppSettings {
  vibrate: boolean;
}
