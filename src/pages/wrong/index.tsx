import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import EmptyState from '@/components/EmptyState';
import { STAGES } from '@/data/stages';
import { loadWrong, removeWrong } from '@/utils/storage';
import type { WrongEntry } from '@/types';
import styles from './index.module.scss';

const MAX_SHOW = 30;

interface WrongGroup {
  stageId: string;
  name: string;
  short: string;
  gradient: string;
  words: WrongEntry[];
}

const WrongPage: React.FC = () => {
  const [groups, setGroups] = useState<WrongGroup[]>([]);
  const [total, setTotal] = useState(0);

  const refresh = () => {
    try {
      const map = loadWrong();
      const list: WrongGroup[] = STAGES.filter(stage => map[stage.id] && map[stage.id].length).map(stage => ({
        stageId: stage.id,
        name: stage.name,
        short: stage.short,
        gradient: stage.gradient,
        words: map[stage.id] || []
      }));
      setGroups(list);
      setTotal(list.reduce((sum, group) => sum + group.words.length, 0));
    } catch (error) {
      console.error('[Wrong] load wrong book failed:', error);
    }
  };

  useDidShow(() => {
    refresh();
  });

  const handleDelete = (stageId: string, word: string) => {
    console.log('[Wrong] remove word:', stageId, word);
    removeWrong(stageId, word);
    refresh();
  };

  const startReview = (stageId: string) => {
    Taro.navigateTo({ url: `/pages/game/index?stageId=${stageId}&mode=review` });
  };

  return (
    <View className={styles.page}>
      <View className={styles.container}>
        <View className={styles.headerCard}>
          <View className={styles.headerTop}>
            <Text className={styles.headerTitle}>错词本</Text>
            <Text className={styles.headerCount}>{total} 个</Text>
          </View>
          <Text className={styles.headerDesc}>答错的单词会自动收录，答对后自动移除</Text>
        </View>

        {groups.length === 0 ? (
          <View className={styles.emptyWrap}>
            <EmptyState
              icon="🗂"
              title="错词本还是空的"
              desc="去闯关吧，答错的单词会自动收进这里，方便随时复习"
            />
            <View className={styles.emptyBtn} onClick={() => Taro.switchTab({ url: '/pages/index/index' })}>
              <Text className={styles.emptyBtnText}>去闯关</Text>
            </View>
          </View>
        ) : (
          groups.map(group => (
            <View key={group.stageId} className={styles.groupCard}>
              <View className={styles.groupHead}>
                <View className={styles.groupBadge} style={{ background: group.gradient }}>
                  <Text className={styles.groupBadgeText}>{group.short}</Text>
                </View>
                <View className={styles.groupInfo}>
                  <Text className={styles.groupName}>{group.name}</Text>
                  <Text className={styles.groupMeta}>{group.words.length} 个错词待复习</Text>
                </View>
                <View className={styles.reviewBtn} onClick={() => startReview(group.stageId)}>
                  <Text className={styles.reviewBtnText}>重练</Text>
                </View>
              </View>

              {group.words.slice(0, MAX_SHOW).map(item => (
                <View key={item.word} className={styles.wordRow}>
                  <View className={styles.wordMain}>
                    <View className={styles.wordLine}>
                      <Text className={styles.word}>{item.word}</Text>
                      {item.phonetic ? <Text className={styles.phonetic}>{item.phonetic}</Text> : null}
                    </View>
                    <Text className={styles.meaning}>{item.meaning}</Text>
                  </View>
                  <Text className={styles.remove} onClick={() => handleDelete(group.stageId, item.word)}>
                    ✕
                  </Text>
                </View>
              ))}

              {group.words.length > MAX_SHOW ? (
                <Text className={styles.moreText}>仅展示最近 {MAX_SHOW} 个错词</Text>
              ) : null}
            </View>
          ))
        )}
      </View>
    </View>
  );
};

export default WrongPage;
