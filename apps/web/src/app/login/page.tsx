'use client';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();

    const handleSuccess = async (credentialResponse: any) => {
        try {
            const { credential } = credentialResponse;
            // Send to backend
            const res = await api.post('/auth/google', { token: credential });
            const { token, user } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            router.push('/dashboard');
        } catch (error) {
            console.error('Login Failed', error);
            alert('Login failed');
        }
    };

    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">Sign in to ReachInbox</h2>
                        <p className="mt-2 text-sm text-gray-600">Scheduler Dashboard</p>
                    </div>
                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleSuccess}
                            onError={() => console.log('Login Failed')}
                        />
                    </div>

                    {/* Mock Login for Dev - Only visible in development */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => handleSuccess({ credential: 'mock-token' })}
                                className="text-xs text-blue-500 underline"
                            >
                                Dev Hack: Mock Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </GoogleOAuthProvider>
    );
}
