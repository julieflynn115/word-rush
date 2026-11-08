import React, { useState } from 'react';
import { View, Text, Switch } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { STAGES } from '@/data/stages';
import {
  clearWrong,
  countWrongTotal,
  getTotalPassed,
  getTotalStars,
  loadProgress,
  loadSettings,
  resetAllProgress,
  saveSettings
} from '@/utils/storage';
import styles from './index.module.scss';

const TOTAL_WORDS = STAGES.reduce((sum, stage) => sum + stage.words, 0);

const MinePage: React.FC = () => {
  const [passed, setPassed] = useState(0);
  const [stars, setStars] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [vibrate, setVibrate] = useState(true);

  const refresh = () => {
    try {
      const progress = loadProgress();
      setPassed(getTotalPassed(progress));
      setStars(getTotalStars(progress));
      setWrongCount(countWrongTotal());
      setVibrate(loadSettings().vibrate);
    } catch (error) {
      console.error('[Mine] refresh failed:', error);
    }
  };

  useDidShow(() => {
    refresh();
  });

  const toggleVibrate = (value: boolean) => {
    setVibrate(value);
    saveSettings({ vibrate: value });
  };

  const handleClearWrong = () => {
    Taro.showModal({
      title: '清空错词本',
      content: '将删除所有已收录的错词，是否继续？',
      confirmColor: '#f4516c'
    })
      .then(res => {
        if (!res.confirm) return;
        clearWrong();
        refresh();
        Taro.showToast({ title: '已清空错词本', icon: 'none' });
      })
      .catch((error: unknown) => {
        console.error('[Mine] clear wrong failed:', error);
      });
  };

  const handleReset = () => {
    Taro.showModal({
      title: '重置全部进度',
      content: '将清空通关记录、星星和错词本，且无法恢复，是否继续？',
      confirmColor: '#f4516c'
    })
      .then(res => {
        if (!res.confirm) return;
        resetAllProgress();
        refresh();
        Taro.showToast({ title: '进度已重置', icon: 'none' });
      })
      .catch((error: unknown) => {
        console.error('[Mine] reset progress failed:', error);
      });
  };

  return (
    <View className={styles.page}>
      <View className={styles.container}>
        <View className={styles.profileCard}>
          <View className={styles.avatar}>
            <Text className={styles.avatarText}>W</Text>
          </View>
          <View className={styles.profileInfo}>
            <Text className={styles.profileName}>单词闯关学习者</Text>
            <Text className={styles.profileDesc}>坚持每天 10 分钟，词汇量稳步提升</Text>
          </View>
        </View>

        <View className={styles.statCard}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{passed}</Text>
            <Text className={styles.statLabel}>已通关</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stars}</Text>
            <Text className={styles.statLabel}>累计星星</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{wrongCount}</Text>
            <Text className={styles.statLabel}>错词待复习</Text>
          </View>
        </View>

        <View className={styles.group}>
          <Text className={styles.groupTitle}>偏好设置</Text>
          <View className={styles.row}>
            <Text className={styles.rowLabel}>答错震动反馈</Text>
            <Switch checked={vibrate} color="#5b57f5" onChange={event => toggleVibrate(event.detail.value)} />
          </View>
          <View className={styles.row} onClick={handleClearWrong}>
            <Text className={styles.rowLabel}>清空错词本</Text>
            <Text className={styles.rowArrow}>›</Text>
          </View>
          <View className={styles.row} onClick={handleReset}>
            <Text className={styles.rowLabelDanger}>重置全部进度</Text>
            <Text className={styles.rowArrow}>›</Text>
          </View>
        </View>

        <View className={styles.group}>
          <Text className={styles.groupTitle}>关于词库</Text>
          <View className={styles.row}>
            <Text className={styles.rowLabel}>覆盖阶段</Text>
            <Text className={styles.rowValue}>9 个阶段</Text>
          </View>
          <View className={styles.row}>
            <Text className={styles.rowLabel}>收录单词</Text>
            <Text className={styles.rowValue}>{TOTAL_WORDS} 个</Text>
          </View>
          <View className={styles.row}>
            <Text className={styles.rowLabel}>关卡规则</Text>
            <Text className={styles.rowValue}>每关 10 词 · 3 颗心</Text>
          </View>
        </View>

        <Text className={styles.footer}>单词闯关 v1.0.0 · 小学到雅思全覆盖</Text>
      </View>
    </View>
  );
};

export default MinePage;
