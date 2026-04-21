/**
 * Express Backend Server for EduVest
 * 
 * NOTE: All AI/Gemini dependencies have been removed.
 * Schedule generation and chat assistant are now 100% client-side
 * using manual rule-based logic (no API keys needed).
 * 
 * This server is kept for future backend needs (e.g., database proxying).
 * 
 * RUNS ON: http://localhost:3001
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load env from project root
dotenv.config({ path: "../.env" });

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// ─── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: ["http://localhost:8080", "http://localhost:5173"] }));
app.use(express.json());

// ─── Health Check ───────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    mode: "manual-assistant",
    message: "All schedule and chat logic runs client-side. No AI API required.",
    timestamp: new Date().toISOString(),
  });
});

// ─── Start Server ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 EduVest Server running on http://localhost:${PORT}`);
  console.log(`   Mode: Manual Assistant (No AI API keys needed)\n`);
});

