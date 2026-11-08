import React, { useEffect, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { getStageById } from '@/data/stages';
import { loadRound } from '@/utils/storage';
import type { RoundSummary } from '@/types';
import styles from './index.module.scss';

const ResultPage: React.FC = () => {
  const [round, setRound] = useState<RoundSummary | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setRound(loadRound());
    } catch (error) {
      console.error('[Result] load round failed:', error);
    }
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <View className={styles.page}>
        <View className={styles.container}>
          <Text className={styles.emptyText}>正在汇总本关表现…</Text>
        </View>
      </View>
    );
  }

  if (!round) {
    return (
      <View className={styles.page}>
        <View className={styles.container}>
          <Text className={styles.emptyText}>暂无本关记录，请重新挑战</Text>
          <View className={styles.primaryBtn} onClick={() => Taro.switchTab({ url: '/pages/index/index' })}>
            <Text className={styles.primaryText}>返回首页</Text>
          </View>
        </View>
      </View>
    );
  }

  const stage = getStageById(round.stageId);
  const totalLevels = stage ? stage.levels : round.level;
  const hasNext = !round.review && round.passed && round.level < totalLevels;
  const accuracy = round.total ? Math.round((round.correct / round.total) * 100) : 0;

  const goNext = () => {
    Taro.redirectTo({
      url: `/pages/game/index?stageId=${round.stageId}&level=${round.level + 1}&mode=level`
    });
  };

  const goReplay = () => {
    if (round.review) {
      Taro.redirectTo({ url: `/pages/game/index?stageId=${round.stageId}&mode=review` });
      return;
    }
    Taro.redirectTo({
      url: `/pages/game/index?stageId=${round.stageId}&level=${round.level}&mode=level`
    });
  };

  const goBack = () => {
    Taro.navigateBack();
  };

  return (
    <View className={styles.page}>
      <View className={styles.container}>
        <View className={styles.headerCard}>
          <Text className={styles.statusEmoji}>{round.passed ? '🎉' : '💪'}</Text>
          <Text className={styles.statusTitle}>
            {round.review ? '复习完成' : round.passed ? '闯关成功' : '生命值耗尽'}
          </Text>
          <Text className={styles.statusSub}>
            {round.review
              ? `${round.stageName} · 错题强化`
              : `${round.stageName} · 第 ${round.level} 关`}
          </Text>

          <View className={styles.starsRow}>
            {[1, 2, 3].map(index => (
              <Text
                key={index}
                className={classnames(
                  styles.star,
                  index === 2 && styles.starBig,
                  index <= round.stars && styles.starOn
                )}
              >
                ★
              </Text>
            ))}
          </View>

          <View className={styles.scoreRow}>
            <View className={styles.scoreItem}>
              <Text className={styles.scoreValue}>{round.score}</Text>
              <Text className={styles.scoreLabel}>得分</Text>
            </View>
            <View className={styles.scoreDivider} />
            <View className={styles.scoreItem}>
              <Text className={styles.scoreValue}>
                {round.correct}/{round.total}
              </Text>
              <Text className={styles.scoreLabel}>答对</Text>
            </View>
            <View className={styles.scoreDivider} />
            <View className={styles.scoreItem}>
              <Text className={styles.scoreValue}>{accuracy}%</Text>
              <Text className={styles.scoreLabel}>正确率</Text>
            </View>
          </View>
        </View>

        {round.wrongWords.length > 0 ? (
          <View className={styles.wrongCard}>
            <View className={styles.wrongHead}>
              <Text className={styles.wrongTitle}>本关错词</Text>
              <Text className={styles.wrongCount}>{round.wrongWords.length} 个已加入错词本</Text>
            </View>
            {round.wrongWords.map((item, index) => (
              <View key={`${item.word}-${index}`} className={styles.wrongItem}>
                <View className={styles.wrongWordRow}>
                  <Text className={styles.wrongWord}>{item.word}</Text>
                  {item.phonetic ? <Text className={styles.wrongPhonetic}>{item.phonetic}</Text> : null}
                </View>
                <Text className={styles.wrongMeaning}>{item.meaning}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View className={styles.perfectCard}>
            <Text className={styles.perfectText}>全部答对，太棒了！继续保持 ✨</Text>
          </View>
        )}

        <View className={styles.actions}>
          {hasNext ? (
            <View className={styles.primaryBtn} onClick={goNext}>
              <Text className={styles.primaryText}>下一关 · 第 {round.level + 1} 关</Text>
            </View>
          ) : (
            <View className={styles.primaryBtn} onClick={goReplay}>
              <Text className={styles.primaryText}>再练一次</Text>
            </View>
          )}

          {hasNext ? (
            <View className={styles.secondaryBtn} onClick={goReplay}>
              <Text className={styles.secondaryText}>再玩一次本关</Text>
            </View>
          ) : null}

          <View className={styles.textBtn} onClick={goBack}>
            <Text className={styles.textBtnLabel}>{round.review ? '返回上一页' : '返回选关'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ResultPage;
