import { useEffect, useMemo, useRef, useState } from "react";
import {
  Clock,
  Camera,
  Download,
  Filter,
  MapPin,
  MessageSquare,
  MoreVertical,
  Search,
  ShieldAlert,
  Send,
  UserCircle2,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import type { ComplaintItem } from "../../types/operations";

const statusStyles: Record<string, string> = {
  New: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Triaged: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200",
  Assigned: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200",
  "In Progress": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
  Escalated: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200",
  Resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
  Closed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
  Rejected: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200",
};

const priorityStyles: Record<string, string> = {
  Critical: "bg-rose-500/10 text-rose-500 border-rose-500/30",
  High: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  Medium: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
  Low: "bg-slate-500/10 text-slate-500 border-slate-500/30",
};

interface ComplaintQueueProps {
  complaints: ComplaintItem[];
  onAssign?: (complaintId: string) => void;
  onStart?: (complaintId: string) => void;
  onResolve?: (complaintId: string) => void;
  onShareProgress?: (complaintId: string, payload: { comment?: string; imageUrl?: string; fileName?: string; status?: "assigned" | "in_progress" | "resolved" }) => void;
  onDownloadReport?: (complaintId: string) => void;
  activeComplaintId?: string | null;
  isUpdating?: boolean;
  isOfficerReady?: boolean;
}

export function ComplaintQueue({
  complaints,
  onAssign,
  onStart,
  onResolve,
  onShareProgress,
  onDownloadReport,
  activeComplaintId,
  isUpdating,
  isOfficerReady = true,
}: ComplaintQueueProps) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(complaints[0]?.id ?? null);
  const [filter, setFilter] = useState("All");
  const [progressText, setProgressText] = useState<Record<string, string>>({});
  const [progressImage, setProgressImage] = useState<Record<string, { dataUrl: string; fileName: string } | null>>({});
  const [cameraComplaintId, setCameraComplaintId] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const readProgressImage = (complaintId: string, file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProgressImage((prev) => ({
        ...prev,
        [complaintId]: { dataUrl: String(reader.result), fileName: file.name },
      }));
    };
    reader.readAsDataURL(file);
  };

  const stopCamera = () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraComplaintId(null);
  };

  const startCamera = async (complaintId: string) => {
    setCameraError(null);
    if (cameraComplaintId && cameraComplaintId !== complaintId) stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      cameraStreamRef.current = stream;
      setCameraComplaintId(complaintId);
      window.setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 0);
    } catch {
      setCameraError("Camera permission is required for live image upload.");
    }
  };

  const captureLiveImage = (complaintId: string) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.86);
    setProgressImage((prev) => ({
      ...prev,
      [complaintId]: { dataUrl, fileName: `live-work-${Date.now()}.jpg` },
    }));
  };

  const submitProgress = (complaintId: string) => {
    const image = progressImage[complaintId];
    const comment = progressText[complaintId]?.trim();
    if (!comment && !image) return;
    onShareProgress?.(complaintId, {
      comment,
      imageUrl: image?.dataUrl,
      fileName: image?.fileName,
      status: "in_progress",
    });
    setProgressText((prev) => ({ ...prev, [complaintId]: "" }));
    setProgressImage((prev) => ({ ...prev, [complaintId]: null }));
  };

  const filtered = useMemo(() => {
    return complaints.filter((item) => {
      const matchesQuery =
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.location.toLowerCase().includes(query.toLowerCase()) ||
        item.id.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === "All" || item.priority === filter;
      return matchesQuery && matchesFilter;
    });
  }, [complaints, filter, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Live Complaint Queue
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Prioritized for decision velocity and SLA compliance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            "All",
            "Critical",
            "High",
            "Medium",
            "Low",
          ].map((level) => (
            <Button
              key={level}
              variant={filter === level ? "default" : "outline"}
              className={
                filter === level
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-white/60 dark:bg-slate-900/50"
              }
              size="sm"
              onClick={() => setFilter(level)}
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search queue by ID, location, or category"
            className="w-full rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60 px-9 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
          />
        </div>
        <Button variant="outline" className="bg-white/70 dark:bg-slate-900/60">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="space-y-3">
        {filtered.map((item) => {
          const isExpanded = expanded === item.id;
          const isPending = activeComplaintId === item.id && isUpdating;
          const canAssign = ["New", "Triaged"].includes(item.status) && isOfficerReady;
          const canStart = ["Assigned"].includes(item.status) && item.canShareProgress;
          const canResolve = ["In Progress"].includes(item.status);
          const isDone = ["Resolved", "Closed"].includes(item.status);
          const canShareProgress = Boolean(item.canShareProgress);
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-white/40 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-4 shadow-sm transition-all hover:shadow-[0_20px_50px_-30px_rgba(59,130,246,0.55)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">{item.id}</span>
                    <Badge variant="secondary" className={priorityStyles[item.priority]}>
                      {item.priority}
                    </Badge>
                    <Badge variant="secondary" className={statusStyles[item.status]}>
                      {item.status}
                    </Badge>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {item.category}
                    </Badge>
                    <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-500 border-cyan-500/30">
                      AI {Math.round(item.confidence * 100)}%
                    </Badge>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {item.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      SLA {item.slaMinutes}m
                    </span>
                    <span className="flex items-center gap-1">
                      <UserCircle2 className="h-4 w-4" />
                      {item.assignedOfficer}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {["New", "Triaged"].includes(item.status) && (
                    <Button
                      size="sm"
                      className="bg-cyan-600 hover:bg-cyan-500 text-white"
                      disabled={isPending || !isOfficerReady}
                      onClick={() => onAssign?.(item.id)}
                    >
                      {isPending ? "Assigning..." : isOfficerReady ? "Assign to Me" : "Loading officer..."}
                    </Button>
                  )}
                  {canStart && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/70 dark:bg-slate-900/60"
                      disabled={isPending}
                      onClick={() => onStart?.(item.id)}
                    >
                      {isPending ? "Starting..." : "Start Work"}
                    </Button>
                  )}
                  {canResolve && (
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white"
                      disabled={isPending}
                      onClick={() => onResolve?.(item.id)}
                    >
                      {isPending ? "Completing..." : "Mark Done"}
                    </Button>
                  )}
                  {isDone && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                      Work Complete
                    </Badge>
                  )}
                  <Button size="icon" variant="ghost" className="text-slate-400">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {isExpanded ? (
                <div className="mt-4 grid gap-3 md:grid-cols-[1.4fr_1fr]">
                  <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-950/50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <ShieldAlert className="h-4 w-4 text-cyan-500" />
                      AI Summary
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {item.summary}
                    </p>
                    <p className="mt-3 text-sm font-medium text-cyan-600 dark:text-cyan-400">
                      Recommendation: {item.aiRecommendation}
                    </p>
                    {!!item.aiModels?.length && (
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        {item.aiModels.map((model) => (
                          <div
                            key={model.modelName}
                            className="rounded-lg border border-slate-200/70 bg-white/70 p-2 text-xs dark:border-slate-700/70 dark:bg-slate-900/60"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-slate-700 dark:text-slate-200">{model.label}</span>
                              <span className="text-slate-400">{model.confidence ? `${Math.round(model.confidence)}%` : model.status}</span>
                            </div>
                            {model.summary && (
                              <p className="mt-1 line-clamp-2 text-slate-500 dark:text-slate-400">{model.summary}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-slate-200/60 dark:border-slate-700/60 px-2 py-1 text-xs text-slate-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-950/50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        <MessageSquare className="h-4 w-4 text-amber-500" />
                        Work Updates
                      </div>
                      <Button size="sm" variant="ghost" className="text-slate-500" onClick={() => onDownloadReport?.(item.id)}>
                        <Download className="mr-1 h-3.5 w-3.5" />
                        Report
                      </Button>
                    </div>
                    <div className="mt-3 space-y-3">
                      {item.comments.length === 0 ? (
                        <p className="text-sm text-slate-400">No internal notes yet.</p>
                      ) : (
                        item.comments.map((comment) => (
                          <div key={comment.id} className="text-sm">
                            <p className="font-medium text-slate-700 dark:text-slate-200">
                              {comment.author}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400">
                              {comment.message}
                            </p>
                            <p className="text-xs text-slate-400">{comment.createdAt}</p>
                          </div>
                        ))
                      )}
                    </div>
                    {!!item.feedback?.length && (
                      <div className="mt-4 rounded-lg border border-emerald-200/70 bg-emerald-50/70 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                          Citizen Feedback
                        </p>
                        <div className="mt-2 space-y-2">
                          {item.feedback.map((feedback) => (
                            <div key={feedback.id} className="text-sm">
                              <p className="font-medium text-slate-700 dark:text-slate-200">{feedback.author}</p>
                              <p className="text-slate-500 dark:text-slate-400">{feedback.message}</p>
                              <p className="text-xs text-slate-400">{feedback.createdAt}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {!!item.images?.length && (
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {item.images.slice(0, 6).map((image) => (
                          <img
                            key={image.id}
                            src={image.url}
                            alt={image.fileName || "progress"}
                            className="h-20 w-full rounded-lg border border-slate-200/70 object-cover dark:border-slate-700/70"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="rounded-full border border-slate-200/60 dark:border-slate-700/60 px-2 py-1">
                    AI summary available
                  </span>
                  <span className="rounded-full border border-slate-200/60 dark:border-slate-700/60 px-2 py-1">
                    {item.comments.length} internal notes
                  </span>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>Created {item.createdAt}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-cyan-600 dark:text-cyan-400"
                  onClick={() => setExpanded(isExpanded ? null : item.id)}
                >
                  {isExpanded ? "Collapse" : "Expand"} details
                </Button>
              </div>

              {isExpanded && canShareProgress && (
                <div className="mt-4 rounded-xl border border-slate-200/60 bg-slate-50/70 p-3 dark:border-slate-700/60 dark:bg-slate-950/50">
                  <textarea
                    value={progressText[item.id] || ""}
                    onChange={(event) => setProgressText((prev) => ({ ...prev, [item.id]: event.target.value }))}
                    placeholder="Share live work progress for citizen, officer, and admin visibility..."
                    className="min-h-20 w-full resize-none rounded-lg border border-slate-200 bg-white/80 p-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-cyan-500/50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex cursor-pointer items-center rounded-md border border-slate-200 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                        <Camera className="mr-2 h-4 w-4" />
                        Select Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => readProgressImage(item.id, event.target.files?.[0])}
                        />
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-white/70 dark:bg-slate-900/60"
                        onClick={() => cameraComplaintId === item.id ? stopCamera() : startCamera(item.id)}
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        {cameraComplaintId === item.id ? "Stop Camera" : "Live Camera"}
                      </Button>
                      {progressImage[item.id]?.fileName && (
                        <span className="text-xs font-medium text-cyan-600 dark:text-cyan-300">
                          Ready: {progressImage[item.id]?.fileName}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="outline" className="bg-white/70 dark:bg-slate-900/60" onClick={() => onDownloadReport?.(item.id)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Report
                      </Button>
                      <Button
                        className="bg-cyan-600 text-white hover:bg-cyan-500"
                        disabled={isPending}
                        onClick={() => submitProgress(item.id)}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Share Update
                      </Button>
                    </div>
                  </div>
                  {cameraComplaintId === item.id && (
                    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-900 p-2 dark:border-slate-700">
                      <video ref={videoRef} autoPlay playsInline muted className="h-48 w-full rounded-md object-cover" />
                      <canvas ref={canvasRef} className="hidden" />
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="text-xs text-slate-300">{cameraError || "Live camera preview active"}</p>
                        <Button
                          type="button"
                          size="sm"
                          className="bg-cyan-600 text-white hover:bg-cyan-500"
                          onClick={() => captureLiveImage(item.id)}
                        >
                          Capture
                        </Button>
                      </div>
                    </div>
                  )}
                  {cameraComplaintId !== item.id && cameraError && (
                    <p className="mt-2 text-xs text-red-500">{cameraError}</p>
                  )}
                </div>
              )}
              {isExpanded && !canShareProgress && !isDone && (
                <div className="mt-4 rounded-xl border border-dashed border-slate-200/80 bg-slate-50/70 p-3 text-sm text-slate-500 dark:border-slate-700/70 dark:bg-slate-950/40 dark:text-slate-400">
                  Assign this complaint to yourself to share live work updates, upload site images, and view citizen feedback for your work.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
