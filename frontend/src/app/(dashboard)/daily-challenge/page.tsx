"use client";

import React, { useEffect, useRef, useState } from "react";
import { useStore } from "@/store/useStore";
import {
  Timer as TimerIcon,
  CheckCircle,
  XCircle,
  Calendar,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { playAudioFeedback, triggerVibrationFeedback } from "@/utils/audio";

const getIstDateString = () => {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date());
  } catch (e) {
    const now = new Date();
    const istOffsetMs = 330 * 60 * 1000;
    const ist = new Date(now.getTime() + istOffsetMs - now.getTimezoneOffset() * 60000);
    const year = ist.getFullYear();
    const month = String(ist.getMonth() + 1).padStart(2, "0");
    const day = String(ist.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
};

export default function DailyChallengePage() {
  const {
    user,
    dailyChallengeTimer,
    dailyChallengeIsPlaying,
    dailyChallengeQuestions,
    dailyChallengeIndex,
    dailyChallengeCorrect,
    dailyChallengeCompletedToday,
    startDailyChallenge,
    tickDailyChallengeTimer,
    submitDailyChallengeAnswer,
    endDailyChallenge
  } = useStore();

  const [inputVal, setInputVal] = useState("");
  const [showFeedback, setShowFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [lockedToday, setLockedToday] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showStreakUp, setShowStreakUp] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevStatsRef = useRef({ level: user.level, streak: user.streak });
  const endHandledRef = useRef(false);

  const currentQuestion = dailyChallengeQuestions[dailyChallengeIndex];
  const totalQuestions = dailyChallengeQuestions.length || 5;
  const isCompleted = dailyChallengeIndex >= totalQuestions;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const userKey = user?.name || "guest";
    const saved = localStorage.getItem(`vedax-daily-challenge-${userKey}`);
    if (!saved) {
      setLockedToday(false);
      useStore.setState({ dailyChallengeCompletedToday: false });
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      if (parsed?.lastCompletedDate === getIstDateString()) {
        setLockedToday(true);
        useStore.setState({ dailyChallengeCompletedToday: true });
      } else {
        setLockedToday(false);
        useStore.setState({ dailyChallengeCompletedToday: false });
      }
    } catch (e) {}
  }, [user?.name]);

  useEffect(() => {
    if (dailyChallengeIsPlaying) {
      timerIntervalRef.current = setInterval(() => {
        tickDailyChallengeTimer();
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [dailyChallengeIsPlaying, dailyChallengeTimer]);

  useEffect(() => {
    if (dailyChallengeIsPlaying && inputRef.current) {
      inputRef.current.focus();
    }
  }, [dailyChallengeIsPlaying, dailyChallengeIndex]);

  useEffect(() => {
    if (dailyChallengeTimer === 0 && !gameOver && !isCompleted && dailyChallengeIsPlaying === false) {
      setGameOver(true);
      if (!endHandledRef.current) {
        endHandledRef.current = true;
        endDailyChallenge();
      }
    }
  }, [dailyChallengeTimer, gameOver, isCompleted, dailyChallengeIsPlaying]);

  useEffect(() => {
    const prev = prevStatsRef.current;
    if (user.level > prev.level) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 2200);
    }
    if (user.streak > prev.streak) {
      setShowStreakUp(true);
      setTimeout(() => setShowStreakUp(false), 2200);
    }
    prevStatsRef.current = { level: user.level, streak: user.streak };
  }, [user.level, user.streak]);

  const handleStart = () => {
    setInputVal("");
    setShowFeedback(null);
    setGameOver(false);
    endHandledRef.current = false;
    startDailyChallenge();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyChallengeIsPlaying || !currentQuestion) return;

    const numericAns = parseFloat(inputVal.trim());
    if (isNaN(numericAns)) return;

    const isCorrect = submitDailyChallengeAnswer(numericAns);
    setInputVal("");

    playAudioFeedback(isCorrect);
    triggerVibrationFeedback(isCorrect);

    setShowFeedback(isCorrect ? "correct" : "incorrect");
    setTimeout(() => setShowFeedback(null), 350);
  };

  const renderStatus = () => {
    if (lockedToday || dailyChallengeCompletedToday) {
      return (
        <div className="bg-card rounded-3xl p-8 border border-primary/10 shadow-lg text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 text-secondary">
            <Calendar className="w-7 h-7" />
          </div>
          <h1 className="font-sans text-2xl font-extrabold text-primary">Daily Challenge Complete</h1>
          <p className="text-sm text-muted-foreground font-medium max-w-sm mx-auto">
            Your response matters to us through daily practice. Come back after 12:00 AM IST for a fresh challenge.
          </p>
        </div>
      );
    }

    if (!dailyChallengeIsPlaying && !isCompleted && !gameOver) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-8 border border-primary/10 shadow-lg text-center space-y-6"
        >
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
              <TimerIcon className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-sans text-3xl font-extrabold text-primary">Daily Challenge</h1>
            <p className="text-sm text-muted-foreground font-medium max-w-sm mx-auto">
              5 intermediate and hard questions in 60 seconds. Finish to earn 200 XP.
            </p>
          </div>

          <button
            onClick={handleStart}
            className="px-8 py-4 bg-primary hover:bg-primary/95 text-white font-extrabold rounded-xl text-sm uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-md border-b-4 border-primary/40"
          >
            Start Daily Challenge
          </button>
        </motion.div>
      );
    }

    if (gameOver && !isCompleted) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-3xl p-8 border border-primary/10 shadow-lg text-center space-y-6"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
            <Sparkles className="w-8 h-8 text-secondary fill-secondary" />
          </div>
          <h2 className="font-sans text-2xl font-extrabold text-primary">Time’s Up</h2>
          <p className="text-sm text-muted-foreground font-medium max-w-sm mx-auto">
            You answered {dailyChallengeCorrect} out of {totalQuestions}. Try again to complete today’s challenge.
          </p>
          <button
            onClick={handleStart}
            className="px-6 py-3 bg-card hover:bg-card/90 text-primary border border-primary/20 font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
          >
            Try Again
          </button>
        </motion.div>
      );
    }

    if (isCompleted) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-3xl p-8 border border-primary/10 shadow-lg text-center space-y-6"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 text-secondary">
            <Sparkles className="w-8 h-8 text-secondary fill-secondary" />
          </div>
          <h2 className="font-sans text-2xl font-extrabold text-primary">Challenge Complete</h2>
          <p className="text-sm text-muted-foreground font-medium max-w-sm mx-auto">
            You finished today’s daily challenge and earned 200 XP. Great focus!
          </p>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 relative">
      {dailyChallengeIsPlaying && currentQuestion && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between bg-card p-4 rounded-2xl border border-primary/10 shadow-sm">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Progress</p>
              <p className="text-sm font-extrabold text-primary">
                {Math.min(dailyChallengeIndex + 1, totalQuestions)} of {totalQuestions}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[10px] font-bold uppercase text-muted-foreground">Time</div>
              <div className="font-mono text-lg font-black text-primary">{dailyChallengeTimer}</div>
            </div>
          </div>

          <div className="bg-card rounded-3xl p-8 border border-primary/10 shadow-sm text-center relative overflow-hidden">
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center z-10 backdrop-blur-[1px]"
                >
                  {showFeedback === "correct" ? (
                    <div className="bg-success/90 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">Correct</span>
                    </div>
                  ) : (
                    <div className="bg-error/90 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg">
                      <XCircle className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">Incorrect</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-6">
              <div className="font-mono text-4xl font-black text-primary tracking-wide">
                {currentQuestion.text}
              </div>

              <form onSubmit={handleSubmit} className="max-w-xs mx-auto space-y-4">
                <input
                  ref={inputRef}
                  type="text"
                  pattern="[0-9.-]*"
                  inputMode="decimal"
                  placeholder="Enter answer"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value.replace(/[^0-9.-]/g, ""))}
                  className="w-full bg-background text-center py-4 rounded-2xl border-2 border-primary/20 text-3xl font-mono font-black focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/30"
                />
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3.5 rounded-xl cursor-pointer active:scale-95 transition-all text-sm uppercase tracking-wider shadow-md border-b-4 border-primary/40"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      )}

      {renderStatus()}

      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-primary text-white px-5 py-2.5 rounded-full shadow-lg text-xs font-extrabold uppercase tracking-wider">
              Level Up +1
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStreakUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-secondary text-white px-5 py-2.5 rounded-full shadow-lg text-xs font-extrabold uppercase tracking-wider">
              Streak +1
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
