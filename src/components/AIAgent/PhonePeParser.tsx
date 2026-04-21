import { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, Loader2, Camera, Sparkles, Clock, Trophy, XCircle, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/utils/utils";
import { useAddPoints } from "@/hooks/use-profile";
import confetti from "canvas-confetti";

interface PhonePeParserProps {
  onParsed: (data: { amount: string; vendor: string; isExpense: boolean }) => void;
}

type PipelineStep = "idle" | "uploading" | "analyzing" | "matching" | "rewarded" | "no-match";

const MOCK_RECEIPTS = [
  { amount: "450.00", vendor: "Zomato / PhonePe", category: "Food & Dining" },
  { amount: "199.00", vendor: "Spotify Premium", category: "Subscription" },
  { amount: "1200.00", vendor: "Amazon Pay", category: "Shopping" },
  { amount: "85.00", vendor: "Uber Auto", category: "Transport" },
];

export function PhonePeParser({ onParsed }: PhonePeParserProps) {
  const [isDrag, setIsDrag] = useState(false);
  const [step, setStep] = useState<PipelineStep>("idle");
  const [parsedData, setParsedData] = useState<typeof MOCK_RECEIPTS[0] | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addPoints = useAddPoints();

  const isEvening = new Date().getHours() >= 17;

  const runPipeline = (file?: File) => {
    // Step 1: Show upload preview
    setStep("uploading");
    setParsedData(null);

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }

    // Step 2: Simulate AI analysis after 1.5s
    setTimeout(() => {
      setStep("analyzing");

      // Step 3: Mock AI extracts data after 2s
      setTimeout(() => {
        const mockResult = MOCK_RECEIPTS[Math.floor(Math.random() * MOCK_RECEIPTS.length)];
        setParsedData(mockResult);

        // Step 4: Check schedule
        setTimeout(() => {
          if (isEvening) {
            setStep("matching");

            // Step 5: Award points after match animation
            setTimeout(async () => {
              setStep("rewarded");

              // Fire confetti
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });

              // Award points in Supabase
              try {
                await addPoints.mutateAsync({ points: 15, activityName: "receipt_upload" });
              } catch {}

              toast.success("🎉 +15 Points! Receipt matched your evening schedule!");

              // Send parsed data to parent
              onParsed({
                amount: mockResult.amount,
                vendor: mockResult.vendor,
                isExpense: true,
              });

              // Reset after 5s
              setTimeout(() => resetPipeline(), 5000);
            }, 1200);
          } else {
            setStep("no-match");
            toast.info("Receipt logged! Upload during your Evening schedule to earn bonus points.");

            onParsed({
              amount: mockResult.amount,
              vendor: mockResult.vendor,
              isExpense: true,
            });

            setTimeout(() => resetPipeline(), 4000);
          }
        }, 1000);
      }, 2000);
    }, 1500);
  };

  const resetPipeline = () => {
    setStep("idle");
    setParsedData(null);
    setPreview(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file) runPipeline(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) runPipeline(file);
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleClick = () => {
    if (step !== "idle") return;
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {/* Hidden file input with camera support */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 relative overflow-hidden group cursor-pointer",
          step === "idle" && isDrag && "border-indigo-500 bg-indigo-50 scale-[1.02]",
          step === "idle" && !isDrag && "border-border hover:bg-muted/80 hover:border-indigo-300",
          step === "rewarded" && "border-emerald-300 bg-emerald-50/50",
          step === "no-match" && "border-amber-300 bg-amber-50/50",
          step !== "idle" && step !== "rewarded" && step !== "no-match" && "border-indigo-200 bg-indigo-50/30",
          step !== "idle" && "pointer-events-none"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
        onDragLeave={() => setIsDrag(false)}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {/* Image preview overlay */}
        {preview && (
          <div className="absolute inset-0 opacity-10">
            <img src={preview} alt="Receipt" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex flex-col items-center justify-center space-y-3 relative z-10">
          <div className={cn(
            "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300",
            step === "idle" && (isDrag ? "bg-indigo-100" : "bg-muted group-hover:bg-indigo-50"),
            step === "uploading" && "bg-indigo-100",
            step === "analyzing" && "bg-indigo-100",
            step === "matching" && "bg-indigo-100 animate-pulse",
            step === "rewarded" && "bg-emerald-100",
            step === "no-match" && "bg-amber-100",
          )}>
            {step === "idle" && (
              <div className="flex items-center gap-1">
                <Camera className={cn("h-5 w-5", isDrag ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500")} />
                <span className="text-slate-300">|</span>
                <UploadCloud className={cn("h-5 w-5", isDrag ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500")} />
              </div>
            )}
            {step === "uploading" && <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />}
            {step === "analyzing" && <Sparkles className="h-6 w-6 text-indigo-600 animate-pulse" />}
            {step === "matching" && <Clock className="h-6 w-6 text-indigo-600 animate-bounce" />}
            {step === "rewarded" && <Trophy className="h-6 w-6 text-emerald-600" />}
            {step === "no-match" && <XCircle className="h-6 w-6 text-amber-600" />}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700">
              {step === "idle" && "Upload PhonePe Receipt"}
              {step === "uploading" && "Uploading receipt..."}
              {step === "analyzing" && "🤖 AI is analyzing your receipt..."}
              {step === "matching" && "Checking schedule match..."}
              {step === "rewarded" && "✅ Match Found! +15 Points"}
              {step === "no-match" && "Receipt logged (no schedule match)"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {step === "idle" && "📷 Camera, drag & drop, or click to upload"}
              {step === "uploading" && "Processing image..."}
              {step === "analyzing" && "Extracting amount, merchant, and category..."}
              {step === "matching" && "Verifying against your evening schedule..."}
              {step === "rewarded" && "Points added to your profile!"}
              {step === "no-match" && "Upload during evening block for bonus points"}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Progress */}
      {step !== "idle" && (
        <div className="flex items-center justify-between bg-card rounded-xl border border-border p-3 shadow-sm">
          {[
            { label: "Upload", active: step === "uploading", done: ["analyzing", "matching", "rewarded", "no-match"].includes(step) },
            { label: "Analyze", active: step === "analyzing", done: ["matching", "rewarded", "no-match"].includes(step) },
            { label: "Schedule", active: step === "matching", done: ["rewarded", "no-match"].includes(step) },
            { label: "Reward", active: step === "rewarded", done: false },
          ].map((s, i, arr) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <div className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300",
                s.done && "bg-emerald-500 text-white",
                s.active && "bg-indigo-500 text-white animate-pulse",
                !s.done && !s.active && "bg-muted text-slate-400",
                step === "no-match" && s.label === "Reward" && "bg-amber-100 text-amber-600"
              )}>
                {s.done ? "✓" : i + 1}
              </div>
              <span className={cn(
                "text-[11px] font-semibold hidden sm:block",
                s.active ? "text-indigo-700" : s.done ? "text-emerald-700" : "text-slate-400"
              )}>
                {s.label}
              </span>
              {i < arr.length - 1 && (
                <ChevronRight className={cn("h-3 w-3 mx-1", s.done ? "text-emerald-400" : "text-slate-200")} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Parsed Data Result Card */}
      {parsedData && step !== "idle" && (
        <div className={cn(
          "rounded-xl p-4 border transition-all duration-300",
          step === "rewarded" ? "bg-emerald-50 border-emerald-200" : "bg-card border-border"
        )}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            AI Extracted Data
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground">Amount</p>
              <p className="text-sm font-bold text-foreground">₹{parsedData.amount}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Merchant</p>
              <p className="text-sm font-bold text-foreground">{parsedData.vendor}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Category</p>
              <p className="text-sm font-bold text-foreground">{parsedData.category}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
