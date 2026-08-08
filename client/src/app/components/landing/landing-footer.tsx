import { Brain, Phone, Mail, Send } from "lucide-react";
import { useNavigate } from "react-router";

export function LandingFooter() {
  const navigate = useNavigate();

  return (
    <footer className="bg-slate-900 border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">CivicAI</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-5">
              AI-based citizen grievance classification and routing system. Built for better governance, powered by NLP and machine learning.
            </p>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-slate-400">All systems operational</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#departments" className="text-slate-400 hover:text-white transition-colors">Departments</a></li>
              <li><a href="#testimonials" className="text-slate-400 hover:text-white transition-colors">Testimonials</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Get in Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-slate-400">
                <Phone className="w-4 h-4 text-slate-600" />
                <span>1800-XXX-XXXX</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4 text-slate-600" />
                <span>support@civicai.app</span>
              </li>
            </ul>
            <button
              onClick={() => navigate("/auth?mode=signup")}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
            >
              Register Now <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-slate-500">Built for better governance. Powered by AI and NLP.</p>
          <div className="flex items-center gap-6 text-slate-500">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>&copy; {new Date().getFullYear()} CivicAI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
