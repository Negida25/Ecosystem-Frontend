import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import api from "../api/axios";
import { setAuth } from "../store/slices/authSlice";

export default function Register() {
  const [form, setForm] = useState({ name:"", email:"", password:"", confirm:"" });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) { toast.error("Please fill all fields"); return; }
    if (form.password !== form.confirm) { toast.error("Passwords do not match"); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res = await api.post("/auth/register", { name:form.name, email:form.email, password:form.password });
      dispatch(setAuth({ token: res.data.token, user: { name: res.data.name, email: res.data.email, role: res.data.role } }));
      toast.success(`Welcome to EcoSync, ${res.data.name}!`);
      navigate("/");
    } catch (e) {
      toast.error(e.response?.data?.message || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:block w-1/2 relative">
        <img src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=90" alt="Nature" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#052e16cc]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
          <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4">E</div>
          <h1 className="text-3xl font-bold text-white mb-3">Join EcoSync</h1>
          <p className="text-green-200 text-sm leading-relaxed max-w-xs">Be part of the global movement to monitor, understand and protect Earth's ecosystems.</p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Create account</h2>
          <p className="text-slate-500 text-sm mb-8">Join EcoSync to explore and protect our planet</p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Full name</label>
              <input type="text" value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="Aditya Kumar"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} placeholder="aditya@email.com"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Password</label>
              <input type="password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} placeholder="Min. 6 characters"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Confirm password</label>
              <input type="password" value={form.confirm} onChange={e => setForm({...form,confirm:e.target.value})}
                onKeyDown={e => e.key==="Enter" && handleSubmit()} placeholder="••••••••"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400" />
            </div>
            <button onClick={handleSubmit} disabled={loading}
              className="w-full py-3 bg-green-700 hover:bg-green-600 disabled:bg-slate-200 text-white rounded-xl font-medium transition-colors">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-green-700 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}