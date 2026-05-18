import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

// FadeInView component for scroll animations
const FadeInView = ({ children, delay = 0, className = '' }) => {
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  return (
    <div
      ref={ref}
      className={`fade-in-view ${isVisible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export const LandingPage = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <div className="landing-page-root">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface/80 backdrop-blur-lg border-b border-white/10">
        <div className="flex justify-between items-center px-lg md:px-xl py-4 max-w-[1440px] mx-auto w-full">
          <div className="flex items-center gap-sm">
            <span className="font-headline-md text-headline-md font-bold text-primary dark:text-primary tracking-tight">Stratify</span>
          </div>
          <div className="hidden md:flex items-center gap-xl">
            <a href="#roles" className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary transition-all duration-300 font-body-md text-body-md">Roles</a>
            <a href="#features" className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary transition-all duration-300 font-body-md text-body-md">Features</a>
            <a href="#how-it-works" className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary transition-all duration-300 font-body-md text-body-md">How It Works</a>
          </div>
          <div className="flex items-center gap-md">
            <button className="material-symbols-outlined text-primary" data-icon="target">target</button>
            <Link to="/login" className="bg-primary hover:bg-primary/90 text-on-primary px-8 py-3 rounded-lg font-bold text-[15px] hover:scale-105 transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              Login
            </Link>
          </div>
        </div>
      </nav>

      <main className="mt-[80px]">
        {/* Hero Section */}
        <section className="relative px-8 md:px-16 lg:px-24 py-20 min-h-[calc(100vh-80px)] flex items-center overflow-hidden">
          <div className="max-w-[1440px] mx-auto w-full grid md:grid-cols-2 gap-12 items-center relative z-10">
            <FadeInView className="flex flex-col justify-center space-y-8 h-full">
              <h1 className="font-display-lg text-display-lg text-on-background leading-tight">
                Align. Track.<br /><span className="text-primary">Achieve.</span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                A unified goal management portal for modern organizations from strategic goal setting to automated quarterly check-ins. Stratify your vision into actionable success.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/login" className="bg-primary text-on-primary px-8 py-4 rounded-lg font-bold text-[16px] hover:scale-105 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                  Get Started <span className="material-symbols-outlined text-[20px]" data-icon="arrow_forward">arrow_forward</span>
                </Link>
                <a href="#features" className="border border-outline-variant text-on-surface px-8 py-4 rounded-lg font-bold text-[16px] hover:bg-surface-variant transition-all">
                  Learn More
                </a>
              </div>
            </FadeInView>
            <FadeInView delay={200} className="relative hidden md:block">
              {/* Custom Dashboard Representation for Goal Tracking */}
              <div className="relative w-full h-[550px] flex items-center justify-center">
                {/* Main Glass Panel */}
                <div className="absolute w-[400px] h-[320px] glass-panel rounded-xl p-6 shadow-2xl animate-float z-20 border-primary/20" style={{ transform: 'rotateX(5deg) rotateY(-5deg)' }}>
                  <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                      </div>
                      <div>
                        <div className="text-on-surface font-bold text-[14px]">Alex Mercer</div>
                        <div className="text-on-surface-variant text-[12px]">Senior Developer • Q2 Goals</div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-primary">more_vert</span>
                  </div>

                  <div className="space-y-5">
                    {/* Goal Item 1 */}
                    <div>
                      <div className="flex justify-between text-[13px] text-on-surface font-semibold mb-2">
                        <span>Increase Department Efficiency</span>
                        <span className="text-tertiary">85%</span>
                      </div>
                      <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                        <div className="w-[85%] h-full bg-tertiary"></div>
                      </div>
                      <div className="text-[11px] text-on-surface-variant mt-1">Weightage: 50% • On Track</div>
                    </div>

                    {/* Goal Item 2 */}
                    <div>
                      <div className="flex justify-between text-[13px] text-on-surface font-semibold mb-2">
                        <span>Reduce API Latency by 20%</span>
                        <span className="text-primary">40%</span>
                      </div>
                      <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                        <div className="w-[40%] h-full bg-primary"></div>
                      </div>
                      <div className="text-[11px] text-on-surface-variant mt-1">Weightage: 30% • In Progress</div>
                    </div>
                  </div>
                </div>

                {/* Floating Manager Approval Card */}
                <div className="absolute bottom-10 right-0 w-[260px] glass-panel rounded-xl p-4 shadow-2xl animate-float-delayed z-30 border-tertiary/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-tertiary/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-tertiary text-[16px]">verified</span>
                    </div>
                    <div>
                      <div className="text-on-surface font-bold text-[12px]">Manager Review</div>
                      <div className="text-tertiary text-[10px]">Approved</div>
                    </div>
                  </div>
                  <div className="bg-surface-variant/50 p-3 rounded-lg border border-white/5">
                    <p className="text-[11px] text-on-surface-variant italic">"Excellent progress on the launch, keep pushing the latency metrics."</p>
                  </div>
                </div>

                {/* Abstract background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-primary/20 blur-[120px] rounded-full -z-10"></div>
              </div>
            </FadeInView>
          </div>
        </section>

        {/* Tailored Experiences (Roles moved up) */}
        <section id="roles" className="px-lg md:px-xl py-24 bg-surface-dim border-t border-white/5">
          <div className="max-w-[1440px] mx-auto w-full">
            <FadeInView className="text-center mb-16">
              <span className="text-primary font-label-md text-label-md tracking-widest uppercase">Roles</span>
              <h2 className="font-headline-lg text-headline-lg mt-2">Tailored Experiences</h2>
              <p className="text-on-surface-variant font-body-lg text-body-lg mt-4 max-w-2xl mx-auto">A platform that adapts to every level of your organization with dedicated dashboards for everyone.</p>
            </FadeInView>
            <div className="grid md:grid-cols-3 gap-8">
              {/* For Employees */}
              <FadeInView delay={100} className="relative group h-[400px] overflow-hidden rounded-xl border border-white/5 shadow-lg">
                <img className="absolute inset-0 w-full h-full object-cover grayscale opacity-30 group-hover:scale-110 transition-transform duration-700" alt="Employee" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVFUW1aQq99qUcFsFjE5eJeDX6nK0Dthklp6Nulz-SD2n0-swtzO5Fxmg8xS9A0qi7RXhqozfyUL7L1e79n85W5MYtERsBlyPgv6JAQ93h4GbVx22C_ig_QiVzBXNgG58JDi1fqYtmwDRye0Bz71Qgbs0NBYyJiTQgforNYULG7XmvMzKB6o2PjdTDSN7UryxFlRacR1bk56P89S0YX39p0JpdfF8Em90SYDEcG-NJskcrI89i8GFXkaEQ7jePnFWpsMORverUEg" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
                <div className="absolute bottom-0 p-8 w-full z-10">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 border border-primary/30">
                    <span className="material-symbols-outlined text-primary">person</span>
                  </div>
                  <span className="text-primary font-bold text-[13px] tracking-wider uppercase">Employee Role</span>
                  <h3 className="font-headline-md text-headline-md mt-2">Own Your Growth</h3>
                  <p className="text-on-surface-variant text-[15px] mt-3">Submit your personal goals, log quarterly achievements, and showcase your organizational impact.</p>
                </div>
              </FadeInView>
              {/* For Managers */}
              <FadeInView delay={200} className="relative group h-[400px] overflow-hidden rounded-xl border border-white/5 shadow-lg">
                <img className="absolute inset-0 w-full h-full object-cover grayscale opacity-30 group-hover:scale-110 transition-transform duration-700" alt="Manager" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOsAl4f1b03j9tVOcFfwStxZ_nziZkSo7TyxbP8qEkVMT1rrq390sxsVaS5E0keWyZd0pH7O7ikxSWfEDYiQcluGTMEv7aYf49InlaNGy6iq6KYrTvwHgf1tt4jfvJhYRDhTSa795_65MjOOVglalsvF_WLZurXjB8NI2QllQM4vx4F9sRcV36NFArKspgkrdxGpbqB5sDSi9QLZW1UU47f-FztE27gR8_Zj246ZQ_rJqHXn3mZmv9LxzlM1BB-ije4LF3TTKQog" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
                <div className="absolute bottom-0 p-8 w-full z-10">
                  <div className="w-12 h-12 rounded-lg bg-tertiary/20 flex items-center justify-center mb-4 border border-tertiary/30">
                    <span className="material-symbols-outlined text-tertiary">groups</span>
                  </div>
                  <span className="text-tertiary font-bold text-[13px] tracking-wider uppercase">Manager (L1)</span>
                  <h3 className="font-headline-md text-headline-md mt-2">Empower Your Team</h3>
                  <p className="text-on-surface-variant text-[15px] mt-3">Review goal sheets, provide critical feedback, and conduct seamless quarterly check-ins.</p>
                </div>
              </FadeInView>
              {/* For Admins */}
              <FadeInView delay={300} className="relative group h-[400px] overflow-hidden rounded-xl border border-white/5 shadow-lg">
                <img className="absolute inset-0 w-full h-full object-cover grayscale opacity-30 group-hover:scale-110 transition-transform duration-700" alt="Admin" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdoWNBKn7dkoqlIylsp5g-rFqklrI147Qnb6ZiKfjOlX-JMKDgp9aEruiu8r3NF5NVjzonUDcv0zTV7mEd9hR3v5gFb1-BjP45Mt5AUgsQ7FojodQ0X6o7Qagcmjm_F62oLkzh6zxvFu5wwnXsCfyFOFXWITZ2w_peS-IZEAsyI20qKnstL017o89q4uihHYx4eaFsW5GtB8LtBQSV8_vr_kOg5a4JJeIzS7rDsi1six4LqjMxeZSbQ25bxnBwGUpdJyFbl9Yv_A" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
                <div className="absolute bottom-0 p-8 w-full z-10">
                  <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-4 border border-secondary/30">
                    <span className="material-symbols-outlined text-secondary">admin_panel_settings</span>
                  </div>
                  <span className="text-secondary font-bold text-[13px] tracking-wider uppercase">Admin / HR</span>
                  <h3 className="font-headline-md text-headline-md mt-2">Master Governance</h3>
                  <p className="text-on-surface-variant text-[15px] mt-3">Manage evaluation cycles, oversee user roles, and export executive-level audit reports.</p>
                </div>
              </FadeInView>
            </div>
          </div>
        </section>

        {/* Engineered for Excellence (Features) */}
        <section id="features" className="px-lg md:px-xl py-24 bg-surface-container-lowest">
          <div className="max-w-[1440px] mx-auto w-full">
            <FadeInView className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
              <div className="max-w-2xl">
                <span className="text-primary font-label-md text-label-md tracking-widest uppercase">Features</span>
                <h2 className="font-headline-lg text-headline-lg mt-2">Engineered for Excellence</h2>
                <p className="text-on-surface-variant font-body-lg text-body-lg mt-4">A sophisticated toolkit designed to remove friction from enterprise performance management.</p>
              </div>
            </FadeInView>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <FadeInView delay={100} className="p-8 bg-surface-container border border-white/5 rounded-xl hover:border-primary/50 transition-colors shadow-lg hover:-translate-y-1">
                <span className="material-symbols-outlined text-primary mb-6 text-[32px]" data-icon="magic_button">magic_button</span>
                <h4 className="font-headline-md text-headline-md text-body-lg mb-3">Goal Creation</h4>
                <p className="text-on-surface-variant font-body-md text-body-md">Intuitive wizard for setting objectives that guides users through creating ambitious and measurable targets with weightages.</p>
              </FadeInView>
              {/* Feature 2 */}
              <FadeInView delay={200} className="p-8 bg-surface-container border border-white/5 rounded-xl hover:border-primary/50 transition-colors shadow-lg hover:-translate-y-1">
                <span className="material-symbols-outlined text-primary mb-6 text-[32px]" data-icon="approval_delegation">approval_delegation</span>
                <h4 className="font-headline-md text-headline-md text-body-lg mb-3">Manager Approval</h4>
                <p className="text-on-surface-variant font-body-md text-body-md">Automated workflows ensure alignment across departments with one-click approval systems and built-in commenting.</p>
              </FadeInView>
              {/* Feature 3 */}
              <FadeInView delay={300} className="p-8 bg-surface-container border border-white/5 rounded-xl hover:border-primary/50 transition-colors shadow-lg hover:-translate-y-1">
                <span className="material-symbols-outlined text-primary mb-6 text-[32px]" data-icon="calendar_clock">calendar_clock</span>
                <h4 className="font-headline-md text-headline-md text-body-lg mb-3">Quarterly Check-ins</h4>
                <p className="text-on-surface-variant font-body-md text-body-md">Scheduled reflection points built into the system to maintain momentum, capture learnings, and update achievements.</p>
              </FadeInView>
              {/* Feature 4 */}
              <FadeInView delay={100} className="p-8 bg-surface-container border border-white/5 rounded-xl hover:border-primary/50 transition-colors shadow-lg hover:-translate-y-1">
                <span className="material-symbols-outlined text-primary mb-6 text-[32px]" data-icon="groups">groups</span>
                <h4 className="font-headline-md text-headline-md text-body-lg mb-3">Shared Goals</h4>
                <p className="text-on-surface-variant font-body-md text-body-md">Break down silos by aligning cross-functional teams around centralized organizational initiatives and thrust areas.</p>
              </FadeInView>
              {/* Feature 5 */}
              <FadeInView delay={200} className="p-8 bg-surface-container border border-white/5 rounded-xl hover:border-primary/50 transition-colors shadow-lg hover:-translate-y-1">
                <span className="material-symbols-outlined text-primary mb-6 text-[32px]" data-icon="speed">speed</span>
                <h4 className="font-headline-md text-headline-md text-body-lg mb-3">Cycle Management</h4>
                <p className="text-on-surface-variant font-body-md text-body-md">Admins can easily open and close goal setting and quarterly review windows to enforce organizational timelines.</p>
              </FadeInView>
              {/* Feature 6 */}
              <FadeInView delay={300} className="p-8 bg-surface-container border border-white/5 rounded-xl hover:border-primary/50 transition-colors shadow-lg hover:-translate-y-1">
                <span className="material-symbols-outlined text-primary mb-6 text-[32px]" data-icon="shield_person">shield_person</span>
                <h4 className="font-headline-md text-headline-md text-body-lg mb-3">Audit Logs & Security</h4>
                <p className="text-on-surface-variant font-body-md text-body-md">Enterprise-grade tracking of all sensitive operations, ensuring complete transparency and compliance.</p>
              </FadeInView>
            </div>
          </div>
        </section>

        {/* The Strategic Flow (How it works) */}
        <section id="how-it-works" className="px-lg md:px-xl py-24 bg-background border-t border-white/5">
          <div className="max-w-[1440px] mx-auto w-full">
            <FadeInView className="mb-16 text-center">
              <span className="text-primary font-label-md text-label-md tracking-widest uppercase">The Process</span>
              <h2 className="font-headline-lg text-headline-lg mt-2">How Stratify Works</h2>
            </FadeInView>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <FadeInView delay={100} className="glass-panel p-10 rounded-xl relative group">
                <div className="absolute -top-5 left-8 bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center font-bold text-[20px] shadow-[0_0_15px_rgba(59,130,246,0.5)]">1</div>
                <div className="mt-4 space-y-4">
                  <span className="material-symbols-outlined text-primary text-[40px]" data-icon="edit_note">edit_note</span>
                  <h3 className="font-headline-md text-headline-md">Set Goals</h3>
                  <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed">Employees define high-impact objectives. Map them to strategic thrust areas, assign weightages, and set target dates.</p>
                </div>
              </FadeInView>
              {/* Step 2 */}
              <FadeInView delay={200} className="glass-panel p-10 rounded-xl relative">
                <div className="absolute -top-5 left-8 bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center font-bold text-[20px] shadow-[0_0_15px_rgba(59,130,246,0.5)]">2</div>
                <div className="mt-4 space-y-4">
                  <span className="material-symbols-outlined text-primary text-[40px]" data-icon="fact_check">fact_check</span>
                  <h3 className="font-headline-md text-headline-md">Review</h3>
                  <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed">Managers review submitted goal sheets. Built-in feedback loops ensure every goal is aligned before the cycle is locked.</p>
                </div>
              </FadeInView>
              {/* Step 3 */}
              <FadeInView delay={300} className="glass-panel p-10 rounded-xl relative">
                <div className="absolute -top-5 left-8 bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center font-bold text-[20px] shadow-[0_0_15px_rgba(59,130,246,0.5)]">3</div>
                <div className="mt-4 space-y-4">
                  <span className="material-symbols-outlined text-primary text-[40px]" data-icon="insights">insights</span>
                  <h3 className="font-headline-md text-headline-md">Track</h3>
                  <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed">As quarters progress, employees log actual achievements against targets, maintaining a living record of performance.</p>
                </div>
              </FadeInView>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-lg md:px-xl py-32 relative overflow-hidden border-t border-white/5 bg-surface-dim">
          <div className="absolute inset-0 bg-primary/5 -z-10"></div>
          <div className="max-w-[1440px] mx-auto w-full text-center space-y-8">
            <FadeInView>
              <h2 className="font-display-lg text-display-lg max-w-3xl mx-auto">Ready to experience Stratify?</h2>
              <p className="text-on-surface-variant font-body-lg text-body-lg max-w-xl mx-auto mt-4">Build smarter goal tracking, seamless team collaboration, and real-time performance insights with Stratify.</p>
              <div className="flex justify-center gap-4 mt-10">
                <Link to="/login" className="bg-primary text-on-primary px-10 py-4 rounded-lg font-bold text-[16px] hover:scale-105 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]">Enter Portal</Link>
              </div>
            </FadeInView>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background dark:bg-background border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center px-lg md:px-xl py-12 max-w-[1440px] mx-auto w-full gap-6">
          <div className="flex flex-col gap-2 items-center md:items-start">
            <span className="font-headline-md text-headline-md font-bold text-primary">Stratify</span>
          </div>
          <div className="flex gap-8">
            <span className="font-label-md text-label-md text-on-surface-variant">React</span>
            <span className="font-label-md text-label-md text-on-surface-variant">Supabase</span>
            <span className="font-label-md text-label-md text-on-surface-variant">Vercel</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
