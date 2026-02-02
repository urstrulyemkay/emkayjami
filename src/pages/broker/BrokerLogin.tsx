import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBrokerAuth } from "@/contexts/BrokerAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Mail, Lock, User, Phone, MapPin, Building, ArrowRight, ArrowLeft } from "lucide-react";
import { useSoundNotifications } from "@/hooks/useSoundNotifications";

const BrokerLogin = () => {
  const navigate = useNavigate();
  const { login, signup, isAuthenticated, isLoading } = useBrokerAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login fields
  const [email, setEmail] = useState("broker@drivex.com");
  const [password, setPassword] = useState("broker123");

  // Signup fields
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("Bangalore");
  
  // Sound notifications
  const { playSound } = useSoundNotifications();
  
  // Redirect if already authenticated - must be in useEffect
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/broker");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await login(email, password);
        if (error) throw error;
        playSound('success');
        navigate("/broker");
      } else {
        const { error } = await signup({
          email,
          password,
          businessName,
          ownerName,
          mobile,
          city,
        });
        if (error) throw error;
        playSound('success');
        navigate("/broker");
      }
    } catch (err: any) {
      setError(err.message);
      playSound('error');
    } finally {
      setLoading(false);
    }
  };

  const cities = ["Bangalore", "Mumbai", "Delhi", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-zinc-900 dark:to-zinc-800 flex flex-col">
      {/* Back button */}
      <div className="p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/login")}
          className="text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Role Selection
        </Button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">DriveX Broker</h1>
          <p className="text-muted-foreground mt-1">B2B Two-Wheeler Marketplace</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto w-full">
          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="Your dealership name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="ownerName"
                    type="text"
                    placeholder="Your full name"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    required
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                    pattern="[6-9][0-9]{9}"
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full pl-10 h-12 rounded-md border border-input bg-background text-foreground"
                  >
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pl-10 h-12"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-lg">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-6 bg-amber-500 hover:bg-amber-600 text-white"
          >
            {loading ? "Please wait..." : isLogin ? "Sign In as Broker" : "Create Broker Account"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </form>

        {/* Toggle */}
        <p className="text-center text-muted-foreground mt-8">
          {isLogin ? "New to DriveX?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-amber-600 font-medium hover:underline"
          >
            {isLogin ? "Register as Broker" : "Sign in"}
          </button>
        </p>

        {/* Info */}
        {isLogin && (
          <div className="mt-6 p-4 bg-amber-100 dark:bg-amber-900/20 rounded-xl max-w-md mx-auto">
            <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
              <strong>Demo:</strong> Use pre-filled credentials or sign up as a new broker
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrokerLogin;
