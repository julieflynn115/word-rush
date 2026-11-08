import React, { useRef, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow, useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { getStageById } from '@/data/stages';
import { loadProgress, getStageStats, getUnlockedLevel, getStageWrong } from '@/utils/storage';
import type { LevelRecord } from '@/types';
import styles from './index.module.scss';

const PAGE_SIZE = 100;

const LevelsPage: React.FC = () => {
  const router = useRouter();
  const stageId = router.params.stageId || 'xiaoxue';
  const stage = getStageById(stageId);

  const [passed, setPassed] = useState(0);
  const [stars, setStars] = useState(0);
  const [unlocked, setUnlocked] = useState(1);
  const [wrongCount, setWrongCount] = useState(0);
  const [levelsMap, setLevelsMap] = useState<Record<string, LevelRecord>>({});
  const [page, setPage] = useState(1);
  const initialized = useRef(false);

  useDidShow(() => {
    if (!stage) return;
    try {
      const progress = loadProgress();
      const stats = getStageStats(progress, stageId);
      const nextUnlocked = Math.min(getUnlockedLevel(progress, stageId), stage.levels);
      setPassed(stats.passed);
      setStars(stats.stars);
      setUnlocked(nextUnlocked);
      setLevelsMap(progress[stageId] ? progress[stageId].levels : {});
      setWrongCount(getStageWrong(stageId).length);
      if (!initialized.current) {
        initialized.current = true;
        const pageOfUnlocked = Math.min(
          Math.ceil(stage.levels / PAGE_SIZE),
          Math.floor((nextUnlocked - 1) / PAGE_SIZE) + 1
        );
        setPage(pageOfUnlocked);
      }
    } catch (error) {
      console.error('[Levels] load progress failed:', error);
    }
  });

  if (!stage) {
    return (
      <View className={styles.page}>
        <Text className={styles.tips}>词库不存在</Text>
      </View>
    );
  }

  const totalPages = Math.max(1, Math.ceil(stage.levels / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, stage.levels);
  const cells: number[] = [];
  for (let level = start; level <= end; level += 1) {
    cells.push(level);
  }

  const openLevel = (level: number) => {
    if (level > unlocked) {
      Taro.showToast({ title: '先通过前面的关卡哦', icon: 'none' });
      return;
    }
    Taro.navigateTo({ url: `/pages/game/index?stageId=${stageId}&level=${level}&mode=level` });
  };

  const openReview = () => {
    if (wrongCount <= 0) {
      Taro.showToast({ title: '本阶段还没有错词', icon: 'none' });
      return;
    }
    Taro.navigateTo({ url: `/pages/game/index?stageId=${stageId}&mode=review` });
  };

  const percent = Math.min(100, Math.round((passed / stage.levels) * 100));

  return (
    <View className={styles.page}>
      <View className={styles.container}>
        <View className={styles.headerCard}>
          <View className={styles.headerTop}>
            <View className={styles.badge} style={{ background: stage.gradient }}>
              <Text className={styles.badgeText}>{stage.short}</Text>
            </View>
            <View className={styles.headerInfo}>
              <Text className={styles.stageName}>{stage.name}</Text>
              <Text className={styles.stageDesc}>{stage.desc}</Text>
            </View>
          </View>

          <View className={styles.progressRow}>
            <Text className={styles.progressLabel}>
              已通关 {passed}/{stage.levels} 关
            </Text>
            <Text className={styles.progressValue}>★ {stars}</Text>
          </View>
          <View className={styles.track}>
            <View className={styles.fill} style={{ width: `${percent}%`, background: stage.gradient }} />
          </View>
        </View>

        {wrongCount > 0 ? (
          <View className={styles.reviewCard} onClick={openReview}>
            <View className={styles.reviewInfo}>
              <Text className={styles.reviewTitle}>错题重练</Text>
              <Text className={styles.reviewDesc}>本阶段错词 {wrongCount} 个 · 随机抽 10 个强化</Text>
            </View>
            <Text className={styles.reviewBtn}>开始</Text>
          </View>
        ) : null}

        <View className={styles.legend}>
          <Text className={styles.legendText}>灰色关卡需要先通过前一关</Text>
          <Text className={styles.legendCurrent}>
            {passed >= stage.levels ? '本阶段已全部通关' : `第 ${unlocked} 关待挑战`}
          </Text>
        </View>

        <View className={styles.grid}>
          {cells.map(level => {
            const record = levelsMap[String(level)];
            const isPassed = !!record && record.passed;
            const isUnlocked = level <= unlocked;
            const isNext = level === unlocked && !isPassed;
            return (
              <View
                key={level}
                className={classnames(
                  styles.cell,
                  isPassed && styles.cellPassed,
                  !isUnlocked && styles.cellLocked,
                  isNext && styles.cellNext
                )}
                onClick={() => openLevel(level)}
              >
                <Text
                  className={classnames(
                    styles.cellNumber,
                    isPassed && styles.cellNumberPassed,
                    !isUnlocked && styles.cellNumberLocked
                  )}
                >
                  {level}
                </Text>
                {isPassed ? (
                  <View className={styles.cellStars}>
                    {[1, 2, 3].map(index => (
                      <Text
                        key={index}
                        className={classnames(
                          styles.cellStar,
                          record && index <= record.stars && styles.cellStarOn
                        )}
                      >
                        ★
                      </Text>
                    ))}
                  </View>
                ) : (
                  <Text className={styles.cellHint}>{isNext ? '待挑战' : isUnlocked ? '可挑战' : '未解锁'}</Text>
                )}
              </View>
            );
          })}
        </View>

        {totalPages > 1 ? (
          <View className={styles.pager}>
            <View
              className={classnames(styles.pagerBtn, page <= 1 && styles.pagerBtnDisabled)}
              onClick={() => page > 1 && setPage(page - 1)}
            >
              <Text className={styles.pagerText}>上一页</Text>
            </View>
            <Text className={styles.pagerInfo}>
              {page} / {totalPages}
            </Text>
            <View
              className={classnames(styles.pagerBtn, page >= totalPages && styles.pagerBtnDisabled)}
              onClick={() => page < totalPages && setPage(page + 1)}
            >
              <Text className={styles.pagerText}>下一页</Text>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
};

export default LevelsPage;
