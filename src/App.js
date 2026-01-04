import React, { useState, useEffect } from 'react';
import { Shield, Terminal, Code, Briefcase, GraduationCap, User, Mail, Linkedin, ChevronRight, Lock, Cpu, Network, Building2, Megaphone, Users } from 'lucide-react';

const Portfolio = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [matrixColumns, setMatrixColumns] = useState([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Update active section based on scroll position
      const sections = ['home', 'about', 'projects', 'contact'];
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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Matrix rain effect
  useEffect(() => {
    const columns = Math.floor(window.innerWidth / 25);
    const chars = '0123456789ABCDEF'.split('');
    const securityTerms = [
      '0x', 'PWN', 'ROP', 'NOP', 'JMP', 'XOR', 'DEP', 'PIE',
      'root@', 'sudo', 'nc', 'sh', 'bin'
    ];

    const initColumns = Array.from({ length: columns }, (_, i) => ({
      id: i,
      x: i * 25,
      y: Math.random() * -2000,
      speed: 1 + Math.random() * 3,
      chars: Array.from({ length: 15 + Math.floor(Math.random() * 15) }, () =>
        Math.random() > 0.7
          ? securityTerms[Math.floor(Math.random() * securityTerms.length)]
          : chars[Math.floor(Math.random() * chars.length)]
      )
    }));

    setMatrixColumns(initColumns);

    const interval = setInterval(() => {
      setMatrixColumns(prevColumns =>
        prevColumns.map(col => {
          let newY = col.y + col.speed;
          if (newY > window.innerHeight + 200) {
            return {
              ...col,
              y: -200 - Math.random() * 500,
              speed: 1 + Math.random() * 3,
              chars: Array.from({ length: 15 + Math.floor(Math.random() * 15) }, () =>
                Math.random() > 0.7
                  ? securityTerms[Math.floor(Math.random() * securityTerms.length)]
                  : chars[Math.floor(Math.random() * chars.length)]
              )
            };
          }
          return { ...col, y: newY };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

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

  const projects = [
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
      links: [
        { label: "GitHub Repository", url: "#" },
        { label: "Documentation", url: "#" }
      ]
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
      links: [
        { label: "GitHub Repository", url: "#" },
        { label: "Demo Video", url: "#" }
      ]
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
      links: [
        { label: "GitHub Repository", url: "#" },
        { label: "Writeups", url: "#" }
      ]
    }
  ];

  const experiences = [
    {
      title: "Intern Analyst",
      company: "Driving Forward",
      period: "Dec 2025 – Present",
      description: "Develop business cases by analyzing market data and industry trends; translate findings into executive-ready recommendations with clear assumptions, risks, and next steps.",
      icon: Briefcase
    },
    {
      title: "IT Intern",
      company: "McLean County RPC",
      period: "Aug 2025 – Present",
      description: "Support planning and transportation initiatives through GIS/database workflows and IT innovation; analyze multi-year transportation and planning datasets to identify trends supporting the 2050 Metropolitan Transportation Plan (MTP)",
      icon: Cpu
    },
    {
      title: "GIS Analyst & Technical Assistant",
      company: "Illinois Wesleyan Physical Plant",
      period: "May 2025 – Aug 2025",
      description: "Built and maintained indoor geodatabases for 8 campus buildings, improving data accuracy by ~40% and creating automated validation scripts to reduce manual QA.",
      icon: Network
    }
  ];



    const leaderships = [
    {
      title: "Resident Advisor",
      company: "IWU Office of Residential Life",
      period: "Aug 2024 – Present",
      description: "Mentor and support 30+ first-year students through the transition to college, promoting well-being, engagement, and accountability while upholding university policies across 300+ residents. Also bring experience advising upper-division residents in a suite-style community.",
      icon: Building2
    },
    {
      title: "Presidential Ambassador",
      company: "IWU Admissions Office",
      period: "May 2024 – Present",
      description: "Represent IWU in admissions panels and weekly campus tours; communicate academics and student life clearly to prospective students and families.",
      icon: Megaphone
    },
    {
      title: "President",
      company: "IWU MSA & Billiards Club",
      period: "Aug 2024 – Present",
      description: "Lead executive boards for cultural/interfaith programming and run weekly engagement through the Billiards Club.",
      icon: Users
    }
  ];

  const skills = {
    "Offensive Security": ["Binary Exploitation", "Web Exploitation", "Cryptography", "Reverse Engineering", "CTF Competitions"],
    "Languages": ["Python", "C++", "Rust", "OCaml", "SQL"],
    "Tools & Frameworks": [ "Linux", "Git", "Flask", "HTML/CSS", "REST APIs", "ArcGIS Pro"],
    "Engineering Focus": ["Red Team Operations", "Vulnerability Research", "Exploit Development", "Security Labs & Writeups"]
  };

  return (
    <div className="bg-black text-gray-100 min-h-screen font-mono relative overflow-hidden">
      {/* Matrix Rain Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
        {matrixColumns.map((col) => (
          <div
            key={col.id}
            className="absolute font-mono text-sm leading-tight"
            style={{
              left: `${col.x}px`,
              top: `${col.y}px`,
              transform: 'translateZ(0)',
              willChange: 'transform'
            }}
          >
            {col.chars.map((char, idx) => {
              const opacity = Math.max(0.1, 1 - (idx / col.chars.length));
              const isHead = idx === 0;
              const isTail = idx === col.chars.length - 1;

              return (
                <div
                  key={idx}
                  className="transition-opacity duration-100"
                  style={{
                    color: isHead
                      ? '#ffffff'
                      : isTail
                        ? '#450a0a'
                        : `rgba(220, 38, 38, ${opacity})`,
                    textShadow: isHead
                      ? '0 0 8px rgba(220, 38, 38, 0.8), 0 0 12px rgba(220, 38, 38, 0.6)'
                      : isTail
                        ? 'none'
                        : `0 0 6px rgba(220, 38, 38, ${opacity * 0.6})`,
                    opacity: opacity,
                    fontWeight: isHead ? '700' : '400'
                  }}
                >
                  {char}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {/* Navigation */}
      <nav className={`fixed top-0 w-full transition-all duration-300 ${scrolled ? 'bg-black/95 backdrop-blur-sm border-b border-red-900/30' : 'bg-transparent'}`} style={{ zIndex: 100 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => scrollToSection('home')}
              className="flex items-center space-x-2 cursor-pointer group"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0 relative">
                {/* Your hexagon logo */}
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
                           fill="url(#hexGrad)"
                           stroke="#DC2626"
                           strokeWidth="2"
                           className="group-hover:stroke-red-500 transition-colors"/>
                  <polygon points="50,12 82,30 82,70 50,88 18,70 18,30"
                           fill="none"
                           stroke="#7F1D1D"
                           strokeWidth="1.5"
                           opacity="0.5"/>
                  <path d="M 28 35 L 28 65 M 28 50 L 42 50 M 42 35 L 42 65"
                        stroke="url(#letterGrad)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"/>
                  <path d="M 58 35 L 58 65 M 58 35 L 70 35 Q 75 35 75 42 Q 75 50 68 50 L 58 50 M 68 50 L 75 65"
                        stroke="url(#letterGrad)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"/>
                </svg>
              </div>
              <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-red-500 via-burgundy-600 to-burgundy-900 bg-clip-text text-transparent group-hover:from-red-400 group-hover:via-burgundy-500 transition-all hidden sm:inline">
                HIRAT RAHMAN RAHI
              </span>
            </button>
            <div className="flex items-center space-x-3 sm:space-x-8">
              {[
                { label: 'HOME', id: 'home' },
                { label: 'ABOUT', id: 'about' },
                { label: 'PROJECTS', id: 'projects' },
                { label: 'CONTACT', id: 'contact' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-xs sm:text-sm transition-colors hover:text-red-500 ${activeSection === item.id ? 'text-red-500' : 'text-gray-400'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20 px-4 sm:px-6" style={{ zIndex: 10 }}>
        <div className="absolute inset-0 bg-gradient-to-br from-black via-burgundy-950/50 to-black" style={{ zIndex: 2 }}></div>

        <div className="max-w-6xl mx-auto relative w-full" style={{ zIndex: 10 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Terminal className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-red-500 text-xs sm:text-sm font-bold tracking-wider">ASPIRING OFFENSIVE SECURITY ENGINEER</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-red-500 via-burgundy-500 to-red-600 bg-clip-text text-transparent">
                  PURPLE → RED
                </span>
                <br />
                <span className="text-white">AUTOMATION</span>
              </h1>
              <p className="text-gray-400 text-base sm:text-lg mb-8 leading-relaxed">
                Hi, I’m Hirat. I build and document security projects across web security, reverse engineering,
                and CTF-style problem solving, and apply the same discipline to data and automation work through my internships.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => scrollToSection('contact')}
                  className="px-6 py-3 bg-gradient-to-r from-red-900 to-burgundy-900 hover:from-red-800 hover:to-burgundy-800 transition-all border border-red-800 flex items-center justify-center space-x-2 group"
                >
                  <span>LET'S CONNECT</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <a href="mailto:hrahi@iwu.edu" className="px-6 py-3 border border-red-900 hover:border-red-700 hover:bg-red-950/30 transition-all text-center">
                  VIEW RESUME
                </a>
              </div>
            </div>

            <div className="relative mt-8 lg:mt-0">
              <div className="relative z-10 bg-gradient-to-br from-burgundy-900/30 to-black border border-red-900/50 p-6 sm:p-8 backdrop-blur">
                <Shield className="text-red-500 w-12 h-12 sm:w-16 sm:h-16 mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-red-400">Security Focus</h3>
                <ul className="space-y-3">
                  {['Web Application Security (OWASP mindset)', 'Reverse Engineering (fundamentals)', 'Binary Exploitation (pwn fundamentals)', 'Cryptography (CTF / applied basics)', 'CTF Writeups & Learning Notes'].map((item, i) => (
                    <li key={i} className="flex items-center space-x-3 text-sm sm:text-base text-gray-300">
                      <div className="w-2 h-2 bg-red-500 rotate-45 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="absolute -bottom-4 -right-4 w-full h-full border border-red-900/30 hidden sm:block"></div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-24 bg-gradient-to-b from-black to-burgundy-950/20 px-4 sm:px-6 relative" style={{ zIndex: 10 }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-3 mb-8 sm:mb-12">
            <User className="text-red-500 w-6 h-6 sm:w-8 sm:h-8" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white">ABOUT</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <p className="text-gray-300 leading-relaxed">
                I’m Hirat Rahman Rahi, a Computer Science & Neuroscience double major at Illinois Wesleyan University.
                I’m building toward offensive security through hands-on practice (CTFs, labs, writeups) and strong engineering
                habits, clean documentation, repeatable workflows, and measurable outcomes. My neuroscience background strengthens
                how I think about human behavior, attention, and decision-making, which connects directly to security’s human
                layer (social engineering, usability, and risk). Currently preparing for CompTIA Security+ while continuing
                technical work in systems and automation.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="border border-red-900/50 p-4 bg-burgundy-950/20">
                  <div className="text-3xl font-bold text-red-500 mb-2">3.40</div>
                  <div className="text-sm text-gray-400">GPA / 4.0</div>
                </div>
                <div className="border border-red-900/50 p-4 bg-burgundy-950/20">
                  <div className="text-3xl font-bold text-red-500 mb-2">4+</div>
                  <div className="text-sm text-gray-400">Languages Fluent</div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border border-red-900/50 p-6 bg-gradient-to-br from-burgundy-950/30 to-black">
                <GraduationCap className="text-red-500 w-8 h-8 mb-4" />
                <h3 className="text-xl font-bold mb-3 text-red-400">Education</h3>
                <div className="text-gray-300">
                  <p className="font-semibold">Illinois Wesleyan University</p>
                  <p className="text-sm text-gray-400">B.S. Computer Science & Neuroscience</p>
                  <p className="text-sm text-gray-400">Expected May 2027</p>
                </div>
                <div className="mt-4 pt-4 border-t border-red-900/30">
                  <p className="text-sm text-gray-400 mb-2">Relevant Coursework:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Data Structures', 'Software Development', 'Discrete Math', 'Logic, Sets & Recursion'].map((course, i) => (
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

      {/* Skills Section */}
      <section className="py-16 sm:py-24 bg-black px-4 sm:px-6 relative" style={{ zIndex: 10 }}>
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

      {/* Experience Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-black to-burgundy-950/20 px-4 sm:px-6 relative" style={{ zIndex: 10 }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-3 mb-8 sm:mb-12">
            <Briefcase className="text-red-500 w-6 h-6 sm:w-8 sm:h-8" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white">EXPERIENCE</h2>
          </div>

          <div className="space-y-6">
            {experiences.map((exp, idx) => {
              const Icon = exp.icon;
              return (
                <div key={idx} className="border border-red-900/50 p-4 sm:p-6 bg-gradient-to-r from-burgundy-950/20 to-black hover:border-red-700/70 transition-all group">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-3 sm:space-y-0">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-900 to-burgundy-900 flex items-center justify-center border border-red-800 group-hover:border-red-600 transition-all flex-shrink-0">
                        <Icon className="w-6 h-6 text-red-300" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-red-400 transition-colors">{exp.title}</h3>
                        <p className="text-red-400 text-sm sm:text-base">{exp.company}</p>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-400 border border-red-900/50 px-3 py-1 self-start sm:self-auto">{exp.period}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base sm:ml-16">{exp.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* Leadership Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-black to-burgundy-950/20 px-4 sm:px-6 relative" style={{ zIndex: 10 }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-3 mb-8 sm:mb-12">
            <Briefcase className="text-red-500 w-6 h-6 sm:w-8 sm:h-8" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white">LEADERSHIP</h2>
          </div>

          <div className="space-y-6">
            {leaderships.map((exp, idx) => {
              const Icon = exp.icon;
              return (
                <div key={idx} className="border border-red-900/50 p-4 sm:p-6 bg-gradient-to-r from-burgundy-950/20 to-black hover:border-red-700/70 transition-all group">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-3 sm:space-y-0">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-900 to-burgundy-900 flex items-center justify-center border border-red-800 group-hover:border-red-600 transition-all flex-shrink-0">
                        <Icon className="w-6 h-6 text-red-300" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-red-400 transition-colors">{exp.title}</h3>
                        <p className="text-red-400 text-sm sm:text-base">{exp.company}</p>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-400 border border-red-900/50 px-3 py-1 self-start sm:self-auto">{exp.period}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base sm:ml-16">{exp.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-16 sm:py-24 bg-black px-4 sm:px-6 relative" style={{ zIndex: 10 }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-3 mb-8 sm:mb-12">
            <Code className="text-red-500 w-6 h-6 sm:w-8 sm:h-8" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white">PROJECTS</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, idx) => (
              <div
                key={idx}
                className="group cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <div className={`h-48 bg-gradient-to-br ${project.gradient} mb-4 relative overflow-hidden border border-red-900/50 group-hover:border-red-600 transition-all`}>
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Terminal className="w-16 h-16 text-red-400/50 group-hover:text-red-400 transition-all group-hover:scale-110" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-black/60 border border-red-900/50 text-xs text-red-400 backdrop-blur">
                      {project.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <div className="w-8 h-8 bg-red-900/60 border border-red-700 flex items-center justify-center backdrop-blur group-hover:bg-red-800/60 transition-all">
                      <ChevronRight className="w-5 h-5 text-red-300" />
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-red-400 transition-colors">{project.title}</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-red-950/30 border border-red-900/50 text-red-400">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 sm:py-24 bg-gradient-to-b from-black to-burgundy-950/20 px-4 sm:px-6 relative" style={{ zIndex: 10 }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 mb-8 sm:mb-12">
            <Mail className="text-red-500 w-6 h-6 sm:w-8 sm:h-8" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white">CONTACT</h2>
          </div>

          <div className="border border-red-900/50 p-8 bg-gradient-to-br from-burgundy-950/30 to-black">
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Interested in collaboration, have a security project, or just want to connect?
              Feel free to reach out through any of the channels below.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <a href="mailto:hrahi@iwu.edu" className="flex flex-col items-center p-8 border border-red-900/50 hover:border-red-700 hover:bg-red-950/20 transition-all group">
                <Mail className="w-10 h-10 text-red-500 mb-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm text-gray-400 uppercase tracking-wider mb-2">Email</span>
                <span className="text-white text-lg text-center break-all">hrahi@iwu.edu</span>
              </a>

              <a href="https://linkedin.com/in/hiratrahi" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-8 border border-red-900/50 hover:border-red-700 hover:bg-red-950/20 transition-all group">
                <Linkedin className="w-10 h-10 text-red-500 mb-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm text-gray-400 uppercase tracking-wider mb-2">LinkedIn</span>
                <span className="text-white text-lg">hiratrahman</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-red-900/30 py-6 sm:py-8 bg-black px-4 sm:px-6 relative" style={{ zIndex: 10 }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
            <p className="text-gray-500 text-xs sm:text-sm text-center sm:text-left">© 2026 Hirat Rahman Rahi. All rights reserved.</p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-gray-500 text-xs sm:text-sm">Available for opportunities</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Project Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          style={{ zIndex: 200, backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
          onClick={() => setSelectedProject(null)}
        >
          {/* Matrix rain for modal - only show heads */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {matrixColumns.map((col) => (
              <div
                key={`modal-${col.id}`}
                className="absolute font-mono text-sm font-bold"
                style={{
                  left: `${col.x}px`,
                  top: `${col.y}px`,
                  color: '#ffffff',
                  textShadow: '0 0 10px rgba(220, 38, 38, 0.8), 0 0 20px rgba(220, 38, 38, 0.4)',
                  opacity: 0.6,
                  transform: 'translateZ(0)',
                  willChange: 'transform'
                }}
              >
                {col.chars[0]}
              </div>
            ))}
          </div>

          <div
            className="bg-gradient-to-br from-burgundy-950/95 to-black border-2 border-red-900/50 max-w-4xl w-full my-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-red-900/50 border border-red-800 hover:bg-red-900 hover:border-red-600 transition-all flex items-center justify-center group z-10"
            >
              <span className="text-2xl text-red-400 group-hover:text-red-300">×</span>
            </button>

            {/* Header */}
            <div className={`h-48 bg-gradient-to-br ${selectedProject.gradient} relative overflow-hidden border-b-2 border-red-900/50`}>
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <span className="px-4 py-2 bg-black/60 border border-red-900/50 text-sm text-red-400 backdrop-blur mb-4">
                  {selectedProject.category}
                </span>
                <h2 className="text-4xl font-bold text-white text-center">{selectedProject.title}</h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              {/* Tech Stack */}
              <div className="mb-6">
                <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-3">Technologies Used</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tech.map((tech, i) => (
                    <span key={i} className="px-4 py-2 bg-red-950/50 border border-red-900/50 text-red-400 text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {selectedProject.fullDescription}
                </div>
              </div>

              {/* Links */}
              {selectedProject.links && (
                <div className="border-t border-red-900/30 pt-6">
                  <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-4">Project Links</h3>
                  <div className="flex flex-wrap gap-4">
                    {selectedProject.links.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-gradient-to-r from-red-900 to-burgundy-900 hover:from-red-800 hover:to-burgundy-800 transition-all border border-red-800 flex items-center space-x-2 group"
                      >
                        <span>{link.label}</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default Portfolio;