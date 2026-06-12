import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      lenis.destroy();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Framer Motion Variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const floatingAnimate = (yOffset = 15) => isMobile ? { y: 0 } : { y: [0, yOffset] };
  const floatingTransition = (duration = 5, delay = 0) => isMobile ? {} : {
    y: {
      duration: duration,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
      delay: delay
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen antialiased selection:bg-primary/10 selection:text-primary">
      
      {/* 1. NAVBAR */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-outline shadow-[0_1px_10px_rgba(0,0,0,0.02)]' : 'bg-transparent'}`}>
        <div className="max-w-[1280px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[22px]">monitoring</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Stratify</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">How It Works</a>
            <a href="#analytics" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Analytics</a>
            <a href="#security" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Security</a>
          </div>

          <div>
            <Link to="/login" className="bg-primary hover:bg-secondary text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm hover:shadow-md">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-36 pb-20 px-6 overflow-hidden bg-white">
        <div className="max-w-[1280px] mx-auto text-center relative z-10 flex flex-col items-center">
          
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-8"
          >
            <span className="material-symbols-outlined text-xs">verified</span>
            Enterprise Goal Management Platform
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] max-w-4xl"
          >
            Performance Reviews <br />Shouldn't Be Guesswork
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-slate-600 text-lg md:text-xl max-w-2xl mt-6 leading-relaxed"
          >
            Stratify helps organizations set goals, manage approvals, track achievements, and evaluate performance across quarterly cycles.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mt-10"
          >
            <Link to="/login" className="bg-primary hover:bg-secondary text-white px-8 py-4 rounded-full font-semibold text-base transition-all shadow-[0_4px_20px_rgba(0,99,151,0.15)] hover:scale-[1.02]">
              Get Started
            </Link>
            <a href="#features" className="border border-slate-200 text-slate-700 hover:bg-slate-100 px-8 py-4 rounded-full font-semibold text-base transition-all">
              Learn More
            </a>
          </motion.div>

          {/* HERO VISUAL (Floating Layered Product Showcase) */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="w-full max-w-5xl mt-24 relative aspect-[1.8/1] rounded-3xl bg-slate-100 border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 overflow-hidden flex items-center justify-center"
          >
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: `linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)`, backgroundSize: '24px 24px' }}></div>

            {/* Center Visual Platform Core Mockup */}
            <div className="w-[60%] aspect-[1.6/1] bg-white border border-slate-200/80 rounded-2xl shadow-sm relative p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xs">monitoring</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800">Q2 Strategy Overview</span>
                </div>
                <div className="w-12 h-4 rounded bg-slate-100 animate-pulse"></div>
              </div>
              <div className="flex-1 py-4 flex flex-col justify-center gap-3">
                <div className="w-full h-3 bg-slate-100 rounded"></div>
                <div className="w-[85%] h-3 bg-slate-100 rounded"></div>
                <div className="w-[60%] h-3 bg-slate-100 rounded"></div>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-[10px] text-slate-400">
                <span>Updated 5m ago</span>
                <span className="text-primary font-bold">12 Active Goals</span>
              </div>
            </div>

            {/* Layer 1: Goal Progress Card (Revenue Growth 82%) */}
            <motion.div
              animate={floatingTransition(12, 5.5, 0.2).animate}
              transition={floatingTransition(12, 5.5, 0.2).y}
              className="hero-card absolute top-10 left-10 w-[240px] bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_10px_25px_rgba(0,0,0,0.03)] text-left"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Goal Progress</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">82%</span>
              </div>
              <h4 className="text-sm font-bold text-slate-800">Revenue Growth</h4>
              <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
                <div className="w-[82%] h-full bg-emerald-500 rounded-full"></div>
              </div>
            </motion.div>

            {/* Layer 2: Employee Score Card (91/100) */}
            <motion.div
              animate={floatingTransition(-10, 6, 0.5).animate}
              transition={floatingTransition(-10, 6, 0.5).y}
              className="hero-card absolute bottom-10 left-16 w-[180px] bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_10px_25px_rgba(0,0,0,0.03)] text-left"
            >
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Employee Score</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-extrabold text-slate-800">91</span>
                <span className="text-sm text-slate-400">/ 100</span>
              </div>
              <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1 mt-2">
                <span className="material-symbols-outlined text-xs">trending_up</span> Top Tier Performer
              </span>
            </motion.div>

            {/* Layer 3: Pending Approval Card (12 Reviews) */}
            <motion.div
              animate={floatingTransition(14, 4.8, 0.8).animate}
              transition={floatingTransition(14, 4.8, 0.8).y}
              className="hero-card absolute top-12 right-12 w-[220px] bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_10px_25px_rgba(0,0,0,0.03)] text-left"
            >
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending Approval</span>
              <div className="flex items-center justify-between mt-3">
                <span className="text-2xl font-extrabold text-slate-800">12 Reviews</span>
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">pending_actions</span>
                </div>
              </div>
              <div className="mt-2 text-[10px] text-slate-400">Requires L1 evaluation</div>
            </motion.div>

            {/* Layer 4: Quarter Completion & Goal Status (76% On Track) */}
            <motion.div
              animate={floatingTransition(-8, 5.2, 1).animate}
              transition={floatingTransition(-8, 5.2, 1).y}
              className="hero-card absolute bottom-12 right-16 w-[210px] bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_10px_25px_rgba(0,0,0,0.03)] text-left"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completion</span>
                <span className="text-xs font-bold text-slate-800">76%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div className="w-[76%] h-full bg-primary rounded-full"></div>
              </div>
              <div className="flex items-center justify-between mt-4 border-t border-slate-200 pt-3">
                <span className="text-[11px] text-slate-500">Goal Status</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">On Track</span>
              </div>
            </motion.div>

          </motion.div>

          <style>{`
            @media (max-width: 699px) {
              .hero-card {
                display: none !important;
              }
            }
          `}</style>
        </div>
      </section>

      {/* 3. STATS BAR */}
      <section className="border-y border-outline bg-slate-100/50 py-10 px-6">
        <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <span className="block text-3xl font-extrabold text-slate-900 md:text-4xl">4+</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 block">UoM Types</span>
          </div>
          <div>
            <span className="block text-3xl font-extrabold text-slate-900 md:text-4xl">3</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 block">Role Dashboards</span>
          </div>
          <div>
            <span className="block text-3xl font-extrabold text-slate-900 md:text-4xl">100%</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 block">Weight Validation</span>
          </div>
          <div>
            <span className="block text-3xl font-extrabold text-slate-900 md:text-4xl">4</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 block">Quarter Cycles</span>
          </div>
        </div>
      </section>

      {/* 4. ROLE SECTION */}
      <section id="features" className="py-32 px-6 bg-white">
        <div className="max-w-[1280px] mx-auto text-center flex flex-col items-center">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="max-w-3xl"
          >
            <span className="text-xs font-bold text-primary uppercase tracking-widest block">Stakeholders</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">Built For Every Stakeholder</h2>
            <p className="text-slate-600 mt-4 text-base md:text-lg">One platform connecting employees, managers, and administrators through a structured performance workflow.</p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 mt-16 w-full items-start"
          >
            {/* Employee Card - Height: Min-380px */}
            <motion.div variants={fadeUp} className="bg-slate-100/50 border border-slate-200 rounded-3xl p-8 text-left hover:border-slate-300 hover:shadow-sm transition-all min-h-[380px] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary">person</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Employee</h3>
                <p className="text-sm text-slate-500 mt-2">Empowering staff to define their development goals and log success indicators.</p>
                
                <ul className="space-y-3 mt-6">
                  <li className="flex items-center gap-2.5 text-slate-600 text-sm">
                    <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span> Set quarterly goals
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-600 text-sm">
                    <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span> Log achievements
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-600 text-sm">
                    <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span> Track progress
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-600 text-sm">
                    <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span> View personal scores
                  </li>
                </ul>
              </div>
              <div className="mt-8 text-xs font-semibold text-primary">Explore Employee View →</div>
            </motion.div>

            {/* Manager Card - Staggered Offset - Height: Min-410px */}
            <motion.div variants={fadeUp} className="bg-slate-100/50 border border-slate-200 rounded-3xl p-8 text-left hover:border-slate-300 hover:shadow-sm transition-all min-h-[410px] md:mt-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-secondary">groups</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Manager</h3>
                <p className="text-sm text-slate-500 mt-2">Driving departmental alignment through structured feedback loops and review gates.</p>
                
                <ul className="space-y-3 mt-6">
                  <li className="flex items-center gap-2.5 text-slate-600 text-sm">
                    <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span> Review goal sheets
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-600 text-sm">
                    <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span> Approve submissions
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-600 text-sm">
                    <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span> Provide feedback
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-600 text-sm">
                    <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span> Monitor team performance
                  </li>
                </ul>
              </div>
              <div className="mt-8 text-xs font-semibold text-secondary">Explore Manager View →</div>
            </motion.div>

            {/* Admin Card - Staggered Offset - Height: Min-440px */}
            <motion.div variants={fadeUp} className="bg-slate-100/50 border border-slate-200 rounded-3xl p-8 text-left hover:border-slate-300 hover:shadow-sm transition-all min-h-[440px] md:mt-12 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-emerald-500">admin_panel_settings</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Admin</h3>
                <p className="text-sm text-slate-500 mt-2">Complete governance control over valuation cycles, scoring configurations, and logs.</p>
                
                <ul className="space-y-3 mt-6">
                  <li className="flex items-center gap-2.5 text-slate-600 text-sm">
                    <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span> Manage cycles
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-600 text-sm">
                    <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span> Configure scoring
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-600 text-sm">
                    <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span> Control access
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-600 text-sm">
                    <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span> View company analytics
                  </li>
                </ul>
              </div>
              <div className="mt-8 text-xs font-semibold text-emerald-600">Explore Admin View →</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 5. GOAL LIFECYCLE SECTION */}
      <section id="how-it-works" className="py-32 px-6 bg-slate-100/50 border-t border-b border-outline">
        <div className="max-w-[1280px] mx-auto text-center flex flex-col items-center">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="max-w-2xl"
          >
            <span className="text-xs font-bold text-primary uppercase tracking-widest block">Workflow</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">How Goals Move Through Stratify</h2>
            <p className="text-slate-600 mt-4">A transparent, Linear-inspired timeline tracking objectives from planning to calculations.</p>
          </motion.div>

          {/* Timeline Process Visual */}
          <div className="relative mt-20 w-full max-w-4xl">
            {/* Horizontal timeline bar on desktop */}
            <div className="absolute top-[38px] left-[10%] right-[10%] h-[2px] bg-slate-200 hidden md:block z-0"></div>

            <div className="grid md:grid-cols-5 gap-8 relative z-10">
              
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-white border-2 border-primary flex items-center justify-center shadow-sm relative">
                  <span className="material-symbols-outlined text-primary">edit_note</span>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">1</div>
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-5">Draft</h4>
                <p className="text-xs text-slate-500 mt-2 max-w-[150px]">Goal details defined with chosen UoM and weightage.</p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm relative">
                  <span className="material-symbols-outlined text-slate-600">publish</span>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-400 text-white text-[10px] font-bold flex items-center justify-center">2</div>
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-5">Submitted</h4>
                <p className="text-xs text-slate-500 mt-2 max-w-[150px]">Locked goal sheet sent to supervisor for L1 review.</p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm relative">
                  <span className="material-symbols-outlined text-slate-600">verified</span>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-400 text-white text-[10px] font-bold flex items-center justify-center">3</div>
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-5">Approved</h4>
                <p className="text-xs text-slate-500 mt-2 max-w-[150px]">Objectives approved by manager and locked in cycle.</p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm relative">
                  <span className="material-symbols-outlined text-slate-600">playlist_add_check</span>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-400 text-white text-[10px] font-bold flex items-center justify-center">4</div>
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-5">Achievements Logged</h4>
                <p className="text-xs text-slate-500 mt-2 max-w-[150px]">Quarter progress and evidence inputs saved by employee.</p>
              </div>

              {/* Step 5 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm relative">
                  <span className="material-symbols-outlined text-slate-600">calculate</span>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-400 text-white text-[10px] font-bold flex items-center justify-center">5</div>
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-5">Score Computed</h4>
                <p className="text-xs text-slate-500 mt-2 max-w-[150px]">Mathematical formulas calculate target outcome scores.</p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 6. SCORING ENGINE SECTION */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-[1280px] mx-auto text-center flex flex-col items-center">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="max-w-2xl"
          >
            <span className="text-xs font-bold text-primary uppercase tracking-widest block">Scoring Engine</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">Flexible Performance Scoring Engine</h2>
            <p className="text-slate-600 mt-4">Stratify supports multiple Unit of Measure (UoM) types to fairly evaluate goals across departments.</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 mt-16 w-full">
            
            {/* Numeric Min */}
            <div className="bg-slate-100 border border-slate-200/80 rounded-3xl p-6 hover:border-slate-300 transition-all text-left">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/5 border border-primary/10 px-2.5 py-1 rounded-full">Numeric Min</span>
              <div className="mt-5 space-y-2">
                <p className="text-xs text-slate-400 font-semibold uppercase">Minimize Target</p>
                <div className="text-sm font-bold text-slate-800">Target: ₹10,00,000</div>
                <div className="text-sm font-bold text-slate-800">Achieved: ₹12,00,000</div>
                <div className="pt-3 border-t border-slate-200 mt-3 text-[10px] text-slate-500">
                  Formula: Evaluates higher margins of return against low thresholds.
                </div>
              </div>
            </div>

            {/* Numeric Max */}
            <div className="bg-slate-100 border border-slate-200/80 rounded-3xl p-6 hover:border-slate-300 transition-all text-left">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">Numeric Max</span>
              <div className="mt-5 space-y-2">
                <p className="text-xs text-slate-400 font-semibold uppercase">Minimize Cost/Errors</p>
                <div className="text-sm font-bold text-slate-800">Target: 5 Defects</div>
                <div className="text-sm font-bold text-slate-800">Achieved: 2 Defects</div>
                <div className="pt-3 border-t border-slate-200 mt-3 text-[10px] text-slate-500">
                  Formula: Evaluates lower defects with higher efficiency percentages.
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-slate-100 border border-slate-200/80 rounded-3xl p-6 hover:border-slate-300 transition-all text-left">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">Timeline</span>
              <div className="mt-5 space-y-2">
                <p className="text-xs text-slate-400 font-semibold uppercase">Deliver by Date</p>
                <div className="text-sm font-bold text-slate-800">Target Date: June 30</div>
                <div className="text-sm font-bold text-slate-800">Delivered: June 25</div>
                <div className="pt-3 border-t border-slate-200 mt-3 text-[10px] text-slate-500">
                  Formula: Calculations compute early launch rewards or delays.
                </div>
              </div>
            </div>

            {/* Zero Based */}
            <div className="bg-slate-100 border border-slate-200/80 rounded-3xl p-6 hover:border-slate-300 transition-all text-left">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">Zero Based</span>
              <div className="mt-5 space-y-2">
                <p className="text-xs text-slate-400 font-semibold uppercase">Zero Tolerance SLA</p>
                <div className="text-sm font-bold text-slate-800">Target: 0 Incidents</div>
                <div className="text-sm font-bold text-slate-800">Achieved: 0 Incidents</div>
                <div className="pt-3 border-t border-slate-200 mt-3 text-[10px] text-slate-500">
                  Formula: Direct boolean score impact if target deviations occur.
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. ANALYTICS SECTION */}
      <section id="analytics" className="py-32 px-6 bg-slate-100/50 border-t border-b border-outline">
        <div className="max-w-[1280px] mx-auto flex flex-col items-center">
          
          <div className="max-w-2xl text-center mb-16">
            <span className="text-xs font-bold text-primary uppercase tracking-widest block">Dashboard View</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">Performance Insights At Every Level</h2>
            <p className="text-slate-600 mt-4">Monitor progress, identify trends, and evaluate performance across the organization.</p>
          </div>

          {/* Premium Mock Dashboard Showcase */}
          <div className="w-full bg-white border border-slate-200 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.02)] p-6 md:p-10 text-left space-y-8">
            
            {/* Header / Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-slate-100 border border-slate-200 p-5 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Average Completion</span>
                <span className="text-3xl font-extrabold text-slate-800 block mt-2">76%</span>
                <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2.5 overflow-hidden">
                  <div className="w-[76%] h-full bg-primary rounded-full"></div>
                </div>
              </div>

              <div className="bg-slate-100 border border-slate-200 p-5 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Goals</span>
                <span className="text-3xl font-extrabold text-slate-800 block mt-2">48</span>
                <span className="text-[10px] text-slate-400 mt-2 block">Allocated in current cycle</span>
              </div>

              <div className="bg-slate-100 border border-slate-200 p-5 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pending Approvals</span>
                <span className="text-3xl font-extrabold text-amber-500 block mt-2">12</span>
                <span className="text-[10px] text-slate-400 mt-2 block">Requires manager sign-off</span>
              </div>

              <div className="bg-slate-100 border border-slate-200 p-5 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Top Performers</span>
                <span className="text-3xl font-extrabold text-emerald-600 block mt-2">8</span>
                <span className="text-[10px] text-slate-400 mt-2 block">Evaluation score &gt; 90%</span>
              </div>

            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Leaderboard */}
              <div className="lg:col-span-1 border border-slate-200 bg-slate-100/30 p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-3 mb-4">Employee Leaderboard</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px]">AM</div>
                        <span className="font-bold text-slate-700">Alex Mercer</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-600">91.2%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-secondary/10 text-secondary font-bold flex items-center justify-center text-[10px]">SR</div>
                        <span className="font-bold text-slate-700">Sarah Ryan</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-600">89.5%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-[10px]">DH</div>
                        <span className="font-bold text-slate-700">David Hall</span>
                      </div>
                      <span className="font-mono font-bold text-slate-600">86.1%</span>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-primary font-semibold mt-4 text-right cursor-pointer hover:underline">View All Teams →</div>
              </div>

              {/* Quarterly Performance Chart representation */}
              <div className="lg:col-span-2 border border-slate-200 bg-slate-100/30 p-6 rounded-2xl">
                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-3 mb-4">Quarterly Performance Chart</h4>
                <div className="aspect-[2.2/1] w-full flex items-end justify-between px-4 pt-4 relative">
                  
                  {/* Grid Lines */}
                  <div className="absolute left-0 right-0 top-[20%] border-t border-dashed border-slate-200/50"></div>
                  <div className="absolute left-0 right-0 top-[50%] border-t border-dashed border-slate-200/50"></div>
                  <div className="absolute left-0 right-0 top-[80%] border-t border-dashed border-slate-200/50"></div>

                  <div className="flex flex-col items-center gap-2 z-10 w-[20%]">
                    <div className="w-full bg-slate-200/80 rounded-t-lg transition-all hover:bg-slate-300 h-16"></div>
                    <span className="text-[10px] font-bold text-slate-400">Q1</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 z-10 w-[20%]">
                    <div className="w-full bg-primary/70 rounded-t-lg transition-all hover:bg-primary/95 h-28"></div>
                    <span className="text-[10px] font-bold text-slate-400">Q2</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 z-10 w-[20%]">
                    <div className="w-full bg-slate-200/80 rounded-t-lg transition-all hover:bg-slate-300 h-20"></div>
                    <span className="text-[10px] font-bold text-slate-400">Q3</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 z-10 w-[20%]">
                    <div className="w-full bg-primary rounded-t-lg transition-all hover:bg-primary/90 h-36"></div>
                    <span className="text-[10px] font-bold text-slate-400">Q4</span>
                  </div>

                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 8. APPROVAL WORKFLOW SECTION */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-[1280px] mx-auto flex flex-col items-center">
          
          <div className="max-w-2xl text-center mb-16">
            <span className="text-xs font-bold text-primary uppercase tracking-widest block">Review Flow</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">Manager Review Workflow</h2>
            <p className="text-slate-600 mt-4">Review, approve, or return submissions with contextual feedback inside a GitHub-inspired approval board.</p>
          </div>

          {/* GitHub Style Approval UI Container */}
          <div className="w-full max-w-3xl border border-slate-200 rounded-3xl overflow-hidden shadow-sm bg-white">
            
            {/* PR Header */}
            <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Pending Review
                </span>
                <h3 className="text-sm font-bold text-slate-800">Q2 Goal Verification</h3>
              </div>
              <span className="text-[11px] text-slate-400">Requested 2h ago</span>
            </div>

            {/* Content Area */}
            <div className="p-6 space-y-6">
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">AM</div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <h4 className="text-sm font-bold text-slate-800">Alex Mercer</h4>
                    <span className="text-xs text-slate-400">Senior Software Engineer</span>
                  </div>
                  <div className="bg-slate-100 border border-slate-200 p-4 rounded-2xl text-xs space-y-3">
                    <p className="font-semibold text-slate-700">Goal Sheet: Core Engineering Goals (Weight: 100%)</p>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-slate-500">
                      <span>1. Decrease latency by 20%</span>
                      <span className="font-bold text-slate-700">Weight: 40%</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>2. Implement automated cycle audits</span>
                      <span className="font-bold text-slate-700">Weight: 30%</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>3. Optimize database queries</span>
                      <span className="font-bold text-slate-700">Weight: 30%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback / Review Comment Form */}
              <div className="border-t border-slate-200 pt-6 space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Contextual Review Feedback</label>
                <textarea 
                  className="w-full bg-slate-100/50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl py-3 px-4 text-xs text-slate-800 placeholder:text-slate-400"
                  rows="3"
                  placeholder="Review comment (e.g. Excellent alignment on API latency targets, check database index schemas...)"
                  defaultValue="Database indexing goals look high impact. Let's align on target definitions before approval."
                />
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button className="px-5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-amber-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">assignment_return</span>
                Return for Rework
              </button>
              <button className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-secondary transition-all flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Approve & Lock
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 9. SECURITY SECTION (Dark Contrast Section) */}
      <section id="security" className="py-32 px-6 bg-[#0F172A] text-white">
        <div className="max-w-[1280px] mx-auto text-center flex flex-col items-center relative">
          
          {/* Subtle Glow Effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/10 blur-[130px] rounded-full pointer-events-none"></div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="max-w-2xl relative z-10"
          >
            <span className="text-xs font-bold text-primary uppercase tracking-widest block">Governance</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-3">Enterprise Security Built In</h2>
            <p className="text-slate-400 mt-4">Designed for organizations that require complete transparency, accountability, and security control.</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 mt-16 w-full relative z-10">
            
            {/* Card 1 */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 text-left hover:border-slate-700 hover:bg-slate-900/60 transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
              </div>
              <h4 className="text-base font-bold text-white">Role-Based Access</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Dedicated permissions separating Employee, Manager, and HR access controls.</p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 text-left hover:border-slate-700 hover:bg-slate-900/60 transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-primary">receipt_long</span>
              </div>
              <h4 className="text-base font-bold text-white">Audit Logs</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Immutable system audit entries tracking all role elevations and cycle settings.</p>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 text-left hover:border-slate-700 hover:bg-slate-900/60 transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-primary">lock</span>
              </div>
              <h4 className="text-base font-bold text-white">Immutable Locking</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Approved goals are instantly locked down to block unscheduled edit modifications.</p>
            </div>

            {/* Card 4 */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 text-left hover:border-slate-700 hover:bg-slate-900/60 transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-primary">layers</span>
              </div>
              <h4 className="text-base font-bold text-white">Row Level Security</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Supabase-driven RLS database policies shielding private employee performance metrics.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 10. TECH STACK MARQUEE */}
      <section className="py-20 bg-slate-100 border-y border-outline overflow-hidden relative w-full">
        {/* Shadow overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>

        <div className="max-w-[1280px] mx-auto px-6 mb-8 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Our Modern Technology Stack</span>
        </div>

        {/* Infinite scrolling marquee */}
        <div className="flex gap-8 items-center w-max animate-marquee">
          {/* First set of pills */}
          <div className="flex gap-8 items-center shrink-0">
            {['React', 'Supabase', 'PostgreSQL', 'TanStack Query', 'Recharts', 'TailwindCSS', 'Vite', 'Vercel'].map((stack, idx) => (
              <div key={`stack1-${idx}`} className="px-6 py-2.5 rounded-full bg-white border border-slate-200 text-slate-500 font-bold text-xs shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:border-primary/20 hover:text-primary transition-all">
                {stack}
              </div>
            ))}
          </div>
          {/* Duplicate set for infinite loop */}
          <div className="flex gap-8 items-center shrink-0">
            {['React', 'Supabase', 'PostgreSQL', 'TanStack Query', 'Recharts', 'TailwindCSS', 'Vite', 'Vercel'].map((stack, idx) => (
              <div key={`stack2-${idx}`} className="px-6 py-2.5 rounded-full bg-white border border-slate-200 text-slate-500 font-bold text-xs shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:border-primary/20 hover:text-primary transition-all">
                {stack}
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 20s linear infinite;
          }
        `}</style>
      </section>

      {/* 11. FOOTER */}
      <footer className="bg-white border-t border-outline py-20 px-6">
        <div className="max-w-[1280px] mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 pb-16">
            
            <div className="space-y-4 max-w-sm">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[22px]">monitoring</span>
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900">Stratify</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Enterprise Goal Management Platform built to set objectives, track achievements, and evaluate employee performance.
              </p>
            </div>

            <div className="flex gap-16 flex-wrap">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Platform</h4>
                <div className="flex flex-col gap-2.5 text-sm">
                  <a href="#features" className="text-slate-600 hover:text-primary transition-colors">Features</a>
                  <a href="#analytics" className="text-slate-600 hover:text-primary transition-colors">Analytics</a>
                  <a href="#security" className="text-slate-600 hover:text-primary transition-colors">Security</a>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Developer</h4>
                <div className="flex flex-col gap-2.5 text-sm">
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-primary transition-colors">GitHub</a>
                </div>
              </div>
            </div>

          </div>

          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
            <span>&copy; 2026 Stratify. All rights reserved.</span>
            <span>Built for AtomQuest Hackathon 1.0</span>
          </div>

        </div>
      </footer>

    </div>
  );
};
