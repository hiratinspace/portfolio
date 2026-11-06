import React, { useState, useEffect, useRef } from 'react';
import { Shield, Terminal, Code, Briefcase, Radio, GraduationCap, User, Users, Mail, Linkedin, ChevronRight, Lock, X } from 'lucide-react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ThreatFeedPage from './components/ThreatFeedPage';
import ProjectsPage from './components/ProjectsPage';
import CertTracker from './components/CertTracker';
import GitHubActivity from './components/GitHubActivity';
import MatrixRain from './components/MatrixRain';
import NovaChat from './components/NovaChat';
import QRLandingPage from './components/QRLandingPage';
import ErrorBoundary from './components/ErrorBoundary';
import { getEmail } from './utils/email';
import useDialogFocus from './utils/useDialogFocus';
import { experiences, leaderships, skills } from './data/portfolio';

const Portfolio = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const hamburgerRef = useRef(null);
  // Closing the drawer from inside it returns focus to the hamburger
  const closeNav = () => { setNavOpen(false); hamburgerRef.current?.focus(); };
  const dimOverlayRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Dim the matrix rain everywhere below the hero: transparent while the
      // landing view is on screen, fading to mostly-opaque once scrolled one
      // viewport down. Written straight to the DOM (no state) so the matrix
      // animation never re-renders on scroll.
      if (dimOverlayRef.current) {
        const progress = Math.min(1, window.scrollY / window.innerHeight);
        dimOverlayRef.current.style.opacity = (progress * 0.8).toFixed(3);
      }

      // Update active section based on scroll position
      const sections = ['home', 'about', 'experience', 'cert-roadmap', 'contact'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    handleScroll(); // sync overlay + active section on first paint (e.g. reload mid-page)
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  //  locks the page scroll whenever the resume or the project modal is open
  useEffect(() => {
    if (showResume) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showResume]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80; // Offset for fixed navbar
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="bg-black text-gray-100 min-h-screen font-mono relative overflow-hidden">
      {/* Matrix Rain Background */}
      <MatrixRain variant="home" style={{ zIndex: 1 }} />
      {/* Scroll-driven dim layer - keeps the matrix rain vivid on the hero,
          fades it back for every section below. Opacity set in handleScroll. */}
      <div
        ref={dimOverlayRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 2, background: '#000', opacity: 0 }}
      />
      {/* Navigation */}
      <nav className={`fixed top-0 w-full transition-all duration-300 ${scrolled ? 'bg-black/95 backdrop-blur-sm border-b border-red-900/30' : 'bg-transparent'}`} style={{ zIndex: 100 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>

            {/* LEFT - logo */}
            <button
              onClick={() => scrollToSection('home')}
              className="flex items-center space-x-2 cursor-pointer group justify-self-start"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#991B1B', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#450A0A', stopOpacity: 1 }} />
                    </linearGradient>
                    <linearGradient id="letterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#FEF3C7', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#FDE68A', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
                    fill="url(#hexGrad)" stroke="#DC2626" strokeWidth="2"
                    className="group-hover:stroke-red-500 transition-colors" />
                  <polygon points="50,12 82,30 82,70 50,88 18,70 18,30"
                    fill="none" stroke="#7F1D1D" strokeWidth="1.5" opacity="0.5" />
                  <path d="M 28 35 L 28 65 M 28 50 L 42 50 M 42 35 L 42 65"
                    stroke="url(#letterGrad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path d="M 58 35 L 58 65 M 58 35 L 70 35 Q 75 35 75 42 Q 75 50 68 50 L 58 50 M 68 50 L 75 65"
                    stroke="url(#letterGrad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
              <span className="text-base sm:text-xl font-bold text-red-500 group-hover:text-red-400 transition-colors hidden lg:inline">
                HIRAT RAHMAN RAHI
              </span>
            </button>

            {/* CENTRE - page links */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/products')}
                className="flex items-center space-x-2 px-4 py-1.5 border border-red-900/60 hover:border-red-600 hover:bg-red-950/30 transition-all group"
                style={{ fontFamily: "'JetBrains Mono Variable', 'Monaco', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace" }}
              >
                <Code className="w-3.5 h-3.5 text-red-400 group-hover:text-red-300 transition-colors" />
                <span className="text-xs font-bold tracking-widest text-red-400 group-hover:text-red-300 transition-colors">
                  PRODUCTS
                </span>
              </button>
              <button
                onClick={() => navigate('/intel')}
                className="flex items-center space-x-2 px-4 py-1.5 border border-red-900/60 hover:border-red-600 hover:bg-red-950/30 transition-all group"
                style={{ fontFamily: "'JetBrains Mono Variable', 'Monaco', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace" }}
              >
                <Radio className="w-3.5 h-3.5 text-red-400 group-hover:text-red-300 transition-colors" />
                <span className="text-xs font-bold tracking-widest text-red-400 group-hover:text-red-300 transition-colors">
                  INTEL
                </span>
                <span style={{
                  width: 5, height: 5, borderRadius: '50%', background: '#ef4444', display: 'inline-block',
                  animation: 'navPulse 1.8s ease-in-out infinite',
                }} />
              </button>
            </div>

            {/* RIGHT - nav links on desktop, hamburger on mobile */}
            <div className="justify-self-end flex items-center">
              {/* Desktop nav links */}
              <div className="hidden xl:flex items-center space-x-6">
                {[
                  { label: 'HOME',     id: 'home'         },
                  { label: 'ABOUT',   id: 'about'        },
                  { label: 'EXPERIENCE', id: 'experience' },
                  { label: 'PRACTICE', id: 'cert-roadmap' },
                  { label: 'CONTACT', id: 'contact'      },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`text-xs sm:text-sm py-2 transition-colors hover:text-red-400 ${activeSection === item.id ? 'text-red-400' : 'text-gray-300'}`}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => setShowResume(true)}
                  className="text-xs sm:text-sm px-3 py-1.5 border border-red-800 text-red-300 hover:text-white hover:border-red-500 hover:bg-red-950/40 transition-colors"
                >
                  RESUME
                </button>
              </div>
              {/* Mobile hamburger */}
              <button
                ref={hamburgerRef}
                className="xl:hidden flex flex-col gap-1.5 p-1 ml-2"
                onClick={() => setNavOpen(o => !o)}
                aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
                aria-expanded={navOpen}
                aria-controls="mobile-nav-drawer"
              >
                <span style={{ display: 'block', width: 22, height: 2, background: navOpen ? '#ef4444' : 'rgba(220,180,180,0.7)', transition: 'all 0.22s', transform: navOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
                <span style={{ display: 'block', width: 22, height: 2, background: navOpen ? 'transparent' : 'rgba(220,180,180,0.7)', transition: 'all 0.22s' }} />
                <span style={{ display: 'block', width: 22, height: 2, background: navOpen ? '#ef4444' : 'rgba(220,180,180,0.7)', transition: 'all 0.22s', transform: navOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
              </button>
            </div>
          </div>
        </div>
        {/* Keyframe for the live dot */}
        <style>{`
          @keyframes navPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.7)} }
        `}</style>
      </nav>

      {/* Mobile nav sidebar - backdrop */}
      {navOpen && (
        <div
          className="fixed inset-0 xl:hidden"
          style={{ zIndex: 99, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
          onClick={() => setNavOpen(false)}
        />
      )}

      {/* Mobile nav sidebar - drawer (slides from right) */}
      <div
        id="mobile-nav-drawer"
        className="fixed top-0 bottom-0 xl:hidden"
        aria-hidden={!navOpen}
        inert={navOpen ? undefined : ''}
        style={{
          right: 0, width: 240, zIndex: 110,
          background: 'rgba(4,0,1,0.98)',
          borderLeft: '1px solid rgba(127,29,29,0.6)',
          backdropFilter: 'blur(16px)',
          transform: navOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s ease',
          display: 'flex', flexDirection: 'column',
          padding: '0 28px 40px',
        }}
        onKeyDown={(e) => e.key === 'Escape' && closeNav()}
      >
        {/* Header with a close button (the drawer covers the hamburger) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 -12px 16px 0', padding: '14px 0', borderBottom: '1px solid rgba(127,29,29,0.35)' }}>
          <span style={{ color: 'rgba(220,180,180,0.75)', fontSize: 10, letterSpacing: 4, fontFamily: "'JetBrains Mono Variable', 'Monaco', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace", fontWeight: 700 }}>
            NAVIGATE
          </span>
          <button
            onClick={closeNav}
            aria-label="Close navigation"
            style={{ background: 'none', border: 'none', color: 'rgba(220,180,180,0.85)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44 }}
          >
            <X size={20} />
          </button>
        </div>
        {[
          { label: 'HOME',     id: 'home'         },
          { label: 'ABOUT',   id: 'about'        },
          { label: 'EXPERIENCE', id: 'experience' },
          { label: 'PRACTICE', id: 'cert-roadmap' },
          { label: 'CONTACT', id: 'contact'      },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => { scrollToSection(item.id); setNavOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'none', border: 'none', cursor: 'pointer',
              color: activeSection === item.id ? '#ef4444' : 'rgba(220,180,180,0.65)',
              fontFamily: "'JetBrains Mono Variable', 'Monaco', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace",
              fontSize: 13, letterSpacing: 2,
              padding: '13px 0',
              borderBottom: '1px solid rgba(127,29,29,0.15)',
              transition: 'color 0.15s', textAlign: 'left', width: '100%',
            }}
          >
            {activeSection === item.id && <span style={{ width: 4, height: 4, background: '#ef4444', borderRadius: '50%', flexShrink: 0 }} />}
            {item.label}
          </button>
        ))}

        {/* RESUME link in sidebar */}
        <button
          onClick={() => { setShowResume(true); setNavOpen(false); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#fca5a5', fontFamily: "'JetBrains Mono Variable', 'Monaco', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace",
            fontSize: 13, letterSpacing: 2, padding: '13px 0',
            borderBottom: '1px solid rgba(127,29,29,0.15)',
            transition: 'color 0.15s', textAlign: 'left', width: '100%',
          }}
        >
          RESUME
        </button>

        {/* PRODUCTS link in sidebar */}
        <button
          onClick={() => { navigate('/products'); setNavOpen(false); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(239,68,68,0.8)', fontFamily: "'JetBrains Mono Variable', 'Monaco', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace",
            fontSize: 13, letterSpacing: 2, padding: '13px 0',
            transition: 'color 0.15s', textAlign: 'left', width: '100%',
          }}
        >
          PRODUCTS
        </button>

        {/* INTEL link in sidebar */}
        <button
          onClick={() => { navigate('/intel'); setNavOpen(false); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(239,68,68,0.8)', fontFamily: "'JetBrains Mono Variable', 'Monaco', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace",
            fontSize: 13, letterSpacing: 2, padding: '13px 0',
            transition: 'color 0.15s', textAlign: 'left', width: '100%',
            marginTop: 8,
          }}
        >
          INTEL
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'navPulse 1.8s ease-in-out infinite' }} />
        </button>
      </div>

      <main>
      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20 px-4 sm:px-6" style={{ zIndex: 10 }}>
        <div className="absolute inset-0 bg-gradient-to-br from-black via-burgundy-950/50 to-black" style={{ zIndex: 2 }}></div>

        <div className="max-w-6xl mx-auto relative w-full" style={{ zIndex: 10 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative">
              {/* soft shade so the falling code doesn't run through the text */}
              <div aria-hidden="true" className="absolute -inset-x-10 -inset-y-12 -z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.75)_30%,transparent_72%)]" />
              <div className="flex items-center space-x-2 mb-4">
                <Terminal className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-red-500 text-xs sm:text-sm font-bold tracking-wider">ASPIRING OFFENSIVE SECURITY ENGINEER</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[clamp(3rem,6.5vh,3.75rem)] font-bold mb-3 leading-tight text-white" style={{ textWrap: 'balance' }}>
                Hirat Rahman
              </h1>
              <p className="text-xl sm:text-2xl font-bold text-red-500 mb-6">
                Purple → Red automation.
              </p>
              <p className="text-gray-300 text-base sm:text-lg mb-4 leading-relaxed max-w-xl">
                Information Technology Intern at <span className="text-white">Integrity Technology Solutions</span>, a managed security
                provider for banks and healthcare. CS &amp; Mathematics at Illinois Wesleyan, Dec 2027.
              </p>
              <p className="text-gray-400 text-base sm:text-lg mb-8 leading-relaxed max-w-xl">
                I build AI-powered recon tooling, document detections in my home lab, compete in CTFs, and ship
                products people actually use.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => scrollToSection('contact')}
                  className="px-6 py-3 bg-gradient-to-r from-red-900 to-burgundy-900 hover:from-red-800 hover:to-burgundy-800 transition-all border border-red-800 flex items-center justify-center space-x-2 group"
                >
                  <span>LET'S CONNECT</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => setShowResume(true)}
                  className="px-6 py-3 border border-red-900 hover:border-red-700 hover:bg-red-950/30 transition-all text-center"
                >
                  VIEW RESUME
                </button>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm" style={{ fontFamily: "'JetBrains Mono Variable', 'Monaco', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace" }}>
                <span className="text-gray-400">Shipped:</span>
                {[
                  { label: 'PassMyResume', url: 'https://passmyresume.com' },
                  { label: 'interninbox', url: 'https://github.com/hiratinspace/interninbox' },
                  { label: 'TuitionCreep', url: 'https://tuitioncreep.org' },
                  { label: 'SpecterAI', url: 'https://github.com/hiratinspace/specter-ai' },
                ].map(p => (
                  <a key={p.label} href={p.url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer"
                    className="text-red-300 hover:text-white underline decoration-red-800 underline-offset-4 hover:decoration-red-400 transition-colors">
                    {p.label}
                  </a>
                ))}
                <button onClick={() => navigate('/products')} className="text-gray-300 hover:text-white transition-colors">
                  All products →
                </button>
              </div>
            </div>

            <div className="relative mt-8 lg:mt-0">
              <div className="relative z-10 bg-gradient-to-br from-burgundy-900/30 to-black border border-red-900/50 p-6 sm:p-8">
                <Shield className="text-red-500 w-12 h-12 sm:w-16 sm:h-16 mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold mb-4 text-red-400">Security Focus</h2>
                <ul className="space-y-3">
                  {['Penetration Testing & Reconnaissance', 'Security Operations & Incident Triage', 'MCP & AI-Agent Security', 'Reverse Engineering & CTF Competitions', 'Python Automation & Tooling'].map((item, i) => (
                    <li key={i} className="flex items-center space-x-3 text-sm sm:text-base text-gray-300">
                      <div className="w-2 h-2 bg-red-500 rotate-45 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-[clamp(4rem,10vh,6rem)] bg-gradient-to-b from-black to-burgundy-950/20 px-4 sm:px-6 relative" style={{ zIndex: 10 }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-3 mb-8 sm:mb-12">
            <User className="text-red-500 w-6 h-6 sm:w-8 sm:h-8" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white">ABOUT</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <p className="text-gray-300 leading-relaxed">
                I’m Hirat Rahman, a Computer Science & Mathematics double major with a minor in Psychology at
                Illinois Wesleyan University, focused on offensive security. I identify and validate weaknesses in web
                applications and systems through hands-on practice, CTFs, labs, and clearly documented writeups, and I
                build Python automation for reconnaissance, testing, and reporting so results are consistent, repeatable,
                and easy to act on. My goal is straightforward: help organizations find real risks before attackers do,
                and communicate them in terms that support clear decisions. Mathematics gives me the foundation for
                cryptography and rigorous problem solving, and psychology adds perspective on the human side of
                security, from social engineering to how people actually make decisions under pressure.
              </p>
            </div>

            <div className="space-y-6">
              <div className="border border-red-900/50 p-6 bg-gradient-to-br from-burgundy-950/30 to-black">
                <GraduationCap className="text-red-500 w-8 h-8 mb-4" />
                <h3 className="text-xl font-bold mb-3 text-red-400">Education</h3>
                <div className="text-gray-300">
                  <p className="font-semibold">Illinois Wesleyan University</p>
                  <p className="text-sm text-gray-400">B.S. Computer Science & Mathematics</p>
                  <p className="text-sm text-gray-400">Minor in Psychology</p>
                  <p className="text-sm text-gray-400">Expected Dec 2027</p>
                </div>
                <div className="mt-4 pt-4 border-t border-red-900/30">
                  <p className="text-sm text-gray-400 mb-2">Relevant Coursework:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Algorithms', 'Data Structures', 'Software Development', 'Database Systems', 'Discrete Math'].map((course, i) => (
                      <span key={i} className="text-xs px-3 py-1 bg-red-950/50 border border-red-900/50 text-red-400">
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section - timeline */}
      <section id="experience" className="py-16 sm:py-[clamp(4rem,10vh,6rem)] bg-black px-4 sm:px-6 relative" style={{ zIndex: 10 }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-3 mb-8 sm:mb-12">
            <Briefcase className="text-red-500 w-6 h-6 sm:w-8 sm:h-8" aria-hidden="true" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white">EXPERIENCE</h2>
          </div>

          <ol className="relative border-l border-red-900/60 ml-1.5 space-y-12">
            {experiences.map((exp, idx) => {
              const current = /Present/.test(exp.period);
              return (
                <li key={idx} className="relative pl-6 sm:pl-10">
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[6px] top-2 w-[11px] h-[11px] rotate-45 ${current ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-black border border-red-700'}`}
                  />
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">{exp.title}</h3>
                      <p className="text-red-400 text-sm sm:text-base">{exp.company}</p>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400 whitespace-nowrap flex items-center gap-2">
                      {exp.period}
                      {current && <span className="text-red-300 border border-red-700 px-1.5 py-0.5 text-[10px] tracking-widest">NOW</span>}
                    </p>
                  </div>
                  <p className="mt-3 text-gray-300 leading-relaxed text-sm sm:text-base max-w-[70ch]">{exp.description}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <GitHubActivity />

      {/* ── Cert Roadmap ── */}
      <CertTracker />

      {/* Skills Section */}
      <section id="skills" className="py-16 sm:py-[clamp(4rem,10vh,6rem)] bg-gradient-to-b from-black to-burgundy-950/20 px-4 sm:px-6 relative" style={{ zIndex: 10 }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-3 mb-8 sm:mb-12">
            <Lock className="text-red-500 w-6 h-6 sm:w-8 sm:h-8" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white">SKILLS & TOOLKIT</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(skills).map(([category, items], idx) => (
              <div key={idx} className="border border-red-900/50 p-6 bg-gradient-to-br from-burgundy-950/20 to-black hover:border-red-700/70 transition-all group">
                <h3 className="text-xl font-bold mb-4 text-red-400 group-hover:text-red-300 transition-colors">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {items.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-red-950/30 border border-red-900/50 text-sm text-gray-300 hover:bg-red-900/30 hover:border-red-700 transition-all cursor-default">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section - compact two-column list */}
      <section id="leadership" className="py-16 sm:py-[clamp(4rem,10vh,6rem)] bg-black px-4 sm:px-6 relative" style={{ zIndex: 10 }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-3 mb-8 sm:mb-12">
            <Users className="text-red-500 w-6 h-6 sm:w-8 sm:h-8" aria-hidden="true" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white">LEADERSHIP</h2>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {leaderships.map((item, idx) => (
              <li key={idx} className="border-t border-red-900/60 pt-4">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-base sm:text-lg font-bold text-white">{item.title}</h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{item.period}</span>
                </div>
                <p className="text-red-400 text-sm mb-2">{item.company}</p>
                <p className="text-gray-300 leading-relaxed text-sm max-w-[70ch]">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 sm:py-[clamp(4rem,10vh,6rem)] bg-gradient-to-b from-black to-burgundy-950/20 px-4 sm:px-6 relative" style={{ zIndex: 10 }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-3 mb-8 sm:mb-12">
            <Mail className="text-red-500 w-6 h-6 sm:w-8 sm:h-8" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white">CONTACT</h2>
          </div>

          <div className="max-w-4xl border border-red-900/50 p-6 sm:p-8 bg-gradient-to-br from-burgundy-950/30 to-black">
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Interested in collaboration, have a security project, or just want to connect?
              Feel free to reach out through any of the channels below.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              {/* Email decoded at runtime - address never appears as a literal in source */}
              <a href={`mailto:${getEmail()}`}
                className="flex flex-col items-center p-8 border border-red-900/50 hover:border-red-700 hover:bg-red-950/20 transition-all group"
                referrerPolicy="no-referrer"
                aria-label="Send an email"
              >
                <Mail className="w-10 h-10 text-red-500 mb-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
                <span className="text-sm text-gray-400 uppercase tracking-wider mb-2">Email</span>
                <span className="text-white text-lg text-center break-all">{getEmail()}</span>
              </a>

              {/* referrerPolicy prevents the destination from seeing where the visitor came from */}
              <a href="https://linkedin.com/in/hiratrahi"
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              className="flex flex-col items-center p-8 border border-red-900/50 hover:border-red-700 hover:bg-red-950/20 transition-all group"
              aria-label="Visit LinkedIn profile (opens in new tab)"
              >
                <Linkedin className="w-10 h-10 text-red-500 mb-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm text-gray-400 uppercase tracking-wider mb-2">LinkedIn</span>
                <span className="text-white text-lg">hiratrahi</span>
              </a>
            </div>
          </div>
        </div>
      </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-red-900/30 py-6 sm:py-8 bg-black px-4 sm:px-6 relative" style={{ zIndex: 10 }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
            <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">© 2026 Hirat Rahman. All rights reserved.</p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-gray-400 text-xs sm:text-sm">Available for opportunities</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Resume Modal */}
      {showResume && <ResumeModal onClose={() => setShowResume(false)} />}

    </div>
  );
};

// Resume viewer dialog: embedded PDF plus open/download links (iOS Safari
// renders PDFs in iframes poorly, so a direct link is always offered).
const ResumeModal = ({ onClose }) => {
  const panelRef = useDialogFocus(onClose);
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 300, backgroundColor: 'rgba(0, 0, 0, 0.88)' }}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-dialog-title"
        tabIndex={-1}
        className="bg-gradient-to-br from-burgundy-950/95 to-black border-2 border-red-900/50 max-w-4xl w-full my-8 relative"
        style={{ height: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-red-900/50">
          <div className="flex items-center space-x-3 min-w-0">
            <Terminal className="text-red-500 w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <h2 id="resume-dialog-title" className="text-red-400 text-xs font-bold tracking-wider truncate">RESUME // HIRAT_RAHMAN_RAHI.pdf</h2>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-red-300 border border-red-900/60 px-3 py-2 hover:bg-red-950/40 transition-all"
            >
              OPEN
            </a>
            <a
              href="/resume.pdf"
              download
              className="text-xs text-red-300 border border-red-900/60 px-3 py-2 hover:bg-red-950/40 transition-all"
            >
              ↓ DOWNLOAD
            </a>
            <button
              onClick={onClose}
              aria-label="Close resume"
              className="w-9 h-9 flex items-center justify-center border border-red-900/50 hover:bg-red-900/40 transition-all text-red-300 text-xl"
            >×</button>
          </div>
        </div>

        <iframe
          src="/resume.pdf"
          className="w-full"
          style={{ height: 'calc(90vh - 60px)' }}
          title="Resume - Hirat Rahman"
        />
      </div>
    </div>
  );
};

// ErrorBoundary wraps the entire app - any runtime error shows a
// fallback instead of a blank page
const App = () => (
  <>
    <Routes>
      <Route path="/"      element={<ErrorBoundary><Portfolio /></ErrorBoundary>} />
      <Route path="/intel" element={<ThreatFeedPage />} />
      <Route path="/products" element={<ProjectsPage />} />
      {/* Old URL, kept so previously shared links still work */}
      <Route path="/projects" element={<Navigate to="/products" replace />} />
      <Route path="/scan"  element={<ErrorBoundary><QRLandingPage /></ErrorBoundary>} />
    </Routes>
    <NovaChat />
  </>
);

export default App;