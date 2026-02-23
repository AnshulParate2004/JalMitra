import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const success = login(email, password);

    if (success) {
      navigate("/dashboard");
    } else {
      setError("INVALID_CREDENTIALS: Authentication failed. Please verify your credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }}
    >
      <div className="w-full max-w-lg scale-[0.85] origin-center -translate-y-12 transition-transform py-2">
        {/* Logo & Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-card border-2 border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Activity className="w-7 h-7 text-primary fill-primary" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-black text-foreground tracking-tighter leading-none">JAL</h2>
              <p className="text-primary text-xs font-bold tracking-[0.2em] transform scale-y-90 uppercase">Suraksha</p>
            </div>
          </div>
          <h1 className="text-4xl font-black text-foreground uppercase tracking-tight mb-3">ACCESS_PORTAL_V1</h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black bg-black text-white border-2 border-black rounded-md uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
            AUTH_MODE: WATER_QUALITY_MONITORING
          </div>
        </div>

        <div className="bg-card border-2 border-black rounded-lg p-8 sm:p-10 relative overflow-visible shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg border-2 border-destructive bg-destructive/10 text-destructive text-xs font-black uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
                // IDENTITY_URI
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="OPERATOR@SYSTEM.COM"
                  className="w-full pl-12 pr-4 py-4 bg-background border border-black rounded-lg text-sm font-black text-foreground placeholder:text-muted-foreground focus:outline-none focus:bg-primary/5 hover:shadow-md transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
                // CRYPTOGRAPHIC_KEY
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-background border border-black rounded-lg text-sm font-black text-foreground placeholder:text-muted-foreground focus:outline-none focus:bg-primary/5 hover:shadow-md transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border border-black bg-background peer-checked:bg-primary peer-checked:border-primary transition-colors rounded"></div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">PERSIST_SESSION</span>
              </label>
              <button type="button" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                RECOVER_ACCESS
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className={`w-full px-6 py-5 bg-black text-white border border-black rounded-lg flex items-center justify-center gap-3 text-lg font-black uppercase tracking-wider hover:shadow-md transition-all group ${isLoading ? 'opacity-70 cursor-wait' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? 'INITIALIZING_LINK...' : (
                <>
                  INITIALIZE_SESSION
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8 flex items-center gap-4">
            <div className="flex-1 h-[1px] bg-black/20"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">EXT_BRIDGE_PROTOCOL</span>
            <div className="flex-1 h-[1px] bg-black/20"></div>
          </div>

          {/* Social Sign In (Optional - can be removed or kept) */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="px-4 py-3 bg-background text-foreground border border-black rounded-lg text-sm font-black uppercase tracking-wider hover:shadow-md transition-all"
            >
              GOOGLE_API
            </button>
            <button
              type="button"
              className="px-4 py-3 bg-background text-foreground border border-black rounded-lg text-sm font-black uppercase tracking-wider hover:shadow-md transition-all"
            >
              AUTH_O_FED
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-black flex items-center justify-center gap-2">
            <ShieldCheck size={14} className="text-primary" />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">ENCRYPTED_PATH: RSA_4096_GCM</p>
          </div>
        </div>

        <div className="mt-6 text-center space-y-4">
          <div className="flex justify-center items-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
            <span className="w-8 h-px bg-black/10" />
            <Link to="/" className="hover:text-foreground transition-colors">RETURN_TO_ROOT_DOMAIN</Link>
            <span className="w-8 h-px bg-black/10" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
