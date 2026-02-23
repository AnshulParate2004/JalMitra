import { motion } from "framer-motion";
import { Activity, Bell, Settings, LogOut, LogIn } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Analytics", path: "/analytics" },
  { name: "Alerts", path: "/alerts" },
  { name: "Chatbot", path: "/chatbot" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-30 h-14 flex items-center justify-between border-b-2 border-black bg-card/90 backdrop-blur-sm px-5 shrink-0"
    >
      <Link to="/" className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg border-2 border-black bg-primary flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Activity className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-foreground">JalSuraksha</span>
      </Link>

      {isAuthenticated && (
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors duration-300 ${
                location.pathname === link.path
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1">
        {isAuthenticated ? (
          <>
            <button className="relative h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors border-[0.5px] border-black">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-destructive rounded-full" />
            </button>
            <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors border-[0.5px] border-black">
              <Settings className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 ml-2 px-3 py-1 rounded-lg border-2 border-black bg-muted/50 text-xs font-medium">
              <span className="text-muted-foreground">{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="h-8 px-3 flex items-center justify-center gap-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors border-[0.5px] border-black text-xs font-medium"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <Link
            to="/signin"
            className="h-8 px-3 flex items-center justify-center gap-1 rounded-lg border-2 border-black bg-primary text-primary-foreground transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-xs font-medium"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
