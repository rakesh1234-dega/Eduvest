import { 
  GraduationCap, ArrowRight, BarChart3, Wallet, PiggyBank, 
  Shield, PlayCircle, LayoutDashboard, LineChart, 
  CreditCard, Smartphone, CheckCircle2, Sparkles, TrendingUp,
  Quote, Github, Twitter, Instagram, Target
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

const features = [
  { icon: Smartphone, title: "Smart Expense Tracking", desc: "Track every rupee across Cash, UPI, and Card in real-time.", gradient: "icon-bg-purple", color: "text-violet-600" },
  { icon: Target, title: "Intelligent Budgeting", desc: "Set monthly limits and get alerts before you overspend.", gradient: "icon-bg-blue", color: "text-blue-600" },
  { icon: LineChart, title: "Live Financial Insights", desc: "Understand where your money goes with powerful analytics.", gradient: "icon-bg-green", color: "text-emerald-600" },
  { icon: LayoutDashboard, title: "Multi-Account System", desc: "Manage Cash, UPI, and Cards in one unified dashboard.", gradient: "icon-bg-orange", color: "text-orange-600" },
  { icon: GraduationCap, title: "Student-Centric Design", desc: "Built specifically for student life, budgets, and habits.", gradient: "icon-bg-purple", color: "text-indigo-600" },
  { icon: Shield, title: "Secure & Private", desc: "Your data is encrypted and fully protected.", gradient: "bg-slate-100", color: "text-slate-600" },
];

function useInView(options = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, options);
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options]);
  
  return [ref, inView] as const;
}

const AnimatedStatCard = ({ label, targetValue, prefix, suffix, percent, delay, inView }: any) => {
  const [count, setCount] = useState(0);
  const [ringProgress, setRingProgress] = useState(0);

  useEffect(() => {
    if (inView) {
      let startTime: number;
      const duration = 2000;
      
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        
        setCount(Math.floor(easeProgress * targetValue));
        setRingProgress(easeProgress * percent);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(targetValue);
          setRingProgress(percent);
        }
      };
      
      const timer = setTimeout(() => {
        requestAnimationFrame(animate);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [inView, targetValue, percent, delay]);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (ringProgress / 100) * circumference;

  return (
    <div className={`relative flex flex-col items-center text-center md:px-6 pt-6 md:pt-0 transition-all duration-700 ease-out group ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${delay}ms` }}>
      <div className="relative w-36 h-36 flex items-center justify-center mb-6 transition-transform duration-500 group-hover:-translate-y-2">
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none drop-shadow-sm" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={radius} fill="none" className="stroke-indigo-100/30" strokeWidth="4" />
          <circle 
            cx="70" cy="70" r={radius} fill="none" 
            className="stroke-indigo-500 transition-all duration-700 ease-out" 
            strokeWidth="6" 
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ filter: ringProgress > 0 ? "drop-shadow(0px 0px 8px rgba(99,102,241,0.6))" : "none" }}
          />
        </svg>
        <div className="relative z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md rounded-full w-[100px] h-[100px] shadow-[0_4px_20px_-4px_rgba(99,102,241,0.15)] border border-white group-hover:bg-white group-hover:shadow-[0_4px_25px_-4px_rgba(99,102,241,0.3)] group-hover:scale-105 transition-all duration-500">
           <span className="text-2xl font-extrabold text-slate-800 tracking-tight transition-colors group-hover:text-indigo-950">
             {prefix}{count === 0 && !inView ? "0" : count.toLocaleString()}{suffix}
           </span>
        </div>
      </div>
      <p className={`text-sm font-semibold text-slate-500 transition-all duration-700 group-hover:text-slate-800 uppercase tracking-wider ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: `${delay + 400}ms` }}>
        {label}
      </p>
    </div>
  );
};

const animatedStatsData = [
  { label: "student users", targetValue: 10000, prefix: "", suffix: "+", percent: 85, delay: 0 },
  { label: "expenses tracked", targetValue: 5, prefix: "₹", suffix: " Crore+", percent: 78, delay: 200 },
  { label: "improved savings", targetValue: 95, prefix: "", suffix: "%", percent: 95, delay: 400 },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [statsRef, statsInView] = useInView({ threshold: 0.2 });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#eef2ff] font-sans text-slate-900 overflow-x-hidden selection:bg-indigo-500/30 relative">
      <div className="fixed inset-0 z-0 opacity-[0.04] pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }}></div>
      {/* ── Navbar ── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? "bg-white/60 backdrop-blur-xl border-white/20 shadow-sm py-3" : "bg-transparent border-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">EduVest</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it works</a>
            <a href="#testimonials" className="hover:text-indigo-600 transition-colors">Stories</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Link to="/signup">
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:shadow-indigo-500/50 hover:scale-[1.03] transition-all shadow-md active:scale-95">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="relative pt-36 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Radial Light Highlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-96 bg-white rounded-full blur-[100px] opacity-80"></div>
          {/* Layer 2: Gradient Glow Blobs */}
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-purple-500/40 to-indigo-500/40 blur-[120px] opacity-40 animate-float"></div>
          <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-violet-400/40 to-fuchsia-400/40 blur-[120px] opacity-40 animate-float-delayed"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-6 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              The #1 Finance App for Students
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Money.</span><br/>
              While You Master Your Future.
            </h1>
            <p className="text-slate-500 text-lg lg:text-xl mb-10 leading-relaxed font-medium animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              EduVest is a smart financial companion designed for students — track expenses, manage budgets, and understand your money like never before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/signup">
                <button className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white text-base font-semibold px-8 py-4 rounded-xl hover:shadow-indigo-500/50 hover:scale-[1.03] transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 group">
                  Get Started Free <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <button className="w-full sm:w-auto bg-white/50 backdrop-blur-sm text-slate-700 text-base font-semibold px-8 py-4 rounded-xl border border-slate-200 hover:bg-white/80 transition-all flex items-center justify-center gap-2 shadow-sm">
                <PlayCircle className="h-5 w-5 text-slate-400" /> View Demo
              </button>
            </div>
          </div>

          {/* Hero Mockup */}
          <div className="relative animate-fade-in lg:block hidden">
            <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-br from-purple-500 to-blue-600 opacity-40 blur-2xl"></div>
            <div className="relative rounded-[2rem] border border-white/60 bg-white/60 backdrop-blur-3xl shadow-2xl p-4 overflow-hidden transform -rotate-2 hover:rotate-0 ring-1 ring-purple-500/20 transition-transform duration-700 ease-in-out">
              
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="text-xs font-semibold text-slate-400">eduvest.app/dashboard</div>
                </div>
                
                <div className="p-6 bg-slate-50">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group">
                      <div className="absolute right-0 top-0 w-16 h-16 bg-gradient-to-br from-indigo-100 to-transparent rounded-bl-full opacity-50"></div>
                      <div className="text-sm font-semibold text-slate-500 mb-1">Total Balance</div>
                      <div className="text-2xl font-bold text-slate-900">₹12,450</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                      <div className="text-sm font-semibold text-slate-500 mb-1">Monthly Spent</div>
                      <div className="text-2xl font-bold text-slate-900">₹4,200</div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm font-bold text-slate-700">Recent Transactions</div>
                    </div>
                    <div className="space-y-3">
                      {[ 
                        { icon: Smartphone, bg: "bg-indigo-100 text-indigo-600", name: "Zomato", amount: "-₹350" },
                        { icon: BarChart3, bg: "bg-emerald-100 text-emerald-600", name: "Pocket Money", amount: "+₹5000" },
                        { icon: CreditCard, bg: "bg-purple-100 text-purple-600", name: "Netflix", amount: "-₹199" }
                      ].map((tx, i) => (
                        <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.bg}`}>
                              <tx.icon className="w-5 h-5" />
                            </div>
                            <div className="font-semibold text-slate-700 text-sm">{tx.name}</div>
                          </div>
                          <div className={`font-bold text-sm ${tx.amount.startsWith('+') ? 'text-emerald-600' : 'text-slate-900'}`}>{tx.amount}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Element */}
              <div className="absolute -right-6 -bottom-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/50 flex items-center gap-4 animate-float">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Insight</div>
                  <div className="text-sm font-bold text-slate-800">You saved ₹1,200!</div>
                </div>
              </div>

              {/* Second Floating Element */}
              <div className="absolute -left-8 top-12 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-white/50 flex items-center gap-3 animate-float-delayed">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400">Total Balance</div>
                  <div className="text-sm font-extrabold text-slate-800">₹12,450</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST + SOCIAL PROOF SECTION */}
      <section ref={statsRef} className="border-y border-slate-100 bg-gradient-to-b from-white to-slate-50/50 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <p className={`text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-12 transition-all duration-700 ${statsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>Trusted by students everywhere</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-200/60">
            {animatedStatsData.map((stat, i) => (
              <AnimatedStatCard key={i} {...stat} inView={statsInView} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (Moved before Features for better flow) */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-2">How it works</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Financial control in 3 steps.</h3>
            <p className="text-slate-500 text-lg">Managing money shouldn't be harder than your exams. We made it incredibly simple.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-100"></div>
            
            {[
              { num: "01", title: "Set Your Balances", desc: "Add your Cash, UPI, and Card money securely.", icon: Wallet },
              { num: "02", title: "Track Your Spending", desc: "Log expenses in seconds using Quick Add.", icon: Smartphone },
              { num: "03", title: "Stay in Control", desc: "Monitor budget, insights, and watch your savings grow.", icon: LineChart }
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center relative mb-6 group-hover:scale-110 transition-transform duration-500">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 opacity-10"></div>
                  <step.icon className="w-8 h-8 text-indigo-600 relative z-10" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center shadow-md">
                    {step.num}
                  </div>
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h4>
                <p className="text-slate-500 font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. APP PREVIEW SECTION (SHOW PRODUCT POWER) */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 text-center mb-16 relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">Your money, beautifully organized.</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Experience a dashboard that feels more like a stunning piece of art than a spreadsheet.</p>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="relative rounded-2xl md:rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl p-2 md:p-6 overflow-hidden group">
            {/* The actual mockup interior */}
            <div className="bg-[#0f172a] rounded-xl md:rounded-[1.5rem] border border-white/5 overflow-hidden flex flex-col md:flex-row shadow-inner">
              
              {/* Sidebar Mock */}
              <div className="w-full md:w-64 border-r border-white/5 p-6 hidden md:block">
                <div className="flex items-center gap-3 mb-12">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-500"></div>
                  <div className="h-4 w-24 bg-white/20 rounded"></div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-8 rounded flex items-center px-3 ${i === 1 ? 'bg-white/10' : ''}`}>
                      <div className="h-3 w-32 bg-white/20 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content Mock */}
              <div className="flex-1 p-6 md:p-10">
                <div className="flex justify-between items-center mb-8">
                  <div className="h-6 w-32 bg-white/20 rounded"></div>
                  <div className="h-10 w-10 bg-white/10 rounded-full"></div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="col-span-2 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-white/10 p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-30">
                      <TrendingUp className="w-16 h-16" />
                    </div>
                    <div className="text-white/60 text-sm mb-1 uppercase tracking-wider font-semibold">Total Balance</div>
                    <div className="text-4xl font-extrabold mb-4">₹24,500</div>
                    <div className="flex gap-2 text-sm text-emerald-400 font-medium">
                      +₹1,200 (5%) vs last month
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                    <div className="text-white/60 text-sm mb-4 uppercase tracking-wider font-semibold">Monthly Budget</div>
                    <div className="relative h-32 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-[12px] border-white/5"></div>
                      <div className="absolute inset-0 rounded-full border-[12px] border-indigo-500 border-t-transparent border-l-transparent transform rotate-45"></div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">60%</div>
                        <div className="text-xs text-white/50">Used</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                  <div className="h-4 w-32 bg-white/20 rounded mb-6"></div>
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="flex gap-4 items-center">
                          <div className="w-10 h-10 rounded bg-white/10"></div>
                          <div>
                            <div className="h-3 w-24 bg-white/20 rounded mb-2"></div>
                            <div className="h-2 w-16 bg-white/10 rounded"></div>
                          </div>
                        </div>
                        <div className="h-3 w-16 bg-white/20 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Hover Floating Overlay 1 */}
            <div className="absolute -left-6 top-1/4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-2xl hidden lg:flex items-center gap-4 transform -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-700 delay-100">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-rose-300" />
              </div>
              <div>
                <div className="text-xs text-white/60 font-medium">Budget Alert</div>
                <div className="text-sm font-bold text-white">Food 90% utilized</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION (CORE VALUE) */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Everything you need. Nothing you don't.</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Powerful features designed around a student's real financial life, packed into a blazing fast interface.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 group cursor-default">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${f.gradient}`}>
                  <f.icon className={`h-6 w-6 ${f.color}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SMART INSIGHTS SECTION (UNIQUE) */}
      <section className="py-24 bg-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-50"></div>
            <div className="relative space-y-4">
              <div className="bg-white border border-slate-100 shadow-xl rounded-2xl p-5 flex items-start gap-4 transform hover:-translate-y-1 transition-transform">
                <div className="bg-indigo-100 p-2.5 rounded-lg text-indigo-600 mt-1"><Sparkles className="w-5 h-5"/></div>
                <div>
                  <h4 className="font-bold text-slate-900">AI Spending Insight</h4>
                  <p className="text-slate-500 text-sm mt-1">You spent 30% more on Food this week compared to last week. Consider eating at the mess!</p>
                </div>
              </div>
              <div className="bg-white border border-slate-100 shadow-xl rounded-2xl p-5 flex items-start gap-4 transform translate-x-8 hover:-translate-y-1 transition-transform">
                <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-600 mt-1"><CheckCircle2 className="w-5 h-5"/></div>
                <div>
                  <h4 className="font-bold text-slate-900">Budget On Track</h4>
                  <p className="text-slate-500 text-sm mt-1">You have ₹2,400 left for this month. You're doing great pacing your expenses.</p>
                </div>
              </div>
              <div className="bg-white border border-slate-100 shadow-xl rounded-2xl p-5 flex items-start gap-4 transform hover:-translate-y-1 transition-transform">
                <div className="bg-amber-100 p-2.5 rounded-lg text-amber-600 mt-1"><BarChart3 className="w-5 h-5"/></div>
                <div>
                  <h4 className="font-bold text-slate-900">Payment Habit</h4>
                  <p className="text-slate-500 text-sm mt-1">UPI is your most used payment method (85% of transactions). Cash withdrawals are unusually high today.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2 lg:pl-10">
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-2">Smart Insights</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Your personal financial analyst.</h3>
            <p className="text-slate-500 text-lg mb-8 leading-relaxed">
              EduVest doesn't just show you past numbers. It actively learns your habits to provide actionable, intelligent insights that help you make better financial decisions every day.
            </p>
            <ul className="space-y-4 text-slate-700 font-medium">
              <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-500 w-5 h-5" /> Autocategorization of expenses</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-500 w-5 h-5" /> Real-time unusual spending alerts</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-500 w-5 h-5" /> End-of-month predictive analysis</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 7. STUDENT VALUE SECTION */}
      <section className="py-24 bg-indigo-600 text-white rounded-[3rem] mx-4 md:mx-10 my-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-12">Why students love EduVest</h2>
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10 text-left">
            <div className="flex gap-4">
              <Shield className="w-8 h-8 text-indigo-300 shrink-0" />
              <div>
                <h4 className="text-xl font-bold mb-2">Avoid Overspending</h4>
                <p className="text-indigo-200">Strict limits and visual warnings ensure you never run out of money mid-month.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <GraduationCap className="w-8 h-8 text-indigo-300 shrink-0" />
              <div>
                <h4 className="text-xl font-bold mb-2">Build Financial Discipline</h4>
                <p className="text-indigo-200">Learn healthy habits now that will pay off massively when you start your career.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Wallet className="w-8 h-8 text-indigo-300 shrink-0" />
              <div>
                <h4 className="text-xl font-bold mb-2">Track Pocket Money</h4>
                <p className="text-indigo-200">Know exactly where your allowance went, down to the last rupee.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <TrendingUp className="w-8 h-8 text-indigo-300 shrink-0" />
              <div>
                <h4 className="text-xl font-bold mb-2">Real-world Prep</h4>
                <p className="text-indigo-200">Master terminology and logic used in real-world finance apps in a safe environment.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section id="testimonials" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-16 text-center tracking-tight">Don't just take our word for it.</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { text: "EduVest helped me control my expenses during college. I now save ₹2000/month effortlessly!", author: "Rahul K.", role: "Engineering Student" },
              { text: "The UI is so clean and Apple-like. It makes managing money actually fun. The smart insights are a game changer.", author: "Priya S.", role: "Design Major" },
              { text: "Finally an app that understands student problems. Tracking Cash and UPI separately is exactly what I needed.", author: "Aman D.", role: "Business Student" }
            ].map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative">
                <Quote className="absolute top-6 right-6 w-10 h-10 text-slate-100" />
                <p className="text-slate-600 font-medium leading-relaxed mb-6 relative z-10">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center font-bold text-indigo-600">
                    {t.author[0]}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{t.author}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA SECTION (CONVERSION) */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative rounded-[2rem] bg-slate-900 p-12 md:p-20 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/40 to-purple-600/40 mix-blend-screen"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-[80px]"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
                Start Managing Your Money Today
              </h2>
              <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
                Join thousands of students who are taking control of their financial future. Takes 30 seconds to setup.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <button className="w-full sm:w-auto bg-white text-slate-900 text-base font-bold px-8 py-4 rounded-xl hover:bg-slate-50 transition-all shadow-xl shadow-white/10 flex items-center justify-center gap-2">
                    Get Started Free <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
                <button className="w-full sm:w-auto bg-slate-800 text-white text-base font-bold px-8 py-4 rounded-xl hover:bg-slate-700 transition-all border border-slate-700 flex items-center justify-center gap-2">
                  Try Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FOOTER (PROFESSIONAL) */}
      <footer className="bg-slate-50 pt-16 pb-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-sm">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <span className="font-extrabold text-lg text-slate-900">EduVest</span>
              </div>
              <p className="text-slate-500 text-sm max-w-xs mb-6 leading-relaxed">
                The smart financial companion designed exclusively for students to track, manage, and grow their money.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><Twitter className="w-5 h-5"/></a>
                <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><Instagram className="w-5 h-5"/></a>
                <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><Github className="w-5 h-5"/></a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-medium">
                <li><a href="#features" className="hover:text-indigo-600 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Changelog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Resources</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-medium">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Student Guide</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-medium">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-200 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm font-medium">© {new Date().getFullYear()} EduVest Inc. All rights reserved.</p>
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
              Made with <span className="text-rose-500">♥</span> for students
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

