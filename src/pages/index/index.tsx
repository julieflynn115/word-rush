import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import StageCard from '@/components/StageCard';
import { STAGES, getStageById } from '@/data/stages';
import { loadProgress, getStageStats, getTotalPassed, getTotalStars, countWrongTotal, getLastStageId } from '@/utils/storage';
import styles from './index.module.scss';

interface StageStat {
  passed: number;
  stars: number;
}

const HomePage: React.FC = () => {
  const [stageStats, setStageStats] = useState<Record<string, StageStat>>({});
  const [passedCount, setPassedCount] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [lastStageId, setLastStageId] = useState<string | null>(null);

  useDidShow(() => {
    try {
      const progress = loadProgress();
      const nextStats: Record<string, StageStat> = {};
      STAGES.forEach(stage => {
        nextStats[stage.id] = getStageStats(progress, stage.id);
      });
      setStageStats(nextStats);
      setPassedCount(getTotalPassed(progress));
      setTotalStars(getTotalStars(progress));
      setWrongCount(countWrongTotal());
      setLastStageId(getLastStageId());
    } catch (error) {
      console.error('[Home] load progress failed:', error);
    }
  });

  const goStage = (stageId: string) => {
    console.log('[Home] enter stage:', stageId);
    Taro.navigateTo({ url: `/pages/levels/index?stageId=${stageId}` });
  };

  const lastStage = lastStageId ? getStageById(lastStageId) : undefined;

  return (
    <View className={styles.page}>
      <View className={styles.container}>
        <View className={styles.hero}>
          <View className={styles.decorA} />
          <View className={styles.decorB} />
          <View className={styles.heroTop}>
            <View className={styles.heroTextGroup}>
              <Text className={styles.kicker}>每日 10 分钟 · 轻松记单词</Text>
              <Text className={styles.title}>单词闯关</Text>
            </View>
            <View className={styles.pill}>
              <Text className={styles.pillText}>9 个阶段</Text>
            </View>
          </View>

          <View className={styles.statsRow}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{passedCount}</Text>
              <Text className={styles.statLabel}>已通关</Text>
            </View>
            <View className={styles.statDivider} />
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{totalStars}</Text>
              <Text className={styles.statLabel}>累计星星</Text>
            </View>
            <View className={styles.statDivider} />
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{wrongCount}</Text>
              <Text className={styles.statLabel}>错词待复习</Text>
            </View>
          </View>

          {lastStage ? (
            <View className={styles.continueBtn} onClick={() => goStage(lastStage.id)}>
              <Text className={styles.continueText}>继续上次：{lastStage.name}</Text>
              <Text className={styles.continueArrow}>›</Text>
            </View>
          ) : null}
        </View>

        <View className={styles.sectionHead}>
          <Text className={styles.sectionTitle}>选择词库阶段</Text>
          <Text className={styles.sectionSub}>难度由易到难</Text>
        </View>

        {STAGES.map(stage => (
          <StageCard
            key={stage.id}
            stage={stage}
            passed={stageStats[stage.id] ? stageStats[stage.id].passed : 0}
            stars={stageStats[stage.id] ? stageStats[stage.id].stars : 0}
            active={stage.id === lastStageId}
            onClick={() => goStage(stage.id)}
          />
        ))}

        <Text className={styles.tips}>
          每关 10 个单词 · 3 颗心 · 答错扣心，连对可获得额外加分
        </Text>
      </View>
    </View>
  );
};

export default HomePage;
