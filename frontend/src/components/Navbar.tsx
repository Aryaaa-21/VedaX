"use client";

import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { Menu, X, Flame, Trophy, Award, User, Settings, LogOut, BookOpen, LayoutDashboard, Timer, ArrowLeft, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useStore();
  const { logout, isGuest, authUser } = useAuth();
  const [showXpBurst, setShowXpBurst] = useState(false);
  const [xpDelta, setXpDelta] = useState(0);
  const prevXpRef = useRef(user.xp);

  const isLoggedIn = !!authUser || isGuest;

  const mobileNavItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Learn", path: "/learn", icon: BookOpen },
    { name: "Sutra Practice", path: "/sutra-practice", icon: Sparkles },
    { name: "Practice", path: "/practice", icon: Flame },
    { name: "Daily Challenge", path: "/daily-challenge", icon: Timer },
    { name: "Bonus Challenge", path: "/bonus-challenge", icon: Timer },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Achievements", path: "/achievements", icon: Award },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const handleStartDailyChallenge = () => {
    setIsOpen(false);
    navigate("/daily-challenge");
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    const prev = prevXpRef.current;
    if (user.xp > prev) {
      setXpDelta(user.xp - prev);
      setShowXpBurst(true);
      setTimeout(() => setShowXpBurst(false), 1800);
    }
    prevXpRef.current = user.xp;
  }, [user.xp, isLoggedIn]);

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-card border-b border-primary/10 px-4 md:px-8 flex items-center justify-between z-50 shadow-sm text-foreground">
      {/* Brand logo */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-1.5 hover:bg-primary/5 rounded-lg text-primary mr-1"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <Link to="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-mono font-bold text-lg relative group-hover:scale-105 transition-all">
            <span className="group-hover:opacity-0 transition-opacity">V</span>
            <ArrowLeft className="w-4.5 h-4.5 absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-opacity text-white" />
          </div>
          <span className="font-sans text-lg font-black tracking-wider text-primary group-hover:text-primary/80 transition-colors">VedaX</span>
        </Link>
      </div>

      {/* Desktop Quick Nav Links (for landing page / public view) */}
      <nav className="hidden lg:flex items-center gap-8">
        <Link
          to="/learn"
          className={`font-semibold text-sm transition-all ${
            pathname === "/learn"
              ? "text-primary border-b-2 border-primary pb-1"
              : "text-muted-foreground hover:text-primary"
          }`}
        >
          Learn
        </Link>
        <Link
          to="/sutra-practice"
          className={`font-semibold text-sm transition-all ${
            pathname === "/sutra-practice"
              ? "text-primary border-b-2 border-primary pb-1"
              : "text-muted-foreground hover:text-primary"
          }`}
        >
          Sutra Practice
        </Link>
        <Link
          to="/practice"
          className={`font-semibold text-sm transition-all ${
            pathname === "/practice"
              ? "text-primary border-b-2 border-primary pb-1"
              : "text-muted-foreground hover:text-primary"
          }`}
        >
          Practice
        </Link>
        <Link
          to="/leaderboard"
          className={`font-semibold text-sm transition-all ${
            pathname === "/leaderboard"
              ? "text-primary border-b-2 border-primary pb-1"
              : "text-muted-foreground hover:text-primary"
          }`}
        >
          Leaderboard
        </Link>
      </nav>

      {/* Right Stats & User Info */}
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <>
            {/* Streak counter */}
            <div className="flex items-center gap-1 bg-primary/5 text-primary px-3 py-1 rounded-full border border-primary/10">
              <Flame className="w-4 h-4 fill-primary text-primary" />
              <span className="font-mono text-xs font-extrabold">{user.streak} Days</span>
            </div>

            {/* XP badge */}
            <div className="hidden sm:flex items-center gap-1 bg-accent/15 text-primary px-3 py-1 rounded-full border border-accent/25 relative">
              <Trophy className="w-3.5 h-3.5 text-primary" />
              <span className="font-mono text-xs font-extrabold">{user.xp} XP</span>
              <AnimatePresence>
                {showXpBurst && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: -10, scale: 1 }}
                    exit={{ opacity: 0, y: -18, scale: 0.95 }}
                    transition={{ duration: 0.6 }}
                    className="absolute -top-5 right-0 flex items-center gap-1 text-secondary"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-secondary" />
                    <span className="text-[10px] font-extrabold">+{xpDelta} XP</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User avatar */}
            <Link to="/profile">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-primary/20 hover:scale-105 transition-transform"
              />
            </Link>
          </>
        ) : (
          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/login"
              className="text-xs font-bold text-muted-foreground hover:text-primary transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="bg-primary hover:bg-primary/90 text-white text-xs font-extrabold px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              Create Account
            </Link>
          </div>
        )}

        <ThemeToggle compact />
      </div>

      {/* Mobile Drawer Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-primary/20 backdrop-blur-sm z-30"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0.15 }}
              className="lg:hidden fixed top-16 left-0 w-64 h-[calc(100vh-64px)] bg-card border-r border-primary/10 p-5 z-40 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-6">
                {/* User quick stats info */}
                {isLoggedIn && (
                  <div className="flex items-center gap-3 p-2 bg-background/50 rounded-xl border border-primary/5">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border border-primary/10"
                    />
                    <div>
                      <p className="text-xs text-primary font-bold">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold">Level {user.level} Mathlete</p>
                    </div>
                  </div>
                )}

                {/* Nav links */}
                <nav className="space-y-1">
                  {mobileNavItems.map((item) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;

                    return (
                      <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                        <div
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                            isActive
                              ? "bg-primary text-white"
                              : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                          }`}
                        >
                          <Icon className="w-4 h-4 text-primary/70" />
                          <span>{item.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer footer actions */}
              <div className="pt-4 border-t border-primary/10 space-y-3">
                <button
                  onClick={handleStartDailyChallenge}
                  className="w-full bg-primary text-white font-bold py-2.5 px-4 rounded-xl shadow-md text-xs uppercase tracking-wider border-b-4 border-primary/30"
                >
                  Start Daily Challenge
                </button>
                {!isLoggedIn ? (
                  <div className="flex flex-col gap-1 w-full">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-primary hover:bg-primary/5 transition-all"
                    >
                      <LogOut className="w-4 h-4 rotate-180" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-primary hover:bg-primary/5 transition-all"
                    >
                      <User className="w-4 h-4" />
                      <span>Create Account</span>
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-error hover:bg-error/5 transition-all cursor-pointer border-none bg-transparent"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isGuest ? "End Guest Session" : "Logout"}</span>
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
