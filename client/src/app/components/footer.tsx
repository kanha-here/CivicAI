import { motion } from "motion/react";
import { useState, useEffect } from "react";
import {
  Github,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Activity,
  Shield,
  Zap,
} from "lucide-react";
import { dashboardService } from "../../services/dashboard.service";

export function Footer() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    dashboardService.landing().then(setData).catch(console.error);
  }, []);

  const hero = data?.hero ?? {};
  const pipeline = data?.pipeline ?? {};

  return (
    <footer className="py-16 px-6 relative bg-white dark:bg-[#0B1020] border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <motion.div
                  animate={{
                    scale: [1, 2, 1],
                    opacity: [0.8, 0, 0.8],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-green-400"
                ></motion.div>
              </div>
              <div>
                <p className="font-semibold dark:text-white text-gray-900">
                  {hero.active != null ? "Database Connected" : "System Initializing"}
                </p>
                <p className="text-sm dark:text-gray-400 text-gray-600">
                  Live data from PostgreSQL/Prisma
                </p>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm font-semibold dark:text-white text-gray-900">
                    {pipeline.accuracy ?? 0}%
                  </p>
                  <p className="text-xs dark:text-gray-400 text-gray-600">
                    Model Confidence
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-sm font-semibold dark:text-white text-gray-900">
                    Secured
                  </p>
                  <p className="text-xs dark:text-gray-400 text-gray-600">
                    256-bit SSL
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm font-semibold dark:text-white text-gray-900">
                    {(hero.resolved ?? 0).toLocaleString()}
                  </p>
                  <p className="text-xs dark:text-gray-400 text-gray-600">
                    Resolved Cases
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold dark:text-white text-gray-900">
                  GrievanceAI
                </h3>
                <p className="text-xs dark:text-cyan-300 text-cyan-600">
                  Civic Intelligence Platform
                </p>
              </div>
            </div>
            <p className="text-sm dark:text-gray-400 text-gray-600 mb-4">
              Transforming citizen complaints into intelligent action through AI-powered
              governance automation.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-8 h-8 rounded-lg dark:bg-white/10 bg-gray-200 dark:hover:bg-white/20 hover:bg-gray-300 flex items-center justify-center transition-colors"
              >
                <Twitter className="w-4 h-4 dark:text-gray-300 text-gray-700" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-lg dark:bg-white/10 bg-gray-200 dark:hover:bg-white/20 hover:bg-gray-300 flex items-center justify-center transition-colors"
              >
                <Github className="w-4 h-4 dark:text-gray-300 text-gray-700" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-lg dark:bg-white/10 bg-gray-200 dark:hover:bg-white/20 hover:bg-gray-300 flex items-center justify-center transition-colors"
              >
                <Linkedin className="w-4 h-4 dark:text-gray-300 text-gray-700" />
              </a>
            </div>
          </motion.div>

          {/* Product */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="font-semibold dark:text-white text-gray-900 mb-4">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="text-sm dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#dashboard"
                  className="text-sm dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="#workflow"
                  className="text-sm dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors"
                >
                  Workflow
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-sm dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#api"
                  className="text-sm dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors"
                >
                  API Documentation
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="font-semibold dark:text-white text-gray-900 mb-4">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors"
                >
                  Case Studies
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors"
                >
                  Community
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="font-semibold dark:text-white text-gray-900 mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 dark:text-gray-400 text-gray-600 mt-0.5" />
                <a
                  href="mailto:support@grievanceai.gov"
                  className="text-sm dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors"
                >
                  support@grievanceai.gov
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 dark:text-gray-400 text-gray-600 mt-0.5" />
                <a
                  href="tel:+911800123456"
                  className="text-sm dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors"
                >
                  +91 1800-123-456
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 dark:text-gray-400 text-gray-600 mt-0.5" />
                <span className="text-sm dark:text-gray-400 text-gray-600">
                  Government Tech Center
                  <br />
                  New Delhi, India
                </span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pt-8 border-t dark:border-white/10 border-gray-200"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm dark:text-gray-400 text-gray-600">
              © 2026 GrievanceAI. All rights reserved. | Built for Smart Governance
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-sm dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors"
              >
                Accessibility
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
