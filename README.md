# EduVest – Smart Student Finance Management App

EduVest is a premium student finance management platform designed to help students track their income, manage budgets, and analyze spending through a sleek, modern interface.

## 🚀 Getting Started

To get this project running on your local machine, follow these steps:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/rakesh1234-dega/Eduvest.git
cd Eduvest
npm install
```

### 3. Environment Setup
The project requires environment variables to connect to Supabase and Clerk.
1. Create a file named `.env` in the root directory.
2. Copy the content from `.env.example` into `.env`.
3. Provide the actual values from your Supabase and Clerk dashboards:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### 4. Running the App
Start the development server:
```bash
npm run dev
```

## 📂 Project Structure
- `/src/components`: UI and reusable components.
- `/src/pages`: Main application screens (Dashboard, Budget, etc.).
- `/src/hooks`: Custom React hooks for data fetching and logic.
- `/src/utils`: Authentication logic and global utility functions.
- `/src/styles`: CSS and styling tokens.
- `/public`: Static assets and icons.

## 🔒 Security Notice
The `.env` file is excluded from version control (Git) to protect sensitive API keys. When inviting collaborators, ensure they are provided with these keys securely.

## 🌐 Deployment (Vercel / Netlify)
When deploying this application to platforms like Vercel or Netlify, you must configure the environment variables in their respective dashboards:

1. **Do not upload your `.env` file**.
2. In your Vercel/Netlify project settings, enter your environment variables.
3. For Clerk authentication, **ensure you use production keys**. Development keys (`pk_test_`) will cause the production build to fail starting.
   - `VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_live_key_here`
   - `VITE_SUPABASE_URL=...`
   - `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=...`

## 🤝 Collaboration
This is a private repository. If you are a collaborator:
1. Ensure you have Git access.
2. Follow the setup steps above.
3. Make atomic commits and push to the `main` branch.
