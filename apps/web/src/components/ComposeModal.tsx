'use client';
import { useState } from 'react';
import Papa from 'papaparse';
import api from '@/lib/api';

interface ComposeModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function ComposeModal({ onClose, onSuccess }: ComposeModalProps) {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [recipients, setRecipients] = useState<string[]>([]);
    const [startTime, setStartTime] = useState('');
    const [hourlyLimit, setHourlyLimit] = useState('50');
    const [loading, setLoading] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            complete: (results) => {
                // Find email column or assume first column
                const emails: string[] = [];
                results.data.forEach((row: any) => {
                    // Simple check for email-like string in row values
                    const values = Object.values(row);
                    const email = values.find((v: any) => typeof v === 'string' && v.includes('@'));
                    if (email) emails.push(email as string);
                });
                setRecipients(emails);
            },
            header: true // Try with header, if fails falls back
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/schedule', {
                subject,
                body,
                recipients,
                startTime,
                hourlyLimit
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to schedule');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

                <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

                <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                    <form onSubmit={handleSubmit} className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                            Compose New Email
                        </h3>

                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Subject</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Body</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Recipients (CSV)</label>
                                <input
                                    type="file"
                                    accept=".csv,.txt"
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-100"
                                    onChange={handleFileUpload}
                                />
                                <p className="mt-1 text-xs text-gray-500">Detected: {recipients.length} emails</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Schedule Time</label>
                                <input
                                    type="datetime-local"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Hourly Limit</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={hourlyLimit}
                                    onChange={(e) => setHourlyLimit(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                            <button
                                type="submit"
                                disabled={loading || recipients.length === 0}
                                className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm disabled:opacity-50"
                            >
                                {loading ? 'Scheduling...' : 'Schedule'}
                            </button>
                            <button
                                type="button"
                                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
