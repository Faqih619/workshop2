# SkillBridge AI — Environment Setup Guide

## 1. Introduction

This guide explains how to configure environment variables for SkillBridge AI.

Environment variables store configuration values required by the application, such as the Supabase Project URL and Publishable API Key.

Each developer must create their own `.env.local` file.

## 2. Understanding Environment Files

We use two environment files:

| File | Purpose | Upload to GitHub? |
|---|---|---|
| `.env.local` | Stores actual local configuration values | No |
| `.env.example` | Provides a template for required variables | Yes |

The `.env.local` file is excluded from Git to prevent accidental exposure of credentials.

## 3. Create `.env.local`

### Step 1: Open the project root

Open the main SkillBridge AI project folder in Visual Studio Code.

### Step 2: Create the file

Create a new file named:

```text
.env.local
```

Make sure it is located in the project root, alongside `package.json`.

### Step 3: Add the environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

Replace the placeholder values with the credentials provided by the project administrator.

**Important:** The variable name `NEXT_PUBLIC_SUPABASE_ANON_KEY` is retained for compatibility with our existing application code. Its value should be the newer Supabase Publishable Key beginning with `sb_publishable_`.

## 4. Where to Get the Credentials

The project administrator should provide:

### Supabase Project URL

Found in the Supabase Dashboard under the project's API settings.

### Supabase Publishable Key

Found under:

Project Settings → API Keys → Publishable Key.

All developers can use the same Project URL and Publishable Key for this project.

## 5. Understanding the Publishable Key

The Publishable Key is designed to be used in frontend applications.

However:
- Never share or expose the Supabase Secret Key.
- Never put secret keys in frontend code.
- Database security must be enforced using Row Level Security (RLS).

## 6. Restart the Development Server

After creating or modifying `.env.local`, restart Next.js.

```bash
npm run dev
```

Next.js loads environment variables when the development server starts.

## 7. Environment Variables in Production

When SkillBridge AI is deployed, environment variables must be configured separately in the hosting platform.

For example, if using Vercel:

1. Open the Vercel project.
2. Navigate to Settings.
3. Open Environment Variables.
4. Add the Supabase Project URL.
5. Add the Supabase Publishable Key.

Do not upload `.env.local` to GitHub for production deployment.

## 8. Security Rules

1. Never commit `.env.local`.
2. Never share Supabase Secret Keys.
3. Never store personal credentials in source code.
4. Use `.env.example` as a configuration template.
5. Verify `.gitignore` before pushing changes to GitHub.

---

**End of Environment Setup Guide**