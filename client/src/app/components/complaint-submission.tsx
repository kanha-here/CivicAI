import { motion } from "motion/react";
import { useState, useCallback } from "react";
import {
  Send,
  Mic,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { dashboardService } from "../../services/dashboard.service";
import { speechLanguages, useAzureSpeech } from "../../hooks/useAzureSpeech";

export function ComplaintSubmission() {
  const [complaint, setComplaint] = useState("");
  const [speechLanguage, setSpeechLanguage] = useState("hi-IN");
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    language: string;
    category: string;
    priority: string;
    confidence: number;
    summary: string;
  } | null>(null);

  const handleSubmit = useCallback(async () => {
    setIsProcessing(true);
    try {
      const result = await dashboardService.analyzeComplaint(complaint);
      setAnalysis({
        language: result.language,
        category: result.category,
        priority: result.priority,
        confidence: Number(result.confidence || 0),
        summary: result.summary,
      });
    } catch (error) {
      console.error("Failed to analyze complaint:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [complaint]);

  const speech = useAzureSpeech({
    language: speechLanguage,
    onText: (text) => setComplaint((prev) => `${prev}${prev ? " " : ""}${text}`),
  });

  return (
    <section className="py-24 px-6 relative bg-slate-50/50 dark:bg-[#0B1020]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 border-none">
            AI-Powered Submission
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Submit Your Complaint
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            AI analyzes, classifies, and routes your complaint in real-time
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-8"
        >
          {/* Submission Form */}
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="space-y-6">
              <div>
                <label className="text-sm dark:text-gray-300 text-gray-700 mb-2 block">
                  Describe your complaint
                </label>
                <Textarea
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  placeholder="Type your complaint in any language... (Hindi, English, etc.)"
                  className="min-h-[200px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 resize-none text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-blue-500"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <select
                  value={speechLanguage}
                  onChange={(event) => setSpeechLanguage(event.target.value)}
                  className="h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-700 dark:text-slate-300"
                >
                  {speechLanguages.map((language) => (
                    <option key={language.value} value={language.value}>
                      {language.label}
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={speech.toggleListening}
                  className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  {speech.isListening ? "Stop Voice" : "Voice Input"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2 dark:text-cyan-400 text-cyan-600">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span className="text-sm">AI is analyzing your complaint...</span>
                  </div>
                  <Progress value={66} className="h-1" />
                </motion.div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={!complaint || isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium"
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    Submit Complaint
                    <Send className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* AI Analysis Preview */}
          <div className="space-y-4">
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  AI Analysis Results
                </h3>
              </div>

              {analysis ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Language
                    </span>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {analysis.language}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Category
                    </span>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {analysis.category}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Priority
                    </span>
                    <Badge variant="secondary" className="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                      {analysis.priority}
                    </Badge>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Confidence Score
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {analysis.confidence}%
                      </span>
                    </div>
                    <Progress value={analysis.confidence} className="h-2 bg-slate-100 dark:bg-slate-800" />
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      AI-Generated Summary
                    </p>
                    <p className="text-sm text-slate-900 dark:text-slate-200">
                      {analysis.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 text-green-700 dark:text-green-400">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">Ready to route to relevant department</span>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                    <Sparkles className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Submit a complaint to see AI analysis
                  </p>
                </div>
              )}
            </div>

            {/* Live Processing Indicator */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    AI System Active
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time multilingual processing enabled
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
