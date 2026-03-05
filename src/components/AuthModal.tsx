"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, X } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  defaultTab?: "login" | "register";
  onClose: () => void;
}

// Panel width as a percentage of the modal
const PANEL_W = 42;

const easing = [0.77, 0, 0.175, 1] as const;
const DURATION = 0.55;

export default function AuthModal({
  defaultTab = "login",
  onClose,
}: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(defaultTab === "login");
  const backdropRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSuccess = () => {
    onClose();
    router.push("/dashboard");
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={backdropRef}
        key="backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => {
          if (e.target === backdropRef.current) onClose();
        }}
      >
        {/* Modal card */}
        <motion.div
          key="modal"
          className="relative w-full max-w-[820px] h-[500px] bg-white rounded-3xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.94, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 28 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
        >
          {/* Close button — always on top-right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* ── FORM LAYER ──
               Both forms share the same 58%-wide area but are on opposite sides.
               Login  → left:  0,        width: 58%  (left side)
               Register → right: 0,      width: 58%  (right side)
               Overlay always covers 42%, sliding left↔right on top.
          */}

          {/* Login form — left side */}
          <motion.div
            className="absolute top-0 left-0 h-full flex flex-col items-center justify-center"
            style={{ width: `${100 - PANEL_W}%` }}
            animate={{ opacity: isLogin ? 1 : 0, x: isLogin ? 0 : -16 }}
            transition={{ duration: DURATION, ease: easing }}
          >
            <div className="w-full px-12">
              <LoginForm
                onSuccess={handleSuccess}
                onSwitchToRegister={() => setIsLogin(false)}
              />
            </div>
          </motion.div>

          {/* Register form — right side, same width as login */}
          <motion.div
            className="absolute top-0 right-0 h-full flex flex-col items-center justify-center"
            style={{ width: `${100 - PANEL_W}%` }}
            animate={{ opacity: isLogin ? 0 : 1, x: isLogin ? 16 : 0 }}
            transition={{ duration: DURATION, ease: easing }}
          >
            <div className="w-full px-12">
              <RegisterForm
                onSuccess={handleSuccess}
                onSwitchToLogin={() => setIsLogin(true)}
              />
            </div>
          </motion.div>

          {/* ── SLIDING OVERLAY PANEL (desktop) ──
               Uses `left` (% of modal width) so it truly sits flush at each edge.
               login  → left: 58%  (flush right)
               register → left: 0%  (flush left)
          */}
          <motion.div
            className="absolute top-0 hidden md:block h-full z-20"
            style={{ width: `${PANEL_W}%` }}
            animate={{ left: isLogin ? `${100 - PANEL_W}%` : "0%" }}
            transition={{ duration: DURATION, ease: easing }}
          >
            {/* Green background with animated border-radius */}
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(160deg, #7a8f60 0%, #9CAB84 60%, #b0c090 100%)",
              }}
              animate={{
                borderRadius: isLogin
                  ? "32px 0 0 32px"   /* panel on right → curve left corners */
                  : "0 32px 32px 0",  /* panel on left  → curve right corners */
              }}
              transition={{ duration: DURATION, ease: easing }}
            />

            {/* Decorative blobs */}
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-white/10 rounded-full" />
            <div className="absolute top-1/2 right-4 w-20 h-20 bg-white/5 rounded-full -translate-y-1/2" />

            {/* Panel content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 text-center text-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? "panel-login" : "panel-register"}
                  className="space-y-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                >
                  <div className="text-6xl">
                    {isLogin ? "🌱" : "👋"}
                  </div>
                  <div>
                    <h3 className="text-[26px] font-extrabold leading-tight">
                      {isLogin ? (
                        <>
                          Hello,
                          <br />
                          Welcome!
                        </>
                      ) : (
                        <>
                          Welcome
                          <br />
                          Back!
                        </>
                      )}
                    </h3>
                  </div>
                  <p className="text-sm text-white/75 leading-relaxed">
                    {isLogin
                      ? "Don't have an account?"
                      : "Already have an account?"}
                  </p>
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="px-10 py-2.5 border-2 border-white rounded-2xl text-sm font-bold tracking-wide hover:bg-white hover:text-[#89986D] transition-all duration-200"
                  >
                    {isLogin ? "Register" : "Login"}
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── MOBILE tab switcher ── */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex md:hidden gap-2 z-30">
            <button
              onClick={() => setIsLogin(true)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                isLogin
                  ? "bg-[#89986D] text-white shadow"
                  : "text-gray-400 border border-gray-200"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                !isLogin
                  ? "bg-[#89986D] text-white shadow"
                  : "text-gray-400 border border-gray-200"
              }`}
            >
              Register
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ───────────────── LOGIN FORM ───────────────── */
function LoginForm({
  onSuccess,
  onSwitchToRegister,
}: {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onSuccess();
    } catch (err: unknown) {
      console.error("[Login Error]", err);
      const code = (err as { code?: string }).code ?? "";
      const msg = err instanceof Error ? err.message : "";
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else if (code === "auth/network-request-failed") {
        setError("Network error. Check your connection.");
      } else if (code === "auth/operation-not-allowed") {
        setError("Email/password login is not enabled. Enable it in Firebase Console.");
      } else {
        setError(msg || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-4 py-3 rounded-2xl bg-gray-100 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C5D89D] transition"
      />

      <div className="relative">
        <input
          type={showPass ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 pr-11 rounded-2xl bg-gray-100 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C5D89D] transition"
        />
        <button
          type="button"
          onClick={() => setShowPass(!showPass)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#89986D] transition-colors"
        >
          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <div className="text-right">
        <button type="button" className="text-xs text-gray-400 hover:text-[#89986D] transition-colors">
          Forgot password?
        </button>
      </div>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#89986D] hover:bg-[#7a8f60] active:scale-[0.98] disabled:opacity-60 text-white font-bold rounded-2xl transition-all duration-200 shadow-md"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <p className="text-center text-xs text-gray-400 md:hidden pt-1">
        No account?{" "}
        <button type="button" onClick={onSwitchToRegister} className="text-[#89986D] font-semibold">
          Register
        </button>
      </p>
    </form>
  );
}

/* ───────────────── REGISTER FORM ───────────────── */
function RegisterForm({
  onSuccess,
  onSwitchToLogin,
}: {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: username });
      onSuccess();
    } catch (err: unknown) {
      console.error("[Register Error]", err);
      const code = (err as { code?: string }).code ?? "";
      const msg = err instanceof Error ? err.message : "";
      if (code === "auth/email-already-in-use") {
        setError("Email is already registered.");
      } else if (code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else if (code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else if (code === "auth/network-request-failed") {
        setError("Network error. Check your connection.");
      } else if (code === "auth/operation-not-allowed") {
        setError("Email/password registration is not enabled. Enable it in Firebase Console.");
      } else {
        setError(msg || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Registration</h2>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        className="w-full px-4 py-3 rounded-2xl bg-gray-100 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C5D89D] transition"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-4 py-3 rounded-2xl bg-gray-100 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C5D89D] transition"
      />

      <div className="relative">
        <input
          type={showPass ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 pr-11 rounded-2xl bg-gray-100 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C5D89D] transition"
        />
        <button
          type="button"
          onClick={() => setShowPass(!showPass)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#89986D] transition-colors"
        >
          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#89986D] hover:bg-[#7a8f60] active:scale-[0.98] disabled:opacity-60 text-white font-bold rounded-2xl transition-all duration-200 shadow-md"
      >
        {loading ? "Registering..." : "Register"}
      </button>

      <p className="text-center text-xs text-gray-400 md:hidden pt-1">
        Already have an account?{" "}
        <button type="button" onClick={onSwitchToLogin} className="text-[#89986D] font-semibold">
          Login
        </button>
      </p>
    </form>
  );
}
