import { AlertTriangle, Key, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface ConfigErrorProps {
  errorType: "clerk" | "supabase" | "mixed";
  message: string;
}

export function ConfigError({ errorType, message }: ConfigErrorProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
        <div className="bg-indigo-600 p-8 flex justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="h-20 w-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center relative z-10 border border-white/30 shadow-xl">
            <AlertTriangle className="h-10 w-10 text-white" />
          </div>
        </div>
        
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Configuration Required</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            {message || "We detected a missing or incorrect environment variable. This is common during the first deployment to Vercel."}
          </p>

          <div className="space-y-4 text-left">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                <Key className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">What to do:</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Go to your <strong>Vercel Dashboard</strong> &rarr; <strong>Settings</strong> &rarr; 
                  <strong> Environment Variables</strong> and ensure all keys from <code>.env.example</code> are added.
                </p>
              </div>
            </div>

            {errorType === "clerk" && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-800">Check Clerk Keys:</p>
                  <p className="text-xs text-amber-600 mt-1 leading-relaxed">
                    You appear to be using a <code>pk_test_</code> key in Production. 
                    Please switch to your <strong>pk_live_</strong> key in the Clerk Dashboard.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-10 flex flex-col gap-3">
            <Button 
              onClick={() => window.location.reload()}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 font-bold flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Try Again
            </Button>
            <a 
              href="https://vercel.com/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-600 transition-colors py-2"
            >
              Open Vercel Dashboard <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
