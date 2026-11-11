# SkillBridge AI — Contribution Guidelines

## 1. Introduction

This document defines the Git and GitHub workflow for all SkillBridge AI developers.

All team members must follow these guidelines to maintain code consistency, prevent conflicts and ensure that the `main` branch remains stable.

## 2. Project Modules

Development is divided into five main modules:

| Module | Feature Branch |
|---|---|
| AI Resume Builder | `feature/resume-builder` |
| Portfolio Generator | `feature/portfolio-generator` |
| Opportunity Portal | `feature/opportunity-portal` |
| AI Opportunity & Skill Gap Analyzer | `feature/skill-gap-analyzer` |
| Application Tracker | `feature/application-tracker` |

Developers should work on the feature branch corresponding to their assigned module.

## 3. Branching Rules

- Do not push directly to `main`.
- Create a feature branch before starting development.
- Always get the latest code from `main` before creating a new feature branch.
- Keep module development separate whenever possible.
- Do not merge unfinished features into `main`.

## 4. Development Workflow

### Step 1: Update the main branch

```bash
git checkout main
git pull origin main
```

### Step 2: Create a feature branch

Example:

```bash
git checkout -b feature/resume-builder
```

### Step 3: Make changes and commit

```bash
git add .
git commit -m "feat: implement resume builder"
```

### Step 4: Push your branch

```bash
git push -u origin feature/resume-builder
```

### Step 5: Create a Pull Request

1. Open the GitHub repository.
2. Create a Pull Request.
3. Set the base branch to `main`.
4. Set the compare branch to your feature branch.
5. Describe the changes made.
6. Request a review from another team member.
7. Merge after review and approval.

## 5. Commit Message Convention

Use these prefixes when writing commit messages:

| Prefix | Purpose |
|---|---|
| `feat:` | New functionality |
| `fix:` | Bug fixes |
| `docs:` | Documentation changes |
| `style:` | Formatting and styling |
| `refactor:` | Code restructuring |
| `chore:` | Configuration and maintenance |

Examples:

```bash
git commit -m "feat: add student registration"
git commit -m "fix: resolve resume upload error"
git commit -m "docs: update installation guide"
```

## 6. Shared Code Rules

Some components are shared across all five modules:

- Global layout
- Navigation bar
- Authentication
- Supabase client
- Shared UI components
- Database configuration

Before modifying shared components, coordinate with other developers to avoid conflicts.

## 7. Database Rules

Since all developers use the same Supabase project:

- Database schema changes must be saved as SQL migration files.
- Commit migration files to GitHub.
- Coordinate database changes with the team before applying them.
- Never commit `.env.local` or secret API keys.
- Do not modify shared database structures without informing the team.

## 8. General Development Rules

1. Pull the latest `main` before starting