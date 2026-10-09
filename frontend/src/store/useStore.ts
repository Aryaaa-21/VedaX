import { create } from "zustand";
import VEDIC_TECHNIQUES_JSON from "@/data/techniques.json";
import USER_JSON from "@/data/users.json";
import LEADERBOARD_JSON from "@/data/leaderboard.json";
import ACHIEVEMENTS_JSON from "@/data/achievements.json";
import { API_URL } from "@/utils/api";

const syncWithDatabase = async (
  user: any,
  recentActivities: any[],
  badges: any[],
  challengeHighScore: number
) => {
  if (typeof window === "undefined") return;
  const isGuestSaved = localStorage.getItem("guestMode") === "true";
  const token = localStorage.getItem("vedax_token");

  if (token && !isGuestSaved) {
    try {
      const apiUrl = API_URL;
      await fetch(`${apiUrl}/user/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: user.name,
          level: user.level,
          xp: user.xp,
          streak: user.streak,
          accuracy: user.accuracy,
          avgSpeed: user.avgSpeed,
          completedLessons: user.completedLessons,
          avatar: user.avatar,
          recentActivities: recentActivities,
          challengeHighScore: challengeHighScore,
          badges: badges.map(b => ({ id: b.id, unlocked: b.unlocked, unlockedAt: b.unlockedAt || null }))
        })
      });
    } catch (e) {
      console.error("Error syncing with MERN backend:", e);
    }
  } else if (isGuestSaved) {
    localStorage.setItem("vedax-guest-state", JSON.stringify({
      user,
      recentActivities,
      badges,
      challengeHighScore
    }));
  }
};

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

const getUtcDayStamp = (dateString: string) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
};

const recordChallengeStreakAward = (set: any, get: any, solvedCount: number) => {
  if (typeof window === "undefined") return;
  if (solvedCount < 2) return;

  const today = getIstDateString();
  let tracker = { lastAwardDate: "" };
  const saved = localStorage.getItem("vedax-streak-tracker");
  if (saved) {
    try {
      tracker = JSON.parse(saved);
    } catch (e) {}
  }

  if (tracker.lastAwardDate === today) return;

  const state = get();
  let nextStreak = state.user.streak;

  if (tracker.lastAwardDate) {
    const diffDays = Math.round(
      (getUtcDayStamp(today) - getUtcDayStamp(tracker.lastAwardDate)) / (1000 * 60 * 60 * 24)
    );
    if (diffDays !== 1) {
      nextStreak = 0;
    }
  }

  nextStreak += 1;
  tracker.lastAwardDate = today;

  set((state: any) => ({ user: { ...state.user, streak: nextStreak } }));
  localStorage.setItem("vedax-streak-tracker", JSON.stringify(tracker));

  const s = get();
  syncWithDatabase(s.user, s.recentActivities, s.badges, s.challengeHighScore);
};

export const calculateLevelFromXp = (xp: number): number => {
  let level = 1;
  let xpNeededForNext = 250;
  let tempXp = xp;

  while (tempXp >= xpNeededForNext) {
    tempXp -= xpNeededForNext;
    level += 1;
    const band = Math.floor((level - 1) / 5);
    xpNeededForNext = 250 + band * 50;
  }

  return level;
};

export const getXpProgressForLevel = (xp: number) => {
  let level = 1;
  let xpNeededForNext = 250;
  let tempXp = xp;

  while (tempXp >= xpNeededForNext) {
    tempXp -= xpNeededForNext;
    level += 1;
    const band = Math.floor((level - 1) / 5);
    xpNeededForNext = 250 + band * 50;
  }

  return {
    currentLevelXp: tempXp,
    nextLevelXpRequired: xpNeededForNext,
    percent: Math.floor((tempXp / xpNeededForNext) * 100)
  };
};

export interface Technique {
  id: string;
  name: string;
  title?: string;
  sutra: string;
  sanskritName?: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category?: "Beginner" | "Intermediate" | "Advanced";
  tag: string;
  applicationType?: string;
  description: string;
  formula: string;
  level: number;
  unlockedAtStreak: number;
  speedGain: string;
  mentalLoad: string;
  memoryLoad?: string;
  practiceCount?: number;
  estimatedMastery?: number;
  example: {
    problem: string;
    steps: { step: number; title: string; desc: string; detail: string }[];
    answer: number;
  };
  examples?: { problem: string; answer: number }[];
}

export const VEDIC_TECHNIQUES = VEDIC_TECHNIQUES_JSON as Technique[];

const buildQuestionForTechnique = (technique: Technique) => {
  let qText = "";
  let qAnswer = 0;
  let qHint = technique.formula || "Apply sutra steps.";

  if (technique.id === "ekadhikena-purvena") {
    const tens = Math.floor(Math.random() * 15) + 1; // 15 to 155
    const num = tens * 10 + 5;
    qText = `${num} × ${num}`;
    qAnswer = num * num;
    qHint = `Multiply ${tens} × (${tens} + 1) and append 25`;
  } else if (technique.id === "nikhilam-subtraction") {
    const base = Math.random() > 0.5 ? 100 : 10;
    const d1 = Math.floor(Math.random() * 8) + 1;
    const d2 = Math.floor(Math.random() * 8) + 1;
    const n1 = base - d1;
    const n2 = base - d2;
    qText = `${n1} × ${n2}`;
    qAnswer = n1 * n2;
    qHint = `Find deficits from ${base}. Subtract crosswise and append/add deficits product.`;
  } else if (technique.id === "sankalana-vyavakalanabhyam") {
    const a = Math.floor(Math.random() * 15) + 10;
    const b = Math.floor(Math.random() * 15) + 10;
    const finalA = a === b ? a + 2 : a;
    const x = Math.floor(Math.random() * 5) + 1;
    const y = Math.floor(Math.random() * 5) + 1;
    const c = finalA * x + b * y;
    const d = b * x + finalA * y;
    qText = `${finalA}x + ${b}y = ${c}\n${b}x + ${finalA}y = ${d}\nSolve for x.`;
    qAnswer = x;
    qHint = "Add or subtract the two equations to solve for x easily.";
  } else if (technique.id === "yavadunam") {
    const base = Math.random() > 0.5 ? 100 : 10;
    const delta = Math.floor(Math.random() * 8) + 1;
    const num = base - delta;
    qText = `${num} × ${num}`;
    qAnswer = num * num;
    qHint = "Subtract deficit from number, then append squared deficit.";
  } else if (technique.id === "ekanyunena-purvena") {
    const baseMultiplier = Math.random() > 0.5 ? 99 : 9;
    const n = baseMultiplier === 99
      ? Math.floor(Math.random() * 80) + 11
      : Math.floor(Math.random() * 8) + 2;
    qText = `${n} × ${baseMultiplier}`;
    qAnswer = n * baseMultiplier;
    qHint = "Subtract 1 from the multiplicand, then append the 9's complement of the result.";
  } else if (technique.id === "vyastisamastih") {
    const a = Math.floor(Math.random() * 4) + 1; // 1..4
    const b = a + Math.floor(Math.random() * 4) + 1; // a+1..a+4
    qText = `Factor x² + ${a + b}x + ${a * b}\nFind the smaller factor constant (a in x+a).`;
    qAnswer = a;
    qHint = "Look for two numbers that multiply to the constant and add to the x coefficient.";
  } else if (technique.id === "vertically-crosswise") {
    const n1 = Math.floor(Math.random() * 30) + 11;
    const n2 = Math.floor(Math.random() * 30) + 11;
    qText = `${n1} × ${n2}`;
    qAnswer = n1 * n2;
    qHint = "Multiply vertically (units), crosswise (sum of products), then vertically (tens).";
  } else if (technique.id === "anurupyena") {
    const base = 50;
    const d1 = Math.floor(Math.random() * 7) - 3; // -3 to +3
    const d2 = Math.floor(Math.random() * 7) - 3;
    const n1 = base + d1;
    const n2 = base + d2;
    qText = `${n1} × ${n2}`;
    qAnswer = n1 * n2;
    qHint = "Work relative to base 50 (half of 100), then halve the left side.";
  } else if (technique.id === "puranapuranabhyam") {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = a + Math.floor(Math.random() * 5) + 1;
    const coeff = 2 * a;
    const rhs = b * b - a * a;
    qText = `Solve x² + ${coeff}x = ${rhs}\nFind the positive value of x.`;
    qAnswer = b - a;
    qHint = "Add a² to both sides to complete the square: (x + a)² = b².";
  } else if (technique.id === "sesanyankena-caramena") {
    const prefix = Math.floor(Math.random() * 4) + 1; // 1, 2, 3, 4
    const d = prefix * 10 + 9; // 19, 29, 39, 49
    qText = `For fraction 1 / ${d}\nFind the first non-zero digit after the decimal point.`;
    const val = 1 / d;
    const match = val.toFixed(10).match(/[1-9]/);
    qAnswer = match ? parseInt(match[0]) : 0;
    qHint = "Divide 1.0 by the denominator or use the Ekadhika addition rule.";
  } else if (technique.id === "sopantyadvayamantyam") {
    const k = Math.floor(Math.random() * 5) + 3; // 3..7
    qText = `Solve symmetric equation:\n1/(x - ${k + 1}) + 1/(x - ${k - 1}) = 1/(x - ${k + 2}) + 1/(x - ${k - 2})\nFind x.`;
    qAnswer = k;
    qHint = "Symmetric denominators add up to 2x - 2k = 0, so x = k.";
  } else if (technique.id === "paravartya-yojayet") {
    const divisor = Math.floor(Math.random() * 5) + 101; // 101..105
    const q = Math.floor(Math.random() * 6) + 10; // 10..15
    const r = Math.floor(Math.random() * 15) + 5; // 5..19
    const dividend = q * divisor + r;
    qText = `Divide ${dividend} by ${divisor}.\nFind the remainder.`;
    qAnswer = r;
    qHint = "Transpose divisor digits to subtract deficits during synthetic division.";
  } else if (technique.id === "sunyam-samyasamuccaye") {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 1;
    const c = Math.floor(Math.random() * 5) + 1;
    const rhsConstant = a + b + c;
    qText = `Solve equation:\n(x + ${a}) + (x + ${b}) = x + ${rhsConstant}\nFind x.`;
    qAnswer = c;
    qHint = "Simplify the left side to 2x + a + b and subtract x from both sides.";
  } else if (technique.id === "chalana-kalanabhyam") {
    const a = Math.floor(Math.random() * 3) + 2; // 2..4
    const b = Math.floor(Math.random() * 5) + 1; // 1..5
    const x = Math.floor(Math.random() * 3) + 1; // 1..3
    qText = `Find derivative of f(x) = ${a}x² + ${b}x at x = ${x}.`;
    qAnswer = 2 * a * x + b;
    qHint = "Derivative of ax² + bx is 2ax + b. Substitute x.";
  } else if (technique.id === "gunitasamuccayah") {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 1;
    qText = `For product (x + ${a})(x + ${b}), find the sum of all coefficients in its expanded form.`;
    qAnswer = (1 + a) * (1 + b);
    qHint = "The sum of coefficients of P(x) is simply P(1). Substitute x = 1.";
  } else if (technique.id === "gunakasamuccayah") {
    const a = Math.floor(Math.random() * 4) + 1;
    const b = Math.floor(Math.random() * 4) + 1;
    const sumDivisor = 1 + a;
    const sumQuotient = 1 + b;
    qText = `For algebraic division:\n(x² + ${a+b}x + ${a*b}) / (x + ${a}) = x + ${b}\nFind the product of the divisor's and quotient's coefficient sums.`;
    qAnswer = sumDivisor * sumQuotient;
    qHint = "Find the sum of coefficients for each linear factor at x = 1 and multiply.";
  } else {
    const examplesList = technique.examples || [];
    if (examplesList.length > 0) {
      const ex = examplesList[Math.floor(Math.random() * examplesList.length)];
      qText = ex.problem;
      qAnswer = ex.answer;
      qHint = technique.formula || qHint;
    } else {
      const n1 = Math.floor(Math.random() * 10) + 2;
      const n2 = Math.floor(Math.random() * 10) + 2;
      qText = `${n1} × ${n2}`;
      qAnswer = n1 * n2;
      qHint = technique.formula || qHint;
    }
  }

  return {
    question: qText,
    answer: qAnswer,
    hint: qHint,
    sutraName: technique.name,
    sutraFormula: technique.formula
  };
};

const buildDailyChallengeQuestion = () => {
  const roll = Math.random();

  if (roll < 0.34) {
    const baseOptions = [100, 200, 500, 1000];
    const base = baseOptions[Math.floor(Math.random() * baseOptions.length)];
    const deltaA = Math.floor(Math.random() * 35) + 5;
    const deltaB = Math.floor(Math.random() * 35) + 5;
    const n1 = base - deltaA;
    const n2 = base + deltaB;
    return { text: `${n1} × ${n2}`, answer: n1 * n2 };
  }

  if (roll < 0.68) {
    const n1 = Math.floor(Math.random() * 90) + 30;
    const n2 = Math.floor(Math.random() * 90) + 30;
    return { text: `${n1} × ${n2}`, answer: n1 * n2 };
  }

  const endsInFive = Math.random() > 0.5;
  if (endsInFive) {
    const tens = Math.floor(Math.random() * 80) + 12;
    const num = tens * 10 + 5;
    return { text: `${num} × ${num}`, answer: num * num };
  }

  const n1 = Math.floor(Math.random() * 900) + 100;
  const n2 = Math.floor(Math.random() * 90) + 10;
  return { text: `${n1} × ${n2}`, answer: n1 * n2 };
};

const buildDailyChallengeQuestions = (count: number) => {
  const questions: { text: string; answer: number }[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    let attempt = 0;
    let nextQuestion = buildDailyChallengeQuestion();

    while (seen.has(nextQuestion.text) && attempt < 10) {
      attempt += 1;
      nextQuestion = buildDailyChallengeQuestion();
    }

    seen.add(nextQuestion.text);
    questions.push(nextQuestion);
  }

  return questions;
};

const buildBonusChallengeQuestion = (solvedCount: number) => {
  // Use VEDIC_TECHNIQUES to generate a question, incrementing the technique index for each correct answer (solvedCount)
  // VEDIC_TECHNIQUES is sorted by difficulty/level, so increasing the index increases the difficulty level.
  const techniqueIndex = solvedCount % VEDIC_TECHNIQUES.length;
  const technique = VEDIC_TECHNIQUES[techniqueIndex];
  const qObj = buildQuestionForTechnique(technique);

  return {
    text: qObj.question,
    answer: qObj.answer,
    sutraName: qObj.sutraName,
    sutraFormula: qObj.sutraFormula,
    difficulty: technique.difficulty
  };
};


interface LeaderboardUser {
  rank: number;
  name: string;
  initials: string;
  avatar?: string;
  accuracy: number;
  xp: number;
  streak: number;
  isCurrentUser?: boolean;
}

interface RecentActivity {
  id: string;
  type: "practice" | "challenge" | "daily-challenge" | "achievement";
  title: string;
  desc: string;
  date: string;
  xpAwarded: number;
}

interface Badge {
  id: string;
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: string;
}

interface StoreState {
  // User profile
  user: {
    name: string;
    level: number;
    xp: number;
    streak: number;
    accuracy: number;
    avgSpeed: number;
    completedLessons: number;
    avatar: string;
  };
  recentActivities: RecentActivity[];
  badges: Badge[];
  leaderboard: LeaderboardUser[];

  // Practice session state
  activeTechnique: Technique | null;
  practiceIndex: number;
  practiceTotal: number;
  practiceStreak: number;
  practiceCorrect: number;
  practiceHistory: { question: string; userAnswer: number; correctAnswer: number; isCorrect: boolean }[];
  practiceQuestions: { question: string; answer: number; hint: string; sutraName?: string; sutraFormula?: string }[];

  // Timed challenge state
  challengeScore: number;
  challengeStreak: number;
  challengeTimer: number;
  challengeIsPlaying: boolean;
  challengeQuestionsSolved: number;
  challengeCurrentQuestion: {
    text: string;
    answer: number;
    sutraName?: string;
    sutraFormula?: string;
    difficulty?: string;
  } | null;
  challengeHighScore: number;

  // Daily challenge state
  dailyChallengeTimer: number;
  dailyChallengeIsPlaying: boolean;
  dailyChallengeQuestions: { text: string; answer: number }[];
  dailyChallengeIndex: number;
  dailyChallengeCorrect: number;
  dailyChallengeCompletedToday: boolean;

  // Settings
  audioEnabled: boolean;
  vibrationEnabled: boolean;
  difficulty: "Beginner" | "Intermediate" | "Advanced";

  // Action creators
  setUserStats: (stats: Partial<StoreState["user"]>) => void;
  addXp: (amount: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  addActivity: (activity: Omit<RecentActivity, "id" | "date">) => void;
  unlockBadge: (badgeId: string) => void;

  // Practice actions
  selectTechnique: (tech: Technique | null) => void;
  startPractice: (customPool?: Technique[]) => void;
  submitPracticeAnswer: (userAns: number) => { isCorrect: boolean; correctAnswer: number };
  nextPracticeQuestion: () => boolean; // returns true if there is a next question, false if ended

  // Challenge actions
  startChallenge: () => void;
  tickChallengeTimer: () => void;
  submitChallengeAnswer: (userAns: number) => boolean;
  endChallenge: () => void;

  // Daily challenge actions
  startDailyChallenge: () => void;
  tickDailyChallengeTimer: () => void;
  submitDailyChallengeAnswer: (userAns: number) => boolean;
  endDailyChallenge: () => void;

  // Settings actions
  toggleAudio: () => void;
  toggleVibration: () => void;
  setDifficulty: (level: "Beginner" | "Intermediate" | "Advanced") => void;
}

export const useStore = create<StoreState>((set, get) => ({
  user: USER_JSON,
  recentActivities: [

  ],
  badges: ACHIEVEMENTS_JSON as Badge[],
  leaderboard: LEADERBOARD_JSON as LeaderboardUser[],

  activeTechnique: null,
  practiceIndex: 0,
  practiceTotal: 5,
  practiceStreak: 0,
  practiceCorrect: 0,
  practiceHistory: [],
  practiceQuestions: [],

  challengeScore: 0,
  challengeStreak: 0,
  challengeTimer: 60,
  challengeIsPlaying: false,
  challengeQuestionsSolved: 0,
  challengeCurrentQuestion: null,
  challengeHighScore: 1500,

  dailyChallengeTimer: 60,
  dailyChallengeIsPlaying: false,
  dailyChallengeQuestions: [],
  dailyChallengeIndex: 0,
  dailyChallengeCorrect: 0,
  dailyChallengeCompletedToday: false,

  audioEnabled: true,
  vibrationEnabled: true,
  difficulty: "Beginner",

  setUserStats: (stats) => {
    set((state) => ({ user: { ...state.user, ...stats } }));
    const s = get();
    syncWithDatabase(s.user, s.recentActivities, s.badges, s.challengeHighScore);
  },

  addXp: (amount) => {
    set((state) => {
      const newXp = state.user.xp + amount;
      const newLevel = calculateLevelFromXp(newXp);
      const statsUpdated = { xp: newXp, level: newLevel > state.user.level ? newLevel : state.user.level };

      const updatedLeaderboard = state.leaderboard.map(user => {
        if (user.isCurrentUser) {
          return { ...user, xp: user.xp + amount };
        }
        return user;
      });

      return {
        user: { ...state.user, ...statsUpdated },
        leaderboard: updatedLeaderboard
      };
    });
    const s = get();
    syncWithDatabase(s.user, s.recentActivities, s.badges, s.challengeHighScore);
  },

  incrementStreak: () => {
    set((state) => ({ user: { ...state.user, streak: state.user.streak + 1 } }));
    const s = get();
    syncWithDatabase(s.user, s.recentActivities, s.badges, s.challengeHighScore);
  },

  resetStreak: () => {
    set((state) => ({ user: { ...state.user, streak: 0 } }));
    const s = get();
    syncWithDatabase(s.user, s.recentActivities, s.badges, s.challengeHighScore);
  },

  addActivity: (activity) => {
    set((state) => ({
      recentActivities: [
        {
          ...activity,
          id: String(Date.now()),
          date: "Today"
        },
        ...state.recentActivities
      ]
    }));
    const s = get();
    syncWithDatabase(s.user, s.recentActivities, s.badges, s.challengeHighScore);
  },

  unlockBadge: (badgeId) => {
    set((state) => ({
      badges: state.badges.map((b) =>
        b.id === badgeId ? { ...b, unlocked: true, unlockedAt: "Today" } : b
      )
    }));
    const s = get();
    syncWithDatabase(s.user, s.recentActivities, s.badges, s.challengeHighScore);
  },

  selectTechnique: (tech) => set({ activeTechnique: tech }),

  startPractice: (customPool) => set((state) => {
    const defaultPool = [state.activeTechnique || VEDIC_TECHNIQUES[0]];
    const pool = customPool && customPool.length > 0 ? customPool : defaultPool;
    const questions: StoreState["practiceQuestions"] = [];
    const totalQuestions = 5;
    const seen = new Set<string>();

    for (let i = 0; i < totalQuestions; i++) {
      const pick = pool[Math.floor(Math.random() * pool.length)];
      let attempt = 0;
      let nextQuestion = buildQuestionForTechnique(pick);

      while (seen.has(nextQuestion.question) && attempt < 10) {
        attempt += 1;
        nextQuestion = buildQuestionForTechnique(pick);
      }

      seen.add(nextQuestion.question);
      questions.push(nextQuestion);
    }

    return {
      practiceIndex: 0,
      practiceTotal: totalQuestions,
      practiceStreak: 0,
      practiceCorrect: 0,
      practiceHistory: [],
      practiceQuestions: questions
    };
  }),

  submitPracticeAnswer: (userAns) => {
    let result = { isCorrect: false, correctAnswer: 0 };
    set((state) => {
      const q = state.practiceQuestions[state.practiceIndex];
      const isCorrect = q.answer === userAns;
      result = { isCorrect, correctAnswer: q.answer };

      const updatedHistory = [
        ...state.practiceHistory,
        {
          question: q.question,
          userAnswer: userAns,
          correctAnswer: q.answer,
          isCorrect
        }
      ];

      const newStreak = isCorrect ? state.practiceStreak + 1 : 0;
      const newCorrect = isCorrect ? state.practiceCorrect + 1 : state.practiceCorrect;
      const newTotal = isCorrect ? state.practiceTotal : state.practiceTotal + 1;

      return {
        practiceStreak: newStreak,
        practiceCorrect: newCorrect,
        practiceHistory: updatedHistory,
        practiceTotal: newTotal
      };
    });
    return result;
  },

  nextPracticeQuestion: () => {
    let hasNext = false;
    set((state) => {
      if (state.practiceIndex < state.practiceTotal - 1) {
        hasNext = true;
        return { practiceIndex: state.practiceIndex + 1 };
      }
      return {};
    });
    return hasNext;
  },

  startChallenge: () => {
    const initialQuestion = buildBonusChallengeQuestion(0);

    set({
      challengeScore: 0,
      challengeStreak: 0,
      challengeTimer: 60,
      challengeIsPlaying: true,
      challengeQuestionsSolved: 0,
      challengeCurrentQuestion: initialQuestion
    });
  },

  tickChallengeTimer: () => set((state) => {
    if (state.challengeTimer <= 1) {
      return {
        challengeTimer: 0,
        challengeIsPlaying: false
      };
    }
    return { challengeTimer: state.challengeTimer - 1 };
  }),

  submitChallengeAnswer: (userAns) => {
    let correct = false;
    set((state) => {
      const q = state.challengeCurrentQuestion;
      if (!q) return {};

      const isCorrect = q.answer === userAns;
      correct = isCorrect;

      const newStreak = isCorrect ? state.challengeStreak + 1 : 0;
      const points = isCorrect ? 20 : -10;
      const newScore = state.challengeScore + points;
      const nextSolvedCount = state.challengeQuestionsSolved + (isCorrect ? 1 : 0);
      const nextQ = buildBonusChallengeQuestion(nextSolvedCount);

      return {
        challengeScore: newScore,
        challengeStreak: newStreak,
        challengeQuestionsSolved: nextSolvedCount,
        challengeCurrentQuestion: nextQ
      };
    });
    return correct;
  },

  endChallenge: () => {
    set((state) => {
      const finalScore = state.challengeScore;
      const isNewHighScore = finalScore > state.challengeHighScore;

      const xpEarned = finalScore > 0 ? finalScore : 0;
      if (xpEarned > 0) {
        const newXp = state.user.xp + xpEarned;
        const newLevel = calculateLevelFromXp(newXp);

        const sessionAvgSpeed = state.challengeQuestionsSolved > 0
          ? parseFloat((60 / state.challengeQuestionsSolved).toFixed(1))
          : 0;

        let newAvgSpeed = state.user.avgSpeed;
        if (sessionAvgSpeed > 0) {
          newAvgSpeed = state.user.avgSpeed > 0
            ? parseFloat((state.user.avgSpeed * 0.7 + sessionAvgSpeed * 0.3).toFixed(1))
            : sessionAvgSpeed;
        }

        const statsUpdated = {
          xp: newXp,
          level: newLevel > state.user.level ? newLevel : state.user.level,
          avgSpeed: newAvgSpeed
        };

        const newActivity = {
          id: String(Date.now()),
          type: "challenge" as const,
          title: "Bonus Challenge",
          desc: `Solved ${state.challengeQuestionsSolved} questions. Bonus XP: ${xpEarned}.`,
          date: "Today",
          xpAwarded: xpEarned
        };

        return {
          user: { ...state.user, ...statsUpdated },
          recentActivities: [newActivity, ...state.recentActivities],
          challengeIsPlaying: false,
          challengeHighScore: isNewHighScore ? finalScore : state.challengeHighScore
        };
      }

      const newActivity = {
        id: String(Date.now()),
        type: "challenge" as const,
        title: "Bonus Challenge",
        desc: `Solved ${state.challengeQuestionsSolved} questions. Bonus XP: 0.`,
        date: "Today",
        xpAwarded: 0
      };

      return {
        recentActivities: [newActivity, ...state.recentActivities],
        challengeIsPlaying: false,
        challengeHighScore: isNewHighScore ? finalScore : state.challengeHighScore
      };
    });
    const state = get();
    if (state.challengeQuestionsSolved >= 2) {
      recordChallengeStreakAward(set, get, state.challengeQuestionsSolved);
    }
    const s = get();
    syncWithDatabase(s.user, s.recentActivities, s.badges, s.challengeHighScore);
  },

  startDailyChallenge: () => {
    const today = getIstDateString();
    let completedToday = false;
    const userKey = get().user?.name || "guest";
    const saved = typeof window !== "undefined" ? localStorage.getItem(`vedax-daily-challenge-${userKey}`) : null;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        completedToday = parsed?.lastCompletedDate === today;
      } catch (e) {}
    }

    if (completedToday) {
      set({ dailyChallengeCompletedToday: true, dailyChallengeIsPlaying: false });
      return;
    }

    set({
      dailyChallengeTimer: 60,
      dailyChallengeIsPlaying: true,
      dailyChallengeQuestions: buildDailyChallengeQuestions(5),
      dailyChallengeIndex: 0,
      dailyChallengeCorrect: 0,
      dailyChallengeCompletedToday: false
    });
  },

  tickDailyChallengeTimer: () => set((state) => {
    if (state.dailyChallengeTimer <= 1) {
      return {
        dailyChallengeTimer: 0,
        dailyChallengeIsPlaying: false
      };
    }
    return { dailyChallengeTimer: state.dailyChallengeTimer - 1 };
  }),

  submitDailyChallengeAnswer: (userAns) => {
    let correct = false;
    let completed = false;

    set((state) => {
      const current = state.dailyChallengeQuestions[state.dailyChallengeIndex];
      if (!current) return {};

      const isCorrect = current.answer === userAns;
      correct = isCorrect;

      const nextIndex = state.dailyChallengeIndex + 1;
      completed = nextIndex >= state.dailyChallengeQuestions.length;

      return {
        dailyChallengeIndex: nextIndex,
        dailyChallengeCorrect: state.dailyChallengeCorrect + (isCorrect ? 1 : 0),
        dailyChallengeIsPlaying: completed ? false : state.dailyChallengeIsPlaying
      };
    });

    if (completed) {
      get().endDailyChallenge();
    }

    return correct;
  },

  endDailyChallenge: () => {
    const state = get();
    const today = getIstDateString();
    const completed = state.dailyChallengeIndex >= state.dailyChallengeQuestions.length;

    if (completed && !state.dailyChallengeCompletedToday) {
      const xpEarned = 200;
      const newXp = state.user.xp + xpEarned;
      const newLevel = calculateLevelFromXp(newXp);

      const statsUpdated = {
        xp: newXp,
        level: newLevel > state.user.level ? newLevel : state.user.level
      };

      const newActivity = {
        id: String(Date.now()),
        type: "daily-challenge" as const,
        title: "Daily Challenge",
        desc: `Solved ${state.dailyChallengeCorrect} of 5 in 60 seconds.`,
        date: "Today",
        xpAwarded: xpEarned
      };

      set({
        user: { ...state.user, ...statsUpdated },
        recentActivities: [newActivity, ...state.recentActivities],
        dailyChallengeCompletedToday: true
      });

      if (typeof window !== "undefined") {
        const userKey = state.user?.name || "guest";
        localStorage.setItem(`vedax-daily-challenge-${userKey}`, JSON.stringify({ lastCompletedDate: today }));
      }
    }

    if (state.dailyChallengeCorrect >= 2) {
      recordChallengeStreakAward(set, get, state.dailyChallengeCorrect);
    }

    const s = get();
    syncWithDatabase(s.user, s.recentActivities, s.badges, s.challengeHighScore);
  },

  toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),
  toggleVibration: () => set((state) => ({ vibrationEnabled: !state.vibrationEnabled })),
  setDifficulty: (level) => set({ difficulty: level })
}));
