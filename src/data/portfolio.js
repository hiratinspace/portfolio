// Static portfolio content - defined once at module level (not inside a
// component body, so it is never re-created on render) and deep-frozen so
// it cannot be mutated at runtime. (Security audit Findings 8 & 10.)
import deepFreeze from '../utils/deepFreeze';

export const experiences = deepFreeze([
  {
    title: "Information Technology Intern",
    company: "Integrity Technology Solutions",
    period: "Aug 2026 – Present",
    description: "Support security operations and IT service delivery at a NIST CSF-aligned managed security service provider serving 150+ regulated banking and healthcare clients, working within HIPAA and financial-sector compliance requirements. Handle tasks across Windows 11 endpoints, Windows Server, and Microsoft 365 environments, including account provisioning, access issues, patching, and device setup. Configure advanced audit and security policies on Windows Server, and help manage Azure and Microsoft 365 environments as part of security operations. Monitor endpoint protection, security alerts, and patch compliance, and escalate suspicious activity following the firm's incident-response procedures."
  },
  {
    title: "Intern Analyst & Team Lead",
    company: "Driving Forward",
    period: "Dec 2025 – Mar 2026",
    description: "Led a 4-member team benchmarking midsize companies’ cybersecurity and AI readiness across 10 control domains against NIST CSF and ISO 27001, producing maturity scores on a 1–5 scale. Evaluated cloud, network, and data-security controls (Azure, Palo Alto firewalls, Microsoft Sentinel SIEM, Purview DLP) through framework research and leadership interviews; presented executive reports and roadmaps targeting gaps in DLP, vendor risk, and AI governance."
  },
  {
    title: "Intern Analyst",
    company: "McLean County Government - MCRPC",
    period: "Aug 2025 – Aug 2026",
    description: "Built automated data pipelines and Tableau dashboards analyzing 5+ years of transportation and U.S. Census data for the 2055 Metropolitan Transportation Plan, and developed supporting websites for planning projects."
  },
  {
    title: "GIS Analyst & Technical Assistant",
    company: "Illinois Wesleyan Physical Plant",
    period: "May 2025 – Aug 2025",
    description: "Built and maintained indoor geodatabases for 8 campus buildings, improving data accuracy by ~40% and creating automated validation scripts to reduce manual QA."
  }
]);

export const leaderships = deepFreeze([
  {
    title: "President",
    company: "ACM Student Chapter at IWU",
    period: "Aug 2026 – Present",
    description: "Lead a 50+ member chapter hosting guest speaker panels and technical workshops, and organize team trips to hackathons nationwide."
  },
  {
    title: "Senior Resident Advisor",
    company: "IWU Office of Residential Life",
    period: "Aug 2024 – Present",
    description: "Directly mentor and support 28+ students in a house-style upper-division hall. Part of an on-call rotation covering multiple residence halls, collaborating with hall staff and campus resources to respond to emergencies, conflicts, and student concerns."
  },
  {
    title: "Founder & President",
    company: "IWU Billiards Club",
    period: "Aug 2024 – Present",
    description: "Lead a board of 7+ members running weekly play sessions for the club's general members."
  },
  {
    title: "Titan Ambassador",
    company: "IWU Admissions Office",
    period: "May 2024 – Present",
    description: "Lead panel sessions each fall for 500+ prospective students and family members, communicating academics and student life at Illinois Wesleyan."
  },
  {
    title: "President",
    company: "IWU MSA",
    period: "Aug 2024 – Aug 2026",
    description: "Led executive board totaling 7+ members and organized 10+ interfaith and cultural events reaching 200+ participants, fostering inclusive communities and promoting diversity."
  }
]);

export const skills = deepFreeze({
  "Security": ["Security Operations", "Incident Triage", "Reconnaissance", "Penetration Testing", "Reverse Engineering", "CTF Competitions", "MCP & AI-Agent Security"],
  "Frameworks & Compliance": ["NIST CSF", "ISO 27001", "HIPAA", "DLP", "DNS", "SSL/TLS Analysis"],
  "Languages": ["Python", "JavaScript", "TypeScript", "Java", "SQL", "HTML/CSS"],
  "Systems & Tools": ["Windows 11", "Windows Server", "Microsoft 365", "Linux", "PowerShell", "Bash", "Flask", "Next.js", "React", "PostgreSQL", "Git", "GitHub Actions", "Claude API"]
});
