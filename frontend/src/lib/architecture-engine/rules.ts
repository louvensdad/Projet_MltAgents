import { StackKey } from "./types";

export const COMPATIBILITY_MATRIX: Record<StackKey, string[]> = {
  springboot: ["Angular", "React", "Vue", "HTMX"],
  fastapi: ["React", "Vue", "Angular", "Next.js"],
  nestjs: ["Angular", "React", "Next.js"],
  express: ["React", "Vue", "Next.js"],
  laravel: ["Vue", "React", "Angular", "Blade"],
  dotnet: ["Blazor", "Angular", "React"],
  static: ["HTML/CSS/JS", "Next.js"]
};

export const PIPELINE_STEPS = [
  "Parsing",
  "Docs Sync",
  "Architecture Validation",
  "Backend Generation",
  "Frontend Generation",
  "Docker Generation",
  "Security Validation",
  "Packaging"
];
