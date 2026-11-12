# SkillBridge AI — Installation Guide

## 1. Overview

This guide explains how to install and run SkillBridge AI on your local computer.

## 2. Prerequisites

Before starting, install the following:

### Node.js and npm

1. Visit https://nodejs.org/
2. Download and install the latest LTS version of Node.js.
3. npm is included automatically with Node.js.

Verify the installation using:

```bash
node -v
npm -v
```

### Git

1. Visit https://git-scm.com/
2. Download and install Git.
3. Verify the installation:

```bash
git --version
```

### Visual Studio Code

Download and install Visual Studio Code:

https://code.visualstudio.com/

## 3. Clone the Repository

Open your terminal and navigate to the directory where you want to store the project.

Clone the repository:

```bash
git clone https://github.com/Faqih619/workshop2.git
```

Navigate into the project directory:

```bash
cd workshop2
```

Open the project in Visual Studio Code:

```bash
code .
```

## 4. Install Project Dependencies

Open the VS Code terminal.

Make sure you are inside the project directory.

Run:

```bash
npm install
```

This command installs the dependencies listed in `package.json`.

## 5. Configure Environment Variables

SkillBridge AI uses Supabase as its database service.

Create a file named `.env.local` in the project root.

Add the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

Replace the placeholder values with the credentials provided by the project administrator.

**Important:**
- Do not commit `.env.local` to GitHub.
- Never use the Supabase secret key in frontend code.
- Ask the project administrator for the correct configuration values.

Refer to `03-environment-setup.md` for detailed instructions.

## 6. Run the Development Server

Start the application:

```bash
npm run dev
```

Open your browser and visit:

http://localhost:3000

The SkillBridge AI application should now be running locally.

## 7. Stopping the Development Server

To stop the development server, press:

```text
Ctrl + C
```

## 8. Updating the Project

Before starting new development work, update your local repository:

```bash
git checkout main
git pull origin main
```

## 9. Troubleshooting

### npm is not recognised

- Make sure Node.js is installed.
- Restart your terminal.
- Verify the Node.js installation using `node -v`.

### Cannot connect to Supabase

- Check your `.env.local` file.
- Verify the Project URL and publishable key.
- Restart the development server after changing environment variables.

### Port 3000 is already in use

Next.js may automatically use another available port. Check the terminal output for the correct local URL.

---

**End of Installation Guide**