import { Brain, Languages, Zap, BarChart3, MapPin, Mic, Sparkles, ChevronRight, Rocket, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Classification",
    description: "Advanced NLP models automatically categorize complaints into the right department with high accuracy.",
    color: "from-indigo-500 to-blue-600",
    span: "lg:col-span-2",
  },
  {
    icon: Languages,
    title: "Multilingual Support",
    description: "Handle complaints in regional languages and English seamlessly.",
    color: "from-emerald-500 to-teal-600",
    span: "",
  },
  {
    icon: Zap,
    title: "Priority Detection",
    description: "Automatically identifies urgent complaints for immediate escalation.",
    color: "from-orange-500 to-red-500",
    span: "",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Comprehensive dashboard with department-wise trends, status tracking, and resolution timelines.",
    color: "from-pink-500 to-rose-500",
    span: "lg:col-span-2",
  },
  {
    icon: MapPin,
    title: "Live Location & Photos",
    description: "GPS location and photo evidence for faster, accurate resolution.",
    color: "from-violet-500 to-purple-600",
    span: "",
  },
  {
    icon: Mic,
    title: "Voice-to-Text Input",
    description: "Submit complaints by speaking — our speech recognition converts voice to text for accessibility.",
    color: "from-cyan-500 to-blue-500",
    span: "",
  },
];

export function Features() {
  const navigate = useNavigate();

  return (
    <section id="features" className="py-24 bg-white dark:bg-[#020817] relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-light dark:bg-grid opacity-60 dark:opacity-[0.04]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-white/5 border border-indigo-100 dark:border-white/10 mb-4">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-semibold text-indigo-700 dark:text-slate-200 uppercase tracking-wide">
              Features
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
            Everything you need for
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">smart grievance management</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            From AI classification to real-time analytics, our platform covers the entire complaint lifecycle.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`group relative p-7 rounded-3xl border transition-all duration-500 overflow-hidden bg-white dark:bg-white/5 border-slate-200/60 dark:border-white/10 hover:border-transparent dark:hover:border-white/20 hover:shadow-xl dark:hover:shadow-2xl ${feature.span}`}
              >
                <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`} />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                    Learn more <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}

          <div className="group relative p-7 rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-700 border border-indigo-500 hover:shadow-2xl transition-all duration-500 overflow-hidden text-white">
            <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-3xl group-hover:bg-white/20 transition-all" />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">End-to-End Pipeline</h3>
              <p className="text-sm text-indigo-100 leading-relaxed mb-4">
                From complaint submission to resolution tracking — one unified, automated workflow.
              </p>
              <button
                onClick={() => navigate("/auth?mode=signup")}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-indigo-100 transition-colors"
              >
                Start now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
