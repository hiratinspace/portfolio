import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useDialogFocus from '../utils/useDialogFocus';
import MatrixRain from './MatrixRain';
import {
  ArrowLeft, Terminal, ChevronRight, Code,
  Menu, X,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const FONT = "'JetBrains Mono Variable', 'Monaco', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace";

const ALLOWED_PROTOCOLS = new Set(['https:', 'http:', 'mailto:']);
const sanitizeUrl = (url) => {
  if (!url || url.trim() === '' || url === '#') return null;
  try {
    const parsed = new URL(url, window.location.origin);
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) return null;
    return url;
  } catch { return null; }
};

// ─── Project data - add new projects here ─────────────────────────────────────
const PROJECTS = [
  {
    title: "PassMyResume",
    category: "Web App · Founder",
    featured: true,
    status: "LIVE",
    description: "ATS resume scanner and internship search. Scores your resume against any job posting with a published, deterministic formula and ranks the fixes by how much they raise your score. No sign-up to start.",
    tech: ["TypeScript", "Next.js", "React", "Neon Postgres", "Stripe", "Claude API", "Vercel"],
    gradient: "from-black via-black to-black",
    logo: "/PassMyResume.png",
    logoFit: "contain",
    links: [
      { label: "Visit", url: "https://passmyresume.com" },
    ],
    fullDescription: `PassMyResume is a live platform I built and launched that shows you your resume the way an applicant tracking system (ATS) sees it.

The Problem:
Most resumes are filtered by software before a person ever reads them, and most "ATS score" tools are black boxes that never explain where the number comes from or what to fix first.

What It Does:
• Parses PDF and DOCX resumes and scores them against any job posting
• Uses a published, deterministic formula weighted across 12 fields, so the same inputs always give the same score
• Shows matched and missing keywords and the hard requirements you meet
• Ranks suggested fixes by how much each one raises your score
• Internship search built on interninbox, my open-source PyPI scanner and MCP server, pulling from 6 ATS job-board APIs and USAJOBS across 100+ companies with a rate-limited, robots.txt-respecting fetcher

Privacy:
Resumes aren't stored unless you choose to save them, and they're never used for model training. A built-in check flags any AI rewrite that adds numbers, skills, or employers that weren't in your original resume.

Tech Stack:
TypeScript, Next.js 16, React 19, Tailwind CSS v4, Neon Postgres, Better Auth, Stripe, Resend, Anthropic Claude API, deployed on Vercel.

Role: Founder - product, design, and engineering.`,
  },
  {
    title: "REDHEXX",
    category: "Startup · Founder",
    featured: true,
    status: "EARLY ACCESS",
    description: "AI-native security review platform for the MCP and AI-agent attack surface. Founder - currently in early access.",
    tech: ["AI Security", "MCP", "LLM Agents", "Prompt Injection", "Pentesting"],
    gradient: "from-red-800 via-red-950 to-black",
    logo: "/redhexx.webp",
    links: [
      { label: "Visit", url: "https://redhexx.com" },
    ],
    fullDescription: `REDHEXX is an early-stage startup I'm building - an AI-native security review platform focused on the new attack surface created by AI agents and Model Context Protocol (MCP) servers.

The Problem:
Teams are shipping AI agents and MCP integrations fast, but traditional pentests rarely reason about prompt-injection-to-tool-abuse or privilege chains between agents. That leaves a new class of exposure unaddressed.

What It Does:
A hands-on security review of your MCP and agent configuration, run in a scoped test environment - no production access required. It surfaces:
• Unauthenticated tools that agents can invoke without authorization
• Over-scoped permissions granting excessive capability
• Injection paths that turn prompt attacks into privileged actions
• Privilege-escalation chains between agents

Deliverables: a configuration scan, ranked vulnerability findings, and clear remediation guidance.

Status:
Pre-launch / early access - building the platform, refining the methodology, and working with first design partners.

Role: Founder - product direction, security research, and engineering.`,
  },
  {
    title: "TuitionCreep",
    category: "Web App · Founder",
    featured: true,
    status: "LIVE",
    description: "College cost tool that projects your real four-year tuition bill - accounting for the annual increases that offer letters hide while scholarships stay flat. Compare aid packages across schools.",
    tech: ["Web App", "IPEDS Data", "College Cost", "EdTech"],
    gradient: "from-red-900 via-red-950 to-black",
    logo: "/TuitionCreep.webp",
    links: [
      { label: "Visit", url: "https://tuitioncreep.org" },
    ],
    fullDescription: `TuitionCreep is a product I built to expose the true four-year cost of college - the number offer letters never show you.

The Problem:
Colleges advertise freshman-year tuition, but tuition compounds every year while most scholarships stay flat. Families commit based on year-one numbers and get blindsided by a much larger bill in years 3 and 4.

What It Does:
• Projects your total four-year cost using real tuition-growth rates
• Compares up to four schools side by side, each with its own aid package
• Year-by-year cost breakdowns so you see exactly where the increases land
• "Guaranteed tuition" resource highlighting schools with frozen pricing
• A financial-aid questions guide for families evaluating offers

Data:
Search across 3,478 US schools, powered by federal IPEDS data through 2023.

Who It's For:
High school seniors and families comparing college options and financial aid offers.

Tagline: "Know your senior-year bill before you enroll."

Role: Founder - product, data, and engineering.`,
  },
  {
    title: "interninbox",
    category: "CLI Tool · Open Source",
    featured: true,
    status: "LIVE",
    description: "Open-source CLI that finds internships from your terminal. Scans company job boards (Greenhouse, Lever, Ashby, and more), community lists, and the USAJOBS API. Zero API keys, no telemetry, and an MCP server so AI agents can run it too.",
    tech: ["Python", "CLI", "MCP", "PyPI", "Open Source"],
    gradient: "from-black via-black to-black",
    logo: "/interninbox.webp",
    logoFit: "contain",
    links: [
      { label: "GitHub", url: "https://github.com/hiratinspace/interninbox" },
      { label: "PyPI", url: "https://pypi.org/project/interninbox/" },
    ],
    fullDescription: `interninbox is an open-source command-line tool I built and published to PyPI. It finds internships from your terminal - no accounts, no API keys, and nothing leaves your machine.

The Problem:
Internship hunting means checking dozens of career pages over and over. Job aggregators are noisy, require accounts, and often show stale listings. The freshest data lives on each company's own job board.

What It Does:
List your target companies once, then get every matching internship in one command. It reads the documented public board APIs of Greenhouse, Lever, Ashby, SmartRecruiters, Workable, and Recruitee - the same endpoints each company's careers page calls - plus the official USAJOBS API for federal Pathways internships.

Key Features:
• Search by location with smart aliases: "California" finds boards that wrote "CA", and vice versa
• Nine curated role presets (software, cybersecurity, finance, and more) or custom keywords
• Eligibility filters for visa sponsorship, season, and degree level
• A curated registry of 100+ live-verified companies, plus community lists like SimplifyJobs
• A first-run wizard that asks three questions and scans immediately
• --new-only mode turns scheduled scans into a personal internship feed
• An MCP server (interninbox mcp) that hands the whole scanner to Claude or any MCP-capable agent

Privacy and Ethics:
No accounts, no API keys, no LLMs, no telemetry. Sequential, rate-limited requests with an honest User-Agent against documented public APIs only - no scraping.

Tech Stack:
Python, published on PyPI with CI via GitHub Actions. MIT licensed.

Role: Creator - design, engineering, and maintenance.`,
  },
  {
    title: "SpecterAI",
    category: "AI-Powered Security Tool",
    featured: true,
    status: "LIVE",
    description: "AI-powered penetration testing reconnaissance tool. Input a target domain, get a full recon scan analyzed by Claude AI, and receive a professional pentest report. All in one command.",
    tech: ["Python", "Flask", "Claude AI", "DNS", "SSL/TLS", "SSE", "REST API"],
    gradient: "from-red-950 via-red-900 to-black",
    logo: "/SpecterAI.webp",
    links: [
      { label: "Live Tool", url: "https://hiratinspace.github.io/specter-ai/" },
      { label: "GitHub", url: "https://github.com/hiratinspace/specter-ai" },
    ],
    fullDescription: `An AI-powered penetration testing reconnaissance tool that automates the first phase of a security assessment.

How It Works:
User inputs a target domain → 4 recon modules run in parallel → Results aggregated → Sent to Claude AI (acts as an experienced pentester) → AI returns risk level + findings + next steps → Markdown report generated → Visual web dashboard displays everything
The web dashboard runs on a free Render instance, so the first scan after a quiet period can take a minute while it wakes up.

Recon Modules:
• DNS / WHOIS - IP addresses, DNS records, subdomains, registrar info
• Port Scanner - Open TCP ports, running services, service banners
• HTTP Probe - Tech stack, missing security headers, cookie flags, redirects
• SSL/TLS - Certificate expiry, weak ciphers, self-signed certs, HTTP→HTTPS

AI Analysis:
Claude Sonnet acts as an experienced pentester. It doesn't just return raw data, it interprets findings, assigns a risk level, summarizes the attack surface, and provides prioritized next steps in structured JSON.

Key Features:
• Parallel scanning - all 4 modules run simultaneously for speed
• Two interfaces - CLI for terminal users, web dashboard for visual reporting
• Real-time progress streaming via Server-Sent Events (SSE)
• Scan history - every scan is saved and can be reopened or downloaded
• JSON export - raw API endpoint for every report
• Graceful error handling - one failing module never crashes the scan
• Ethical use built in - authorized-use disclaimer on every report

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
    title: "Conjure",
    category: "Accessibility · Hackathon",
    description: "Webcam mouse for people with limited hand mobility. Hand tracking moves the cursor; clicks come from a pinch, holding still, or a gesture you record yourself. Built solo in 16 hours at a University of Michigan hackathon.",
    tech: ["Python", "MediaPipe", "Computer Vision", "Accessibility", "macOS"],
    gradient: "from-red-900 via-burgundy-900 to-black",
    links: [
      { label: "GitHub", url: "https://github.com/hiratinspace/Conjure" },
    ],
    fullDescription: `Conjure turns a standard laptop webcam into an alternative pointer for people who can lift one hand but find a mouse hard or painful: tremor, arthritis, partial paralysis, or repetitive strain injury.

The Idea:
Most webcam pointers ship a fixed set of gestures and expect your hand to adapt. Conjure inverts that: any motion your hand can repeat reliably becomes a click.

Key Features:
• Natural pinch to click, with feedback when a pinch isn't counted
• Record your own click gesture three times and Conjure learns it
• Dwell clicking (hold still) for anyone who can't pinch
• A tremor filter that ignores tremor-speed motion so the cursor stays steady
• Per-user tuning of tremor threshold and pinch sensitivity
• Input pauses automatically when the hand leaves the frame

Measured Results (from recorded sessions, reproducible with the test suite):
• 0 false clicks in 2.4 minutes of ordinary pointing, versus 17 for a typical tutorial approach
• Cursor shake at rest of 1.3 px, versus 4.8 px
• 308 passing tests

Privacy:
Video is processed on the laptop and never stored or sent. No account, no cloud.

Tech Stack:
Python 3.11+, MediaPipe hand tracking, One Euro filter smoothing, macOS (Apple Silicon).

Role: Solo builder - design, engineering, and testing.`,
  },
  {
    title: "Security Monitoring Lab",
    category: "Blue Team · Writeups",
    description: "Windows 11 + Sysmon home lab with documented detections and a SOC-style incident report: brute-force logins, encoded PowerShell, and LOLBin abuse via rundll32.",
    tech: ["Sysmon", "Windows Event Logs", "Kali Linux", "Detection Engineering", "Incident Response"],
    gradient: "from-burgundy-800 via-red-800 to-black",
    links: [
      { label: "GitHub", url: "https://github.com/hiratinspace/cyber-portfolio" },
    ],
    fullDescription: `A hands-on lab documenting how common attacks show up in Windows telemetry, and how to detect and write them up.

Lab Setup:
Windows 11 victim and Kali Linux attacker VMs in VMware Fusion, with Sysmon and Windows Event Viewer for telemetry.

Detections and Writeups:
• Brute-force login: a spike of failed logons (Event ID 4625) followed by a success (4624)
• Encoded PowerShell execution caught through Sysmon process-creation events
• LOLBin abuse: suspicious rundll32.exe execution

Incident Report:
A SOC-style investigation of the brute-force login with a timeline, evidence, severity rating, and recommendations such as account lockout thresholds and correlation with endpoint telemetry.

Why It Matters:
Understanding what attacks look like from the defender's side makes offensive work sharper, and it maps directly to day-to-day security operations work.`,
  },
  {
    title: "Crypto-Solver",
    category: "CTF Tooling",
    description: "Python helper for CTF cryptography challenges. Brute-forces Caesar shifts and ranks candidate plaintexts by English letter-frequency scoring, plus ROT13. A small, growing toolkit.",
    tech: ["Python", "Cryptography", "CTF"],
    gradient: "from-black via-burgundy-900 to-red-900",
    links: [
      { label: "GitHub", url: "https://github.com/hiratinspace/crypto-solver" },
    ],
    fullDescription: `A small Python toolkit I use for the classical-cipher side of CTF cryptography challenges.

What It Does Today:
• Brute-forces all 25 Caesar shifts
• Scores each candidate against English letter frequencies and ranks the most readable plaintexts first
• ROT13 decoding

How It Fits:
I compete in CTFs across binary exploitation, web exploitation, reverse engineering, and cryptography. This repo is where I turn repeated manual steps from crypto challenges into reusable code, starting with classical ciphers.`,
  },
];

// Cards contain their own links, so they can't be <button>s; give them button
// semantics and Enter/Space activation instead.
const cardProps = (project, onClick) => ({
  role: 'button',
  tabIndex: 0,
  'aria-label': `${project.title}: view details`,
  onClick: () => onClick(project),
  onKeyDown: (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(project); }
  },
});

// ─── Project Card ─────────────────────────────────────────────────────────────
const ProjectCard = ({ project, onClick }) => (
  <div
    className="group cursor-pointer"
    {...cardProps(project, onClick)}
  >
    <div className={`h-48 bg-gradient-to-br ${project.gradient} mb-4 relative overflow-hidden border border-red-900/50 group-hover:border-red-600 transition-all`}>
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
      <div className="absolute inset-0 flex items-center justify-center">
        {project.logo
          ? <img src={project.logo} alt={project.title} className={`absolute inset-0 w-full h-full ${project.logoFit === 'contain' ? 'object-contain p-4' : 'object-cover'} group-hover:scale-105 transition-all duration-300`} />
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

// ─── Featured Card (full-width, flagship projects) ────────────────────────────
const FeaturedCard = ({ project, onClick }) => (
  <div
    className="group cursor-pointer border border-red-900/50 hover:border-red-600 transition-all bg-black/40"
    {...cardProps(project, onClick)}
  >
    <div className="featured-card-inner flex">
      {/* Banner / logo */}
      <div className={`featured-banner relative overflow-hidden bg-gradient-to-br ${project.gradient}`}>
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
        <div className="absolute inset-0 flex items-center justify-center">
          {project.logo
            ? <img src={project.logo} alt={project.title} className={`absolute inset-0 w-full h-full ${project.logoFit === 'contain' ? 'object-contain p-4' : 'object-cover'} group-hover:scale-105 transition-all duration-300`} />
            : <Terminal className="w-16 h-16 text-red-400/50 group-hover:text-red-400 transition-all group-hover:scale-110" />
          }
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col gap-2.5 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 bg-black/60 border border-red-900/50 text-xs text-red-400" style={{ fontFamily: FONT }}>
            {project.category}
          </span>
          {project.status && (
            <span className="px-3 py-1 bg-red-950/60 border border-red-700 text-xs text-red-300 font-bold tracking-widest" style={{ fontFamily: FONT }}>
              {project.status}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-red-400 transition-colors" style={{ fontFamily: FONT }}>
            {project.title}
          </h3>
          {project.links && (
            <div className="flex flex-wrap gap-2">
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
                    className="px-3 py-1.5 bg-black/60 hover:bg-red-900/60 border border-red-800 text-red-300 hover:text-white text-xs flex items-center gap-1 transition-all"
                    style={{ fontFamily: FONT }}
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
        <p className="text-gray-400 text-sm leading-relaxed">{project.description}</p>
        <div className="flex flex-wrap gap-2">
          {project.tech.map((tech, i) => (
            <span key={i} className="text-xs px-2 py-1 bg-red-950/30 border border-red-900/50 text-red-400" style={{ fontFamily: FONT }}>
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ─── Project Modal ────────────────────────────────────────────────────────────
const ProjectModal = ({ project, onClose }) => {
  const panelRef = useDialogFocus(onClose);
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto"
      style={{ zIndex: 400, backgroundColor: 'rgba(0,0,0,0.88)', fontFamily: FONT }}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-dialog-title"
        tabIndex={-1}
        className="bg-gradient-to-br from-burgundy-950/95 to-black border-2 border-red-900/50 max-w-4xl w-full my-8 relative"
        style={{ zIndex: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close details"
          className="absolute top-4 right-4 w-10 h-10 bg-red-900/50 border border-red-800 hover:bg-red-900 hover:border-red-600 transition-all flex items-center justify-center group z-10"
        >
          <span className="text-2xl text-red-400 group-hover:text-red-300" aria-hidden="true">×</span>
        </button>

        {/* Header */}
        <div className={`h-48 bg-gradient-to-br ${project.gradient} relative overflow-hidden border-b-2 border-red-900/50`}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 gap-3">
            <span className="px-4 py-2 bg-black/60 border border-red-900/50 text-sm text-red-400 backdrop-blur">
              {project.category}
            </span>
            <h2 id="project-dialog-title" className="text-3xl sm:text-4xl font-bold text-white text-center">{project.title}</h2>
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
  const [sideNavOpen, setSideNavOpen] = useState(false);


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
        .featured-banner { width: 40%; min-height: 150px; flex-shrink: 0; }
        @media (max-width: 640px) {
          .portfolio-label { display: none !important; }
          .featured-card-inner { flex-direction: column; }
          .featured-banner { width: 100%; min-height: 130px; }
        }
        ::-webkit-scrollbar { width: 4px; background: #080103; }
        ::-webkit-scrollbar-thumb { background: rgba(180,0,30,0.5); border-radius: 2px; }
        * { box-sizing: border-box; }
      `}</style>

      <div className="projects-bg" style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>

        {/* Matrix rain */}
        <MatrixRain variant="page" style={{ zIndex: 3 }} />

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
          <div style={{ maxWidth: 920, margin: '0 auto', padding: '12px 24px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>

            {/* Left - back to portfolio */}
            <button
              onClick={() => navigate('/')}
              aria-label="Back to portfolio" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'rgba(200,180,180,0.75)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontFamily: FONT, letterSpacing: 1.5, justifySelf: 'start', transition: 'color 0.15s', padding: '10px 8px 10px 0', minHeight: 44 }}
              onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(200,180,180,0.75)'}
            >
              <ArrowLeft size={20} />
              <span style={{ display: 'inline', fontSize: 15, letterSpacing: 1.5 }} className="portfolio-label">PORTFOLIO</span>
            </button>

            {/* Centre - page label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 18px', border: '1px solid rgba(180,0,30,0.4)', background: 'rgba(180,0,30,0.07)' }}>
              <Code size={14} style={{ color: 'rgba(200,140,140,0.8)' }} />
              <span style={{ color: 'rgba(200,140,140,0.8)', fontSize: 12, fontWeight: 700, letterSpacing: 3, fontFamily: FONT }}>PRODUCTS</span>
            </div>

            {/* Right - hamburger */}
            <button
              onClick={() => setSideNavOpen(o => !o)}
              style={{ justifySelf: 'end', background: 'none', border: '1px solid rgba(180,0,30,0.4)', padding: '6px 8px', cursor: 'pointer', color: '#ff6b6b', display: 'flex', alignItems: 'center', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,68,68,0.7)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(180,0,30,0.4)'}
              aria-label={sideNavOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={sideNavOpen}
              aria-controls="products-nav-drawer"
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
        <div id="products-nav-drawer" aria-hidden={!sideNavOpen} inert={sideNavOpen ? undefined : ''} style={{
          position: 'fixed', top: 0, right: 0, height: '100vh', width: 260,
          background: 'rgba(6,0,2,0.98)', borderLeft: '1px solid rgba(180,0,30,0.5)',
          zIndex: 301, fontFamily: FONT,
          transform: sideNavOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s ease',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid rgba(180,0,30,0.35)' }}>
            <span style={{ color: '#ff6b6b', fontSize: 11, letterSpacing: 3, fontWeight: 700 }}>NAVIGATION</span>
            <button onClick={() => setSideNavOpen(false)} aria-label="Close navigation" style={{ background: 'none', border: 'none', color: 'rgba(220,170,170,0.85)', cursor: 'pointer', display: 'flex', padding: 6 }}>
              <X size={16} />
            </button>
          </div>

          <nav style={{ padding: '20px 0', flex: 1 }}>
            {/* Current page */}
            <div style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(239,68,68,0.06)', padding: '10px 20px',
              color: '#ef4444', fontSize: 11, fontFamily: FONT, letterSpacing: 2,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.9)', display: 'inline-block', flexShrink: 0 }} />
              PRODUCTS
            </div>

            {/* INTEL link */}
            <button
              onClick={() => { setSideNavOpen(false); navigate('/intel'); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                background: 'none', border: 'none', padding: '10px 20px',
                color: 'rgba(200,140,140,0.85)', cursor: 'pointer', fontSize: 11,
                fontFamily: FONT, letterSpacing: 2, textAlign: 'left',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(200,140,140,0.85)'; }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(200,140,140,0.4)', display: 'inline-block', flexShrink: 0 }} />
              INTEL
              <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', display: 'inline-block', flexShrink: 0, marginLeft: 4 }} />
            </button>
          </nav>

          {/* Drawer footer - back to portfolio */}
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
        <main style={{ position: 'relative', zIndex: 10, maxWidth: 920, margin: '0 auto', padding: '100px 24px 80px' }}>

          {/* Page header */}
          <div style={{ marginBottom: 48 }}>
            <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 700, color: '#fff', margin: '0 0 12px', letterSpacing: 1 }}>
              PRODUCTS
            </h1>
            <p style={{ color: 'rgba(200,180,180,0.75)', fontSize: 13, maxWidth: 520, lineHeight: 1.7 }}>
              Products I've founded and shipped up top, with hackathon builds, labs, and CTF tooling below. Click any card for full details.
            </p>
            <div style={{ marginTop: 16, width: 48, height: 2, background: 'linear-gradient(to right, #ef4444, transparent)' }} />
          </div>

          {/* Featured projects */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <h2 style={{ color: '#ef4444', fontSize: 11, fontWeight: 700, letterSpacing: 2, fontFamily: FONT, margin: 0 }}>{'// FEATURED'}</h2>
            <div style={{ flex: 1, height: 1, background: 'rgba(180,0,30,0.25)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginBottom: 56 }}>
            {PROJECTS.filter(p => p.featured).map((project, idx) => (
              <div
                key={project.title}
                className="card-anim"
                style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'both' }}
              >
                <FeaturedCard project={project} onClick={setSelectedProject} />
              </div>
            ))}
          </div>

          {/* Labs, hackathon & CTF grid */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <h2 style={{ color: '#ef4444', fontSize: 11, fontWeight: 700, letterSpacing: 2, fontFamily: FONT, margin: 0 }}>{'// LABS, HACKATHONS & CTF'}</h2>
            <div style={{ flex: 1, height: 1, background: 'rgba(180,0,30,0.25)' }} />
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 28,
          }}>
            {PROJECTS.filter(p => !p.featured).map((project, idx) => (
              <div
                key={project.title}
                className="card-anim"
                style={{ animationDelay: `${(idx + 2) * 80}ms`, animationFillMode: 'both' }}
              >
                <ProjectCard project={project} onClick={setSelectedProject} />
              </div>
            ))}
          </div>

          {/* Count badge */}
          <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'rgba(200,140,140,0.85)', fontSize: 11, letterSpacing: 2, fontFamily: FONT }}>
              {PROJECTS.length} BUILD{PROJECTS.length !== 1 ? 'S' : ''} INDEXED
            </span>
          </div>

        </main>

      </div>

      {/* Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

    </div>
  );
};

export default ProjectsPage;