import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Brain,
  Bone,
  Baby,
  Eye,
  Activity,
  Calendar,
  Phone,
  Users,
  Award,
  Clock,
  Shield,
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";
import { DepartmentCard } from "@/components/cards/DepartmentCard";
import { DoctorCard } from "@/components/cards/DoctorCard";

const departments = [
  { name: "Cardiology", description: "Comprehensive heart care with advanced diagnostics", icon: Heart, doctorCount: 12 },
  { name: "Neurology", description: "Expert care for brain and nervous system disorders", icon: Brain, doctorCount: 8 },
  { name: "Orthopedics", description: "Bone, joint, and muscle treatment specialists", icon: Bone, doctorCount: 10 },
  { name: "Pediatrics", description: "Compassionate healthcare for children of all ages", icon: Baby, doctorCount: 15 },
  { name: "Ophthalmology", description: "Complete eye care and vision correction services", icon: Eye, doctorCount: 6 },
  { name: "Emergency", description: "24/7 emergency medical services and trauma care", icon: Activity, doctorCount: 20 },
];

const doctors = [
  { name: "Dr. Sarah Mitchell", specialty: "Cardiologist", rating: 4.9, experience: "15 years", availability: "Available", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80" },
  { name: "Dr. James Wilson", specialty: "Neurologist", rating: 4.8, experience: "12 years", availability: "Available", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80" },
  { name: "Dr. Emily Chen", specialty: "Pediatrician", rating: 4.9, experience: "10 years", availability: "Available", image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80" },
  { name: "Dr. Michael Brown", specialty: "Orthopedic Surgeon", rating: 4.7, experience: "18 years", availability: "Available", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80" },
];

const stats = [
  { value: "25+", label: "Years of Excellence" },
  { value: "500+", label: "Expert Doctors" },
  { value: "50k+", label: "Happy Patients" },
  { value: "100+", label: "Hospital Beds" },
];

const features = [
  { icon: Clock, title: "24/7 Emergency Care", description: "Round-the-clock emergency services with rapid response team" },
  { icon: Users, title: "Expert Medical Team", description: "Board-certified specialists in every department" },
  { icon: Shield, title: "Patient Safety First", description: "Stringent safety protocols and infection control measures" },
  { icon: Award, title: "Quality Accredited", description: "Nationally recognized for healthcare excellence" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-clinexa-dark via-clinexa-dark to-clinexa-neutral overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="container-wide py-16 lg:py-24 xl:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left animate-fade-in">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6">
                Trusted Healthcare Since 1990
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                Your Health, Our
                <span className="text-primary block">Priority</span>
              </h1>
              <p className="text-lg lg:text-xl text-clinexa-secondary/90 mb-8 max-w-xl mx-auto lg:mx-0">
                Experience world-class healthcare with compassionate care. Our expert medical team is dedicated to providing you with the best treatment and support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="text-base px-8 btn-transition">
                  <Link to="/appointment">
                    <Calendar className="h-5 w-5 mr-2" />
                    Book Appointment
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-base px-8 bg-transparent border-clinexa-secondary/50 text-clinexa-secondary hover:bg-clinexa-secondary/10 btn-transition">
                  <Link to="/contact">
                    <Phone className="h-5 w-5 mr-2" />
                    Contact Us
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block animate-slide-up">
              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80"
                    alt="Modern hospital facility"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Floating Stats */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-card-hover animate-scale-in">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">50k+</p>
                      <p className="text-sm text-muted-foreground">Patients Treated</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 bg-white rounded-xl p-4 shadow-card-hover animate-scale-in stagger-2">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Star className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">4.9</p>
                      <p className="text-sm text-muted-foreground">Patient Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-secondary border-b border-border">
        <div className="container-wide py-8 lg:py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <p className="text-3xl lg:text-5xl font-black text-clinexa-dark tracking-tight text-shadow-luxury">{stat.value}</p>
                <p className="text-sm lg:text-base text-foreground/80 font-medium mt-2 tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container-wide">
          <div className="text-center mb-12 lg:mb-16 animate-fade-in">
            <span className="text-primary font-medium">Why Choose Us</span>
            <h2 className="text-2xl lg:text-4xl font-bold text-foreground mt-2">
              Exceptional Healthcare Services
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              We combine cutting-edge medical technology with compassionate care to deliver the best possible outcomes for our patients.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 shadow-card card-hover group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-12 animate-fade-in">
            <span className="text-primary font-medium">Our Specialties</span>
            <h2 className="text-2xl lg:text-4xl font-bold text-foreground mt-2 mb-6">
              Medical Departments
            </h2>

          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
            {departments.map((dept, index) => (
              <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                <DepartmentCard {...dept} href="/departments" />
              </div>
            ))}
          </div>
          <div className="text-center mt-12 animate-fade-in">
            <Button asChild variant="outline" className="btn-transition">
              <Link to="/departments">
                View All Departments
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container-wide">
          <div className="text-center mb-12 animate-fade-in">
            <span className="text-primary font-medium">Expert Care</span>
            <h2 className="text-2xl lg:text-4xl font-bold text-foreground mt-2 mb-6">
              Meet Our Doctors
            </h2>

          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
            {doctors.map((doctor, index) => (
              <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                <DoctorCard {...doctor} />
              </div>
            ))}
          </div>
          <div className="text-center mt-12 animate-fade-in">
            <Button asChild variant="outline" className="btn-transition">
              <Link to="/doctors">
                View All Doctors
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-clinexa-dark">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h2 className="text-2xl lg:text-4xl font-bold text-white mb-6">
              Ready to Take Care of Your Health?
            </h2>
            <p className="text-lg text-clinexa-secondary/90 mb-8">
              Schedule an appointment with our expert doctors today. We're here to provide you with the best healthcare experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 btn-transition">
                <Link to="/appointment">
                  Book Appointment Now
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base px-8 bg-transparent border-clinexa-secondary/50 text-clinexa-secondary hover:bg-clinexa-secondary/10 btn-transition">
                <a href="tel:+8801946664836">
                  <Phone className="h-5 w-5 mr-2" />
                  Call: +880 1946-664836
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
