import { ShieldCheck, Eye, Smartphone, Bell } from "lucide-react";

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: "Secure & Private", desc: "Your data is encrypted and never shared" },
  { icon: Eye, title: "Full Transparency", desc: "Track your complaint status in real-time" },
  { icon: Smartphone, title: "Mobile Friendly", desc: "Works seamlessly on any device" },
  { icon: Bell, title: "Instant Notifications", desc: "Get alerts at every stage of resolution" },
];

export function TrustBar() {
  return (
    <section className="py-16 bg-white dark:bg-[#020817] border-y border-slate-100 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {TRUST_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="text-center group">
                <div className="inline-flex w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-transparent dark:border-white/10 items-center justify-center mb-4 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-600/20 group-hover:scale-110 transition-all duration-300">
                  <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
