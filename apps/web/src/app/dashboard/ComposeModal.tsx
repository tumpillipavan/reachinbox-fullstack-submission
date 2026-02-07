"use client";

import { useState } from "react";
import Papa from "papaparse";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";

interface ComposeModalProps {
    onClose: () => void;
    onSuccess: (campaign: any) => void;
}

export default function ComposeModal({ onClose, onSuccess }: ComposeModalProps) {
    const [step, setStep] = useState(1);
    const [recipients, setRecipients] = useState<string[]>([]);
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            complete: (results) => {
                const extractedEmails = results.data
                    .flat()
                    .filter((item: any) => typeof item === 'string' && /\S+@\S+\.\S+/.test(item)) as string[];
                setRecipients(extractedEmails);
                toast.success(`${extractedEmails.length} emails imported!`);
            },
            header: false
        });
    };

    const handleSchedule = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipients,
                    subject,
                    body,
                    scheduledAt: scheduledTime,
                }),
            });

            if (response.ok) {
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 }
                });

                toast.success("Campaign Scheduled Successfully! 🚀");

                onSuccess({
                    id: Date.now(),
                    subject: subject,
                    count: recipients.length,
                    scheduledAt: scheduledTime,
                    status: "Scheduled"
                });

                onClose();
            } else {
                toast.error("Failed to schedule.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error connecting to server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">New Campaign</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
                </div>

                <div className="p-6 space-y-4">
                    {step === 1 && (
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">1. Upload Recipient List (CSV)</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition cursor-pointer">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                />
                            </div>

                            {recipients.length > 0 && (
                                <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md flex justify-between items-center animate-in slide-in-from-top-2">
                                    <span>✅ {recipients.length} emails ready</span>
                                    <button onClick={() => setStep(2)} className="text-blue-600 font-bold hover:underline">Next →</button>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Subject</label>
                                <input
                                    className="w-full border rounded-md p-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g. Special Offer!"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email Body</label>
                                <textarea
                                    className="w-full border rounded-md p-2 mt-1 h-24 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="Hi there..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Schedule Time</label>
                                <input
                                    type="datetime-local"
                                    className="w-full border rounded-md p-2 mt-1 focus:ring-2 focus:ring-blue-500 transition-shadow"
                                    value={scheduledTime}
                                    onChange={(e) => setScheduledTime(e.target.value)}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button onClick={() => setStep(1)} className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">Back</button>
                                <button
                                    onClick={handleSchedule}
                                    disabled={loading}
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-all flex justify-center items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Scheduling...
                                        </>
                                    ) : (
                                        "Confirm Schedule"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
