"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ComposeModal from "./ComposeModal";

export default function Dashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("scheduled");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this campaign?")) {
            setCampaigns(prev => prev.filter(c => c.id !== id));
        }
    };

    useEffect(() => {
        const saved = localStorage.getItem("reachinbox-campaigns");
        if (saved) {
            try {
                setCampaigns(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse campaigns", e);
            }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("reachinbox-campaigns", JSON.stringify(campaigns));
        }
    }, [campaigns, isLoaded]);

    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        if (!isLoaded) return;

        const interval = setInterval(() => {
            const currentTime = Date.now();
            setNow(currentTime);

            setCampaigns((prevCampaigns) => {
                let hasChanges = false;
                const newCampaigns = prevCampaigns.map((c) => {
                    if (c.status === "Scheduled" && new Date(c.scheduledAt).getTime() < currentTime) {
                        hasChanges = true;
                        return { ...c, status: "Sent" };
                    }
                    return c;
                });

                return hasChanges ? newCampaigns : prevCampaigns;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isLoaded]);

    const filteredCampaigns = campaigns.filter(c =>
        activeTab === "scheduled" ? c.status === "Scheduled" : c.status === "Sent"
    );

    const getCountdown = (scheduledDate: string) => {
        const diff = new Date(scheduledDate).getTime() - now;
        if (diff <= 0) return "Sending...";
        const seconds = Math.floor(diff / 1000);
        if (seconds < 60) return `Starts in ${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        return `Starts in ${minutes}m ${seconds % 60}s`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-white font-sans text-gray-900 selection:bg-blue-100">
            <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200/50 bg-white/80 px-8 py-4 backdrop-blur-xl transition-all">
                <div
                    onClick={() => window.location.reload()}
                    className="group flex items-center gap-3 cursor-pointer select-none"
                    title="Refresh Dashboard"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 font-bold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:shadow-blue-600/50">
                        R
                    </div>

                    <span className="text-xl font-bold tracking-tight text-slate-800 transition-colors duration-300 group-hover:text-blue-600">
                        ReachInbox
                    </span>
                </div>
                <div className="flex items-center gap-4">

                    <div className="group flex items-center gap-3 rounded-full bg-white/80 border border-slate-200 py-1.5 pl-1.5 pr-4 shadow-sm transition-all hover:shadow-md hover:border-blue-200 cursor-default">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-xs font-bold text-white shadow-inner">
                            P
                        </div>

                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700 leading-none group-hover:text-blue-700 transition-colors">Pavan</span>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-[10px] font-medium text-slate-400 leading-none">Online</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            localStorage.removeItem("reachinbox-campaigns");
                            router.push("/");
                        }}
                        className="flex items-center justify-center h-9 w-9 rounded-full bg-slate-50 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 hover:scale-105 active:scale-95"
                        title="Logout"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                    </button>

                </div>
            </nav>

            <main className="mx-auto mt-10 max-w-6xl p-6">
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
                        <p className="mt-1 text-gray-500">Manage your automated outreach schedules.</p>
                    </div>
                    <button
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95"
                        onClick={() => setIsModalOpen(true)}
                    >
                        + Compose Campaign
                    </button>
                </div>

                <div className="mb-6 flex gap-8 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("scheduled")}
                        className={`px-1 pb-3 text-sm font-medium transition-all ${activeTab === "scheduled" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Scheduled Emails
                    </button>
                    <button
                        onClick={() => setActiveTab("sent")}
                        className={`px-1 pb-3 text-sm font-medium transition-all ${activeTab === "sent" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Sent History
                    </button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-blue-900/5 transition-all">
                    {filteredCampaigns.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 mb-4 animate-bounce">
                                <span className="text-3xl">📮</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">No campaigns yet</h3>
                            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
                                You haven&apos;t scheduled any emails. Create your first campaign to see the magic happen.
                            </p>
                            {activeTab === "scheduled" && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="mt-6 rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30 transition-all transform hover:-translate-y-0.5"
                                >
                                    Start Campaign
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign Subject</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {activeTab === "scheduled" ? "Time Remaining" : "Sent At"}
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                                </tr>

                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCampaigns.map((c) => (
                                    <tr key={c.id} className="hover:bg-blue-50 transition-colors duration-200 cursor-pointer group">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 group-hover:text-blue-700">{c.subject}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{c.count} Recipients</td>
                                        <td className={`px-6 py-4 whitespace-nowrap font-mono text-sm ${activeTab === 'scheduled' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                                            {activeTab === "scheduled"
                                                ? getCountdown(c.scheduledAt)
                                                : new Date(c.scheduledAt).toLocaleTimeString()
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${c.status === "Sent"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-yellow-100 text-yellow-800 animate-pulse"
                                                }`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(c.id);
                                                }}
                                                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                                                title="Delete Campaign"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M3 6h18"></path>
                                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {isModalOpen && (
                <ComposeModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={(newCampaign) => setCampaigns([newCampaign, ...campaigns])}
                />
            )}
        </div>
    );
}
