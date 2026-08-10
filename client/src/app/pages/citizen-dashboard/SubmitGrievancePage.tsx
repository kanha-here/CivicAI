import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Camera, MapPin, Send, UploadCloud, Info, Mic, ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import { Button } from "../../components/ui/button";
import { complaintService } from "../../../services/complaint.service";
import { speechLanguages, useVoiceTranscription } from "../../../hooks/useVoiceTranscription";
import { verifyImageEvidence, type ImageVerificationResult } from "../../../services/imageVerification.service";
import { warmUpModelServices, waitForVerifyModelReady, type VerifyModelStatus } from "../../../services/modelWarmup.service";

type UploadItem = {
    file: File;
    url: string;
    dataUrl: string;
    source: "upload" | "camera";
};

function normalizePrediction(complaint: any) {
    const directPrediction = complaint.prediction;
    const hasDirectPredictionValues = !!(
        directPrediction && (
            directPrediction.status && directPrediction.status !== "QUEUED"
            || directPrediction.validity
            || directPrediction.priority
            || directPrediction.validity_confidence != null
        )
    );
    if (hasDirectPredictionValues) {
        return directPrediction;
    }

    const savedPrediction = complaint.predictions?.[0];
    if (savedPrediction && (
        savedPrediction.validity
        || savedPrediction.priority
        || savedPrediction.validityConfidence != null
    )) {
        return {
            validity: savedPrediction.validity,
            validity_confidence: savedPrediction.validityConfidence,
            priority: savedPrediction.priority,
        };
    }

    const model1 = complaint.aiModelOutputs?.find(
        (output: any) => output.modelName === "MODEL_1_AUTHENTICITY_PRIORITY",
    );
    const model2 = complaint.aiModelOutputs?.find(
        (output: any) => output.modelName === "MODEL_2_CLASSIFICATION_SEVERITY",
    );
    if (model1 || model2) {
        const processed1 = model1?.processedOutput || {};
        const processed2 = model2?.processedOutput || {};
        const status = complaint.prediction?.status && complaint.prediction.status !== "QUEUED"
            ? complaint.prediction.status
            : model1?.status || model2?.status || complaint.aiStatus || "COMPLETED";
        const classification =
            model2?.classification
            || model2?.suggestedDepartment
            || processed2.predicted_department
            || processed2.department
            || model2?.processedOutput?.predicted_department
            || "Pending";
        const classificationConfidence = Number(
            model2?.confidenceScore
            ?? processed2.confidence
            ?? processed2.classificationConfidence
            ?? 0,
        );

        return {
            validity: processed1.validity || model1?.classification,
            validity_confidence: Number(processed1.validityConfidence ?? processed1.validity_confidence ?? model1?.confidenceScore ?? model1?.validityConfidence ?? 0),
            priority: processed1.priority || model1?.priorityLevel,
            classification,
            classification_confidence: classificationConfidence,
            suggestedDepartment: classification,
            status,
            unavailable: (model1?.status === "FAILED") || (model2?.status === "FAILED"),
            error: model1?.errorLog?.message || model2?.errorLog?.message || model1?.error || model2?.error || complaint.prediction?.error,
        };
    }

    return {
        unavailable: false,
        status: complaint.prediction?.status || complaint.aiStatus || "QUEUED",
        error: complaint.prediction?.error || "AI processing is still running. The values will appear here automatically.",
    };
}

async function waitForPrediction(complaintId: string) {
    let latest: any = null;
    for (let attempt = 0; attempt < 18; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 1200 : 2500));
        latest = await complaintService.getById(complaintId);
        const predictionIsDone = latest.prediction && latest.prediction.status && latest.prediction.status !== "QUEUED";
        const model1 = latest.aiModelOutputs?.find(
            (output: any) => output.modelName === "MODEL_1_AUTHENTICITY_PRIORITY",
        );
        const aiStatusDone = latest.aiStatus && latest.aiStatus !== "QUEUED" && latest.aiStatus !== "PROCESSING";

        if (predictionIsDone || aiStatusDone || latest.predictions?.length || model1) return latest;
    }
    return latest;
}

function routedDepartment(category: string) {
    if (category.includes("Infrastructure")) return "Public Works";
    if (category.includes("Water")) return "Water Supply";
    if (category.includes("Sanitation")) return "Sanitation";
    if (category.includes("Safety")) return "Public Safety";
    return "Civic Services";
}

function severityLabel(priority?: string) {
    if (!priority) return "Pending model triage";
    return priority;
}

export function SubmitGrievance() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const cameraStreamRef = useRef<MediaStream | null>(null);
    const geoWatchRef = useRef<number | null>(null);
    const [step, setStep] = useState(1);
    const today = new Date().toISOString().split("T")[0];
    const [primaryCategory, setPrimaryCategory] = useState("Infrastructure & Roads");
    const [subCategory, setSubCategory] = useState("Pothole / Road Damage");
    const [observationDate, setObservationDate] = useState(today);
    const [description, setDescription] = useState("");
    const [speechLanguage, setSpeechLanguage] = useState("hi-IN");

    const [location, setLocation] = useState("");
    const [geoAccuracy, setGeoAccuracy] = useState<number | null>(null);
    const [isWatchingLocation, setIsWatchingLocation] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    const [uploads, setUploads] = useState<UploadItem[]>([]);
    const [imageError, setImageError] = useState<string | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [imageVerification, setImageVerification] = useState<ImageVerificationResult | null>(null);
    const [imageVerificationError, setImageVerificationError] = useState<string | null>(null);
    const [isVerifyingImage, setIsVerifyingImage] = useState(false);
    const imageVerificationRequestId = useRef(0);
    const imageVerificationTimeoutRef = useRef<number | null>(null);
    const [verificationRetryCount, setVerificationRetryCount] = useState(0);
    const [verifyModelStatus, setVerifyModelStatus] = useState<VerifyModelStatus>("unknown");
    const [predictionResult, setPredictionResult] = useState<null | {
        complaint: string;
        validity?: string;
        validity_confidence?: number;
        priority?: string;
        classification?: string;
        classification_confidence?: number;
        suggestedDepartment?: string;
        whatsappNotification?: {
            sent?: boolean;
            reason?: string;
            sid?: string;
        };
        status?: string;
        unavailable?: boolean;
        error?: string;
    }>(null);

    const speech = useVoiceTranscription({
        language: speechLanguage,
        onText: (text) => setDescription((prev) => `${prev}${prev ? " " : ""}${text}`),
    });

    useEffect(() => {
        // Best-effort: start waking the voice-transcription and
        // image-verification model services as soon as this page opens,
        // so they've had a head start by the time the citizen actually
        // records a voice note or uploads a photo.
        warmUpModelServices();
        // Track the verify model specifically (with live status) so the
        // "Image Evidence Verification" card can tell the citizen it's
        // waking up instead of leaving them staring at nothing until they
        // upload a photo and the first real request happens to time out.
        void waitForVerifyModelReady(setVerifyModelStatus);
    }, []);

    useEffect(() => {
        const latestPhoto = uploads[0];
        const trimmedDescription = description.trim();

        if (imageVerificationTimeoutRef.current !== null) {
            window.clearTimeout(imageVerificationTimeoutRef.current);
            imageVerificationTimeoutRef.current = null;
        }

        if (!latestPhoto || trimmedDescription.length < 20) {
            setImageVerification(null);
            setImageVerificationError(null);
            setIsVerifyingImage(false);
            return;
        }

        const requestId = ++imageVerificationRequestId.current;
        setIsVerifyingImage(true);
        setImageVerificationError(null);

        imageVerificationTimeoutRef.current = window.setTimeout(async () => {
            const outcome = await verifyImageEvidence(trimmedDescription, latestPhoto.file);

            if (imageVerificationRequestId.current !== requestId) return;

            if (outcome.ok) {
                setImageVerification(outcome.result);
            } else {
                setImageVerification(null);
                setImageVerificationError(outcome.error);
            }

            setIsVerifyingImage(false);
        }, 800);

        return () => {
            if (imageVerificationTimeoutRef.current !== null) {
                window.clearTimeout(imageVerificationTimeoutRef.current);
                imageVerificationTimeoutRef.current = null;
            }
        };
        // verificationRetryCount is a manual "try again" trigger (see the
        // retry button next to the error message) — bumping it re-runs
        // this effect with the same photo/description without the citizen
        // needing to touch the upload or retype anything.
    }, [description, uploads, verificationRetryCount]);

    useEffect(() => {
        return () => {
            uploads.forEach((u) => URL.revokeObjectURL(u.url));
            if (geoWatchRef.current !== null) navigator.geolocation.clearWatch(geoWatchRef.current);
            cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
        };
    }, [uploads]);

    const applyPosition = (pos: GeolocationPosition) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setGeoAccuracy(Math.round(accuracy));
        setIsLocating(false);
        setLocationError(null);
    };

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported in this browser.");
            return;
        }
        setIsLocating(true);
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            applyPosition,
            () => {
                setLocationError(
                    "Unable to detect location. Please allow permission.",
                );
                setIsLocating(false);
            },
            { timeout: 8000, enableHighAccuracy: true },
        );

        if (geoWatchRef.current === null) {
            geoWatchRef.current = navigator.geolocation.watchPosition(
                applyPosition,
                () => {
                    setLocationError("Live location updates are unavailable.");
                    setIsWatchingLocation(false);
                },
                { timeout: 10000, enableHighAccuracy: true, maximumAge: 5000 },
            );
            setIsWatchingLocation(true);
        }
    };

    const stopLiveLocation = () => {
        if (geoWatchRef.current !== null) {
            navigator.geolocation.clearWatch(geoWatchRef.current);
            geoWatchRef.current = null;
        }
        setIsWatchingLocation(false);
    };

    // Downscales an image (from a File or a live video frame) to a
    // reasonable max dimension and re-encodes it as JPEG. This keeps the
    // base64 payload we send to the server small (a few hundred KB instead
    // of multiple MB), which is what was actually causing "Request failed
    // with status code 413" on submit.
    const MAX_PHOTO_DIMENSION = 1600;
    const PHOTO_QUALITY = 0.82;

    const drawToCompressedFile = (
        source: CanvasImageSource,
        sourceWidth: number,
        sourceHeight: number,
        fileName: string,
    ): Promise<{ file: File; dataUrl: string }> =>
        new Promise((resolve, reject) => {
            const scale = Math.min(1, MAX_PHOTO_DIMENSION / Math.max(sourceWidth, sourceHeight));
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(sourceWidth * scale);
            canvas.height = Math.round(sourceHeight * scale);
            const context = canvas.getContext("2d");
            if (!context) {
                reject(new Error("Could not process image."));
                return;
            }
            context.drawImage(source, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error("Could not process image."));
                        return;
                    }
                    const file = new File([blob], fileName, { type: "image/jpeg" });
                    const reader = new FileReader();
                    reader.onload = () => resolve({ file, dataUrl: String(reader.result) });
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                },
                "image/jpeg",
                PHOTO_QUALITY,
            );
        });

    const compressUploadedFile = async (file: File): Promise<{ file: File; dataUrl: string }> => {
        const objectUrl = URL.createObjectURL(file);
        try {
            const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.onerror = reject;
                image.src = objectUrl;
            });
            return await drawToCompressedFile(img, img.naturalWidth, img.naturalHeight, file.name);
        } finally {
            URL.revokeObjectURL(objectUrl);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // Grab a plain reference to the actual input element up front.
        // `e.currentTarget` is only guaranteed to be valid for the
        // synchronous part of a React event handler — by the time the
        // `await`s in compressUploadedFile() below finish, the synthetic
        // event may already be gone, so reading e.currentTarget that late
        // was throwing "Cannot set properties of null".
        const inputEl = e.currentTarget;
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const maxFiles = 5;
        // Every photo gets downscaled and re-compressed before it's sent
        // (see compressUploadedFile), so this limit only needs to guard
        // against picking an absurdly large or wrong file — real phone
        // photos (commonly 10-20MB straight off the camera) should pass
        // through fine and get compressed down from here.
        const maxSizeMb = 25;

        const filtered = files.filter((f) => f.size <= maxSizeMb * 1024 * 1024);

        if (files.length > maxFiles) {
            setImageError(`Max ${maxFiles} images allowed.`);
        } else if (filtered.length !== files.length) {
            setImageError(`Each file must be under ${maxSizeMb}MB.`);
        } else {
            setImageError(null);
        }

        const nextUploads = await Promise.all(
            filtered.slice(0, Math.max(0, maxFiles - uploads.length)).map(async (originalFile) => {
                const { file, dataUrl } = await compressUploadedFile(originalFile);
                return {
                    file,
                    url: URL.createObjectURL(file),
                    dataUrl,
                    source: "upload" as const,
                };
            }),
        );

        setUploads((prev) => {
            const remaining = maxFiles - prev.length;
            return [...prev, ...nextUploads.slice(0, remaining)];
        });

        // Allow re-selecting the same file
        if (inputEl) inputEl.value = "";
    };

    const removeImage = (index: number) => {
        setUploads((prev) => {
            const next = [...prev];
            const [removed] = next.splice(index, 1);
            if (removed) URL.revokeObjectURL(removed.url);
            return next;
        });
    };

    const startCamera = async () => {
        setCameraError(null);

        if (!window.isSecureContext) {
            setCameraError("Camera access requires a secure (HTTPS) connection.");
            return;
        }
        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraError("Camera capture isn't supported in this browser.");
            return;
        }

        try {
            let stream: MediaStream;
            try {
                // Prefer the rear camera on phones ("ideal" is a soft hint,
                // so this alone should never fail just because a device
                // only has one camera).
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { ideal: "environment" } },
                    audio: false,
                });
            } catch (innerErr) {
                // Some browsers/webcams reject facingMode constraints
                // outright (mostly seen on laptops with a single front
                // camera and certain external USB webcams) even though a
                // camera is genuinely available. Retry once with no
                // constraints before giving up, instead of surfacing a
                // false "no camera" error in that case.
                const innerName = innerErr instanceof DOMException ? innerErr.name : "";
                if (innerName !== "OverconstrainedError" && innerName !== "NotFoundError") throw innerErr;
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            }
            cameraStreamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
            setIsCameraActive(true);
        } catch (err) {
            // Surface the real reason instead of one generic message — a
            // permission denial, a camera already in use by another app/tab,
            // and no camera being found all need different next steps from
            // the person seeing this.
            const name = err instanceof DOMException ? err.name : "";
            const messages: Record<string, string> = {
                NotAllowedError: "Camera permission was denied. Allow camera access for this site in your browser settings, then reload the page.",
                // NotFoundError also fires when a real camera exists but is
                // blocked at the OS level (e.g. Windows Settings > Privacy
                // > Camera, or macOS System Settings > Privacy & Security >
                // Camera), not only when there's genuinely no hardware —
                // so point people at both possibilities.
                NotFoundError: "No camera was found. If this device does have one, check that camera access isn't blocked for your browser in your system's privacy settings.",
                NotReadableError: "The camera is already in use by another app or browser tab. Close it and try again.",
                OverconstrainedError: "No camera on this device matches the requested settings.",
                SecurityError: "Camera access is blocked by your browser's security settings.",
            };
            setCameraError(
                messages[name] ||
                    `Couldn't access the camera${err instanceof Error && err.message ? `: ${err.message}` : "."}`,
            );
        }
    };

    const stopCamera = () => {
        cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        setIsCameraActive(false);
    };

    const capturePhoto = async () => {
        const video = videoRef.current;
        if (!video) return;
        const maxFiles = 5;
        if (uploads.length >= maxFiles) {
            setImageError(`Max ${maxFiles} images allowed.`);
            return;
        }

        try {
            // Note: this used to build the "file" directly from the base64
            // data-URL string, which isn't decoded image data — it produced a
            // corrupt image every time. drawToCompressedFile properly encodes
            // a real JPEG from the video frame (and downscales it, which is
            // also what keeps the submit payload from tripping the server's
            // size limit).
            const { file, dataUrl } = await drawToCompressedFile(
                video,
                video.videoWidth || 1280,
                video.videoHeight || 720,
                `live-photo-${Date.now()}.jpg`,
            );

            setUploads((prev) => [
                ...prev,
                {
                    file,
                    url: dataUrl,
                    dataUrl,
                    source: "camera",
                },
            ]);
            setImageError(null);
        } catch {
            setImageError("Couldn't capture that photo. Please try again.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 font-inter">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Official Grievance Form
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Please provide accurate details. False reporting may result
                    in civic penalties.
                </p>
            </div>

            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm overflow-hidden">
                {/* Progress Bar */}
                <div className="bg-slate-50/50 dark:bg-slate-800/50 px-8 py-4 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                                step >= 1
                                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                                    : "bg-slate-200 text-slate-500 dark:bg-slate-700"
                            }`}
                        >
                            1
                        </div>
                        <span
                            className={`text-sm font-semibold uppercase tracking-wider ${
                                step >= 1
                                    ? "text-slate-900 dark:text-white"
                                    : "text-slate-500"
                            }`}
                        >
                            Classification
                        </span>
                    </div>
                    <div className="h-px flex-1 mx-6 bg-slate-200 dark:bg-slate-700">
                        <div
                            className={`h-full bg-blue-600 transition-all ${
                                step >= 2 ? "w-full" : "w-0"
                            }`}
                        ></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                                step >= 2
                                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                                    : "bg-slate-200 text-slate-500 dark:bg-slate-700"
                            }`}
                        >
                            2
                        </div>
                        <span
                            className={`text-sm font-semibold uppercase tracking-wider ${
                                step >= 2
                                    ? "text-slate-900 dark:text-white"
                                    : "text-slate-500"
                            }`}
                        >
                            Evidence
                        </span>
                    </div>
                    <div className="h-px flex-1 mx-6 bg-slate-200 dark:bg-slate-700">
                        <div
                            className={`h-full bg-blue-600 transition-all ${
                                step >= 3 ? "w-full" : "w-0"
                            }`}
                        ></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                                step >= 3
                                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                                    : "bg-slate-200 text-slate-500 dark:bg-slate-700"
                            }`}
                        >
                            3
                        </div>
                        <span
                            className={`text-sm font-semibold uppercase tracking-wider ${
                                step >= 3
                                    ? "text-slate-900 dark:text-white"
                                    : "text-slate-500"
                            }`}
                        >
                            Review
                        </span>
                    </div>
                </div>

                <div className="p-8">
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-3">
                                            Primary Category
                                        </label>
                                        <select
                                            value={primaryCategory}
                                            onChange={(e) =>
                                                setPrimaryCategory(e.target.value)
                                            }
                                            className="w-full px-4 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                        >
                                            <option>
                                                Infrastructure & Roads
                                            </option>
                                            <option>Sanitation & Waste</option>
                                            <option>
                                                Public Safety & Police
                                            </option>
                                            <option>Water & Utilities</option>
                                            <option>Civic Services</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">
                                            Sub-Category
                                        </label>
                                        <select
                                            value={subCategory}
                                            onChange={(e) =>
                                                setSubCategory(e.target.value)
                                            }
                                            className="w-full px-4 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                        >
                                            <option>
                                                Pothole / Road Damage
                                            </option>
                                            <option>Broken Streetlight</option>
                                            <option>
                                                Traffic Signal Malfunction
                                            </option>
                                            <option>Sidewalk Blockage</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">
                                            Date of Observation
                                        </label>
                                        <input
                                            type="date"
                                            min={today}
                                            value={observationDate}
                                            onChange={(e) =>
                                                setObservationDate(e.target.value)
                                            }
                                            className="w-full px-4 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">
                                            Detailed Description
                                        </label>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <select
                                                value={speechLanguage}
                                                onChange={(e) => setSpeechLanguage(e.target.value)}
                                                className="h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-white"
                                            >
                                                {speechLanguages.map((language) => (
                                                    <option key={language.value} value={language.value}>
                                                        {language.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={speech.toggleListening}
                                                disabled={speech.isTranscribing}
                                                className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-medium"
                                            >
                                                <Mic className="w-4 h-4 mr-2" />
                                                {speech.isTranscribing
                                                    ? "Transcribing\u2026"
                                                    : speech.isListening
                                                      ? "Stop Voice"
                                                      : "Speak Complaint"}
                                            </Button>
                                        </div>
                                        <textarea
                                            rows={10}
                                            placeholder="Provide specific details. E.g., 'The pothole is roughly 2 feet wide and located in the right lane...'"
                                            value={description}
                                            onChange={(e) =>
                                                setDescription(e.target.value)
                                            }
                                            className="w-full px-4 py-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm resize-none"
                                        ></textarea>
                                        <p className="text-[10px] text-slate-500 mt-1">
                                            Minimum 50 characters required for
                                            automated analysis.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">
                                        Location Coordinates
                                    </label>
                                    <div className="relative mb-2 flex gap-2 items-center">
                                        <div className="relative flex-1">
                                            <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Enter exact street address or coordinates..."
                                                value={location}
                                                onChange={(e) =>
                                                    setLocation(e.target.value)
                                                }
                                                className="w-full pl-10 pr-4 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleDetectLocation}
                                            className="shrink-0 w-[100px] h-[40px] px-4 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                                        >
                                            {isLocating
                                                ? "Detecting..."
                                                : isWatchingLocation
                                                  ? "Live"
                                                  : "Detect"}
                                        </Button>
                                        {isWatchingLocation && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={stopLiveLocation}
                                                className="shrink-0 h-[40px] px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                                            >
                                                Stop
                                            </Button>
                                        )}
                                    </div>
                                    {geoAccuracy !== null && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            Live accuracy: within {geoAccuracy}m
                                        </p>
                                    )}
                                    {locationError && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {locationError}
                                        </p>
                                    )}

                                    <div className="w-full h-[240px] bg-slate-100 dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800 flex items-center justify-center relative overflow-hidden shadow-inner mt-4">
                                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                                        <div className="text-center z-10 flex flex-col items-center">
                                            <MapPin className="w-6 h-6 text-blue-500 mb-2" />
                                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                {location ? location : "Geospatial Locator Active"}
                                            </span>
                                            {location && (
                                                <a
                                                    href={`https://www.google.com/maps?q=${encodeURIComponent(location)}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                                                >
                                                    Open in Maps
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col h-full">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">
                                        Photographic Evidence
                                    </label>

                                    <div className="mb-3 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                                        <div className="aspect-video overflow-hidden rounded-md bg-slate-900">
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className={`h-full w-full object-cover ${isCameraActive ? "block" : "hidden"}`}
                                            />
                                            {!isCameraActive && (
                                                <div className="flex h-full items-center justify-center text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                    Live camera preview
                                                </div>
                                            )}

                                        </div>
                                        <div className="mt-3 grid grid-cols-2 gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={isCameraActive ? capturePhoto : startCamera}
                                                className="rounded-md"
                                            >
                                                <Camera className="mr-2 h-4 w-4" />
                                                {isCameraActive ? "Capture" : "Start Camera"}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={stopCamera}
                                                disabled={!isCameraActive}
                                                className="rounded-md"
                                            >
                                                Stop Camera
                                            </Button>
                                        </div>
                                        {cameraError && (
                                            <p className="mt-2 text-xs text-red-500">
                                                {cameraError}
                                            </p>
                                        )}
                                    </div>

                                    {/* Clickable upload area */}
                                    <label className="flex-1 w-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-md p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors cursor-pointer bg-white dark:bg-slate-900">
                                        <UploadCloud className="w-8 h-8 text-blue-600 mb-3" />
                                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                            Upload High-Res Photos
                                        </span>
                                        <span className="text-xs text-slate-500 mt-2 max-w-xs">
                                            Geo-tagged photos will be
                                            automatically verified by the
                                            Intelligence Center. Max 5 files.
                                        </span>

                                        {/* Hidden input: entire area triggers this */}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>

                                    {imageError && (
                                        <p className="text-xs text-red-500 mt-2">
                                            {imageError}
                                        </p>
                                    )}

                                    {uploads.length > 0 && (
                                        <div className="mt-4 grid grid-cols-2 gap-3">
                                            {uploads.map((item, idx) => (
                                                <div
                                                    key={`${item.file.name}-${item.file.lastModified}`}
                                                    className="relative"
                                                >
                                                    <img
                                                        src={item.url}
                                                        alt={`preview-${idx}`}
                                                        className="w-full h-24 object-cover rounded-md border border-slate-200 dark:border-slate-800"
                                                    />
                                                    <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                                                        {item.source}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeImage(idx)
                                                        }
                                                        className="absolute top-1 right-1 size-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80"
                                                        aria-label="Remove image"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-md flex gap-4 items-start shadow-sm">
                                <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                                        Automated Triage Complete
                                    </h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                        This report is ready for automated
                                        triage as{" "}
                                        <strong>{primaryCategory}</strong> /{" "}
                                        <strong>{subCategory}</strong>. After
                                        submission, the live model output will
                                        set priority and route it to{" "}
                                        <strong>{routedDepartment(primaryCategory)}</strong>.
                                    </p>
                                </div>
                            </div>

                            <div className="border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-950 p-6 space-y-4 shadow-sm">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                                    Final Review
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                                    <div>
                                        <span className="block text-slate-500 text-xs mb-1">
                                            Category
                                        </span>
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {primaryCategory}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-slate-500 text-xs mb-1">
                                            Sub-Category
                                        </span>
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {subCategory}
                                        </span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="block text-slate-500 text-xs mb-1">
                                            Location
                                        </span>
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {location || "Location not provided"}
                                        </span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="block text-slate-500 text-xs mb-1">
                                            Images
                                        </span>
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {uploads.length
                                                ? `${uploads.length} attached`
                                                : "None"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-950 p-6 space-y-3 shadow-sm">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                                    Image Evidence Verification
                                </h3>
                                {verifyModelStatus === "warming" && !isVerifyingImage && !imageVerification && (
                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 pt-1">
                                        <ShieldQuestion className="w-4 h-4 animate-pulse" />
                                        Verification model is waking up — this can take up to a
                                        minute or two the first time. Attaching a photo will still
                                        work while this finishes.
                                    </div>
                                )}
                                {isVerifyingImage && (
                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 pt-1">
                                        <ShieldQuestion className="w-4 h-4 animate-pulse" />
                                        Checking whether your photo matches the description
                                        — this can take a little while on first use.
                                    </div>
                                )}
                                {!isVerifyingImage && imageVerification && (
                                    <div
                                        className={`flex items-start gap-3 pt-1 ${
                                            imageVerification.image_supports_complaint
                                                ? "text-emerald-700 dark:text-emerald-400"
                                                : "text-amber-700 dark:text-amber-400"
                                        }`}
                                    >
                                        {imageVerification.image_supports_complaint ? (
                                            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                                        ) : (
                                            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                                        )}
                                        <div className="text-sm">
                                            <p className="font-semibold capitalize">
                                                {imageVerification.verification_status.replace("_", " ")} (
                                                {Math.round(imageVerification.image_match_score * 100)}% similarity)
                                            </p>
                                            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                                                {imageVerification.image_supports_complaint
                                                    ? "The photo appears consistent with your description."
                                                    : "The photo doesn't clearly match your description — you can still submit, but consider adding a clearer photo."}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {!isVerifyingImage && !imageVerification && imageVerificationError && (
                                    <div className="pt-1">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Couldn't verify the photo automatically ({imageVerificationError}). You can still submit — an officer will review the evidence manually.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                // A timeout here often means the Space had gone back
                                                // to sleep — nudge it awake again before retrying so
                                                // this retry has a real shot instead of just timing
                                                // out the same way.
                                                void waitForVerifyModelReady(setVerifyModelStatus);
                                                setVerificationRetryCount((c) => c + 1);
                                            }}
                                            className="mt-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                        >
                                            Retry verification
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>

                <div className="p-6 bg-slate-50/80 dark:bg-slate-950/80 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={() => setStep(Math.max(1, step - 1))}
                        className={`rounded-md text-sm font-semibold shadow-sm ${
                            step === 1 ? "invisible" : ""
                        }`}
                    >
                        Back
                    </Button>
                    {submitError && (
                        <p className="ml-4 text-sm text-red-500">{submitError}</p>
                    )}
                    <Button
                        type="button"
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6 text-sm font-semibold shadow-md shadow-blue-500/20"
                        onClick={async () => {
                            if (step < 3) {
                                if (
                                    step === 1 &&
                                    (!description.trim() || description.trim().length < 20)
                                ) {
                                    setSubmitError("Please add a more detailed complaint description before continuing.");
                                    return;
                                }
                                if (step === 2 && uploads.length === 0) {
                                    setSubmitError("Please attach at least one photo as evidence before continuing.");
                                    return;
                                }
                                if (step === 2 && !location.trim()) {
                                    setSubmitError("Please detect or enter a location before continuing.");
                                    return;
                                }
                                setSubmitError(null);
                                setStep(step + 1);
                                return;
                            }

                            setIsSubmitting(true);
                            setSubmitError(null);
                            setPredictionResult(null);

                            try {
                                const complaint = await complaintService.create({
                                    title: `${subCategory} - ${location || "Location pending"}`,
                                    description: [
                                        `Category: ${primaryCategory}`,
                                        `Sub-category: ${subCategory}`,
                                        `Date: ${observationDate}`,
                                        `Location: ${location || "Not provided"}`,
                                        `Description: ${description.trim() || "No description provided"}`,
                                    ].join("\n"),
                                    priority: "medium",
                                    category: primaryCategory,
                                    subCategory,
                                    location,
                                    imageVerification,
                                    attachments: uploads.map((item) => ({
                                        fileUrl: item.dataUrl,
                                        fileName: item.file.name,
                                    })),
                                });

                                setPredictionResult({
                                    ...normalizePrediction(complaint),
                                    // Must come after the spread: normalizePrediction() can
                                    // return the raw `prediction` object from the server,
                                    // which (matching the real backend's shape) has its own
                                    // `complaint` field holding the full complaint text, not
                                    // an id. Setting this last guarantees the tracking id
                                    // shown in the UI is always the actual complaint id.
                                    complaint: complaint.id,
                                    whatsappNotification: complaint.whatsappNotification,
                                });

                                waitForPrediction(complaint.id)
                                    .then((latest) => {
                                        if (!latest) return;
                                        setPredictionResult({
                                            ...normalizePrediction(latest),
                                            complaint: latest.id,
                                            whatsappNotification: complaint.whatsappNotification,
                                        });
                                    })
                                    .catch(() => undefined);
                                alert(`Official Grievance Submitted Successfully.\n\nTracking ID: ${complaint.id}`);
                            } catch (error) {
                                setSubmitError(
                                    error instanceof Error && error.message
                                        ? error.message
                                        : "Failed to submit complaint. Please check your login session and try again.",
                                );
                            } finally {
                                setIsSubmitting(false);
                            }
                        }}
                    >
                        {step === 3 ? (
                            <>
                                {isSubmitting ? "Submitting..." : "Submit Complaint"}{" "}
                                <Send className="w-4 h-4 ml-2" />
                            </>
                        ) : (
                            "Proceed to Next Section"
                        )}
                    </Button>
                </div>

                {predictionResult && (
                    <div className="px-6 pb-6">
                        <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/80 dark:bg-blue-950/30 p-4 shadow-sm">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                                Model Output
                            </h4>
                            {predictionResult.unavailable && (
                                <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                                    Model service unavailable: {predictionResult.error}
                                </p>
                            )}
                            {!predictionResult.unavailable && predictionResult.status === "QUEUED" && (
                                <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                                    {predictionResult.error}
                                </p>
                            )}
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="md:col-span-2">
                                    <span className="block text-xs text-slate-500">Tracking ID</span>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {predictionResult.complaint}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs text-slate-500">Validity</span>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {predictionResult.validity ?? "Model pending"}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs text-slate-500">Priority</span>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {severityLabel(predictionResult.priority)}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs text-slate-500">Classification</span>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {predictionResult.classification || predictionResult.suggestedDepartment || "Model pending"}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs text-slate-500">Validity Confidence</span>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {predictionResult.validity_confidence != null
                                            ? `${predictionResult.validity_confidence}%`
                                            : "Model pending"}
                                    </span>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="block text-xs text-slate-500">WhatsApp Confirmation</span>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {predictionResult.whatsappNotification?.sent
                                            ? "Sent"
                                            : predictionResult.whatsappNotification?.reason || "Not sent"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
