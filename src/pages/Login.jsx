import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import api from "../api/axios";
import { setAuth } from "../store/slices/authSlice";

export default function Login() {
  const [mode, setMode] = useState("password"); // "password" | "otp"
  const [form, setForm] = useState({ email: "", password: "" });
  const [otpForm, setOtpForm] = useState({ email: "", otp: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Password login
  const handleLogin = async () => {
    if (!form.email || !form.password) {
      toast.error("Please fill all fields"); return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      dispatch(setAuth({
        token: res.data.token,
        user: { name: res.data.name, email: res.data.email, role: res.data.role }
      }));
      toast.success(`Welcome back, ${res.data.name}!`);
      navigate("/");
    } catch (e) {
      toast.error(e.response?.data?.message || "Invalid credentials");
    }
    setLoading(false);
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (!otpForm.email) { toast.error("Enter your email"); return; }
    setLoading(true);
    try {
      const res = await api.post("/auth/send-otp", { email: otpForm.email });
      if (res.data.success) {
        setOtpSent(true);
        toast.success("OTP sent to your email!");
      } else {
        toast.error("Failed to send OTP");
      }
    } catch {
      toast.error("Failed to send OTP");
    }
    setLoading(false);
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpForm.otp) { toast.error("Enter the OTP"); return; }
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", {
        email: otpForm.email,
        otp: otpForm.otp
      });
      if (res.data.success) {
        dispatch(setAuth({
          token: res.data.token,
          user: { name: res.data.name, email: res.data.email, role: res.data.role }
        }));
        toast.success(`Welcome, ${res.data.name}!`);
        navigate("/");
      } else {
        toast.error(res.data.message || "Invalid OTP");
      }
    } catch {
      toast.error("OTP verification failed");
    }
    setLoading(false);
  };

  // Google login
 const handleGoogleSuccess = async (credentialResponse) => {
  try {
    const decoded = jwtDecode(credentialResponse.credential);

    const loginRes = await api.post("/auth/google-login", {
      email: decoded.email,
      name: decoded.name,
      googleId: decoded.sub,
      imageUrl: decoded.picture,
    });

    dispatch(setAuth({
      token: loginRes.data.token,
      user: {
        name: loginRes.data.name,
        email: loginRes.data.email,
        role: loginRes.data.role,
      },
    }));
    toast.success(`Welcome, ${decoded.name}!`);
    navigate("/");
  } catch (error) {
    console.error("Google login error:", error);
    toast.error("Google login failed. Please try again.");
  }
};

  return (
    <div className="min-h-screen flex">
      {/* Left image */}
      <div className="hidden md:block w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=90"
          alt="Forest"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#052e16cc]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white mb-4 shadow-lg">
            E
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">EcoSync</h1>
          <p className="text-green-200 text-sm leading-relaxed max-w-xs">
            Real-time ecosystem intelligence. Understand our planet. Protect our future.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-6">Sign in to your EcoSync account</p>

          {/* Google Login */}
          <div className="mb-5">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google login failed")}
              useOneTap
              shape="rectangular"
              size="large"
              width="100%"
              text="signin_with_google"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">or continue with</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2 mb-5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setMode("password")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === "password"
                  ? "bg-white text-green-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Password
            </button>
            <button
              onClick={() => { setMode("otp"); setOtpSent(false); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === "otp"
                  ? "bg-white text-green-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              OTP Login
            </button>
          </div>

          {/* Password form */}
          {mode === "password" && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="aditya@email.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                />
              </div>
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-3 bg-green-700 hover:bg-green-600 disabled:bg-slate-200 text-white rounded-xl font-semibold text-sm transition-colors"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          )}

          {/* OTP form */}
          {mode === "otp" && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={otpForm.email}
                    onChange={e => setOtpForm({ ...otpForm, email: e.target.value })}
                    placeholder="aditya@email.com"
                    disabled={otpSent}
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400 disabled:bg-slate-50"
                  />
                  <button
                    onClick={handleSendOtp}
                    disabled={loading || otpSent}
                    className="px-4 py-3 bg-green-700 hover:bg-green-600 disabled:bg-slate-200 text-white rounded-xl text-sm font-semibold transition-colors whitespace-nowrap"
                  >
                    {loading ? "..." : otpSent ? "Sent ✓" : "Send OTP"}
                  </button>
                </div>
              </div>

              {otpSent && (
                <>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      value={otpForm.otp}
                      onChange={e => setOtpForm({ ...otpForm, otp: e.target.value })}
                      onKeyDown={e => e.key === "Enter" && handleVerifyOtp()}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400 text-center text-2xl font-bold tracking-widest"
                    />
                    <p className="text-xs text-slate-400 mt-1 text-center">
                      Check your email for the 6-digit OTP
                    </p>
                  </div>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="w-full py-3 bg-green-700 hover:bg-green-600 disabled:bg-slate-200 text-white rounded-xl font-semibold text-sm transition-colors"
                  >
                    {loading ? "Verifying..." : "Verify & Login"}
                  </button>
                  <button
                    onClick={() => { setOtpSent(false); setOtpForm({ ...otpForm, otp: "" }); }}
                    className="text-sm text-slate-400 hover:text-green-700 text-center transition-colors"
                  >
                    Resend OTP
                  </button>
                </>
              )}
            </div>
          )}

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-green-700 font-semibold hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}