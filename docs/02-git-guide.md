# SkillBridge AI — Git & GitHub Guide

## 1. Introduction

This guide explains how to use Git and GitHub when developing SkillBridge AI.

All team members must follow the Git workflow described in `CONTRIBUTING.md`.

## 2. Basic Git Commands

| Command | Purpose |
|---|---|
| `git status` | Check current changes |
| `git branch` | Display local branches |
| `git branch -a` | Display all branches |
| `git checkout main` | Switch to main |
| `git pull origin main` | Download latest main changes |
| `git add .` | Stage changes |
| `git commit -m "message"` | Save changes locally |
| `git push` | Upload committed changes |
| `git log --oneline` | View commit history |

## 3. Clone the Repository

To download the project for the first time:

```bash
git clone https://github.com/Faqih619/workshop2.git
cd workshop2
```

## 4. Get the Latest Project Updates

Before starting new development:

```bash
git checkout main
git pull origin main
```

This ensures you have the latest code from GitHub.

## 5. Create a Feature Branch

Each developer should work on a separate feature branch.

Examples:

```bash
git checkout -b feature/resume-builder
```

```bash
git checkout -b feature/portfolio-generator
```

```bash
git checkout -b feature/opportunity-portal
```

```bash
git checkout -b feature/skill-gap-analyzer
```

```bash
git checkout -b feature/application-tracker
```

## 6. Save Your Changes

After making code changes:

### Check modified files

```bash
git status
```

### Stage your changes

```bash
git add .
```

### Commit your changes

```bash
git commit -m "feat: implement resume builder"
```

A commit saves your changes in your local Git history.

## 7. Push Changes to GitHub

Upload your feature branch:

```bash
git push -u origin feature/resume-builder
```

For subsequent pushes on the same branch:

```bash
git push
```

## 8. Create a Pull Request

After pushing your branch:

1. Open the SkillBridge AI GitHub repository.
2. Select **Compare & pull request**.
3. Set the base branch to `main`.
4. Set the compare branch to your feature branch.
5. Write a description of your changes.
6. Submit the Pull Request.
7. Request a review from another team member.
8. Merge after approval.

Do not push directly to `main`.

## 9. Switch Between Branches

To view available branches:

```bash
git branch -a
```

To switch to an existing local branch:

```bash
git checkout feature/resume-builder
```

To switch back to main:

```bash
git checkout main
```

## 10. Update Your Feature Branch

If `main` has received new changes while you are developing your feature:

```bash
git checkout main
git pull origin main
```

Return to your feature branch:

```bash
git checkout feature/resume-builder
```

Merge the latest main changes into your branch:

```bash
git merge main
```

Resolve any merge conflicts before continuing.

## 11. Handling Merge Conflicts

A merge conflict occurs when Git cannot automatically combine changes from different branches.

When this happens:

1. Open the files marked as conflicted in VS Code.
2. Review the conflicting code.
3. Choose or combine the correct changes.
4. Save the files.
5. Stage the resolved files:

```bash
git add .
```

6. Complete the merge:

```bash
git commit
```

If Git has already created the merge commit automatically, no additional commit is needed.

## 12. Useful Git Tips