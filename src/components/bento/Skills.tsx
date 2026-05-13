"use client";
import React from "react";
import {
  SiTypescript,
  SiReact,
  SiExpo,
  SiSupabase,
  SiPostgresql,
} from "react-icons/si";
import { TbBrandOpenai } from "react-icons/tb";

import { cn } from "@/src/lib/utils";
import { TechBadge } from "@/src/components/ui/tech-badge";

const skills = [
  { icon: SiTypescript, name: "TypeScript", color: "#3178C6" },
  { icon: SiReact, name: "React Native", color: "#61DAFB" },
  { icon: SiExpo, name: "Expo", color: "#000020" },
  { icon: SiSupabase, name: "Supabase", color: "#3ECF8E" },
  { icon: TbBrandOpenai, name: "OpenAI", color: "#10A37F" },
  { icon: TbBrandOpenai, name: "Claude", color: "#D97757" },
  { icon: TbBrandOpenai, name: "Gemini", color: "#4285F4" },
  { icon: SiPostgresql, name: "PostgreSQL", color: "#4169E1" },
  { icon: SiReact, name: "React Navigation", color: "#61DAFB" },
  { icon: SiReact, name: "AsyncStorage", color: "#61DAFB" },
];

export const SkillsCarousel = () => {
  const row1 = skills.slice(0, 4);
  const row2 = skills.slice(4, 8);
  const row3 = skills.slice(8, 12);

  return (
    <div className="w-full h-full p-2 md:p-4 flex flex-col group">
      <div className="text-sm md:text-lg font-normal flex justify-start items-start px-2 md:px-4 -mt-1 md:-mt-2">Tech Stack</div>
      <div className="flex flex-col gap-1.5 md:gap-3 px-2 md:px-4 justify-center items-center flex-1 content-center">
        <div className="flex flex-wrap md:flex-nowrap gap-1 md:gap-2 justify-start items-center w-full">
          {row1.map((skill, idx) => (
            <TechBadge
              key={`skill-r1-${idx}`}
              name={skill.name}
              icon={skill.icon}
              color={skill.color}
            />
          ))}
        </div>
        <div className="flex flex-wrap md:flex-nowrap gap-1 md:gap-2 justify-start items-center w-full">
          {row2.map((skill, idx) => (
            <TechBadge
              key={`skill-r2-${idx}`}
              name={skill.name}
              icon={skill.icon}
              color={skill.color}
            />
          ))}
        </div>
        <div className="flex flex-wrap md:flex-nowrap gap-1 md:gap-2 justify-start items-center w-full">
          {row3.map((skill, idx) => (
            <TechBadge
              key={`skill-r3-${idx}`}
              name={skill.name}
              icon={skill.icon}
              color={skill.color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
