# 🚀 How to Run EduVest Locally (Setup Guide for Friend)

Hi! Follow these step-by-step instructions to get the **EduVest** project running on your computer. 

### Why do we need this?
When you download the code from GitHub, it does not include the `.env` file (environment variables). The `.env` file contains sensitive API keys (like Supabase database keys, Clerk authentication keys, and Gemini AI keys) which are kept secret and never uploaded to public GitHub repositories for security reasons.

You must manually create this file on your computer to give the project access to the backend services.

---

## 🛠️ Step-by-Step Installation

### Step 1: Download the Code
1. Go to the GitHub repository link.
2. Click the green **"Code"** button and select **"Download ZIP"** (or use `git clone` if you prefer).
3. Extract the ZIP file into a folder on your computer.

### Step 2: Install Node.js
If you don't have Node.js installed, download and install it from [nodejs.org](https://nodejs.org/). (This is required to run the `npm` commands).

### Step 3: Install Dependencies
1. Open up VS Code (or your preferred editor) and open the extracted project folder.
2. Open a new terminal inside VS Code (`Ctrl + \`` or `View -> Terminal`).
3. Run the following command to download all required packages:
   ```bash
   npm install
   ```
   *(This might take a minute or two)*

### Step 4: Create the API Keys File (`.env`)
The app will completely crash on start without the API keys. Let's add them:

1. Look at the root folder of the project (where package.json is).
2. Right-click and choose **"New File"**.
3. Name this file exactly: `.env`  *(Don't name it `.env.txt`, just `.env`)*
4. Open the `.env` file and **paste the following keys exactly as they are**:

```env
VITE_SUPABASE_URL=https://fdsnycmyyvplgeohterr.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_G2_fIUVzyfWi13_VBZh8Hg_0V3uwPQv
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y2FwaXRhbC1zd2FuLTI5LmNsZXJrLmFjY291bnRzLmRldiQ

VITE_APP_URL=http://localhost:8080

VITE_GEMINI_API_KEY="AIzaSyAs5AdhD18YIuZPjp_YvE5uGBUjemieKnw"
```

5. **Save** the file (`Ctrl + S`).

### Step 5: Start the App!
Finally, boot up the local development server by running this command in your terminal:
```bash
npm run dev
```

The terminal will give you a local link (usually `http://localhost:8080`). Hold `Ctrl` (or `Cmd` on Mac) and click the link to open the app in your browser!

---

### ⚠️ Troubleshooting
- **White Screen on Load?** Double-check that your `.env` file is named correctly and all keys are pasted without typos.
- **Can't Log In?** Make sure the `VITE_CLERK_PUBLISHABLE_KEY` is completely pasted.
- **AI Chatbot Not Working?** Ensure `VITE_GEMINI_API_KEY` is present.
