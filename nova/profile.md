# Hirat Rahman Rahi: public profile

Knowledge base for Nova, the AI assistant on hiratrahi.com. Everything here is
already public (resume, website, GitHub). Nothing private belongs in this file:
assume visitors can get Nova to repeat any of it.

Last reviewed: 2026-11-05

## At a glance

- **Name:** Hirat Rahman Rahi (goes by Hirat)
- **Pronouns:** he/him
- **Headline:** Aspiring offensive security engineer. "Purple → Red automation."
- **Currently:** Information Technology Intern at Integrity Technology Solutions (always write the full title "Information Technology Intern", never "IT Intern")
- **Studying:** B.S. Computer Science & Mathematics, minor in Psychology, Illinois Wesleyan University, expected December 2027
- **Based in:** Bloomington, Illinois
- **Building:** REDHEXX, a security review platform for MCP servers and AI agents (early access)
- **Looking for:** software engineering and security internships, especially security-focused roles

## Contact and links

- Email: hrahi@iwu.edu
- Website: https://hiratrahi.com
- GitHub: https://github.com/hiratinspace
- LinkedIn: https://www.linkedin.com/in/hiratrahi
- Resume: https://hiratrahi.com/resume.pdf

## Focus

Hirat identifies and validates weaknesses in web applications and systems
through hands-on practice, CTFs, labs, and documented writeups, and builds
Python automation for reconnaissance, testing, and reporting so results are
consistent and repeatable. The goal: help organizations find real risks before
attackers do, and explain them in terms that support clear decisions.

Mathematics supports cryptography and rigorous problem solving. Psychology adds
perspective on the human side of security, from social engineering to how
people make decisions under pressure.

Security focus areas:
- Penetration testing and reconnaissance
- Security operations and incident triage
- MCP and AI-agent security
- Reverse engineering and CTF competitions
- Python automation and tooling

## How Hirat works

- A fast learner who picks up new tools and fields quickly, then proves it by
  building something real: SpecterAI, the home Security Monitoring Lab, and
  Conjure, built solo in 16 hours at a hackathon.
- Always learning and open to new things: steady hands-on practice on
  HackTheBox, TryHackMe, and picoCTF, plus regular CTFs and hackathons.
- Humble and open to feedback. He sees himself as early in his career, focused
  on improving, and treats every project as a chance to learn something new.

## Education

**Illinois Wesleyan University**, Bloomington, IL
- B.S. Computer Science & Mathematics (double major), minor in Psychology
- Expected graduation: December 2027
- Coursework: Algorithms, Data Structures, Software Development, Database Systems, Discrete Math

## Experience

**Information Technology Intern**, Integrity Technology Solutions (managed IT services and cybersecurity)
Bloomington, IL | Aug 2026 to present
- About the firm: Integrity is a NIST CSF-aligned managed security service provider with 150+ clients, many of them regulated banking and healthcare organizations working under HIPAA and financial-sector compliance requirements. The 150+ is the firm's client count, not a measure of Hirat's own work.
- As an intern, Hirat helps secure client environments across a range of security tasks: responding to security alerts, policy controls, domain controls, and other day-to-day security work.
- Do not quote a ticket count, and do not say Hirat personally monitors or secures 150+ clients.

**Intern Analyst & Team Lead**, Driving Forward (cybersecurity and AI readiness consulting)
Chicago, IL | Dec 2025 to Mar 2026
- Led a 4-member team benchmarking midsize companies' cybersecurity and AI readiness across 10 control domains against NIST CSF and ISO 27001, producing maturity scores on a 1 to 5 scale.
- Evaluated cloud, network, and data-security controls (Azure, Palo Alto firewalls, Microsoft Sentinel SIEM, Purview DLP) through framework research and leadership interviews.
- Presented executive reports and roadmaps targeting gaps in DLP, vendor risk, and AI governance.

**Intern Analyst**, McLean County Government, MCRPC (data engineering and analytics)
Bloomington, IL | Aug 2025 to Aug 2026
- Built automated data pipelines and Tableau dashboards analyzing 5+ years of transportation and US Census data for the 2055 Metropolitan Transportation Plan.
- Developed supporting websites for planning projects.

**GIS Analyst & Technical Assistant**, Illinois Wesleyan Physical Plant
May 2025 to Aug 2025 (listed on the website, not on the current resume)
- Built and maintained indoor geodatabases for 8 campus buildings, improving data accuracy by about 40%, and wrote automated validation scripts to reduce manual QA.

## Products and projects

### Founded products

**PassMyResume** (founder, live): https://passmyresume.com
- ATS resume scanner and internship search. Parses PDF/DOCX resumes, scores them against any job posting with a published, deterministic formula weighted across 12 fields, and ranks fixes by how much they raise the score. No sign-up to start.
- Internship search runs on interninbox, pulling from 6 ATS job-board APIs and USAJOBS across 100+ companies with a rate-limited, robots.txt-respecting fetcher.
- Privacy-first: resumes aren't stored unless the user saves them and are never used for model training. A check flags AI rewrites that add numbers, skills, or employers not in the original.
- Stack: TypeScript, Next.js 16, React 19, Tailwind CSS v4, Neon Postgres, Better Auth, Stripe, Resend, Anthropic Claude API, Vercel.

**REDHEXX** (founder, early access): https://redhexx.com
- AI-native security review platform for the MCP and AI-agent attack surface: MCP security, LLM agents, prompt injection, pentesting.

**TuitionCreep** (founder, live): https://tuitioncreep.org
- Projects a student's real four-year college bill, accounting for the annual tuition increases that offer letters hide while scholarships stay flat. Compare aid packages across schools.
- Tuition projections for 3,525 US schools from federal IPEDS data. Next.js plus a Python ETL pipeline.
- Showcase repo: https://github.com/hiratinspace/tuitioncreep-showcase

**interninbox** (open source, live): https://github.com/hiratinspace/interninbox, https://pypi.org/project/interninbox/
- Finds internships from the terminal. Scans company job boards (Greenhouse, Lever, Ashby, SmartRecruiters, Workable, Recruitee), community lists, company career sites, and the USAJOBS API.
- Zero API keys, no telemetry, and a built-in MCP server so AI agents can run it. Python, MIT license, version 0.5.0 on PyPI.

### Security projects

**SpecterAI** (live): https://github.com/hiratinspace/specter-ai, demo at https://hiratinspace.github.io/specter-ai/
- AI-powered penetration testing reconnaissance tool. Runs four modules in parallel (DNS and WHOIS enumeration, port scanning, HTTP probing, SSL/TLS analysis), then sends the findings to Claude for a risk assessment and a structured Markdown pentest report.
- Real-time Flask dashboard with server-sent-event scan progress, report views, and saved scan history; CLI with quick and full scan modes and an offline no-AI fallback.
- Python, Flask, Anthropic Claude API, SSE, dnspython. Apache 2.0. Authorized use only; the documented legal test target is scanme.nmap.org.

**Security Monitoring Lab**: https://github.com/hiratinspace/cyber-portfolio
- Windows 11 plus Sysmon home lab with documented detections and SOC-style incident reports: brute-force logins, encoded PowerShell execution, and LOLBin abuse via rundll32.exe.
- Tools: VMware Fusion, Kali Linux, Windows 11, Sysmon, Event Viewer.

**Crypto-Solver**: https://github.com/hiratinspace/crypto-solver
- Python helper for CTF cryptography challenges. Brute-forces Caesar shifts and ranks candidate plaintexts by English letter-frequency scoring, plus ROT13. A small, growing toolkit.

**The portfolio site itself**: https://github.com/hiratinspace/portfolio
- React site on Cloudflare Pages with a live security intel feed (NVD CVEs and the CISA Known Exploited Vulnerabilities catalog), a live GitHub activity graph, and case studies for shipped projects.

### Hackathon projects

**Conjure**: https://github.com/hiratinspace/Conjure
- Webcam mouse for people with limited hand mobility (tremor, arthritis, partial paralysis, repetitive strain injury). Hand tracking moves the cursor; clicks come from a pinch, holding still (dwell), or a gesture the user records three times.
- Includes a tremor filter and per-user tuning. Runs on-device on macOS. Python and MediaPipe.
- Built solo in 16 hours at a University of Michigan hackathon.

**Glovebox**: https://github.com/hiratinspace/Glovebox
- Offline-first roadside assistance for iOS. Diagnoses car trouble with an on-device LLM (Llama 3.2 1B via llama.cpp) using retrieval over cached vehicle manuals, with a code-enforced safety filter for brakes, airbags, EV batteries, fuel systems, and frame work.
- Travel Mode pre-caches mechanics, towing, hospitals, and fuel along the route for use with no signal. Swift and SwiftUI.
- Built at the UC Berkeley AI Hackathon 2026. Hirat wrote the product spec and architecture and directed AI coding agents to implement it, reviewing each step.

### Earlier projects

**TuitionTruth**: an earlier college tuition tool (5-year tuition history from federal data, predicted next-year rate) that led to TuitionCreep.

## Leadership

- **President, ACM Student Chapter at IWU** (Aug 2026 to present): leads a 50+ member chapter hosting guest speaker panels and technical workshops, and organizes team trips to hackathons nationwide.
- **Senior Resident Advisor, IWU Office of Residential Life** (Aug 2024 to present): mentors and supports 28+ students in a house-style upper-division hall; part of an on-call rotation across residence halls responding to emergencies, conflicts, and student concerns.
- **Founder & President, IWU Billiards Club** (Aug 2024 to present): leads a board of 7+ members running weekly play sessions for the club's general members.
- **Titan Ambassador, IWU Admissions** (May 2024 to present): leads panel sessions each fall for 500+ prospective students and family members.
- **President, IWU Muslim Student Association** (Aug 2024 to Aug 2026, listed on the website): led an executive board and organized interfaith and cultural events.

## Skills

- **Security:** security operations, incident triage, reconnaissance, penetration testing, reverse engineering, CTF competitions, MCP and AI-agent security
- **Frameworks and compliance:** NIST CSF, ISO 27001, HIPAA, DLP, DNS, SSL/TLS analysis
- **Languages:** Python, JavaScript, TypeScript, Java, SQL, HTML/CSS, Swift
- **Systems and tools:** Windows 11, Windows Server, Microsoft 365, Linux, PowerShell, Bash, Flask, Next.js, React, PostgreSQL, Git, GitHub Actions, Anthropic Claude API, Burp Suite, Nmap, Wireshark, Sysmon, Tableau
- **Spoken languages:** English, Bengali, Sylheti, Hindi

## Practice

- HackTheBox: 12 machines rooted
- TryHackMe: 18 rooms completed
- picoCTF: 42 challenges solved
- Competes in CTFs across binary exploitation, web exploitation, and reverse engineering.

## What Nova should not answer

Nova only knows what is in this file. For anything else, point people to
hrahi@iwu.edu or offer to pass along a message. In particular, do not guess or
commit to:
- salary, rates, or compensation
- start dates, availability, relocation, or work authorization
- opinions, beliefs, or personal life details not written here
- anything about employers or clients beyond what is listed above
