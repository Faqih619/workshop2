# SkillBridge AI

SkillBridge AI is a student-focused platform designed to help users discover opportunities, build their professional profiles, and track their career development.

## Main Modules

The project is organised into five main modules:

1. **AI Resume Builder** — create and improve resumes.
2. **Portfolio Generator** — generate a portfolio to showcase skills and achievements.
3. **Opportunity Portal** — discover opportunities such as internships, micro-internships, hackathons and events.
4. **AI Opportunity & Skill Gap Analyzer** — compare a user's skills with opportunity or career requirements.
5. **Application Tracker** — manage applications and track their progress.

## Technology Stack

- **Frontend:** Next.js
- **Language:** TypeScript
- **Package manager:** npm
- **Database and backend services:** Supabase
- **Database:** PostgreSQL

## Getting Started

### Prerequisites

Install the following before setting up the project:

- [Node.js (LTS)](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/)

### Installation

Clone the repository:

```bash
git clone https://github.com/Faqih619/workshop2.git
cd workshop2
```

#### Windows (recommended)

Run the setup script from the project root:

```powershell
.\setup.bat
```

The script checks that Git, Node.js and npm are installed, creates `.env.local` from `.env.example` if the file does not already exist, and installs project dependencies with `npm install`.

If a required tool is missing, install it first:

- [Git](https://git-scm.com/downloads)
- [Node.js (LTS)](https://nodejs.org/)

The setup script does not overwrite an existing `.env.local`.

#### Manual setup (all platforms)

If you prefer, or if you are not using Windows, install dependencies:

```bash
npm install
```

Then create a `.env.local` file in the project root using the configuration below.

### Environment Configuration

Create a `.env.local` file in the project root and add the shared SkillBridge AI Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=https://uccyqmearvavwyvfvmyc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_zXhzmMuRbgVCii7NJjwAWQ_pPZ0nd_c
```

All team members use the same Project URL and Publishable Key, but each person must have their own local `.env.local` file. On Windows, `setup.bat` copies these values from `.env.example` automatically when `.env.local` is missing.

The variable name `NEXT_PUBLIC_SUPABASE_ANON_KEY` is retained for compatibility with the current project code; its value is the Supabase Publishable Key.

The Publishable Key is intended for client-side applications. Never expose or commit a Supabase Secret Key (such as an `sb_secret_...` key). Keep Row Level Security (RLS) enabled and configure appropriate policies before storing real user data. Never commit `.env.local` to Git.

See [Environment Setup](docs/03-environment-setup.md) for details.

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Documentation

Read the guides in the `docs/` directory before starting development:

| Guide | Description |
|---|---|
| [Installation Guide](docs/01-installation-guide.md) | Install the tools and run the project locally |
| [Git & GitHub Guide](docs/02-git-guide.md) | Common Git commands and collaboration workflow |
| [Environment Setup](docs/03-environment-setup.md) | Configure local environment variables |
| [Supabase Guide](docs/04-supabase-guide.md) | Understand the shared Supabase project |
| [Project Structure](docs/05-project-structure.md) | Understand the main directories and files |
| [Database Migrations](docs/06-database-migrations.md) | Create, review and apply database migrations |
| [Troubleshooting](docs/07-troubleshooting.md) | Resolve common development issues |

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch naming, commit messages, pull requests and team contribution rules.

## Development Workflow

- Keep `main` stable; do not push directly to it.
- Create a feature branch for your assigned module or task.
- Pull the latest `main` before starting work.
- Commit changes with clear messages.
- Push your branch and open a Pull Request targeting `main`.
- Coordinate changes to shared components and the shared Supabase database with the team.

## Useful Commands

| Command | Purpose |
|---|---|
| `npm install` | Install project dependencies |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run lint` | Run the project's lint script, if configured |
| `git status` | Check working tree changes |
| `git pull origin main` | Update the local main branch |

## Deployment

Deployment instructions will be added when the production hosting setup is finalised. For general Next.js deployment information, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
