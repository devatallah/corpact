import { Head, Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { useState, useEffect, useRef, useCallback } from 'react';

/* ══════════════════════════════════════════════════════════════
   All CSS from the original HTML <style> block, injected via
   dangerouslySetInnerHTML on a <style> tag.
   ══════════════════════════════════════════════════════════════ */
const cssText = `
/* ---------- design tokens ---------- */
:root {
  --ink: #0D120F;
  --ink-2: #1A211D;
  --cream: #F4EFE6;
  --paper: #FBF8F2;
  --paper-2: #F7F2E8;
  --lime: #D2FF3A;
  --lime-soft: #E8FF85;
  --rust: #E8593A;
  --muted: #6B7268;
  --muted-2: #9AA09A;
  --line: #E5DFCF;
  --line-dark: #2A312D;

  --font-ar: 'Almarai', system-ui, -apple-system, sans-serif;
  --font-display: 'Instrument Serif', 'Almarai', 'Times New Roman', serif;
  --font-mono: 'JetBrains Mono', 'Almarai', ui-monospace, monospace;

  --radius-s: 10px;
  --radius-m: 18px;
  --radius-l: 28px;
  --radius-xl: 42px;

  --shadow-sm: 0 1px 2px rgba(13,18,15,.04), 0 2px 8px rgba(13,18,15,.04);
  --shadow-md: 0 8px 24px rgba(13,18,15,.06), 0 2px 6px rgba(13,18,15,.04);
  --shadow-lg: 0 30px 60px -20px rgba(13,18,15,.18), 0 18px 36px -18px rgba(13,18,15,.12);
  --shadow-float: 0 50px 100px -30px rgba(13,18,15,.35), 0 30px 60px -30px rgba(13,18,15,.25);

  --max: 1240px;
  --pad: clamp(20px, 4vw, 56px);
}

/* ---------- base ---------- */
*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  font-family: var(--font-ar);
  background: var(--paper);
  color: var(--ink);
  font-size: 16px;
  line-height: 1.6;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
  direction: rtl;
  text-align: right;
}
img, svg { display: block; max-width: 100%; }
button { font: inherit; cursor: pointer; border: none; background: none; color: inherit; }
a { color: inherit; text-decoration: none; }
:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; border-radius: 6px; }

/* selection */
::selection { background: var(--lime); color: var(--ink); }

/* noise overlay for premium texture */
body::before {
  content: '';
  position: fixed; inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: .035;
  background-image: url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  mix-blend-mode: multiply;
}

/* ---------- typography utilities ---------- */
.eyebrow {
  font-family: var(--font-display);
  font-size: clamp(36px, 5vw, 64px);
  line-height: 1.05;
  letter-spacing: -.01em;
  text-transform: none;
  color: var(--ink);
  font-weight: 400;
  font-style: italic;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 8px;
}
.eyebrow::before {
  content: '';
  width: 12px; height: 12px;
  background: var(--lime);
  border-radius: 50%;
  box-shadow: 0 0 0 6px rgba(210,255,58,.25);
}
.serif-en {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 400;
  letter-spacing: -.01em;
}

/* ---------- container ---------- */
.wrap { max-width: var(--max); margin: 0 auto; padding: 0 var(--pad); }

/* ---------- buttons ---------- */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 22px;
  border-radius: 999px;
  font-weight: 500;
  font-size: 15px;
  transition: transform .25s ease, background .25s ease, color .25s ease, box-shadow .25s ease;
  white-space: nowrap;
}
.btn-primary {
  background: var(--ink);
  color: var(--cream);
}
.btn-primary:hover {
  background: var(--ink-2);
  transform: translateY(-1px);
  box-shadow: 0 14px 30px -10px rgba(13,18,15,.4);
}
.btn-primary .arrow { transition: transform .3s ease; }
.btn-primary:hover .arrow { transform: translateX(-4px); }
.btn-ghost {
  color: var(--ink);
  background: transparent;
  border: 1px solid var(--line);
  background: rgba(255,255,255,.5);
  backdrop-filter: blur(8px);
}
.btn-ghost:hover { background: var(--paper); border-color: var(--ink); }
.btn-lime {
  background: var(--lime);
  color: var(--ink);
}
.btn-lime:hover { background: var(--lime-soft); transform: translateY(-1px); }

/* ---------- NAV ---------- */
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(251,248,242,.72);
  backdrop-filter: saturate(180%) blur(14px);
  -webkit-backdrop-filter: saturate(180%) blur(14px);
  border-bottom: 1px solid transparent;
  transition: border-color .3s ease, background .3s ease;
}
.nav.scrolled { border-bottom-color: var(--line); }
.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px var(--pad);
  max-width: var(--max);
  margin: 0 auto;
}
.logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 22px;
  letter-spacing: -.01em;
}
.logo-mark {
  width: 28px; height: 28px;
  background: var(--ink);
  border-radius: 8px;
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
}
.logo-mark::after {
  content: '';
  position: absolute;
  width: 14px; height: 14px;
  background: var(--lime);
  border-radius: 50%;
  transform: translate(3px, -3px);
}
.logo-mark::before {
  content: '';
  position: absolute;
  width: 10px; height: 10px;
  border: 1.5px solid var(--cream);
  border-radius: 50%;
  z-index: 2;
  transform: translate(-5px, 5px);
}
.nav-links {
  display: flex;
  gap: 4px;
  align-items: center;
}
.nav-link {
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 15px;
  color: var(--muted);
  transition: color .2s ease, background .2s ease;
}
.nav-link:hover { color: var(--ink); background: var(--paper-2); }
.nav-cta { display: flex; gap: 10px; align-items: center; }
.nav-burger {
  display: none;
  width: 40px; height: 40px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: var(--paper);
  align-items: center;
  justify-content: center;
}
.nav-burger span {
  width: 16px; height: 1.5px; background: var(--ink);
  position: relative;
}
.nav-burger span::before, .nav-burger span::after {
  content: ''; position: absolute; right: 0; width: 16px; height: 1.5px; background: var(--ink);
}
.nav-burger span::before { top: -5px; } .nav-burger span::after { top: 5px; }

@media (max-width: 880px) {
  .nav-links, .nav-cta .btn-ghost { display: none; }
  .nav-burger { display: inline-flex; }
}

/* ---------- HERO ---------- */
.hero {
  position: relative;
  padding: clamp(56px, 9vw, 120px) 0 clamp(80px, 10vw, 140px);
  overflow: hidden;
}
.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.hero-bg::before {
  content: '';
  position: absolute;
  top: -10%; right: -10%;
  width: 60vw; height: 60vw; max-width: 800px; max-height: 800px;
  background: radial-gradient(circle at 50% 50%, rgba(210,255,58,.55), rgba(210,255,58,0) 60%);
  filter: blur(20px);
  animation: float 18s ease-in-out infinite;
}
.hero-bg::after {
  content: '';
  position: absolute;
  bottom: -20%; left: -10%;
  width: 50vw; height: 50vw; max-width: 700px; max-height: 700px;
  background: radial-gradient(circle at 50% 50%, rgba(232,89,58,.18), rgba(232,89,58,0) 65%);
  filter: blur(40px);
  animation: float 22s ease-in-out infinite reverse;
}
@keyframes float {
  0%, 100% { transform: translate(0,0) scale(1); }
  50% { transform: translate(-30px, 20px) scale(1.06); }
}

.hero-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.05fr .95fr;
  gap: clamp(40px, 6vw, 80px);
  align-items: center;
}
@media (max-width: 980px) { .hero-grid { grid-template-columns: 1fr; } }

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 6px 6px 14px;
  background: rgba(13,18,15,.04);
  border: 1px solid var(--line);
  border-radius: 999px;
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 28px;
  animation: fadeUp .8s ease both;
}
.hero-tag-badge {
  background: var(--ink);
  color: var(--lime);
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  font-family: var(--font-mono);
  letter-spacing: .05em;
}

h1.hero-title {
  font-size: clamp(40px, 6.8vw, 88px);
  line-height: 1.02;
  letter-spacing: -.025em;
  font-weight: 600;
  margin: 0 0 28px;
}
h1.hero-title .ln {
  display: block;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp .9s cubic-bezier(.2,.7,.2,1) forwards;
}
h1.hero-title .ln:nth-child(1) { animation-delay: .1s; }
h1.hero-title .ln:nth-child(2) { animation-delay: .25s; }
h1.hero-title .serif-en {
  font-size: .9em;
  color: var(--rust);
  display: inline-block;
  padding: 0 .08em;
}
h1.hero-title .underline {
  position: relative;
  white-space: nowrap;
}
h1.hero-title .underline::after {
  content: '';
  position: absolute;
  bottom: .02em;
  right: 0; left: 0;
  height: .42em;
  background: var(--lime);
  z-index: -1;
  border-radius: 4px;
  transform-origin: right;
  animation: highlight 1s .8s cubic-bezier(.2,.7,.2,1) both;
}
@keyframes highlight {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
@keyframes fadeUp {
  to { opacity: 1; transform: translateY(0); }
}

.hero-sub {
  font-size: clamp(16px, 1.6vw, 19px);
  line-height: 1.65;
  color: var(--muted);
  max-width: 540px;
  margin: 0 0 36px;
  opacity: 0;
  animation: fadeUp .9s .55s ease both;
}
.hero-cta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  opacity: 0;
  animation: fadeUp .9s .7s ease both;
}
.hero-meta {
  margin-top: 32px;
  display: flex;
  align-items: center;
  gap: 18px;
  color: var(--muted);
  font-size: 13px;
  opacity: 0;
  animation: fadeUp .9s .85s ease both;
}
.hero-meta-stars { display: inline-flex; gap: 2px; color: var(--ink); }
.hero-meta-dot { width: 4px; height: 4px; background: var(--line); border-radius: 50%; }

/* ---------- hero visual: orbital ---------- */
.hero-visual {
  position: relative;
  height: clamp(400px, 55vw, 560px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero-orbit {
  position: relative;
  width: 100%;
  max-width: 480px;
  aspect-ratio: 1;
}

/* center hub */
.hero-hub {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 96px; height: 96px;
  border-radius: 28px;
  background: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 40px rgba(13,18,15,.2), 0 0 60px rgba(210,255,58,.08);
  z-index: 3;
}

/* orbit rings */
.hero-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid var(--line);
  top: 50%; left: 50%;
}
.hero-ring-1 {
  width: 55%; height: 55%;
  transform: translate(-50%, -50%);
  border-color: rgba(210,255,58,.15);
}
.hero-ring-2 {
  width: 78%; height: 78%;
  transform: translate(-50%, -50%);
  border-color: rgba(232,89,58,.1);
}
.hero-ring-3 {
  width: 100%; height: 100%;
  transform: translate(-50%, -50%);
  border-color: rgba(107,114,104,.1);
}

/* orbiting tracks */
.hero-orbit-track {
  position: absolute;
  border-radius: 50%;
  top: 50%; left: 50%;
  animation: heroSpin 30s linear infinite;
}
.hero-orbit-track-1 {
  width: 55%; height: 55%;
  transform: translate(-50%, -50%);
  animation-duration: 28s;
}
.hero-orbit-track-2 {
  width: 78%; height: 78%;
  transform: translate(-50%, -50%);
  animation-duration: 40s;
  animation-direction: reverse;
}
.hero-orbit-track-3 {
  width: 100%; height: 100%;
  transform: translate(-50%, -50%);
  animation-duration: 55s;
}

@keyframes heroSpin {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

/* orbiting items */
.hero-orb {
  position: absolute;
  width: 44px; height: 44px;
  border-radius: 13px;
  background: var(--paper);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transform: translate(-50%, -50%);
  /* counter-rotate to stay upright */
  animation: heroCounterSpin 28s linear infinite;
}
.hero-orbit-track-2 .hero-orb { animation-duration: 40s; animation-direction: reverse; }
.hero-orbit-track-3 .hero-orb { animation-duration: 55s; }
.hero-orb.lg { width: 52px; height: 52px; border-radius: 16px; font-size: 24px; background: var(--cream); }
.hero-orb.sm { width: 38px; height: 38px; border-radius: 10px; font-size: 16px; }

@keyframes heroCounterSpin {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(-360deg); }
}

/* portal labels */
.hero-portal-label {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 999px;
  background: var(--paper);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-sm);
  font-size: 12px;
  font-weight: 600;
  color: var(--ink);
  white-space: nowrap;
  z-index: 2;
  animation: floatLabel 6s ease-in-out infinite;
}
.hero-portal-label:nth-child(5) { animation-delay: 0s; }
.hero-portal-label:nth-child(6) { animation-delay: 2s; }
.hero-portal-label:nth-child(7) { animation-delay: 4s; }
.hero-pl-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
}
@keyframes floatLabel {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

@media (max-width: 980px) {
  .hero-visual { height: 400px; }
  .hero-orbit { max-width: 360px; }
  .hero-portal-label { font-size: 10px; padding: 6px 12px; }
  .hero-orb { width: 36px; height: 36px; font-size: 16px; border-radius: 10px; }
  .hero-orb.lg { width: 42px; height: 42px; font-size: 20px; }
  .hero-orb.sm { width: 30px; height: 30px; font-size: 14px; }
  .hero-hub { width: 72px; height: 72px; border-radius: 22px; }
  .hero-hub .logo-mark { width: 36px !important; height: 36px !important; }
}

/* ---------- section base ---------- */
section { position: relative; }
.section-pad { padding: clamp(80px, 10vw, 140px) 0; }
.section-head {
  max-width: 720px;
  margin: 0 auto 64px;
  text-align: center;
}
.section-head.start { text-align: right; margin: 0 0 64px; }
.section-title {
  font-size: clamp(32px, 4.4vw, 56px);
  line-height: 1.08;
  letter-spacing: -.02em;
  font-weight: 600;
  margin: 14px 0 18px;
}
.section-sub {
  color: var(--muted);
  font-size: clamp(16px, 1.4vw, 18px);
  line-height: 1.65;
  max-width: 560px;
  margin: 0 auto;
}
.section-head.start .section-sub { margin: 0; }

/* ---------- what-we-have section ---------- */
.wwh { background: var(--ink); color: var(--cream); overflow: hidden; }
.wwh .section-title { color: var(--cream); }
.wwh .section-sub { color: var(--muted-2); }
.wwh .eyebrow { color: var(--lime); }
.wwh .eyebrow::before { background: var(--lime); }
.wwh-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 64px;
}
@media (max-width: 880px) { .wwh-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .wwh-grid { grid-template-columns: 1fr; } }
.wwh-card {
  background: var(--ink-2);
  border: 1px solid var(--line-dark);
  border-radius: var(--radius-m);
  padding: 28px 24px;
  transition: transform .3s, border-color .3s, box-shadow .3s;
  position: relative;
  overflow: hidden;
}
.wwh-card:hover {
  transform: translateY(-4px);
  border-color: rgba(210,255,58,.2);
  box-shadow: 0 16px 40px rgba(0,0,0,.3);
}
.wwh-card::before {
  content: '';
  position: absolute; top: 0; right: 0;
  width: 80px; height: 80px;
  background: radial-gradient(circle, rgba(210,255,58,.06) 0%, transparent 70%);
  pointer-events: none;
}
.wwh-icon {
  width: 48px; height: 48px;
  border-radius: 12px;
  background: rgba(210,255,58,.08);
  border: 1px solid rgba(210,255,58,.12);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px;
  margin-bottom: 18px;
}
.wwh-card h3 {
  font-size: 17px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--cream);
}
.wwh-card p {
  font-size: 14px;
  line-height: 1.7;
  color: var(--muted-2);
  margin: 0;
}
.wwh-tag {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .08em;
  padding: 3px 10px;
  border-radius: 20px;
  margin-top: 14px;
}
.wwh-tag.emp { background: rgba(0,158,130,.12); color: #4ADE80; }
.wwh-tag.biz { background: rgba(232,89,58,.12); color: #FB923C; }
.wwh-tag.co { background: rgba(59,91,219,.12); color: #93C5FD; }
.wwh-tag.all { background: rgba(210,255,58,.1); color: var(--lime); }

/* ---------- problem section ---------- */
.problem {
  background: var(--cream);
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}
.problem-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: clamp(40px, 6vw, 80px);
  align-items: center;
}
@media (max-width: 880px) { .problem-grid { grid-template-columns: 1fr; } }

.problem-quote {
  font-size: clamp(28px, 3.6vw, 44px);
  line-height: 1.25;
  letter-spacing: -.02em;
  font-weight: 500;
}
.problem-quote .serif-en { color: var(--rust); }
.problem-quote .mark { background: var(--lime); padding: 0 .15em; border-radius: 4px; }

.problem-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--line); border-radius: var(--radius-l); overflow: hidden; }
.problem-stat {
  background: var(--paper);
  padding: 32px 28px;
}
.problem-stat-n {
  font-family: var(--font-display);
  font-size: clamp(54px, 6vw, 78px);
  line-height: 1;
  letter-spacing: -.03em;
  font-weight: 400;
}
.problem-stat-n.italic { font-style: italic; color: var(--rust); }
.problem-stat-t {
  margin-top: 14px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.55;
}
.problem-cite {
  grid-column: 1 / -1;
  background: var(--paper);
  padding: 16px 28px;
  font-size: 11px;
  color: var(--muted-2);
  font-family: var(--font-mono);
}

/* ---------- portals (the three logins) ---------- */
.portals { background: var(--paper); }
.portal-tabs {
  display: inline-flex;
  background: var(--cream);
  padding: 6px;
  border-radius: 999px;
  border: 1px solid var(--line);
  margin: 0 auto 48px;
}
.portal-tabs-wrap { text-align: center; }
.portal-tab {
  padding: 10px 22px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  color: var(--muted);
  transition: all .25s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  position: relative;
}
.portal-tab.active {
  background: var(--ink);
  color: var(--cream);
}
.portal-tab-num {
  font-family: var(--font-mono);
  font-size: 10px;
  opacity: .6;
}

.portal-panel {
  display: none;
  animation: panelIn .4s ease;
}
.portal-panel.active { display: block; }
@keyframes panelIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ---------- HR benefits grid ---------- */
.benefits { background: var(--paper); }
.benefits-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
@media (max-width: 880px) { .benefits-grid { grid-template-columns: 1fr; } }
.benefit {
  background: var(--cream);
  border: 1px solid var(--line);
  border-radius: var(--radius-l);
  padding: 32px;
  position: relative;
  overflow: hidden;
  transition: transform .35s ease, box-shadow .35s ease;
}
.benefit:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
.benefit.big {
  grid-column: span 2;
  background: var(--ink);
  color: var(--cream);
}
@media (max-width: 880px) { .benefit.big { grid-column: span 1; } }
.benefit-ic {
  width: 44px; height: 44px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 12px;
  display: grid;
  place-items: center;
  margin-bottom: 20px;
}
.benefit.big .benefit-ic { background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.1); }
.benefit-ic svg { width: 22px; height: 22px; }
.benefit-h { font-size: 19px; font-weight: 600; letter-spacing: -.01em; margin: 0 0 10px; }
.benefit.big .benefit-h { font-size: 28px; }
.benefit-p { color: var(--muted); font-size: 14px; line-height: 1.6; margin: 0; }
.benefit.big .benefit-p { color: var(--muted-2); font-size: 16px; }
.benefit.big .benefit-feat-list {
  list-style: none;
  padding: 0;
  margin: 24px 0 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.benefit.big .benefit-feat-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}
.benefit.big .benefit-feat-list li::before {
  content: '';
  width: 16px; height: 16px;
  background: var(--lime);
  border-radius: 50%;
  flex-shrink: 0;
}

/* ---------- journey section ---------- */
.journey-sec { background: var(--paper); position: relative; overflow: hidden; }
.journey-sec::before {
  content: '';
  position: absolute;
  top: 30%;
  right: -200px;
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(210,255,58,.2), transparent 65%);
  filter: blur(40px);
  pointer-events: none;
}
.journey-sec::after {
  content: '';
  position: absolute;
  bottom: 10%;
  left: -200px;
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(232,89,58,.1), transparent 65%);
  filter: blur(40px);
  pointer-events: none;
}
.journey {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: clamp(60px, 8vw, 100px);
}

/* ----- journey slider ----- */
.journey-slider { display: block; }
.journey-viewport { overflow: hidden; width: 100%; }
.journey-track {
  display: flex;
  direction: rtl;
  transition: transform .65s cubic-bezier(.2,.7,.2,1);
  will-change: transform;
}
.journey-track > .journey-step {
  flex: 0 0 100%;
  min-width: 0;
  width: 100%;
  direction: rtl;
  opacity: 1 !important;
  transform: none !important;
}
.journey-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin-top: 56px;
  flex-wrap: wrap;
}
.journey-btn {
  width: 54px; height: 54px;
  border-radius: 50%;
  background: var(--ink);
  color: var(--cream);
  display: inline-flex; align-items: center; justify-content: center;
  transition: transform .2s ease, opacity .2s ease, background .2s ease;
  border: none;
}
.journey-btn:hover:not(:disabled) { transform: scale(1.08); background: var(--ink-2); }
.journey-btn:disabled { opacity: .25; cursor: not-allowed; }
.journey-counter {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--muted);
  letter-spacing: .08em;
  min-width: 64px;
  text-align: center;
}
.journey-dots { display: flex; gap: 8px; align-items: center; }
.journey-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--line);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all .3s ease;
}
.journey-dot.active { background: var(--ink); width: 28px; border-radius: 6px; }

/* journey step layout */
.journey-step {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(40px, 6vw, 80px);
  align-items: center;
  opacity: 1;
  transform: none;
  position: relative;
}
.journey-step.alt > .journey-content { order: 2; }
.journey-step.alt > .journey-mock { order: 1; }
@media (max-width: 880px) {
  .journey-step, .journey-step.alt { grid-template-columns: 1fr; }
  .journey-step > .journey-content, .journey-step.alt > .journey-content { order: 2; }
  .journey-step > .journey-mock, .journey-step.alt > .journey-mock { order: 1; }
}

.journey-content { max-width: 460px; }
.journey-num {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}
.journey-num-n {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 64px;
  line-height: 1;
  color: var(--ink);
  letter-spacing: -.03em;
  position: relative;
}
.journey-num-n::after {
  content: '';
  position: absolute;
  bottom: 4px;
  right: 0; left: 0;
  height: 8px;
  background: var(--lime);
  z-index: -1;
  border-radius: 2px;
}
.journey-num-l {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted);
  letter-spacing: .12em;
  padding-bottom: 6px;
}
.journey-h {
  font-size: clamp(26px, 3.2vw, 38px);
  line-height: 1.15;
  letter-spacing: -.02em;
  font-weight: 600;
  margin: 0 0 16px;
}
.journey-p {
  font-size: 16px;
  line-height: 1.65;
  color: var(--muted);
  margin: 0 0 22px;
}
.journey-feat {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.journey-feat li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  color: var(--ink);
}
.journey-feat li::before {
  content: '';
  width: 16px; height: 16px;
  flex-shrink: 0;
  margin-top: 4px;
  background: var(--lime);
  border-radius: 50%;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none'><path d='M3 8.5L6.5 12L13 5' stroke='%230D120F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>");
  background-size: contain;
}
.journey-mock { display: flex; justify-content: center; }

/* journey visual highlight cards */
.journey-visual {
  width: 100%;
  min-height: 320px;
  border-radius: var(--radius-l);
  background: linear-gradient(135deg, var(--ink) 0%, var(--ink-2) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
}
.journey-visual::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 40%, rgba(210,255,58,.08) 0%, transparent 60%),
              radial-gradient(circle at 70% 60%, rgba(232,89,58,.06) 0%, transparent 50%);
}
.journey-visual-num {
  font-family: var(--font-mono);
  font-size: 80px;
  font-weight: 700;
  color: rgba(210,255,58,.15);
  line-height: 1;
  position: relative;
}
.journey-visual-icon {
  font-size: 64px;
  position: relative;
  animation: float 6s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
@media (max-width: 768px) {
  .journey-visual { min-height: 220px; }
  .journey-visual-num { font-size: 56px; }
  .journey-visual-icon { font-size: 48px; }
}

/* ---------- final CTA ---------- */
.cta {
  padding: clamp(64px, 8vw, 110px) 0;
  text-align: center;
}
.cta-card {
  background: var(--ink);
  color: var(--cream);
  border-radius: clamp(24px, 4vw, 48px);
  padding: clamp(48px, 7vw, 90px) clamp(28px, 5vw, 60px);
  position: relative;
  overflow: hidden;
}
.cta-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 80% 20%, rgba(210,255,58,.2), transparent 50%),
    radial-gradient(circle at 20% 80%, rgba(232,89,58,.15), transparent 50%);
  pointer-events: none;
}
.cta-content { position: relative; max-width: 720px; margin: 0 auto; }
.cta h2 {
  font-size: clamp(36px, 5.5vw, 64px);
  line-height: 1.05;
  letter-spacing: -.02em;
  font-weight: 600;
  margin: 14px 0 18px;
}
.cta h2 .serif-en { color: var(--lime); }
.cta p { color: var(--muted-2); font-size: 17px; max-width: 480px; margin: 0 auto 32px; line-height: 1.6; }
.cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.cta-card .eyebrow { color: var(--lime); justify-content: center; display: flex; }
.cta-card .eyebrow::before { background: var(--lime); }

/* ---------- FAQ ---------- */
.faq { background: var(--paper); }
.faq-list {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.faq-item {
  background: var(--cream);
  border: 1px solid var(--line);
  border-radius: 18px;
  overflow: hidden;
  transition: background .3s ease;
}
.faq-item:hover { background: var(--paper-2); }
.faq-item.open { background: var(--paper); }
.faq-q {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 26px;
  width: 100%;
  text-align: right;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -.01em;
}
.faq-q-i {
  width: 26px; height: 26px;
  border-radius: 50%;
  background: var(--paper);
  border: 1px solid var(--line);
  display: grid;
  place-items: center;
  transition: transform .35s ease, background .3s ease;
  flex-shrink: 0;
  margin-left: 14px;
}
.faq-item.open .faq-q-i { background: var(--ink); color: var(--lime); transform: rotate(45deg); }
.faq-a {
  max-height: 0;
  overflow: hidden;
  transition: max-height .4s ease, padding .4s ease;
  padding: 0 26px;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.65;
}
.faq-item.open .faq-a { max-height: 400px; padding: 0 26px 24px; }

/* ---------- STICKY MOBILE CTA ---------- */
.sticky-cta {
  position: fixed;
  bottom: 16px;
  left: 16px;
  right: 16px;
  z-index: 90;
  background: var(--ink);
  color: var(--cream);
  border-radius: 999px;
  padding: 6px 20px 6px 6px;
  display: none;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 20px 40px -10px rgba(13,18,15,.4);
  transform: translateY(120%);
  transition: transform .4s cubic-bezier(.2,.7,.2,1);
}
.sticky-cta.visible { transform: translateY(0); }
.sticky-cta-t { display: flex; flex-direction: column; }
.sticky-cta-l { font-size: 11px; color: var(--lime); font-family: var(--font-mono); letter-spacing: .05em; }
.sticky-cta-s { font-size: 13px; font-weight: 500; }
.sticky-cta-b {
  background: var(--lime);
  color: var(--ink);
  padding: 10px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
@media (max-width: 880px) { .sticky-cta { display: flex; } }

/* ---------- footer ---------- */
.footer {
  background: var(--paper);
  border-top: 1px solid var(--line);
  padding: 64px 0 32px;
}
.footer-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1fr;
  gap: 40px;
  margin-bottom: 60px;
}
@media (max-width: 880px) { .footer-grid { grid-template-columns: 1fr 1fr; } .footer-brand { grid-column: 1 / -1; } }

.footer-brand h3 {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -.01em;
  margin: 12px 0 14px;
  max-width: 320px;
  line-height: 1.2;
}
.footer-brand p { color: var(--muted); max-width: 320px; font-size: 14px; margin: 0 0 18px; }
.footer-social { display: flex; gap: 8px; }
.footer-social a {
  width: 38px; height: 38px;
  border-radius: 10px;
  border: 1px solid var(--line);
  display: grid;
  place-items: center;
  background: var(--cream);
  transition: background .2s, color .2s;
}
.footer-social a:hover { background: var(--ink); color: var(--lime); }
.footer-social svg { width: 16px; height: 16px; }

.footer-col h4 {
  font-size: 12px;
  font-family: var(--font-mono);
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 500;
  margin: 0 0 18px;
}
.footer-col ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.footer-col li a { font-size: 14px; color: var(--ink); transition: color .2s; }
.footer-col li a:hover { color: var(--rust); }

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  border-top: 1px solid var(--line);
  font-size: 12px;
  color: var(--muted);
  flex-wrap: wrap;
  gap: 14px;
}
.footer-bottom-l { display: flex; gap: 18px; align-items: center; }
.footer-mark {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 20px;
  color: var(--ink);
}

/* ---------- reveal animations ---------- */
.reveal { opacity: 0; transform: translateY(24px); transition: opacity .9s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1); }
.reveal.in { opacity: 1; transform: translateY(0); }
.reveal-stagger > * { opacity: 0; transform: translateY(16px); transition: opacity .8s ease, transform .8s ease; }
.reveal-stagger.in > * { opacity: 1; transform: translateY(0); }
.reveal-stagger.in > *:nth-child(1) { transition-delay: 0s; }
.reveal-stagger.in > *:nth-child(2) { transition-delay: .08s; }
.reveal-stagger.in > *:nth-child(3) { transition-delay: .16s; }
.reveal-stagger.in > *:nth-child(4) { transition-delay: .24s; }
.reveal-stagger.in > *:nth-child(5) { transition-delay: .32s; }
.reveal-stagger.in > *:nth-child(6) { transition-delay: .4s; }

/* ---------- mobile nav drawer ---------- */
.mobile-drawer {
  position: fixed; inset: 0;
  background: var(--paper);
  z-index: 200;
  padding: 80px var(--pad) 40px;
  transform: translateX(-100%);
  transition: transform .35s cubic-bezier(.2,.7,.2,1);
  display: flex;
  flex-direction: column;
}
.mobile-drawer.open { transform: translateX(0); }
.mobile-drawer-close {
  position: absolute;
  top: 18px;
  left: var(--pad);
  right: auto;
  width: 40px; height: 40px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: var(--cream);
}
.mobile-drawer-links { display: flex; flex-direction: column; gap: 4px; margin-top: 20px; }
.mobile-drawer-links a {
  padding: 18px 0;
  font-size: 24px;
  font-weight: 500;
  border-bottom: 1px solid var(--line);
  letter-spacing: -.01em;
}
.mobile-drawer-cta { margin-top: auto; display: flex; flex-direction: column; gap: 10px; }
.mobile-drawer-cta .btn { justify-content: center; }

/* ---------- reduced motion ---------- */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
`;

/* ══════════════════════════════════════════════════════════════
   Journey Slider — a reusable component that wraps
   the 6-step slider UI with prev/next/dots controls.
   ══════════════════════════════════════════════════════════════ */
function JourneySlider({ children, total }: { children: React.ReactNode; total: number }) {
    const [idx, setIdx] = useState(0);
    const pad = (n: number) => String(n).padStart(2, '0');

    return (
        <div className="journey journey-slider">
            <div className="journey-viewport">
                <div className="journey-track" style={{ transform: `translateX(${idx * 100}%)` }}>
                    {children}
                </div>
            </div>
            <div className="journey-controls" role="group" aria-label="تنقل بين الخطوات">
                <button className="journey-btn journey-prev" aria-label="الخطوة السابقة" disabled={idx === 0} onClick={() => setIdx(i => Math.max(0, i - 1))}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <div className="journey-counter">{pad(idx + 1)} / {pad(total)}</div>
                <div className="journey-dots">
                    {Array.from({ length: total }).map((_, i) => (
                        <button key={i} className={`journey-dot${i === idx ? ' active' : ''}`} aria-label={`الخطوة ${i + 1}`} onClick={() => setIdx(i)} />
                    ))}
                </div>
                <button className="journey-btn journey-next" aria-label="الخطوة التالية" disabled={idx === total - 1} onClick={() => setIdx(i => Math.min(total - 1, i + 1))}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   Phone status bar icons (reused across journey steps)
   ══════════════════════════════════════════════════════════════ */
function PhBarIcons() {
    return (
        <div className="ph-bar-icons">
            <svg width="14" height="10" viewBox="0 0 14 10"><rect x="0" y="6" width="2" height="4" fill="currentColor" /><rect x="3" y="4" width="2" height="6" fill="currentColor" /><rect x="6" y="2" width="2" height="8" fill="currentColor" /><rect x="9" y="0" width="2" height="10" fill="currentColor" /></svg>
            <svg width="18" height="10" viewBox="0 0 18 10"><rect x="0" y="0" width="16" height="10" rx="2" fill="none" stroke="currentColor" /><rect x="2" y="2" width="13" height="6" fill="currentColor" /></svg>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   FAQ Item component (accordion)
   ══════════════════════════════════════════════════════════════ */
function FaqItem({ q, a, open, onClick }: { q: string; a: string; open: boolean; onClick: () => void }) {
    return (
        <div className={`faq-item${open ? ' open' : ''}`}>
            <button className="faq-q" onClick={onClick}>
                <span>{q}</span>
                <span className="faq-q-i">
                    <svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 1V9M1 5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </span>
            </button>
            <div className="faq-a">{a}</div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   Main Welcome component
   ══════════════════════════════════════════════════════════════ */
export default function Welcome() {
    const [navScrolled, setNavScrolled] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activePortal, setActivePortal] = useState<'employee' | 'hr' | 'club'>('employee');
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [stickyVisible, setStickyVisible] = useState(false);
    const heroRef = useRef<HTMLElement>(null);

    // Nav scroll effect
    useEffect(() => {
        const onScroll = () => setNavScrolled(window.scrollY > 12);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Reveal on scroll
    useEffect(() => {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('in');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));
        return () => io.disconnect();
    }, [activePortal]);

    // Sticky mobile CTA
    useEffect(() => {
        if (!heroRef.current) return;
        const ctaIO = new IntersectionObserver((entries) => {
            entries.forEach(e => setStickyVisible(!e.isIntersecting));
        }, { threshold: 0.1 });
        ctaIO.observe(heroRef.current);
        return () => ctaIO.disconnect();
    }, []);

    // Close drawer when clicking anchor links
    const closeDrawer = useCallback(() => setDrawerOpen(false), []);

    const portalTabs: { key: 'employee' | 'hr' | 'club'; num: string; label: string }[] = [
        { key: 'employee', num: '01', label: 'الموظف' },
        { key: 'hr', num: '02', label: 'الشركة' },
        { key: 'club', num: '03', label: 'النادي' },
    ];

    const faqData = [
        { q: 'كم من الوقت يستغرق إطلاق تيمات في شركتي؟', a: 'من توقيع العقد إلى المباراة الأولى لموظفيك، المتوسط هو 5 أيام عمل. شركات بحجم 250 موظف انطلقت في 48 ساعة. نوفر فريق Onboarding مخصص يتولّى استيراد قائمة الموظفين، تخصيص الهوية، وإعداد قواعد الدعم الميزانية.' },
        { q: 'هل بيانات موظفينا محفوظة داخل المملكة؟', a: 'نعم. جميع بيانات تيمات مستضافة في مراكز بيانات داخل المملكة (الرياض والدمام) بالتوافق مع نظام حماية البيانات الشخصية (PDPL) ومعايير SDAIA. للعملاء المؤسسيين نوفر خيار منطقة بيانات معزولة مع تقارير وصول تفصيلية.' },
        { q: 'كيف يعمل دعم الميزانية للموظفين؟', a: 'تحدّد قواعد الدعم بنفسك من لوحة HR — نسبة مئوية، مبلغ ثابت، أو حدود شهرية. يمكن أن تختلف القواعد حسب القسم أو المسمى الوظيفي. عند الحجز، يُخصم الدعم تلقائياً قبل أن يدفع الموظف نصيبه. كل ريال مصروف مرئي في التقارير لحظياً.' },
        { q: 'ما هي النوادي والرياضات المتاحة؟', a: 'أكثر من 240 ناديًا شريكًا في 20 مدينة، تغطّي البادل، التنس، كرة القدم، السلة، الكروسفت، السباحة، والركوب. الشبكة تتوسّع بشكل أسبوعي. يمكن لشركتك أيضاً ضمّ ناديها المفضّل إلى الشبكة عبر فريق الشراكات.' },
        { q: 'كيف يتم تنظيم البطولات بين الأقسام؟', a: 'من لوحة الشركة، تختار نوع البطولة (دوري، إقصائي، أو جولة واحدة)، تحدد الأقسام المشاركة، والنظام يولّد الجداول والمباريات تلقائياً. النتائج والترتيب يتحدثان مباشرة بعد كل مباراة، ويمكن للموظفين متابعة كل شيء من بوابتهم.' },
        { q: 'هل يمكن إلغاء الاشتراك في أي وقت؟', a: 'نعم، بدون عقود طويلة الأمد. الفوترة شهرية أو سنوية حسب اختيارك. تقدر تلغي بإشعار 30 يوم وتحصل على بياناتك كاملة. نعتقد أن أفضل علاقات الأعمال تُبنى على الاختيار، لا الالتزام.' },
    ];

    return (
        <>
            <Head title="تيمات — زملاء في المكتب، فريق في الملعب">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
            </Head>
            <style dangerouslySetInnerHTML={{ __html: cssText }} />

            {/* ========== NAV ========== */}
            <nav className={`nav${navScrolled ? ' scrolled' : ''}`}>
                <div className="nav-inner">
                    <Link href="/" className="logo" aria-label="تيمات">
                        <span className="logo-mark"></span>
                        <span>تيمات</span>
                    </Link>
                    <div className="nav-links">
                        <a className="nav-link" href="#">الرئيسية</a>
                        <a className="nav-link" href="#benefits">للشركات</a>
                        <a className="nav-link" href="#portals">المنصة</a>
                        <a className="nav-link" href="#wwh">ماذا نقدّم</a>
                        <a className="nav-link" href="#cta">ابدأ الآن</a>
                        <a className="nav-link" href="#faq">أسئلة شائعة</a>
                    </div>
                    <div className="nav-cta">
                        <Link href="/employee/login" className="btn btn-primary">تسجيل دخول</Link>
                        <button className="nav-burger" aria-label="القائمة" onClick={() => setDrawerOpen(true)}><span></span></button>
                    </div>
                </div>
            </nav>

            {/* mobile drawer */}
            <div className={`mobile-drawer${drawerOpen ? ' open' : ''}`}>
                <button className="mobile-drawer-close" aria-label="إغلاق" onClick={closeDrawer}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
                <div className="mobile-drawer-links">
                    <a href="#" onClick={closeDrawer}>الرئيسية</a>
                    <a href="#benefits" onClick={closeDrawer}>للشركات</a>
                    <a href="#portals" onClick={closeDrawer}>المنصة</a>
                    <a href="#wwh" onClick={closeDrawer}>ماذا نقدّم</a>
                    <a href="#cta" onClick={closeDrawer}>ابدأ الآن</a>
                    <a href="#faq" onClick={closeDrawer}>أسئلة شائعة</a>
                </div>
                <div className="mobile-drawer-cta">
                    <Link href="/employee/login" className="btn btn-primary" onClick={closeDrawer}>تسجيل دخول</Link>
                </div>
            </div>

            {/* ========== HERO ========== */}
            <header className="hero" ref={heroRef}>
                <div className="hero-bg"></div>
                <div className="wrap hero-grid">
                    <div>
                        <h1 className="hero-title">
                            <span className="ln">زملاءُ في المكتب،</span>
                            <span className="ln"><span className="underline">فريقٌ في الملعب</span><span className="serif-en">.</span></span>
                        </h1>
                        <p className="hero-sub">
                            تيمات هي المنصّة المؤسسية الأولى التي تربط شركتك بأفضل النوادي الرياضية في المملكة. حجوزات جماعية، فعاليات للموظفين، ومجتمع رياضي حقيقي يعيش داخل بيئة العمل — بلوحة تحكّم واحدة لإدارة الموارد البشرية.
                        </p>
                        <div className="hero-cta">
                            <a href="#portals" className="btn btn-ghost">
                                استكشف المنصة
                            </a>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="hero-orbit">
                            {/* Center hub */}
                            <div className="hero-hub">
                                <span className="logo-mark" style={{ width: 48, height: 48, borderRadius: 14 }}></span>
                            </div>

                            {/* Orbit rings */}
                            <div className="hero-ring hero-ring-1"></div>
                            <div className="hero-ring hero-ring-2"></div>
                            <div className="hero-ring hero-ring-3"></div>

                            {/* Orbiting sport icons */}
                            <div className="hero-orbit-track hero-orbit-track-1">
                                <span className="hero-orb" style={{ top: '0%', left: '50%' }}>⚽</span>
                                <span className="hero-orb" style={{ top: '50%', left: '100%' }}>🎾</span>
                                <span className="hero-orb" style={{ top: '100%', left: '50%' }}>🏸</span>
                            </div>
                            <div className="hero-orbit-track hero-orbit-track-2">
                                <span className="hero-orb lg" style={{ top: '15%', left: '95%' }}>🏆</span>
                                <span className="hero-orb lg" style={{ top: '85%', left: '5%' }}>📅</span>
                            </div>
                            <div className="hero-orbit-track hero-orbit-track-3">
                                <span className="hero-orb sm" style={{ top: '5%', left: '20%' }}>🏀</span>
                                <span className="hero-orb sm" style={{ top: '75%', left: '90%' }}>💳</span>
                                <span className="hero-orb sm" style={{ top: '40%', left: '2%' }}>👥</span>
                            </div>

                            {/* Portal labels floating */}
                            <div className="hero-portal-label" style={{ top: '18%', right: '-10%' }}>
                                <span className="hero-pl-dot" style={{ background: 'var(--lime)' }}></span>
                                الموظف
                            </div>
                            <div className="hero-portal-label" style={{ bottom: '22%', right: '-5%' }}>
                                <span className="hero-pl-dot" style={{ background: 'var(--rust)' }}></span>
                                المنشأة
                            </div>
                            <div className="hero-portal-label" style={{ bottom: '10%', left: '-5%' }}>
                                <span className="hero-pl-dot" style={{ background: '#6C8CFF' }}></span>
                                الشركة
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ========== PROBLEM ========== */}
            <section className="problem section-pad">
                <div className="wrap">
                    <div className="problem-grid">
                        <div className="reveal">
                            <p className="problem-quote" style={{ marginTop: 18 }}>
                                <span className="mark">72٪ من الموظفين</span> يقولون إنهم يرغبون في ممارسة الرياضة مع زملائهم — لكن لا أحد يبدأ أولاً<span className="serif-en">.</span>
                            </p>
                        </div>
                        <div className="problem-stats reveal">
                            <div className="problem-stat">
                                <div className="problem-stat-n">64<span className="serif-en italic" style={{ fontSize: '.7em' }}>٪</span></div>
                                <p className="problem-stat-t">من الموظفين السعوديين يشعرون بانفصال اجتماعي عن زملاء العمل</p>
                            </div>
                            <div className="problem-stat">
                                <div className="problem-stat-n italic">2.4×</div>
                                <p className="problem-stat-t">الفرق في الإنتاجية بين الفرق المتماسكة وغيرها</p>
                            </div>
                            <div className="problem-stat">
                                <div className="problem-stat-n">38<span className="serif-en italic" style={{ fontSize: '.7em' }}>٪</span></div>
                                <p className="problem-stat-t">انخفاض في معدّل دوران الموظفين عند توفّر برامج تفاعلية</p>
                            </div>
                            <div className="problem-stat">
                                <div className="problem-stat-n italic">12h</div>
                                <p className="problem-stat-t">يقضيها فريق HR في تنسيق فعالية رياضية واحدة يدوياً</p>
                            </div>
                            <div className="problem-cite">المصدر: Gallup MENA Workplace Report 2025 · أبحاث تيمات الداخلية، الرياض 2026</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== BENEFITS ========== */}
            <section className="benefits section-pad" id="benefits">
                <div className="wrap">
                    <div className="section-head reveal">
                        <div className="eyebrow">للشركات والموارد البشرية</div>
                        <h2 className="section-title">لماذا تتبنّى الشركات الرائدة <span className="serif-en">teamat</span>.</h2>
                        <p className="section-sub">برنامج عافية حقيقي يقاس بالأرقام، يربط فرقك بدون عناء، ويُحرّر فريق HR من الفعاليات الورقية.</p>
                    </div>

                    <div className="benefits-grid reveal-stagger">
                        <div className="benefit big">
                            <div className="benefit-ic">
                                <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6V12C4 17.5 7.4 22.1 12 23C16.6 22.1 20 17.5 20 12V6L12 2Z" stroke="currentColor" strokeWidth="1.5" /><path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                            </div>
                            <h3 className="benefit-h">برنامج عافية مؤسسي مكتمل، في أسبوع.</h3>
                            <p className="benefit-p">انطلق بدون فريق بناء داخلي. تيمات تأتي جاهزة بالنوادي، الموظفين، الأنظمة، والتقارير — لتقدّم أثراً ملموساً من اليوم الأول.</p>
                            <ul className="benefit-feat-list"><li>تكامل HRIS</li><li>تقارير ذكية</li><li>دعم متخصص</li><li>ميزانية مرنة</li></ul>
                        </div>
                        <div className="benefit">
                            <div className="benefit-ic">
                                <svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M3 21V19C3 17 5 15 9 15C13 15 15 17 15 19V21" stroke="currentColor" strokeWidth="1.5" /><circle cx="17" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" /><path d="M21 21V19C21 17 19 15 16 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                            </div>
                            <h3 className="benefit-h">مجتمع داخلي، طبيعي.</h3>
                            <p className="benefit-p">دوريات وفرق وقوائم تصنيف تخلق محادثات حقيقية بين الأقسام — بدون اجتماعات إجبارية.</p>
                        </div>
                        <div className="benefit">
                            <div className="benefit-ic">
                                <svg viewBox="0 0 24 24" fill="none"><path d="M3 12L7 8L11 12L17 6L21 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 6V10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 19H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                            </div>
                            <h3 className="benefit-h">عائد قابل للقياس.</h3>
                            <p className="benefit-p">انخفاض في الغياب، ارتفاع في eNPS، وبيانات حقيقية لتقارير مجلس الإدارة.</p>
                        </div>
                        <div className="benefit">
                            <div className="benefit-ic">
                                <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M3 9H21" stroke="currentColor" strokeWidth="1.5" /><path d="M7 14H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                            </div>
                            <h3 className="benefit-h">ميزانية بدعم ذكي.</h3>
                            <p className="benefit-p">قواعد دعم مخصصة لكل قسم أو فئة، مع رؤية فورية لكل ريال مصروف.</p>
                        </div>
                        <div className="benefit">
                            <div className="benefit-ic">
                                <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6V12C4 17.5 7.4 22.1 12 23C16.6 22.1 20 17.5 20 12V6L12 2Z" stroke="currentColor" strokeWidth="1.5" /></svg>
                            </div>
                            <h3 className="benefit-h">أمان مؤسسي.</h3>
                            <p className="benefit-p">بيانات الموظفين محفوظة داخل المملكة، ومتوافقة مع متطلبات SDAIA وPDPL.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== PORTALS ========== */}
            <section className="portals section-pad" id="portals">
                <div className="wrap">
                    <div className="section-head reveal">
                        <div className="eyebrow">منصّة واحدة · ثلاث تجارب</div>
                        <h2 className="section-title">واجهةٌ مصمَّمة <span className="serif-en">for everyone</span> في السلسلة الرياضية.</h2>
                        <p className="section-sub">من الموظف الذي يبحث عن مباراة بعد العمل، إلى مدير الموارد البشرية الذي يقيس الأثر، إلى النادي الذي يدير ملاعبه — كلٌ بأدواته.</p>
                    </div>

                    <div className="portal-tabs-wrap reveal">
                        <div className="portal-tabs" role="tablist">
                            {portalTabs.map(t => (
                                <button
                                    key={t.key}
                                    className={`portal-tab${activePortal === t.key ? ' active' : ''}`}
                                    onClick={() => setActivePortal(t.key)}
                                >
                                    <span className="portal-tab-num">{t.num}</span>
                                    <span>{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* EMPLOYEE PANEL */}
                    <div className={`portal-panel${activePortal === 'employee' ? ' active' : ''}`}>
                        <div className="section-head reveal">
                            <div className="eyebrow">رحلة الموظف · شاشة بشاشة</div>
                            <h2 className="section-title">من الدعوة <span className="serif-en">to the final whistle</span>.</h2>
                            <p className="section-sub">شاهد كل خطوة بعين الموظف — من اللحظة التي يستلم فيها الدعوة من فريق HR، إلى نهاية المباراة وحجز التالية.</p>
                        </div>
                        <JourneySlider total={6}>
                            {/* Step 1-6 employee journey - rendered as inner HTML via dangerouslySetInnerHTML for the massive phone mockups */}
                            <div className="journey-step" dangerouslySetInnerHTML={{ __html: `<div class="journey-content"><div class="journey-num"><span class="journey-num-n">01</span><span class="journey-num-l">/ DAY 1 · MORNING</span></div><h3 class="journey-h">دعوة شخصية تصل من شركتك.</h3><p class="journey-p">يُطلق فريق HR منصة تيمات للموظفين، فيستقبل كل موظف بريداً إلكترونياً يربط هويته بنطاق الشركة. لا أكواد، لا تسجيلات يدوية.</p><ul class="journey-feat"><li>تحقّق تلقائي من نطاق البريد المؤسسي</li><li>قابل للتخصيص بهوية الشركة</li><li>رابط آمن لمدة 7 أيام</li></ul></div><div class="journey-mock"><div class="journey-visual"><span class="journey-visual-num">01</span><span class="journey-visual-icon">✉️</span></div></div>` }} />
                            <div className="journey-step alt" dangerouslySetInnerHTML={{ __html: `<div class="journey-content"><div class="journey-num"><span class="journey-num-n">02</span><span class="journey-num-l">/ DAY 1 · 30 SECONDS LATER</span></div><h3 class="journey-h">تسجيل في 30 ثانية، مع تحقّق فوري.</h3><p class="journey-p">الموظف ينقر الرابط، يدخل اسمه وكلمة المرور، ويبدأ. النظام يتحقق تلقائياً من بريد الشركة ويربطه بحساب المنشأة دون تدخل HR.</p><ul class="journey-feat"><li>تسجيل دخول بـ Apple أو Google متاح</li><li>التزام بـ PDPL ومتطلبات SDAIA</li><li>تكامل SSO للمؤسسات الكبرى</li></ul></div><div class="journey-mock"><div class="journey-visual"><span class="journey-visual-num">02</span><span class="journey-visual-icon">🔐</span></div></div>` }} />
                            <div className="journey-step" dangerouslySetInnerHTML={{ __html: `<div class="journey-content"><div class="journey-num"><span class="journey-num-n">03</span><span class="journey-num-l">/ DAY 1 · LUNCH BREAK</span></div><h3 class="journey-h">يكتشف زملاءه الذين يلعبون. للمرة الأولى.</h3><p class="journey-p">الواجهة الرئيسية تعرض الفعاليات النشطة، زملاء العمل الذين انضموا، والبطولات القادمة. يكتشف الموظف أن 47 من فريقه يلعبون بادل — معلومة لم يكن يعرفها.</p><ul class="journey-feat"><li>اكتشاف ذكي يقترح زملاء حسب القسم</li><li>بطولات داخلية ومباريات مفتوحة</li><li>إشعارات للأصدقاء عند الحجز</li></ul></div><div class="journey-mock"><div class="journey-visual"><span class="journey-visual-num">03</span><span class="journey-visual-icon">🧭</span></div></div>` }} />
                            <div className="journey-step alt" dangerouslySetInnerHTML={{ __html: `<div class="journey-content"><div class="journey-num"><span class="journey-num-n">04</span><span class="journey-num-l">/ DAY 1 · 4:18 PM</span></div><h3 class="journey-h">حجز ملعب، دعوة زملاء، تقسيم تلقائي للتكلفة.</h3><p class="journey-p">يختار الموظف الملعب، المدة، والوقت. يدعو 3 زملاء، فيحسب النظام التكلفة لكل لاعب بعد خصم دعم الشركة. لا ضغط، لا حسابات يدوية.</p><ul class="journey-feat"><li>أسعار مرنة حسب المدة (60 / 90 / 120 دقيقة)</li><li>خصم تلقائي للدعم المؤسسي</li><li>دعوة الزملاء عبر الاسم أو البريد</li></ul></div><div class="journey-mock"><div class="journey-visual"><span class="journey-visual-num">04</span><span class="journey-visual-icon">📅</span></div></div>` }} />
                            <div className="journey-step" dangerouslySetInnerHTML={{ __html: `<div class="journey-content"><div class="journey-num"><span class="journey-num-n">05</span><span class="journey-num-l">/ DAY 1 · 7:00 PM</span></div><h3 class="journey-h">يوم المباراة. كل شيء جاهز.</h3><p class="journey-p">قبل المباراة بـ 30 دقيقة، يصل تذكير. يفتح الموظف التطبيق فيجد العنوان، الزملاء المؤكَّدين، الخريطة، ورمز QR لتسجيل الوصول عند بوابة النادي.</p><ul class="journey-feat"><li>تذكيرات ذكية قبل 24 ساعة و30 دقيقة</li><li>تسجيل وصول QR للنوادي الشريكة</li><li>تنبيه عند تأخر أحد اللاعبين</li></ul></div><div class="journey-mock"><div class="journey-visual"><span class="journey-visual-num">05</span><span class="journey-visual-icon">🏟️</span></div></div>` }} />
                            <div className="journey-step alt" dangerouslySetInnerHTML={{ __html: `<div class="journey-content"><div class="journey-num"><span class="journey-num-n">06</span><span class="journey-num-l">/ DAY 1 · 9:05 PM</span></div><h3 class="journey-h">انتهت المباراة. القصة بدأت للتو.</h3><p class="journey-p">بعد المباراة مباشرة، يحصل الموظف على ملخّص، نقاط على لوحة الشركة، واقتراح للمباراة التالية. هذا ليس حجزاً — هذا روتين أسبوعي.</p><ul class="journey-feat"><li>نقاط ولوحة شرف داخل الشركة</li><li>تقييم سريع للزملاء والملعب</li><li>اقتراح المباراة التالية تلقائياً</li></ul></div><div class="journey-mock"><div class="journey-visual"><span class="journey-visual-num">06</span><span class="journey-visual-icon">🏆</span></div></div>` }} />
                        </JourneySlider>
                    </div>

                    {/* HR PANEL */}
                    <div className={`portal-panel${activePortal === 'hr' ? ' active' : ''}`}>
                        <div className="section-head reveal">
                            <div className="eyebrow">رحلة الشركة · من منظور HR</div>
                            <h2 className="section-title">من الإطلاق <span className="serif-en">to actionable insights</span>.</h2>
                            <p className="section-sub">شاهد كيف يدير فريق الموارد البشرية كل شيء — من إعداد المنصة إلى قراءة أثر كل مباراة على ثقافة الشركة.</p>
                        </div>
                        <JourneySlider total={6}>
                            <div className="journey-step" dangerouslySetInnerHTML={{ __html: `<div class="journey-content"><div class="journey-num"><span class="journey-num-n">01</span><span class="journey-num-l">/ DAY 0 · KICKOFF</span></div><h3 class="journey-h">إعداد المنصة في أقل من ساعة.</h3><p class="journey-p">ترفع ليلى قائمة الموظفين عبر CSV أو تربط نظام HRIS مباشرة. تيمات يستورد 248 موظفاً، ينظّمهم حسب القسم، ويربط نطاق البريد الإلكتروني تلقائياً.</p><ul class="journey-feat"><li>استيراد فوري من SuccessFactors، BambooHR، Mawared HR</li><li>تنظيم تلقائي حسب القسم والفرع</li><li>تخصيص الهوية البصرية بألوان الشركة</li></ul></div><div class="journey-mock"><div class="journey-visual"><span class="journey-visual-num">01</span><span class="journey-visual-icon">⚙️</span></div></div>` }} />
                            <div className="journey-step alt" dangerouslySetInnerHTML={{ __html: `<div class="journey-content"><div class="journey-num"><span class="journey-num-n">02</span><span class="journey-num-l">/ DAY 1 · MORNING</span></div><h3 class="journey-h">قواعد ميزانية مرنة. شفافة. لكل قسم.</h3><p class="journey-p">تضع ليلى قواعد دعم مختلفة لكل قسم: التقنية يحصلون على دعم 50%، المبيعات 30%، المالية مبلغ ثابت. كل ريال مرئي لحظياً.</p><ul class="journey-feat"><li>دعم بنسبة مئوية أو مبلغ ثابت</li><li>حدود شهرية مخصصة لكل قسم</li><li>إشعار تلقائي عند تجاوز 80% من الميزانية</li></ul></div><div class="journey-mock"><div class="journey-visual"><span class="journey-visual-num">02</span><span class="journey-visual-icon">💰</span></div></div>` }} />
                            <div className="journey-step" dangerouslySetInnerHTML={{ __html: `<div class="journey-content"><div class="journey-num"><span class="journey-num-n">03</span><span class="journey-num-l">/ DAY 2 · 9:00 AM</span></div><h3 class="journey-h">إطلاق بضغطة. دعوات مخصّصة لكل موظف.</h3><p class="journey-p">تختار ليلى الإطلاق الفوري أو إطلاق متدرّج. تيمات يرسل 248 بريداً مخصّصاً بهوية الواحة. خلال 30 دقيقة، أول موظف يسجّل دخوله.</p><ul class="journey-feat"><li>إطلاق دفعة واحدة أو على مراحل</li><li>قوالب دعوة قابلة للتخصيص بالكامل</li><li>تتبّع معدّل القبول والتفعيل لحظياً</li></ul></div><div class="journey-mock"><div class="journey-visual"><span class="journey-visual-num">03</span><span class="journey-visual-icon">🚀</span></div></div>` }} />
                            <div className="journey-step alt" dangerouslySetInnerHTML={{ __html: `<div class="journey-content"><div class="journey-num"><span class="journey-num-n">04</span><span class="journey-num-l">/ DAY 3 · WATCHING IT HAPPEN</span></div><h3 class="journey-h">شاهد الانخراط يحدث. لحظة بلحظة.</h3><p class="journey-p">في صباح اليوم التالي، تفتح ليلى اللوحة لترى 127 موظفاً انضموا، و14 حجزاً تم اليوم، وفريق التقنية يقود التفاعل. هذا ليس تقريراً شهرياً — هذا تدفّق مباشر.</p><ul class="journey-feat"><li>نشاط مباشر للموظفين والحجوزات</li><li>إشعارات للمعالم: "50% من الفريق انضمّوا"</li><li>تقسيم حسب القسم، الجنسية، الموقع</li></ul></div><div class="journey-mock"><div class="journey-visual"><span class="journey-visual-num">04</span><span class="journey-visual-icon">📊</span></div></div>` }} />
                            <div className="journey-step" dangerouslySetInnerHTML={{ __html: `<div class="journey-content"><div class="journey-num"><span class="journey-num-n">05</span><span class="journey-num-l">/ WEEK 2 · TIME TO COMPETE</span></div><h3 class="journey-h">بطولة داخلية في 5 دقائق.</h3><p class="journey-p">تطلق ليلى بطولة بادل بين أقسام الواحة. تختار الرياضة، عدد الفرق، الجائزة، والتواريخ. تيمات يولّد المباريات تلقائياً ويرسل الجداول للمشاركين.</p><ul class="journey-feat"><li>قوالب بطولات: Knockout، League، Round-Robin</li><li>جدولة آلية مع توافر النوادي</li><li>لوحة شرف ونتائج مباشرة للجميع</li></ul></div><div class="journey-mock"><div class="journey-visual"><span class="journey-visual-num">05</span><span class="journey-visual-icon">🏅</span></div></div>` }} />
                            <div className="journey-step alt" dangerouslySetInnerHTML={{ __html: `<div class="journey-content"><div class="journey-num"><span class="journey-num-n">06</span><span class="journey-num-l">/ EVERY QUARTER · BOARD MEETING</span></div><h3 class="journey-h">تقارير تنفيذية. لمجلس الإدارة.</h3><p class="journey-p">في نهاية الربع، تيمات يولّد تقرير أثر بمؤشرات eNPS، الانخراط، ومعدّل دوران الموظفين. ليلى تشاركه مع CEO، فيرى أن استثمار الرياضة أعاد 4.2 ضعف قيمته في بقاء الموظفين.</p><ul class="journey-feat"><li>تقارير ربعية تلقائية بصيغة PDF</li><li>ربط مباشر مع مؤشرات الأداء الوظيفي</li><li>قابلة للمشاركة مع CEO والمستثمرين</li></ul></div><div class="journey-mock"><div class="journey-visual"><span class="journey-visual-num">06</span><span class="journey-visual-icon">📈</span></div></div>` }} />
                        </JourneySlider>
                    </div>

                    {/* CLUB PANEL */}
                    <div className={`portal-panel${activePortal === 'club' ? ' active' : ''}`}>
                        <div className="section-head reveal">
                            <div className="eyebrow">رحلة النادي الشريك</div>
                            <h2 className="section-title">من التسجيل <span className="serif-en">to monthly settlement</span>.</h2>
                            <p className="section-sub">شاهد كيف يدير النوادي ملاعبهم وحجوزاتهم وإيراداتهم عبر تيمات — من لحظة الانضمام إلى التسوية الشهرية.</p>
                        </div>
                        <JourneySlider total={6}>
                            <div className="journey-step" dangerouslySetInnerHTML={{ __html: `<div class="journey-content"><div class="journey-num"><span class="journey-num-n">01</span><span class="journey-num-l">/ APPLY · 24h VERIFICATION</span></div><h3 class="journey-h">انضم لشبكة الشركات في 48 ساعة.</h3><p class="journey-p">يقدّم النادي طلب الانضمام عبر استمارة بسيطة: الموقع، الرياضات، عدد الملاعب، وصور. فريق تيمات يتحقّق ويفعّل النادي خلال يوم عمل واحد — لا عقود طويلة، لا رسوم انضمام.</p><ul class="journey-feat"><li>تسجيل مجاني، بدون عقود طويلة الأمد</li><li>تحقّق سريع خلال 24 ساعة</li><li>دعم متخصص بالعربية من فريق الشراكات</li></ul></div><div class="journey-mock"><div class="journey-visual"><span class="journey-visual-num">01</span><span class="journey-visual-icon">📋</span></div></div>` }} />
                            <div className="journey-step alt" dangerouslySetInnerHTML={{ __html: `<div class="journey-content"><div class="journey-num"><span class="journey-num-n">02</span><span class="journey-num-l">/ COURT SETUP · YOUR PRICES</span></div><h3 class="journey-h">أسعار مرنة لكل ملعب ولكل مدة.</h3><p class="journey-p">يضع النادي أسعاره الخاصة لكل ملعب، حسب المدة (60، 90، 120 دقيقة). لا قيود من تيمات على التسعير — النادي يحتفظ بسلطته الكاملة على أسعاره.</p><ul class="journey-feat"><li>تسعير ديناميكي حسب اليوم والوقت</li><li>أسعار مختلفة للشركات والأفراد</li><li>عروض موسمية قابلة للجدولة</li></ul></div><div class="journey-mock"><div class="journey-visual"><span class="journey-visual-num">02</span><span class="journey-visual-icon">🏷️</span></div></div>` }} />
                            <div className="journey-step" dangerouslySetInnerHTML={{ __html: `<div class="journey-content"><div class="journey-num"><span class="journey-num-n">03</span><span class="journey-num-l">/ INCOMING REQUESTS · CORPORATE</span></div><h3 class="journey-h">حجوزات الشركات تصل تلقائياً.</h3><p class="journey-p">بمجرّد التفعيل، يبدأ النادي باستقبال طلبات حجز من شركات تيمات. كل طلب يأتي مع تفاصيل الفريق، الوقت، والمبلغ. قبول أو رفض بنقرة — أو تفعيل القبول التلقائي للشركات الموثوقة.</p><ul class="journey-feat"><li>طلبات مفصّلة مع عدد اللاعبين والوقت</li><li>قبول تلقائي للشركات الموثوقة</li><li>إشعارات فورية على الجوال</li></ul></div><div class="journey-mock"><div class="journey-visual"><span class="journey-visual-num">03</span><span class="journey-visual-icon">📬</span></div></div>` }} />
                            <div className="journey-step alt" dangerouslySetInnerHTML={{ __html: `<div class="journey-content"><div class="journey-num"><span class="journey-num-n">04</span><span class="journey-num-l">/ THE WEEK AT A GLANCE</span></div><h3 class="journey-h">كل ملاعبك في شاشة واحدة.</h3><p class="journey-p">جدول أسبوعي مرئي يعرض كل الحجوزات حسب الملعب والوقت. مُلوّن: أخضر للشركات، رمادي للأفراد، أحمر للفعاليات. اسحب لإعادة الجدولة، انقر للتفاصيل.</p><ul class="journey-feat"><li>عرض يومي، أسبوعي، شهري</li><li>إعادة جدولة بالسحب والإفلات</li><li>تنبيه للتعارضات وفترات الذروة</li></ul></div><div class="journey-mock"><div class="journey-visual"><span class="journey-visual-num">04</span><span class="journey-visual-icon">📆</span></div></div>` }} />
                            <div className="journey-step" dangerouslySetInnerHTML={{ __html: `<div class="journey-content"><div class="journey-num"><span class="journey-num-n">05</span><span class="journey-num-l">/ TURN QUIET HOURS INTO PEAK</span></div><h3 class="journey-h">حوّل ساعاتك الفارغة إلى ذروة جديدة.</h3><p class="journey-p">تيمات يكتشف ساعاتك ذات الإشغال المنخفض ويقترح إرسال عرض ترويجي للشركات في منطقتك. الثلاثاء 10ص-2م كان فارغاً؟ بنقرة، يتحوّل إلى ساعات ذروة جديدة.</p><ul class="journey-feat"><li>اكتشاف ذكي للساعات منخفضة الإشغال</li><li>عروض موجّهة للشركات في النطاق الجغرافي</li><li>قياس عائد كل حملة ترويجية</li></ul></div><div class="journey-mock"><div class="journey-visual"><span class="journey-visual-num">05</span><span class="journey-visual-icon">📣</span></div></div>` }} />
                            <div className="journey-step alt" dangerouslySetInnerHTML={{ __html: `<div class="journey-content"><div class="journey-num"><span class="journey-num-n">06</span><span class="journey-num-l">/ MONTHLY SETTLEMENT · GET PAID</span></div><h3 class="journey-h">تسوية شهرية. بيانات يومية.</h3><p class="journey-p">في الخامس من كل شهر، يتم تحويل الإيراد إلى حساب النادي عبر مدى أو SADAD. النادي يرى كل ريال: من أي شركة، أي ملعب، أي ساعة. شفافية كاملة، بدون استفسارات.</p><ul class="journey-feat"><li>تسوية شهرية تلقائية عبر مدى أو SADAD</li><li>تقارير ضريبية جاهزة للهيئة الزكاة</li><li>تحليل أفضل العملاء المؤسسيين</li></ul></div><div class="journey-mock"><div class="journey-visual"><span class="journey-visual-num">06</span><span class="journey-visual-icon">💳</span></div></div>` }} />
                        </JourneySlider>
                    </div>
                </div>
            </section>

            {/* ========== WHAT WE HAVE ========== */}
            <section className="wwh section-pad" id="wwh">
                <div className="wrap">
                    <div className="section-head reveal">
                        <div className="eyebrow">ماذا نقدّم</div>
                        <h2 className="section-title">كل ما تحتاجه <span className="serif-en">built in</span>.</h2>
                        <p className="section-sub">ميزات متكاملة صُمّمت لتُحرّك فرقك من المكتب إلى الملعب — بدون أدوات خارجية.</p>
                    </div>
                    <div className="wwh-grid reveal-stagger">
                        <div className="wwh-card">
                            <div className="wwh-icon">🏘️</div>
                            <h3>مجتمعات رياضية</h3>
                            <p>أنشئ فرقاً داخلية حسب الرياضة — بادل، كرة قدم، تنس. كل مجتمع بقائده وأعضائه وميزانيته.</p>
                            <span className="wwh-tag co">الشركة</span>
                        </div>
                        <div className="wwh-card">
                            <div className="wwh-icon">🏆</div>
                            <h3>بطولات ودوريات</h3>
                            <p>نظّم بطولات بين الأقسام بصيغ متعددة: دوري، إقصائي، أو جولة واحدة. الجداول والنتائج تلقائية.</p>
                            <span className="wwh-tag co">الشركة</span>
                        </div>
                        <div className="wwh-card">
                            <div className="wwh-icon">📅</div>
                            <h3>حجز ذكي للمرافق</h3>
                            <p>احجز الملاعب بتسعير ديناميكي حسب الوقت والمدة. خصومات تلقائية من دعم الشركة.</p>
                            <span className="wwh-tag emp">الموظف</span>
                        </div>
                        <div className="wwh-card">
                            <div className="wwh-icon">📊</div>
                            <h3>تصويت وتنسيق</h3>
                            <p>صوّت على المواعيد المناسبة مع فريقك. اقتراحات ذكية للمباريات السريعة عند قلّة النشاط.</p>
                            <span className="wwh-tag emp">الموظف</span>
                        </div>
                        <div className="wwh-card">
                            <div className="wwh-icon">💳</div>
                            <h3>محفظة مركزية</h3>
                            <p>أدر ميزانية الأنشطة من محفظة واحدة. وزّع الدعم على المجتمعات وتابع كل ريال.</p>
                            <span className="wwh-tag co">الشركة</span>
                        </div>
                        <div className="wwh-card">
                            <div className="wwh-icon">💰</div>
                            <h3>تسويات شفافة</h3>
                            <p>تسويات شهرية تلقائية للمنشآت. تقارير مفصّلة بكل حجز وعمولة ومبلغ صافي.</p>
                            <span className="wwh-tag biz">المنشأة</span>
                        </div>
                        <div className="wwh-card">
                            <div className="wwh-icon">🏟️</div>
                            <h3>إدارة المرافق</h3>
                            <p>أضف ملاعبك بأسعار مرنة لكل مدة. جدولة الحجوزات وقبول الطلبات تلقائياً.</p>
                            <span className="wwh-tag biz">المنشأة</span>
                        </div>
                        <div className="wwh-card">
                            <div className="wwh-icon">🏷️</div>
                            <h3>خصومات مخصّصة</h3>
                            <p>أنشئ خصومات حسب الشركة أو المجتمع — بنسبة أو مبلغ ثابت، مع فترات زمنية محددة.</p>
                            <span className="wwh-tag biz">المنشأة</span>
                        </div>
                        <div className="wwh-card">
                            <div className="wwh-icon">🔔</div>
                            <h3>إشعارات فورية</h3>
                            <p>تابع كل جديد لحظة بلحظة — فعاليات، تصويتات، حجوزات، تسويات، وتحديات.</p>
                            <span className="wwh-tag all">الجميع</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== CTA ========== */}
            <section className="cta" id="cta">
                <div className="wrap">
                    <div className="cta-card reveal">
                        <div className="cta-content">
                            <div className="eyebrow">جاهز للبدء؟</div>
                            <h2>اجعل شركتك تتحرك<br /><span className="serif-en">together</span>.</h2>
                            <p>عرض توضيحي مدته 30 دقيقة، مصمَّم لفرق الموارد البشرية. سنعرض لك كيف تنطلق شركتك خلال أسبوع — مع دراسة حالة لشركة بحجم مشابه.</p>
                            <div className="cta-actions">
                                <Link href="/company/register" className="btn btn-lime">
                                    انضم لنا
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </Link>
                                <Link href="/business/register" className="btn btn-ghost" style={{ background: 'var(--ink)', color: 'var(--cream)', borderColor: 'var(--ink)' }}>سجّل منشأتك</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== FAQ ========== */}
            <section className="faq section-pad" id="faq">
                <div className="wrap">
                    <div className="section-head reveal">
                        <div className="eyebrow">الأسئلة الشائعة</div>
                        <h2 className="section-title">ما يسأله مديرو HR <span className="serif-en">first</span>.</h2>
                    </div>
                    <div className="faq-list reveal-stagger">
                        {faqData.map((item, i) => (
                            <FaqItem
                                key={i}
                                q={item.q}
                                a={item.a}
                                open={openFaq === i}
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== STICKY MOBILE CTA ========== */}
            <div className={`sticky-cta${stickyVisible ? ' visible' : ''}`}>
                <div className="sticky-cta-t">
                    <span className="sticky-cta-l">/ ابدأ مع تيمات</span>
                    <span className="sticky-cta-s">احجز عرضاً مع فريقنا</span>
                </div>
                <a href="#cta" className="sticky-cta-b">
                    احجز
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </a>
            </div>

            {/* ========== FOOTER ========== */}
            <footer className="footer">
                <div className="wrap">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <Link href="/" className="logo">
                                <span className="logo-mark"></span>
                                <span>تيمات</span>
                            </Link>
                            <h3>منصّة الرياضة المؤسسية الأولى في المملكة.</h3>
                            <p>نُحوّل زملاء العمل إلى فريق — عبر شبكة نوادي مصمَّمة للشركات.</p>
                            <div className="footer-social">
                                <a href="#" aria-label="X"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg></a>
                                <a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" /></svg></a>
                                <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg></a>
                            </div>
                        </div>
                        <div className="footer-col">
                            <h4>الدعم</h4>
                            <ul>
                                <li><a href="#">خدمة العملاء</a></li>
                                <li><a href="#">الشروط والأحكام</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <div className="footer-bottom-l">
                            <span className="footer-mark">teamat<span style={{ color: 'var(--rust)' }}>·</span></span>
                            <span>© 2026 تيمات. جميع الحقوق محفوظة.</span>
                        </div>
                        <div>صُنع بحبّ في المملكة العربية السعودية 🇸🇦</div>
                    </div>
                </div>
            </footer>
        </>
    );
}
