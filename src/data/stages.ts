import type { DictRaw, StageMeta } from '@/types';

interface DictModule {
  default: DictRaw;
}

/** 9 个词库阶段（难度由易到难） */
export const STAGES: StageMeta[] = [
  {
    id: 'xiaoxue',
    name: '小学词汇',
    short: '小学',
    desc: '人教版 3-6 年级 8 册核心词汇',
    badge: '🌱',
    words: 819,
    levels: 82,
    gradient: 'linear-gradient(135deg, #7CE0C3 0%, #2FBF8F 100%)',
    accent: '#2FBF8F'
  },
  {
    id: 'chuzhong',
    name: '初中词汇',
    short: '初中',
    desc: '人教版 7-9 年级 5 册重点词汇',
    badge: '📘',
    words: 2289,
    levels: 229,
    gradient: 'linear-gradient(135deg, #8FD3FF 0%, #4A9DFF 100%)',
    accent: '#4A9DFF'
  },
  {
    id: 'gaozhong',
    name: '高中词汇',
    short: '高中',
    desc: '人教版必修 1-5 高频词汇',
    badge: '🎓',
    words: 1659,
    levels: 166,
    gradient: 'linear-gradient(135deg, #A7B4FF 0%, #6C7BFF 100%)',
    accent: '#6C7BFF'
  },
  {
    id: 'cet4',
    name: '大学英语四级',
    short: '四级',
    desc: 'CET-4 核心词汇',
    badge: '🏫',
    words: 2607,
    levels: 261,
    gradient: 'linear-gradient(135deg, #FFC978 0%, #FF9F1C 100%)',
    accent: '#FF9F1C'
  },
  {
    id: 'cet6',
    name: '大学英语六级',
    short: '六级',
    desc: 'CET-6 进阶词汇',
    badge: '🔥',
    words: 2345,
    levels: 235,
    gradient: 'linear-gradient(135deg, #FFB3A7 0%, #FF6F61 100%)',
    accent: '#FF6F61'
  },
  {
    id: 'level8',
    name: '专业英语八级',
    short: '专八',
    desc: 'TEM-8 高难度词汇',
    badge: '🏆',
    words: 12197,
    levels: 1220,
    gradient: 'linear-gradient(135deg, #C3A9FF 0%, #8A63FF 100%)',
    accent: '#8A63FF'
  },
  {
    id: 'bec',
    name: '商务英语 BEC',
    short: '商务',
    desc: 'BEC 高频商务词汇',
    badge: '💼',
    words: 2753,
    levels: 276,
    gradient: 'linear-gradient(135deg, #9FE3E8 0%, #3EC5CF 100%)',
    accent: '#3EC5CF'
  },
  {
    id: 'toefl',
    name: '托福 TOEFL',
    short: '托福',
    desc: 'TOEFL 核心词汇',
    badge: '✈️',
    words: 4264,
    levels: 427,
    gradient: 'linear-gradient(135deg, #FFB8DE 0%, #F062B8 100%)',
    accent: '#F062B8'
  },
  {
    id: 'ielts',
    name: '雅思 IELTS',
    short: '雅思',
    desc: 'IELTS 核心词汇',
    badge: '🌏',
    words: 3575,
    levels: 358,
    gradient: 'linear-gradient(135deg, #D5E27A 0%, #A8C63F 100%)',
    accent: '#A8C63F'
  }
];

/** 词库按阶段动态加载，避免首屏加载全部数据 */
export const STAGE_DICT_LOADERS: Record<string, () => Promise<DictModule>> = {
  xiaoxue: () => import('./dicts/xiaoxue.json'),
  chuzhong: () => import('./dicts/chuzhong.json'),
  gaozhong: () => import('./dicts/gaozhong.json'),
  cet4: () => import('./dicts/cet4.json'),
  cet6: () => import('./dicts/cet6.json'),
  level8: () => import('./dicts/level8.json'),
  bec: () => import('./dicts/bec.json'),
  toefl: () => import('./dicts/toefl.json'),
  ielts: () => import('./dicts/ielts.json')
};

export function getStageById(id: string): StageMeta | undefined {
  return STAGES.find(stage => stage.id === id);
}
