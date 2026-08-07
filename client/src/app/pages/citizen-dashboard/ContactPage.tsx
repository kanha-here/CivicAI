import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useCurrentUser } from "../../../hooks/useAuth";
import { dashboardService } from "../../../services/dashboard.service";

export function CitizenContact() {
    const { data: user } = useCurrentUser();
    const [requestType, setRequestType] = useState("General Inquiry");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = useCallback(async () => {
        setIsSubmitting(true);
        try {
            await dashboardService.support();
            toast.success("Support message submitted");
            setSubject("");
            setMessage("");
        } catch (error) {
            console.error("Failed to submit support request", error);
            toast.error("Failed to submit support request");
        } finally {
            setIsSubmitting(false);
        }
    }, [requestType, subject, message, user?.email]);

    const names = (user?.name || "").split(" ");
    const firstName = names[0] || "";
    const lastName = names.slice(1).join(" ");

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Contact Support
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Send a tracked support request linked to your citizen account.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                            Your Channels
                        </h3>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                                        Phone
                                    </h4>
                                    <p className="text-slate-500 text-sm mt-0.5">
                                        {user?.phone || "Not added"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                                        Email
                                    </h4>
                                    <p className="text-slate-500 text-sm mt-0.5">
                                        {user?.email || "Not available"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                                        Address
                                    </h4>
                                    <p className="text-slate-500 text-sm mt-0.5">
                                        {user?.address || "Not added"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                            Send a Message
                        </h2>
                        <form
                            className="space-y-6"
                            onSubmit={handleSubmit}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        readOnly
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        readOnly
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={user?.email || ""}
                                    readOnly
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Request Type
                                </label>
                                <select
                                    value={requestType}
                                    onChange={(event) => setRequestType(event.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                                >
                                    <option>General Inquiry</option>
                                    <option>Personal Records Update</option>
                                    <option>Feedback on Service</option>
                                    <option>Technical Support</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Subject
                                </label>
                                <input
                                    value={subject}
                                    onChange={(event) => setSubject(event.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                                    placeholder="Brief subject"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Message
                                </label>
                                <textarea
                                    rows={5}
                                    value={message}
                                    onChange={(event) => setMessage(event.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                                    placeholder="How can we help you?"
                                />
                            </div>

                            <Button
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 text-md font-medium"
                            >
                                {isSubmitting ? "Sending..." : "Send Message"}
                                <Send className="w-4 h-4 ml-2" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
