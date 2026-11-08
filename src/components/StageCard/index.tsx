import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { StageMeta } from '@/types';
import styles from './index.module.scss';

interface StageCardProps {
  stage: StageMeta;
  passed: number;
  stars: number;
  active?: boolean;
  onClick: () => void;
}

const StageCard: React.FC<StageCardProps> = ({ stage, passed, stars, active, onClick }) => {
  const percent = stage.levels ? Math.min(100, Math.round((passed / stage.levels) * 100)) : 0;
  const finished = passed >= stage.levels;

  return (
    <View className={classnames(styles.card, active && styles.active)} onClick={onClick}>
      <View className={styles.badge} style={{ background: stage.gradient }}>
        <Text className={styles.badgeText}>{stage.short}</Text>
      </View>

      <View className={styles.body}>
        <View className={styles.titleRow}>
          <Text className={styles.name}>{stage.name}</Text>
          {finished ? (
            <Text className={styles.doneTag}>已通关</Text>
          ) : active ? (
            <Text className={styles.activeTag}>继续挑战</Text>
          ) : null}
        </View>
        <Text className={styles.desc}>{stage.desc}</Text>
        <View className={styles.metaRow}>
          <Text className={styles.meta}>
            {stage.words} 词 · {stage.levels} 关
          </Text>
          <Text className={styles.stars}>★ {stars}</Text>
        </View>
        <View className={styles.track}>
          <View className={styles.fill} style={{ width: `${percent}%`, background: stage.gradient }} />
        </View>
        <Text className={styles.progressText}>
          已通关 {passed}/{stage.levels} 关
        </Text>
      </View>

      <Text className={styles.arrow}>›</Text>
    </View>
  );
};

export default StageCard;
