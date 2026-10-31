export type LearningPath = {
  id: string;
  tier: "01" | "02" | "03" | "04";
  title: string;
  blurb: string;
  resources: { label: string; url: string }[];
};

// Curated, MVP-scoped: link out to existing free resources rather than
// hosting original course content in v1.
export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "foundations",
    tier: "01",
    title: "Foundations",
    blurb: "Networking, Linux, and security fundamentals before anything offensive.",
    resources: [
      { label: "Professor Messer — Security+", url: "https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-comptia-security-plus-course/" },
      { label: "OverTheWire — Bandit", url: "https://overthewire.org/wargames/bandit/" },
      { label: "Cisco Networking Academy — Free Courses", url: "https://www.netacad.com/courses/all-courses" },
    ],
  },
  {
    id: "web-security",
    tier: "02",
    title: "Web Security",
    blurb: "Injection, auth flaws, and the OWASP Top 10 in practice.",
    resources: [
      { label: "PortSwigger Web Security Academy", url: "https://portswigger.net/web-security" },
      { label: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/" },
      { label: "HackTheBox Academy — Web Requests", url: "https://academy.hackthebox.com/module/details/35" },
    ],
  },
  {
    id: "network-pentest",
    tier: "03",
    title: "Network & Pentesting",
    blurb: "Enumeration, exploitation, and reporting on real-ish infrastructure.",
    resources: [
      { label: "TryHackMe — Jr Penetration Tester", url: "https://tryhackme.com/path/outline/jrpenetrationtester" },
      { label: "HackTheBox Academy", url: "https://academy.hackthebox.com/" },
    ],
  },
  {
    id: "malware-forensics",
    tier: "04",
    title: "Malware & Forensics",
    blurb: "Static/dynamic analysis and incident response basics.",
    resources: [
      { label: "MITRE ATT&CK", url: "https://attack.mitre.org/" },
      { label: "John Hammond — YouTube", url: "https://www.youtube.com/@_JohnHammond" },
    ],
  },
  {
    id: "global-intel",
    tier: "01",
    title: "Global Intel & Policy",
    blurb: "Understand the legal and threat landscape on a global scale.",
    resources: [
      { label: "SANS Newsletters", url: "https://www.sans.org/newsletters/" },
      { label: "CISA Shield Up", url: "https://www.cisa.gov/shields-up" },
      { label: "ENISA — European Union Agency for Cybersecurity", url: "https://www.enisa.europa.eu/" },
      { label: "ITU — Global Cybersecurity Index", url: "https://www.itu.int/en/ITU-D/Cybersecurity/Pages/global-cybersecurity-index.aspx" },
    ],
  },
];
