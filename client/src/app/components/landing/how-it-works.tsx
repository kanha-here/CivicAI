import { MessageSquare, Cpu, Shield, CheckCircle2, Rocket, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

const WORKFLOW = [
  { step: "01", title: "Citizen Submits", description: "File a complaint via text, voice, or photo with live location.", icon: MessageSquare },
  { step: "02", title: "AI Classifies", description: "NLP engine analyzes and routes to the correct department.", icon: Cpu },
  { step: "03", title: "Priority Assessed", description: "Urgent complaints are flagged and escalated automatically.", icon: Shield },
  { step: "04", title: "Authority Acts", description: "Department receives, tracks, and resolves the grievance.", icon: CheckCircle2 },
];

export function HowItWorks() {
  const navigate = useNavigate();

  return (
    <section id="how-it-works" className="py-24 bg-slate-50 dark:bg-[#0a0f1e] relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-light dark:bg-grid opacity-50 dark:opacity-[0.04]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-white/5 border border-emerald-100 dark:border-white/10 mb-4">
            <Rocket className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-slate-200 uppercase tracking-wide">
              How It Works
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
            From complaint to resolution
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text text-transparent">in 4 simple steps</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            A seamless journey powered by AI — from the moment a citizen speaks to the moment authorities act.
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-200 via-emerald-200 to-indigo-200 dark:from-indigo-800 dark:via-emerald-800 dark:to-indigo-800" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WORKFLOW.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative group">
                  <div className="relative z-10 mx-auto mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-white/5 shadow-lg dark:shadow-none border border-slate-100 dark:border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:shadow-xl dark:group-hover:bg-white/10 transition-all duration-300">
                      <Icon className="w-7 h-7 text-indigo-600 group-hover:text-indigo-500" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                      {item.step}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10 group-hover:shadow-lg dark:group-hover:shadow-none group-hover:border-indigo-100 dark:group-hover:border-white/20 transition-all duration-300 text-center">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-14">
          <button
            onClick={() => navigate("/auth?mode=signup")}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 rounded-xl transition-all active:scale-95 shadow-lg"
          >
            Try it yourself — it's free
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
