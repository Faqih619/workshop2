# SkillBridge AI — Troubleshooting Guide

## 1. Introduction

This guide covers common problems developers may encounter when installing, running and developing SkillBridge AI.

## 2. Node.js and npm Issues

### Problem: `npm is not recognized`

**Possible cause:** Node.js is not installed correctly or is not added to the system PATH.

**Solution:**
1. Install Node.js from https://nodejs.org/
2. Restart VS Code.
3. Open a new terminal.
4. Verify the installation:

```bash
node -v
npm -v
```

### Problem: `npm install` fails

**Possible causes:**
- Internet connection problems.
- Dependency conflicts.
- Incorrect Node.js version.

**Solution:**

Try:

```bash
npm install
```

If the problem continues, check the error message before attempting other fixes.

Avoid deleting `package-lock.json` or changing dependency versions without understanding the cause.

## 3. Next.js Issues

### Problem: Port 3000 is already in use

**Cause:** Another development server is already using port 3000.

**Solution:**

Stop the existing server using:

```text
Ctrl + C
```

Alternatively, Next.js may automatically select another available port.

Check the terminal for the correct local URL.

### Problem: Application changes are not appearing

**Possible solutions:**
1. Save your files.
2. Refresh your browser.
3. Check the terminal for compilation errors.
4. Restart the development server if necessary.

## 4. Git and GitHub Issues

### Problem: `Your branch is behind origin/main`

**Cause:** GitHub contains newer changes than your local branch.

**Solution:**

```bash
git checkout main
git pull origin main
```

### Problem: Push rejected

**Cause:** The remote branch contains changes that your local branch does not have, or another Git restriction is preventing the push.

**Solution:**

Check your current branch and Git status:

```bash
git status
git branch
```

If appropriate, retrieve the latest changes and resolve any conflicts before pushing again.

### Problem: Merge conflicts

**Cause:** Different developers modified overlapping parts of the same file.

**Solution:**
1. Open the conflicted file in VS Code.
2. Review the conflicting changes.
3. Select or combine the correct code.
4. Save the file.
5. Stage the resolved changes:

```bash
git add .
```

6. Complete the merge if Git still requires a merge commit:

```bash
git commit
```

## 5. Supabase Issues

### Problem: Supabase connection error

**Possible causes:**
- Incorrect Project URL.
- Incorrect Publishable Key.
- Missing environment variables.
- Development server was not restarted after changing environment variables.

**Solution:**
1. Check `.env.local`.
2. Verify the Project URL.
3. Verify the Publishable Key.
4. Restart the development server:

```bash
npm run dev
```

### Problem: Permission denied or RLS error

**Cause:** The database may not have an appropriate Row Level Security policy for the requested operation.

**Solution:**
1. Check whether RLS is enabled on the table.
2. Review the existing policies.
3. Verify the authenticated user's permissions.
4. Coordinate with the database administrator before changing policies.

### Problem: Supabase CLI cannot find the local Docker container

**Example:**

```text
failed to inspect container health
No such container: supabase_db
```

**Cause:** The local Supabase Docker services are not running.

**Solution:**

SkillBridge AI uses a hosted Supabase project. This error can occur when running commands that inspect local Supabase services.

Local Docker services are not required for ordinary hosted database access.

## 6. Environment Variable Issues

### Problem: Environment variables return `undefined`

**Solution:**
1. Check that `.env.local` is in the project root.
2. Check the variable names.
3. Make sure there are no spelling mistakes.
4. Restart the Next.js development server.

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 7. Getting Help

If a problem cannot be resolved:

1. Read the terminal error message carefully.
2. Check the relevant documentation guide.
3. Search for the error message.
4. Inform the development team.
5. Share the error message and steps to reproduce the problem.

Never share passwords, secret API keys or private credentials when reporting an issue.

---

**End of Troubleshooting Guide**