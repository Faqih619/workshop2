# SkillBridge AI — Project Structure Guide

## 1. Introduction

This document explains the folder structure of SkillBridge AI and the purpose of each important directory.

All developers should follow the existing project structure when adding new files and features.

## 2. Project Overview

The project uses:

- Next.js as the frontend framework.
- TypeScript for application development.
- Supabase for database and backend services.
- npm for package management.

## 3. Main Directory Structure

```text
skillbridge-ai/
│
├── docs/
│   ├── 01-installation-guide.md
│   ├── 02-git-guide.md
│   ├── 03-environment-setup.md
│   ├── 04-supabase-guide.md
│   ├── 05-project-structure.md
│   ├── 06-database-migrations.md
│   └── 07-troubleshooting.md
│
├── public/
│   └── Static assets
│
├── src/
│   ├── app/
│   │   └── Next.js application pages and layouts
│   │
│   └── lib/
│       └── supabase/
│           └── client.ts
│
├── supabase/
│   ├── migrations/
│   │   └── Database migration files
│   │
│   └── config.toml
│
├── .env.example
├── .env.local
├── .gitignore
├── CONTRIBUTING.md
├── package.json
├── package-lock.json
└── README.md
```

Note: This is the current documented structure and may expand as modules are developed.

## 4. Important Directories

### docs/

Stores project documentation and development guides.

All team members should refer to these documents when setting up or developing the project.

### public/

Stores static assets such as:

- Images
- Icons
- Logos
- Other public resources

### src/app/

Contains the Next.js application pages, layouts and routing structure.

For example:

```text
src/app/
├── layout.tsx
├── page.tsx
└── opportunities/
    └── page.tsx
```

Next.js uses the App Router to determine application routes from the directory structure.

### src/lib/

Contains reusable libraries and service configurations.

Currently, the Supabase client is located here:

```text
src/lib/supabase/client.ts
```

### supabase/

Contains Supabase configuration and database migration files.

The `migrations/` directory stores SQL files used to track database schema changes.

## 5. Module Development Organisation

SkillBridge AI has five main modules:

1. AI Resume Builder
2. Portfolio Generator
3. Opportunity Portal
4. AI Opportunity & Skill Gap Analyzer
5. Application Tracker

Developers should organise their module-related pages and components within the existing project structure.

Coordinate shared components and global layout changes with the team.

## 6. Important Files

| File | Purpose |
|---|---|
| `package.json` | Project dependencies and npm scripts |
| `package-lock.json` | Records dependency versions |
| `tsconfig.json` | TypeScript configuration |
| `next.config.js` | Next.js configuration |
| `.gitignore` | Excludes files from Git |
| `.env.local` | Local environment variables |
| `.env.example` | Environment variable template |
| `CONTRIBUTING.md` | Team contribution rules |
| `README.md` | Project introduction |

## 7. Development Guidelines

1. Follow the existing folder structure.
2. Avoid placing all components inside one directory.
3. Reuse shared components where appropriate.
4. Keep module-related code organised.
5. Avoid duplicating existing functionality.
6. Coordinate changes to shared files with other developers.

---

**End of Project Structure Guide**