import { useState } from "react";
import { useNavigate } from "react-router";
import { Apple, Mail, Lock, Eye, EyeOff } from "lucide-react";
import logoImage from "../../imports/image-1.png";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Determine user role based on email
    let userRole = "staff";
    if (email.includes("admin")) {
      userRole = "admin";
    }

    // Store user info in localStorage
    localStorage.setItem("userRole", userRole);
    localStorage.setItem("userEmail", email);

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-secondary p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white">
            <img src={logoImage} alt="CoCoders Logo" className="w-12 h-12 object-cover rounded-full shadow-lg" />
            <div>
              <h1 className="text-2xl font-bold">CoCoders</h1>
              <p className="text-white/80 text-sm">Cracking Ideas, Coding the Future</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white">
          <h2 className="text-4xl font-bold mb-4">Manage Your Food Inventory with Ease</h2>
          <p className="text-white/90 text-lg leading-relaxed">
            Track food items, manage expiration dates, and reduce waste with our specialized food inventory platform.
          </p>

          <div className="mt-12 space-y-4">
            <div className="flex items-start gap-4">
              <img src={logoImage} alt="CoCoders" className="w-10 h-10 object-cover rounded-full flex-shrink-0 shadow-md" />
              <div>
                <h3 className="font-semibold mb-1">Expiration Tracking</h3>
                <p className="text-white/80 text-sm">Monitor expiration dates and reduce food waste</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <img src={logoImage} alt="CoCoders" className="w-10 h-10 object-cover rounded-full flex-shrink-0 shadow-md" />
              <div>
                <h3 className="font-semibold mb-1">Freshness Alerts</h3>
                <p className="text-white/80 text-sm">Get notified when items are approaching expiration</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <img src={logoImage} alt="CoCoders Logo" className="w-10 h-10 object-cover rounded-full shadow-md" />
              <h1 className="text-xl font-bold">CoCoders</h1>
            </div>

            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome</h2>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm mb-2 text-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm mb-2 text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-primary/50"
                />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 font-medium"
            >
              Sign In
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-input"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-muted-foreground">Demo Credentials</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 text-sm">
                <p className="font-semibold text-purple-900 mb-2">Admin Account (Full Access)</p>
                <p className="mb-1 text-purple-800">Email: <span className="text-foreground font-medium">admin@cocoders.com</span></p>
                <p className="text-purple-800">Password: <span className="text-foreground font-medium">admin123</span></p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 text-sm">
                <p className="font-semibold text-green-900 mb-2">Staff Account (Limited Access)</p>
                <p className="mb-1 text-green-800">Email: <span className="text-foreground font-medium">staff@cocoders.com</span></p>
                <p className="text-green-800">Password: <span className="text-foreground font-medium">staff123</span></p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
