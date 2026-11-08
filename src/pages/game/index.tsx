import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { buildQuestion, getLevelWords, shuffle, LEVEL_SIZE } from '@/utils/quiz';
import { loadStageWords } from '@/services/dict';
import { getStageById } from '@/data/stages';
import { addWrong, getStageWrong, recordLevel, removeWrong, saveRound, loadSettings } from '@/utils/storage';
import type { Question, WordItem } from '@/types';
import styles from './index.module.scss';

const GamePage: React.FC = () => {
  const router = useRouter();
  const stageId = router.params.stageId || 'xiaoxue';
  const level = Number(router.params.level || '1');
  const review = router.params.mode === 'review';
  const stage = getStageById(stageId);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [gain, setGain] = useState(0);
  const [answerText, setAnswerText] = useState('');

  const wrongRef = useRef<WordItem[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      Taro.showLoading({ title: '加载词库...', mask: true });
      try {
        const pool = await loadStageWords(stageId);
        let words: WordItem[];
        if (review) {
          words = shuffle(getStageWrong(stageId)).slice(0, LEVEL_SIZE);
        } else {
          words = getLevelWords(pool, level);
        }
        if (!alive) return;
        if (!words.length) {
          Taro.hideLoading();
          Taro.showToast({ title: review ? '暂无可复习的错词' : '该关卡暂无单词', icon: 'none' });
          setTimeout(() => Taro.navigateBack(), 1200);
          return;
        }
        const nextQuestions = words.map(word => buildQuestion(word, pool));
        setQuestions(nextQuestions);
        Taro.hideLoading();
        console.info('[Game] questions ready:', stageId, review ? 'review' : level, nextQuestions.length);
      } catch (error) {
        console.error('[Game] load dict failed:', error);
        Taro.hideLoading();
        Taro.showToast({ title: '词库加载失败，请重试', icon: 'none' });
      }
    };

    run();

    return () => {
      alive = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const current = questions[idx];
  const total = questions.length;

  const finish = (passed: boolean, answeredCount: number, correctCount: number, finalScore: number) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const wrongWords = wrongRef.current;
    let stars = 0;
    if (passed) {
      stars = wrongWords.length === 0 ? 3 : wrongWords.length <= 2 ? 2 : 1;
    }
    if (!review) {
      recordLevel(stageId, level, stars, finalScore);
    }
    saveRound({
      stageId,
      stageName: stage ? stage.name : stageId,
      level: review ? 0 : level,
      review,
      passed,
      stars,
      score: finalScore,
      correct: correctCount,
      total: answeredCount,
      wrongWords
    });
    console.info('[Game] round finished:', { passed, stars, finalScore, correctCount, answeredCount });
    Taro.redirectTo({ url: '/pages/result/index' });
  };

  const handleAnswer = (option: string) => {
    if (answered || !current || finishedRef.current) return;

    const ok = option === current.answer;
    setSelected(option);
    setAnswered(true);

    let nextHearts = hearts;
    let nextScore = score;
    let nextCombo = combo;
    let nextCorrect = correct;

    if (ok) {
      nextCombo = combo + 1;
      const added = 10 + Math.min(nextCombo, 10) * 2;
      nextScore = score + added;
      nextCorrect = correct + 1;
      setCombo(nextCombo);
      setScore(nextScore);
      setCorrect(nextCorrect);
      setGain(added);
      if (review) {
        removeWrong(stageId, current.word.word);
      }
    } else {
      nextHearts = hearts - 1;
      setHearts(nextHearts);
      setCombo(0);
      setGain(0);
      setAnswerText(current.answer);
      wrongRef.current = wrongRef.current.concat(current.word);
      addWrong(stageId, current.word);
      const settings = loadSettings();
      if (settings.vibrate) {
        Taro.vibrateShort({ type: 'light' }).catch((error: unknown) => {
          console.warn('[Game] vibrate failed:', error);
        });
      }
    }

    const isLast = idx + 1 >= questions.length;
    timerRef.current = setTimeout(() => {
      if (nextHearts <= 0) {
        finish(false, idx + 1, nextCorrect, nextScore);
        return;
      }
      if (isLast) {
        finish(true, questions.length, nextCorrect, nextScore);
        return;
      }
      setIdx(idx + 1);
      setSelected(null);
      setAnswered(false);
      setGain(0);
      setAnswerText('');
    }, 900);
  };

  const progressPercent = total ? Math.round(((idx + (answered ? 1 : 0)) / total) * 100) : 0;

  return (
    <View className={styles.page}>
      <View className={styles.container}>
        <View className={styles.statusRow}>
          <View className={styles.hearts}>
            {[1, 2, 3].map(index => (
              <Text key={index} className={classnames(styles.heart, index > hearts && styles.heartLost)}>
                ♥
              </Text>
            ))}
          </View>
          <Text className={styles.stageTag}>
            {review ? '错题重练' : `${stage ? stage.short : ''} · 第 ${level} 关`}
          </Text>
          <Text className={styles.score}>得分 {score}</Text>
        </View>

        <View className={styles.track}>
          <View className={styles.fill} style={{ width: `${progressPercent}%` }} />
        </View>
        <Text className={styles.progressText}>
          第 {Math.min(idx + 1, total || 1)} / {total || LEVEL_SIZE} 题 · 连对 {combo} 题
        </Text>

        {current ? (
          <View className={styles.quizCard}>
            <View className={styles.modeRow}>
              <Text className={styles.modeTag}>{current.mode === 'en2cn' ? '英译中' : '中译英'}</Text>
              <Text className={styles.modeHint}>
                {current.mode === 'en2cn' ? '选出正确的中文释义' : '选出对应的英文单词'}
              </Text>
            </View>

            {current.mode === 'en2cn' ? (
              <View className={styles.promptBlock}>
                <Text className={styles.promptWord}>{current.prompt}</Text>
                {current.word.phonetic ? (
                  <Text className={styles.phonetic}>{current.word.phonetic}</Text>
                ) : null}
              </View>
            ) : (
              <View className={styles.promptBlock}>
                <Text className={styles.promptMeaning}>{current.prompt}</Text>
              </View>
            )}
          </View>
        ) : (
          <View className={styles.quizCard}>
            <Text className={styles.loadingText}>正在准备题目…</Text>
          </View>
        )}

        {current ? (
          <View className={styles.options}>
            {current.options.map((option, index) => {
              const isAnswer = option === current.answer;
              const isSelected = option === selected;
              const stateClass = answered
                ? isAnswer
                  ? styles.optionCorrect
                  : isSelected
                  ? styles.optionWrong
                  : null
                : null;
              return (
                <View
                  key={`${option}-${index}`}
                  className={classnames(styles.option, stateClass)}
                  onClick={() => handleAnswer(option)}
                >
                  <Text className={styles.optionIndex}>{String.fromCharCode(65 + index)}</Text>
                  <Text
                    className={classnames(
                      styles.optionText,
                      current.mode === 'cn2en' && styles.optionTextLg
                    )}
                  >
                    {option}
                  </Text>
                  {answered && isAnswer ? <Text className={styles.optionMark}>✓</Text> : null}
                </View>
              );
            })}
          </View>
        ) : null}

        {answered ? (
          <View className={classnames(styles.feedback, gain > 0 ? styles.feedbackOk : styles.feedbackBad)}>
            <Text className={styles.feedbackText}>
              {gain > 0 ? `回答正确 +${gain} 分` : `答错了，正确答案：${answerText}`}
            </Text>
          </View>
        ) : (
          <Text className={styles.tip}>答错扣 1 颗心，连对越多加分越高</Text>
        )}
      </View>
    </View>
  );
};

export default GamePage;
