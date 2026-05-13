import { I_Experience } from "@/src/types/type";
import { IconType } from "react-icons";
import {
  SiNextdotjs,
  SiTypescript,
  SiReact,
  SiTailwindcss,
  SiPostgresql,
  SiMongodb,
  SiVercel,
  SiSolana,
  SiRust,
  SiNodedotjs,
  SiSocketdotio,
  SiExpress,
  SiStripe,
  SiFramer,
  SiJavascript,
  SiDrizzle,
  SiVite,
} from "react-icons/si";
import { DiRedis } from "react-icons/di";
import {
  TbBrandOpenai,
  TbApi,
  TbChartLine,
  TbAnchor,
  TbTestPipe,
  TbLayoutGrid,
  TbPalette,
  TbFileTypography,
} from "react-icons/tb";

// Technology icons and colors mapping
export const TECH_ICONS: Record<string, { icon: IconType; color: string }> = {
  // Frameworks
  "Next.js": { icon: SiNextdotjs, color: "#ffffff" },
  "React": { icon: SiReact, color: "#61DAFB" },

  // Languages
  "TypeScript": { icon: SiTypescript, color: "#3178C6" },
  "JavaScript": { icon: SiJavascript, color: "#F7DF1E" },
  "Rust": { icon: SiRust, color: "#DEA584" },

  // Styling
  "Tailwind CSS": { icon: SiTailwindcss, color: "#06B6D4" },
  "Framer": { icon: SiFramer, color: "#0055FF" },
  "Framer Motion": { icon: SiFramer, color: "#0055FF" },
  "NeoBrutalism": { icon: TbPalette, color: "#FF6B6B" },

  // Databases
  "PostgreSQL": { icon: SiPostgresql, color: "#4169E1" },
  "MongoDB": { icon: SiMongodb, color: "#47A248" },
  "Redis": { icon: DiRedis, color: "#DC382D" },
  "Drizzle": { icon: SiDrizzle, color: "#C5F74F" },

  // Backend
  "Node.js": { icon: SiNodedotjs, color: "#339933" },
  "Express": { icon: SiExpress, color: "#ffffff" },
  "Socket.io": { icon: SiSocketdotio, color: "#010101" },
  "trpc": { icon: TbApi, color: "#2596BE" },
  "TRPC": { icon: TbApi, color: "#2596BE" },
  "BetterAuth": { icon: TbApi, color: "#10B981" },
  "Vite": { icon: SiVite, color: "#10B981" },

  // Blockchain
  "Solana": { icon: SiSolana, color: "#9945FF" },
  "Anchor": { icon: TbAnchor, color: "#14F195" },

  // AI & APIs
  "AI": { icon: TbBrandOpenai, color: "#10A37F" },
  "YouTube API": { icon: TbApi, color: "#FF0000" },
  "CoinGecko API": { icon: TbApi, color: "#8BC53F" },
  "Axios": { icon: TbApi, color: "#5A29E4" },

  // Deployment
  "Vercel": { icon: SiVercel, color: "#ffffff" },

  // Payments
  "Stripe": { icon: SiStripe, color: "#635BFF" },

  // Charts & UI
  "Chart.js": { icon: TbChartLine, color: "#FF6384" },
  "ReCharts": { icon: TbChartLine, color: "#22C55E" },
  "RGL": { icon: TbLayoutGrid, color: "#8B5CF6" },
  "Zustland": { icon: TbLayoutGrid, color: "#453F39" },

  // Testing
  "Mocha": { icon: TbTestPipe, color: "#8D6748" },

  // Editor & Content
  "TipTap": { icon: TbFileTypography, color: "#68D391" },
  "MDX": { icon: TbFileTypography, color: "#FCB32C" },
  "Framer Motion  ": { icon: SiFramer, color: "#0055FF" },
};

export const words = [
  "FullStack Developer",
  "UI/UX Designer",
  "Prompt Engineer",
  "Project Manager",
];

export const experienceData: I_Experience[] = [
  {
    company_link: "https://www.tiktok.com/",
    company_logo: "/assets/tiktok.svg",
    company_name: "TikTok",
    duration: "2026 - Present",
    job_title: "AI Quality Analyst",
    description: "",
  },
  {
    company_link: "https://www.tiktok.com/",
    company_logo: "/assets/tiktok.svg",
    company_name: "TikTok",
    duration: "2022 - Present",
    job_title: "Senior Bugs Subject Matter Expert",
    description: "",
  },
  {
    company_link: "#",
    company_logo: "/assets/upwork-icon.svg",
    company_name: "Freelance",
    duration: "2018 - Present",
    job_title: "FullStack Developer",
    description: "",
  },
];

import projectsData from "@/src/data/projects.json";
import settingsData from "@/src/data/settings.json";

export const projects = projectsData;
export const SITE_SETTINGS = settingsData;
