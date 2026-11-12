# SkillBridge AI — Supabase Guide

## 1. Introduction

SkillBridge AI uses Supabase as its hosted database and backend service.

Supabase provides:
- PostgreSQL database.
- Database API.
- User authentication.
- Row Level Security (RLS).
- Database management through the Supabase Dashboard.

All developers connect to the same Supabase project.

## 2. Supabase Project Information

| Property | Value |
|---|---|
| Project Name | SkillbridgeAI |
| Project Reference ID | uccyqmearvavwyvfvmyc |
| Region | Southeast Asia (Singapore) |
| Database | PostgreSQL |

Supabase Dashboard:

https://supabase.com/dashboard/project/uccyqmearvavwyvfvmyc

## 3. Supabase Project Access

The project administrator manages access to the Supabase Dashboard.

Team members who need to manage the database or project settings should be invited using their own Supabase accounts.

Do not share personal Supabase login credentials.

Note that Dashboard access and application access are different:
- Dashboard access allows authorised team members to manage the Supabase project.
- Application access allows SkillBridge AI to communicate with the database using its API credentials.

## 4. Supabase API Credentials

SkillBridge AI uses two values to connect to Supabase:

### Project URL

Identifies the hosted Supabase project.

### Publishable Key

Allows the frontend application to communicate with Supabase.

Both values are configured in `.env.local`.

Refer to `03-environment-setup.md` for setup instructions.

**Security rules:**
- Publishable keys can be shared with the development team.
- Never expose the Supabase Secret Key.
- Never commit private credentials to GitHub.

## 5. Database Tables

The current SkillBridge AI database contains the following tables:

| Table | Purpose |
|---|---|
| `users` | Application user records |
| `profile` | User profile information |
| `skill` | Available skills |
| `user_skill` | Skills associated with users |
| `resume` | User resume information |
| `opportunity` | Available opportunities |
| `application` | Opportunity applications |
| `milestone` | Application or project milestones |
| `deliverable` | Submitted deliverables |
| `ai_analysis` | AI analysis records |

Refer to the database schema and SQL migration files for the actual columns and relationships.

## 6. Connecting to Supabase in Next.js

The project uses the Supabase JavaScript client.

The reusable client is located at:

```text
src/lib/supabase/client.ts
```

Example:

```typescript
import { supabase } from '@/lib/supabase/client'
```

Example database query:

```typescript
const { data, error } = await supabase
  .from('opportunity')
  .select('*')

if (error) {
  console.error(error)
} else {
  console.log(data)
}
```

## 7. Managing the Database

Developers can access the database through:

### Supabase Dashboard

Use the Table Editor to:
- View database tables.
- Inspect records.
- Insert or edit records.
- Review table structures.

### Supabase SQL Editor

Use the SQL Editor to execute SQL queries and inspect database information.

Coordinate database changes with the team before modifying shared tables.

## 8. Row Level Security (RLS)

Row Level Security controls which database records users can access.

For example:
- Students should only access their own private application records.
- Users should not be able to access another student's private information.
- Administrative access should follow the assigned role and permissions.

RLS must be configured with appropriate policies for each table.

Enabling RLS alone does not automatically create these policies.

Never rely only on frontend restrictions to protect database information.

## 9. Supabase Authentication

Supabase Authentication will be used to manage user accounts.

Planned features include:
- Student registration.
- Login and logout.
- Email verification.
- Password reset.
- User sessions.

Authentication implementation is part of the application development work and should be coordinated with the relevant module.

## 10. Team Rules

1. All developers use the same hosted Supabase project for development.
2. Do not share personal Dashboard login credentials.
3. Never expose the Secret Key.
4. Coordinate changes to shared database tables.
5. Save database schema changes as SQL migrations.
6. Commit migration files to GitHub.
7. Verify database changes before applying them to the shared project.
8. Do not modify or delete shared records without coordinating with the team.

---

**End of Supabase Guide**