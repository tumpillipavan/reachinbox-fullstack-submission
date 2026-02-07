"use client";

import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";

function LoginContent() {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log(tokenResponse);
      window.location.href = "/dashboard";
    },
    onError: () => {
      console.log("Login Failed");
    }
  });

  return (
    <div className="z-10 w-full max-w-md p-8">

      <div className="mb-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-xl shadow-blue-500/20">
          <span className="text-3xl font-bold text-white">R</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
          ReachInbox
        </h1>
        <p className="mt-3 text-lg text-blue-100/80">
          Your automated email outreach engine.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl">
        <div className="p-8">
          <h2 className="mb-6 text-center text-xl font-semibold text-white">
            Welcome back
          </h2>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => login()}
              className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-3.5 font-medium text-slate-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 active:shadow-none"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        </div>

        <div className="border-t border-white/10 bg-white/5 px-8 py-4 text-center">
          <p className="text-xs text-blue-200/60">
            By clicking continue, you agree to our <a href="#" className="hover:text-white underline decoration-blue-400/50">Terms</a> and <a href="#" className="hover:text-white underline decoration-blue-400/50">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <GoogleOAuthProvider clientId="188957602969-sje1mctu0lbnu1kk7sr7c9rp8ja53h3m.apps.googleusercontent.com">
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-900 to-slate-900 text-white relative overflow-hidden">

        <div className="absolute top-[-10%] left-[-10%] h-96 w-96 rounded-full bg-blue-500/30 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] h-96 w-96 rounded-full bg-purple-500/20 blur-3xl animate-pulse delay-1000"></div>

        <LoginContent />

        <div className="absolute bottom-6 text-sm text-blue-200/40">
          &copy; 2026 ReachInbox. All rights reserved.
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
