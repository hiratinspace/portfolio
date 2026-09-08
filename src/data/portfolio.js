// Static portfolio content - defined once at module level (not inside a
// component body, so it is never re-created on render) and deep-frozen so
// it cannot be mutated at runtime. (Security audit Findings 8 & 10.)
import { Briefcase, Cpu, Network, Building2, Megaphone, Users } from 'lucide-react';
import deepFreeze from '../utils/deepFreeze';

export const experiences = deepFreeze([
  {
    title: "Information Technology Intern",
    company: "Integrity Technology Solutions",
    period: "Aug 2026 – Present",
    description: "Rotational internship supporting security operations and IT service delivery for regulated clients in banking and healthcare at a NIST CSF-aligned managed security service provider.",
    icon: Cpu
  },
  {
    title: "Intern Analyst",
    company: "McLean County Government - MCRPC",
    period: "Aug 2025 – Aug 2026",
    description: "Analyzed 5+ years of transportation and U.S. Census data to identify demographic and mobility trends supporting the 2055 Metropolitan Transportation Plan. Built automated data pipelines and interactive Tableau dashboards to enhance reporting efficiency and data-driven planning decisions.",
    icon: Cpu
  },
  {
    title: "Intern Analyst (Cybersecurity)",
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
    title: "President",
    company: "ACM Chapter at IWU",
    period: "Aug 2026 – Present",
    description: "Leading the executive board and setting the chapter's direction for the year. Organize technical workshops, industry speaker events, and social programming to build a stronger computer science community on campus, and coordinate student teams to attend hackathons nationwide.",
    icon: Users
  },
  {
    title: "Resident Advisor",
    company: "IWU Office of Residential Life",
    period: "Aug 2024 – Present",
    description: "Resident Advisor for three consecutive years, mentoring and supporting 58+ residents annually across first-year and upper-division communities, including a suite-style hall. Promote well-being, engagement, and accountability while upholding university policies as part of an on-call rotation covering up to five residence halls and 300+ residents. Collaborate with hall staff and campus resources to respond to emergencies, conflicts, and student concerns.",
    icon: Building2
  },
  {
    title: "Founder & President",
    company: "IWU Billiards Club",
    period: "Aug 2024 – Present",
    description: "Lead executive board of 6 members to run weekly tournament with over 60 active members.",
    icon: Users
  },
  {
    title: "Presidential Ambassador",
    company: "IWU Admissions Office",
    period: "May 2024 – Present",
    description: "Represent Illinois Wesleyan in admissions panels and weekly campus tours; communicate academics and student life clearly to prospective students and families.",
    icon: Megaphone
  },
  {
    title: "President",
    company: "IWU MSA",
    period: "Aug 2024 – Aug 2026",
    description: "Led executive board totaling 7+ members and organized 10+ interfaith and cultural events reaching 200+ participants, fostering inclusive communities and promoting diversity.",
    icon: Users
  }
]);

export const skills = deepFreeze({
  "Offensive Security": ["Web Application Security", "Reverse Engineering", "Cryptography", "CTF Competitions", "Security Writeups"],
  "Automation & Scripting": ["Python Automation", "Recon & Reporting Scripts", "Web Scraping", "REST APIs", "Bash"],
  "Languages": ["Python", "Java", "C++", "SQL"],
  "Tools & Frameworks": ["Linux", "Git", "Flask", "HTML/CSS", "Tableau"]
});
