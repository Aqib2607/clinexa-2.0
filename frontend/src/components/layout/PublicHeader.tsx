import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, Clock, ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Departments", href: "/departments" },
  { name: "Doctors", href: "/doctors" },
  { name: "Contact", href: "/contact" },
];

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const { data: user } = useUser();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* Top Bar */}
      <div className={`bg-clinexa-dark text-clinexa-secondary transition-all duration-300 ${isScrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
        <div className="container-wide">
          <div className="flex flex-col sm:flex-row items-center justify-between py-2 text-sm gap-2 sm:gap-0">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>Emergency: +8801946664836</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>24/7 Emergency Services</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated && user?.role === 'patient' ? (
                <Link to="/patient" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              ) : (
                <Link to="/login" className="hover:text-primary transition-colors">
                  Staff Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`transition-all duration-300 ${isScrolled
        ? 'bg-white/80 backdrop-blur-xl shadow-lg'
        : 'bg-white shadow-nav'
        }`}>
        <div className="container-wide">
          <div className="flex h-16 lg:h-20 items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/favicon.svg"
                alt="Clinexa Logo"
                className="h-10 w-10 lg:h-12 lg:w-12"
              />
              <div>
                <span className="text-xl lg:text-2xl font-bold text-clinexa-dark">Clinexa</span>
                <p className="text-xs text-muted-foreground hidden sm:block">Hospital Management System</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-clinexa-neutral hover:bg-accent hover:text-accent-foreground"
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden lg:flex items-center gap-4">
              <Button asChild size="lg" className="btn-transition">
                <Link to="/appointment">Book Appointment</Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-clinexa-neutral hover:bg-accent"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Toggle menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-border animate-fade-in">
            <div className="container-wide py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-4 py-3 rounded-md text-base font-medium transition-colors ${isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-clinexa-neutral hover:bg-accent"
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-border">
                <Button asChild className="w-full" size="lg">
                  <Link to="/appointment" onClick={() => setMobileMenuOpen(false)}>
                    Book Appointment
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
