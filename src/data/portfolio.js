// Static portfolio content — defined once at module level (not inside a
// component body, so it is never re-created on render) and deep-frozen so
// it cannot be mutated at runtime. (Security audit Findings 8 & 10.)
import { Briefcase, Cpu, Network, Building2, Megaphone, Users } from 'lucide-react';
import deepFreeze from '../utils/deepFreeze';

export const experiences = deepFreeze([
  {
    title: "IT Intern",
    company: "McLean County Government - MCRPC",
    period: "Aug 2025 – Present",
    description: "Analyze 5+ years of transportation and U.S. Census data to identify demographic and mobility trends supporting the 2055 Metropolitan Transportation Plan. Build automated data pipelines and interactive Tableau dashboards to enhance reporting efficiency and data-driven planning decisions.",
    icon: Cpu
  },
  {
    title: "Intern Analyst",
    company: "Driving Forward",
    period: "Dec 2025 – Mar 2026",
    description: "Led a 4-member team benchmarking midsize companies’ cybersecurity and AI readiness across 10 control domains against NIST CSF and ISO 27001, producing overall maturity scores on a 1–5 scale. Evaluated cloud, network, and data security controls via framework research and leadership interviews; delivered executive reports and roadmaps targeting gaps in DLP, vendor risk, and AI governance.",
    icon: Briefcase
  },
  {
    title: "GIS Analyst & Technical Assistant",
    company: "Illinois Wesleyan Physical Plant",
    period: "May 2025 – Aug 2025",
    description: "Built and maintained indoor geodatabases for 8 campus buildings, improving data accuracy by ~40% and creating automated validation scripts to reduce manual QA.",
    icon: Network
  }
]);

export const leaderships = deepFreeze([
  {
    title: "Resident Advisor",
    company: "IWU Office of Residential Life",
    period: "Aug 2024 – Present",
    description: "Mentor and support 30+ first-year students through the transition to college; promote well-being, engagement, and accountability while upholding university policies across four residence halls with 300+ residents. Supervised and mentored 28+ upper-division students in a suite-style community; collaborated with hall staff, and campus resources to respond to emergencies, and conflicts across five residence halls serving 250+ residents.",
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
]);

export const skills = deepFreeze({
  "Offensive Security": ["Binary Exploitation", "Web Exploitation", "Cryptography", "Reverse Engineering", "CTF Competitions"],
  "Languages": ["Python", "Java", "C++", "Rust", "OCaml", "SQL"],
  "Tools & Frameworks": ["Linux", "Git", "Flask", "HTML/CSS", "REST APIs", "ArcGIS Pro", "Tableau"],
  "Engineering Focus": ["Red Team Operations", "Vulnerability Research", "Exploit Development", "Security Labs & Writeups"]
});
