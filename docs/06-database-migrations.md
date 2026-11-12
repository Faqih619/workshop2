# SkillBridge AI — Database Migration Guide

## 1. Introduction

This guide explains how to manage database schema changes using Supabase migrations.

Migrations allow developers to track database changes through SQL files and GitHub.

All database schema changes must be documented and committed to the repository.

## 2. What Is a Database Migration?

A database migration is an SQL file that describes a database change.

Examples include:

- Creating a new table.
- Adding a new column.
- Modifying a database relationship.
- Creating an index.
- Updating Row Level Security policies.

Instead of manually changing the database without documentation, migrations allow the team to track and reproduce database changes.

## 3. Migration Directory

All migration files are stored inside:

```text
supabase/
└── migrations/
    ├── 20261111115316_remote_schema.sql
    └── future_migration_files.sql
```

Each migration filename begins with a timestamp followed by a description.

Example:

```text
20261112090000_add_notification_table.sql
```

## 4. Creating a New Migration

When a database schema change is required, create a migration using:

```bash
npx supabase migration new add_notification_table
```

Supabase CLI automatically creates a timestamped SQL file inside `supabase/migrations/`.

## 5. Writing SQL Changes

Open the newly created migration file and write the required SQL.

Example: Creating a notification table.

```sql
CREATE TABLE public.notification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Before applying the migration, review the SQL and coordinate with the team.

## 6. Reviewing Migration History

To compare local and remote migration history:

```bash
npx supabase migration list --remote
```

This helps identify migrations recorded locally and remotely.

## 7. Applying Migrations

The project uses a shared hosted Supabase database.

Before applying a migration:

1. Inform the team about the proposed database change.
2. Review the SQL migration file.
3. Check whether the migration has already been applied.
4. Confirm that the migration is safe for the existing database.
5. Coordinate with the project administrator.

For an approved migration, use:

```bash
npx supabase db push
```

**Important:** `db push` applies pending migrations to the linked remote database. It does not automatically guarantee that the SQL is safe or free from destructive changes.

Never run it without reviewing the pending changes first.

## 8. GitHub Workflow

Migration files must be committed to GitHub.

Example:

```bash
git add supabase/migrations/
git commit -m "feat: add notification table migration"
git push
```

Submit a Pull Request so the team can review the database changes.

## 9. Important Database Rules

1. Never make undocumented schema changes.
2. Do not modify an existing migration that has already been applied to the shared database.
3. Create a new migration for additional changes.
4. Coordinate database modifications with the team.
5. Review SQL before applying it.
6. Avoid dropping tables or columns without team approval.
7. Never commit database passwords or secret API keys.
8. Keep migration files in GitHub.

## 10. Important Notes

All developers share the same hosted Supabase project.

A migration applied to the shared database affects everyone.

Therefore, database changes must be coordinated to prevent conflicts and accidental data loss.

---

**End of Database Migration Guide**