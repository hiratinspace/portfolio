import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Terminal, ChevronRight, Code,
  Menu, X,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const FONT = "'Monaco', 'Courier New', monospace";

const ALLOWED_PROTOCOLS = new Set(['https:', 'http:', 'mailto:']);
const sanitizeUrl = (url) => {
  if (!url || url.trim() === '' || url === '#') return null;
  try {
    const parsed = new URL(url, window.location.origin);
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) return null;
    return url;
  } catch { return null; }
};

// ─── Project data — add new projects here ─────────────────────────────────────
const PROJECTS = [
  {
    title: "SpecterAI",
    category: "AI-Powered Security Tool",
    description: "AI-powered penetration testing reconnaissance tool. Input a target domain, get a full recon scan analyzed by Claude AI, and receive a professional pentest report. All in one command.",
    tech: ["Python", "Flask", "Claude AI", "DNS", "SSL/TLS", "SSE", "REST API"],
    gradient: "from-red-950 via-red-900 to-black",
    logo: "/SpecterAI.png",
    links: [
      { label: "Live Tool", url: "https://specter-ai-8p3g.onrender.com/" },
      { label: "GitHub", url: "https://github.com/hiratinspace/specter-ai" },
    ],
    fullDescription: `An AI-powered penetration testing reconnaissance tool that automates the first phase of a security assessment.

How It Works:
User inputs a target domain → 4 recon modules run in parallel → Results aggregated → Sent to Claude AI (acts as an experienced pentester) → AI returns risk level + findings + next steps → Markdown report generated → Visual web dashboard displays everything
Web is deployed through render. So it might take some time deploying at first.

Recon Modules:
• DNS / WHOIS — IP addresses, DNS records, subdomains, registrar info
• Port Scanner — Open TCP ports, running services, service banners
• HTTP Probe — Tech stack, missing security headers, cookie flags, redirects
• SSL/TLS — Certificate expiry, weak ciphers, self-signed certs, HTTP→HTTPS

AI Analysis:
Claude Sonnet acts as an experienced pentester. It doesn't just return raw data, it interprets findings, assigns a risk level, summarizes the attack surface, and provides prioritized next steps in structured JSON.

Key Features:
• Parallel scanning — all 4 modules run simultaneously for speed
• Two interfaces — CLI for terminal users, web dashboard for visual reporting
• Real-time progress streaming via Server-Sent Events (SSE)
• Scan history — every scan persisted and accessible anytime also downloadable
• JSON export — raw API endpoint for every report
• Graceful error handling — one failing module never crashes the scan
• Ethical use built in — authorized-use disclaimer on every report

Tech Stack:
Backend: Python 3.9+, Flask, concurrent.futures, socket, ssl, SSE
Libraries: anthropic, dnspython, python-whois, requests, python-dotenv
Frontend: Pure HTML/CSS/JS - terminal/hacker aesthetic 
AI: Claude Sonnet via Anthropic API

Security & Compliance:
Apache 2.0 license. API keys secured via .env + python-dotenv. .gitignore excludes keys, reports, and scan history. Authorized use only - legal test target: scanme.nmap.org.

Built with Python and Claude AI (Anthropic) for both the AI analysis feature and to assist in building the tool itself.`,
  },
  {
    title: "Binary Exploitation Framework",
    category: "Offensive Security",
    description: "Developed custom exploitation tools for CTF competitions, focusing on stack and heap vulnerabilities in compiled binaries.",
    tech: ["Python", "C++", "GDB", "Pwntools"],
    gradient: "from-red-900 via-burgundy-900 to-black",
    fullDescription: `A comprehensive framework for exploiting binary vulnerabilities in CTF competitions and security research.

Key Features:
• Automated ROP chain generation for bypassing DEP/NX
• Custom shellcode development and testing environment
• Heap exploitation utilities for use-after-free and double-free bugs
• Integration with GDB and Pwntools for streamlined exploitation

Technical Highlights:
Built primarily in Python with C++ for performance-critical components. The framework handles common exploitation patterns including buffer overflows, format string vulnerabilities, and return-oriented programming (ROP).

Challenges Overcome:
One of the biggest challenges was creating reliable exploits that work across different system configurations. I implemented multiple payload strategies that adapt to different security mitigations like ASLR, stack canaries, and PIE.

Results:
Successfully used in 10+ CTF competitions with a 70% solve rate on binary exploitation challenges.`,
  },
  {
    title: "Web Application Penetration Testing Suite",
    category: "Red Team Tools",
    description: "Automated reconnaissance and vulnerability assessment toolkit for web applications with focus on OWASP Top 10.",
    tech: ["Python", "Flask", "SQL Injection", "XSS"],
    gradient: "from-burgundy-800 via-red-800 to-black",
    fullDescription: `An automated penetration testing suite designed to identify and exploit common web application vulnerabilities.

Core Capabilities:
• Automated SQL injection detection and exploitation
• XSS (Cross-Site Scripting) vulnerability scanner
• CSRF token analysis and bypass techniques
• Authentication and session management testing
• Directory traversal and file inclusion testing

Architecture:
Built with Flask for the web interface and Python for the scanning engine. Uses multithreading for concurrent testing of multiple endpoints. Includes a custom reporting system that generates detailed vulnerability reports with remediation steps.

Real-World Applications:
Used this suite in authorized penetration tests for educational purposes and CTF web challenges. It's helped me understand both offensive and defensive perspectives of web security.

Learning Experience:
This project taught me the importance of responsible disclosure and ethical hacking. Every vulnerability found is an opportunity to improve security.`,
  },
  {
    title: "Cryptographic Challenge Solver",
    category: "Cryptography",
    description: "Built automated solvers for common cryptographic challenges including RSA, AES, and classical ciphers.",
    tech: ["Python", "PyCrypto", "Mathematics"],
    gradient: "from-black via-burgundy-900 to-red-900",
    fullDescription: `A collection of tools and algorithms for solving cryptographic puzzles commonly found in CTF competitions.

Supported Cryptosystems:
• RSA (small exponent attacks, Wiener's attack, Fermat factorization)
• Classical ciphers (Caesar, Vigenère, substitution ciphers)
• AES modes of operation and padding oracle attacks
• Hash function analysis and collision detection
• ECB/CBC mode exploitation

Mathematical Foundations:
Implements number theory algorithms including:
- Extended Euclidean algorithm for modular arithmetic
- Chinese Remainder Theorem for solving systems
- Pollard's rho algorithm for integer factorization
- Baby-step giant-step for discrete logarithms

Automation Features:
The toolkit automatically identifies cipher types and applies appropriate attack strategies. It includes frequency analysis for classical ciphers and automated parameter recovery for modern cryptosystems.

CTF Success:
This toolkit has been instrumental in solving 50+ cryptography challenges across various CTF platforms including picoCTF, HackTheBox, and TryHackMe.`,
  },
];

// ─── Project Card ─────────────────────────────────────────────────────────────
const ProjectCard = ({ project, onClick }) => (
  <div
    className="group cursor-pointer"
    onClick={() => onClick(project)}
  >
    <div className={`h-48 bg-gradient-to-br ${project.gradient} mb-4 relative overflow-hidden border border-red-900/50 group-hover:border-red-600 transition-all`}>
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
      <div className="absolute inset-0 flex items-center justify-center">
        {project.logo
          ? <img src={project.logo} alt={project.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
          : <Terminal className="w-16 h-16 text-red-400/50 group-hover:text-red-400 transition-all group-hover:scale-110" />
        }
      </div>
      <div className="absolute top-4 left-4">
        <span className="px-3 py-1 bg-black/60 border border-red-900/50 text-xs text-red-400 backdrop-blur" style={{ fontFamily: FONT }}>
          {project.category}
        </span>
      </div>
      <div className="absolute bottom-4 right-4">
        <div className="w-8 h-8 bg-red-900/60 border border-red-700 flex items-center justify-center backdrop-blur group-hover:bg-red-800/60 transition-all">
          <ChevronRight className="w-5 h-5 text-red-300" />
        </div>
      </div>
    </div>
    <h3 className="text-xl font-bold mb-2 text-white group-hover:text-red-400 transition-colors" style={{ fontFamily: FONT }}>{project.title}</h3>
    <p className="text-gray-400 text-sm mb-4 leading-relaxed">{project.description}</p>
    <div className="flex flex-wrap gap-2">
      {project.tech.map((tech, i) => (
        <span key={i} className="text-xs px-2 py-1 bg-red-950/30 border border-red-900/50 text-red-400" style={{ fontFamily: FONT }}>
          {tech}
        </span>
      ))}
    </div>
  </div>
);

// ─── Project Modal ────────────────────────────────────────────────────────────
const ProjectModal = ({ project, onClose, matrixColumns }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      style={{ zIndex: 400, backgroundColor: 'rgba(0,0,0,0.88)', fontFamily: FONT }}
      onClick={onClose}
    >
      {/* Matrix heads in background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {matrixColumns.map((col) => (
          <div
            key={`modal-${col.id}`}
            className="absolute font-mono text-sm font-bold"
            style={{ left: col.x, top: col.y, color: '#ffffff', textShadow: '0 0 10px rgba(220,38,38,0.8)', opacity: 0.5, transform: 'translateZ(0)' }}
          >
            {col.chars[0]}
          </div>
        ))}
      </div>

      <div
        className="bg-gradient-to-br from-burgundy-950/95 to-black border-2 border-red-900/50 max-w-4xl w-full my-8 relative"
        style={{ zIndex: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-red-900/50 border border-red-800 hover:bg-red-900 hover:border-red-600 transition-all flex items-center justify-center group z-10"
        >
          <span className="text-2xl text-red-400 group-hover:text-red-300">×</span>
        </button>

        {/* Header */}
        <div className={`h-48 bg-gradient-to-br ${project.gradient} relative overflow-hidden border-b-2 border-red-900/50`}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 gap-3">
            <span className="px-4 py-2 bg-black/60 border border-red-900/50 text-sm text-red-400 backdrop-blur">
              {project.category}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center">{project.title}</h2>
            {project.links && (
              <div className="flex flex-wrap justify-center gap-3 mt-1">
                {project.links.map((link, i) => {
                  const safeUrl = sanitizeUrl(link.url);
                  if (!safeUrl) return null;
                  return (
                    <a
                      key={i}
                      href={safeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      referrerPolicy="no-referrer"
                      onClick={e => e.stopPropagation()}
                      className="px-4 py-2 bg-black/60 hover:bg-red-900/60 border border-red-800 text-red-300 hover:text-white text-sm flex items-center gap-1 backdrop-blur transition-all"
                      aria-label={`${link.label} (opens in new tab)`}
                    >
                      {link.label}
                      <ChevronRight className="w-3 h-3" aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[60vh] overflow-y-auto">
          {/* Tech Stack */}
          <div className="mb-6">
            <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-3">Technologies Used</h3>
            <div className="flex flex-wrap gap-2">
              {project.tech.map((tech, i) => (
                <span key={i} className="px-4 py-2 bg-red-950/50 border border-red-900/50 text-red-400 text-sm">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <div className="text-gray-300 leading-relaxed whitespace-pre-line">
              {project.fullDescription}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const ProjectsPage = () => {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState(null);
  const [matrixColumns, setMatrixColumns] = useState([]);
  const [sideNavOpen, setSideNavOpen] = useState(false);

  // Matrix rain
  useEffect(() => {
    const columns = Math.floor(window.innerWidth / 28);
    const chars = '0123456789ABCDEF'.split('');
    const terms = ['0x','PWN','ROP','NOP','JMP','XOR','DEP','PIE','root@','sudo','nc','sh','bin'];
    const init = Array.from({ length: columns }, (_, i) => ({
      id: i, x: i * 28, y: Math.random() * -2000, speed: 0.8 + Math.random() * 2.5,
      chars: Array.from({ length: 14 + Math.floor(Math.random() * 12) }, () =>
        Math.random() > 0.7 ? terms[Math.floor(Math.random() * terms.length)] : chars[Math.floor(Math.random() * chars.length)]
      ),
    }));
    setMatrixColumns(init);
    const interval = setInterval(() => {
      setMatrixColumns(prev => prev.map(col => {
        const newY = col.y + col.speed;
        if (newY > window.innerHeight + 200) {
          return {
            ...col, y: -200 - Math.random() * 500, speed: 0.8 + Math.random() * 2.5,
            chars: Array.from({ length: 14 + Math.floor(Math.random() * 12) }, () =>
              Math.random() > 0.7 ? terms[Math.floor(Math.random() * terms.length)] : chars[Math.floor(Math.random() * chars.length)]
            ),
          };
        }
        return { ...col, y: newY };
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: '#07010400', minHeight: '100vh', fontFamily: FONT, color: '#f0e8e8', position: 'relative', overflowX: 'hidden' }}>
      <style>{`
        body { background: #080103 !important; }
        .projects-bg {
          background-color: #080103;
          background-image:
            linear-gradient(rgba(180,0,30,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(180,0,30,0.06) 1px, transparent 1px);
          background-size: 40px 40px;
          background-position: center center;
        }
        @keyframes navPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.7)} }
        .pulse-dot { animation: navPulse 1.8s ease-in-out infinite; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .card-anim { animation: fadeInUp 0.4s ease forwards; }
        @media (max-width: 640px) {
          .portfolio-label { display: none !important; }
        }
        ::-webkit-scrollbar { width: 4px; background: #080103; }
        ::-webkit-scrollbar-thumb { background: rgba(180,0,30,0.5); border-radius: 2px; }
        * { box-sizing: border-box; }
      `}</style>

      <div className="projects-bg" style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>

        {/* Matrix rain */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 3 }}>
          {matrixColumns.map(col => (
            <div key={col.id} style={{ position: 'absolute', left: col.x, top: col.y, fontFamily: FONT, fontSize: 12, lineHeight: 1.4, transform: 'translateZ(0)', willChange: 'transform' }}>
              {col.chars.map((char, idx) => {
                const opacity = Math.max(0.15, 1 - idx / col.chars.length);
                return (
                  <div key={idx} style={{
                    color: idx === 0 ? '#ff6666' : `rgba(220,38,38,${opacity})`,
                    textShadow: idx === 0 ? '0 0 6px rgba(255,68,68,0.9)' : 'none',
                    opacity, fontWeight: idx === 0 ? 700 : 400,
                  }}>{char}</div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Center dimming overlay */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 4,
          background: 'linear-gradient(to right, transparent 0%, rgba(8,1,4,0.87) 18%, rgba(8,1,4,0.87) 82%, transparent 100%)',
        }} />

        {/* Navbar */}
        <nav style={{
          position: 'fixed', top: 0, width: '100%', zIndex: 200,
          background: 'rgba(6,0,2,0.96)',
          borderBottom: '1px solid rgba(180,0,30,0.5)',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ maxWidth: 980, margin: '0 auto', padding: '12px 24px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>

            {/* Left — back to portfolio */}
            <button
              onClick={() => navigate('/')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'rgba(200,180,180,0.45)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontFamily: FONT, letterSpacing: 1.5, justifySelf: 'start', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(200,180,180,0.45)'}
            >
              <ArrowLeft size={20} />
              <span style={{ display: 'inline', fontSize: 15, letterSpacing: 1.5 }} className="portfolio-label">PORTFOLIO</span>
            </button>

            {/* Centre — page label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 18px', border: '1px solid rgba(180,0,30,0.4)', background: 'rgba(180,0,30,0.07)' }}>
              <Code size={14} style={{ color: 'rgba(200,140,140,0.8)' }} />
              <span style={{ color: 'rgba(200,140,140,0.8)', fontSize: 12, fontWeight: 700, letterSpacing: 3, fontFamily: FONT }}>PROJECTS</span>
            </div>

            {/* Right — hamburger */}
            <button
              onClick={() => setSideNavOpen(o => !o)}
              style={{ justifySelf: 'end', background: 'none', border: '1px solid rgba(180,0,30,0.4)', padding: '6px 8px', cursor: 'pointer', color: '#ff6b6b', display: 'flex', alignItems: 'center', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,68,68,0.7)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(180,0,30,0.4)'}
              aria-label="Toggle navigation"
            >
              {sideNavOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

          </div>
        </nav>

        {/* Side nav backdrop */}
        {sideNavOpen && (
          <div
            onClick={() => setSideNavOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, backdropFilter: 'blur(2px)' }}
          />
        )}

        {/* Side drawer */}
        <div style={{
          position: 'fixed', top: 0, right: 0, height: '100vh', width: 260,
          background: 'rgba(6,0,2,0.98)', borderLeft: '1px solid rgba(180,0,30,0.5)',
          zIndex: 301, fontFamily: FONT,
          transform: sideNavOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s ease',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid rgba(180,0,30,0.35)' }}>
            <span style={{ color: '#ff6b6b', fontSize: 11, letterSpacing: 3, fontWeight: 700 }}>NAVIGATION</span>
            <button onClick={() => setSideNavOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(200,140,140,0.6)', cursor: 'pointer', display: 'flex' }}>
              <X size={16} />
            </button>
          </div>

          <nav style={{ padding: '20px 0', flex: 1 }}>
            {/* Current page */}
            <div style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(239,68,68,0.06)', padding: '10px 20px',
              color: '#ef4444', fontSize: 11, fontFamily: FONT, letterSpacing: 2,
              borderLeft: '2px solid #ef4444',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.9)', display: 'inline-block', flexShrink: 0 }} />
              PROJECTS
            </div>

            {/* INTEL link */}
            <button
              onClick={() => { setSideNavOpen(false); navigate('/intel'); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                background: 'none', border: 'none', padding: '10px 20px',
                color: 'rgba(200,140,140,0.55)', cursor: 'pointer', fontSize: 11,
                fontFamily: FONT, letterSpacing: 2, textAlign: 'left',
                transition: 'all 0.15s', borderLeft: '2px solid transparent',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderLeftColor = '#ef4444'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(200,140,140,0.55)'; e.currentTarget.style.borderLeftColor = 'transparent'; }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(200,140,140,0.4)', display: 'inline-block', flexShrink: 0 }} />
              INTEL
              <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', display: 'inline-block', flexShrink: 0, marginLeft: 4 }} />
            </button>
          </nav>

          {/* Drawer footer — back to portfolio */}
          <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(180,0,30,0.25)' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
                background: 'rgba(180,0,30,0.07)', border: '1px solid rgba(180,0,30,0.35)',
                padding: '8px 12px', color: 'rgba(200,140,140,0.6)', cursor: 'pointer',
                fontSize: 11, fontFamily: FONT, letterSpacing: 2, transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b'; e.currentTarget.style.borderColor = 'rgba(255,68,68,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(200,140,140,0.6)'; e.currentTarget.style.borderColor = 'rgba(180,0,30,0.35)'; }}
            >
              <ArrowLeft size={13} />
              PORTFOLIO
            </button>
          </div>
        </div>

        {/* ── Main content ── */}
        <main style={{ position: 'relative', zIndex: 10, maxWidth: 980, margin: '0 auto', padding: '100px 24px 80px' }}>

          {/* Page header */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Code size={20} style={{ color: '#ef4444' }} />
              <span style={{ color: '#ef4444', fontSize: 11, fontWeight: 700, letterSpacing: 4 }}>SECURITY PROJECTS</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 700, color: '#fff', margin: '0 0 12px', letterSpacing: 1 }}>
              PROJECTS
            </h1>
            <p style={{ color: 'rgba(200,180,180,0.5)', fontSize: 13, maxWidth: 520, lineHeight: 1.7 }}>
              A running record of security tools, CTF solvers, and applied research. Click any card to view full details.
            </p>
            <div style={{ marginTop: 16, width: 48, height: 2, background: 'linear-gradient(to right, #ef4444, transparent)' }} />
          </div>

          {/* Project grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 28,
          }}>
            {PROJECTS.map((project, idx) => (
              <div
                key={idx}
                className="card-anim"
                style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'both' }}
              >
                <ProjectCard project={project} onClick={setSelectedProject} />
              </div>
            ))}
          </div>

          {/* Count badge */}
          <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'rgba(200,140,140,0.35)', fontSize: 11, letterSpacing: 2, fontFamily: FONT }}>
              {PROJECTS.length} PROJECT{PROJECTS.length !== 1 ? 'S' : ''} INDEXED
            </span>
          </div>

        </main>

      </div>

      {/* Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          matrixColumns={matrixColumns}
        />
      )}

    </div>
  );
};

export default ProjectsPage;