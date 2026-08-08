import { Users, Quote, Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Resident, Sector 14",
    text: "I filed a water complaint at 9 AM and got a response by noon. The AI routed it perfectly. Never seen anything like this before.",
    rating: 5,
    color: "#2563eb",
  },
  {
    name: "Rajesh Kumar",
    role: "Municipal Officer",
    text: "Our department used to get misrouted complaints daily. Now the AI sends us exactly what falls under our jurisdiction. Efficiency is up 70%.",
    rating: 5,
    color: "#22c55e",
  },
  {
    name: "Anita Desai",
    role: "Community Leader",
    text: "The voice complaint feature is a game-changer for elderly residents who can't type. They just speak and it gets filed correctly.",
    rating: 5,
    color: "#f59e0b",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-gradient-to-br from-indigo-950 to-slate-900 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px]" />
      <div className="absolute inset-0 bg-grid opacity-[0.04]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 mb-4">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wide">Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            Trusted by citizens
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">and authorities alike</span>
          </h2>
          <p className="text-lg text-slate-400">Real stories from people who experienced faster, smarter grievance redressal.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.name}
              className="group relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-7 hover:border-white/20 transition-all duration-400"
            >
              <Quote className="w-8 h-8 text-indigo-400/40 mb-4" />
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">"{testimonial.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: testimonial.color }}
                >
                  {testimonial.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                  <p className="text-xs text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
