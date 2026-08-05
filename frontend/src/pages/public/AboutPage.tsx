import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Award, Target, Heart, CheckCircle2, Building2, Globe } from "lucide-react";

const values = [
  { icon: Heart, title: "Compassion", description: "We treat every patient with empathy, dignity, and respect." },
  { icon: Award, title: "Excellence", description: "We strive for the highest standards in medical care and service." },
  { icon: Users, title: "Teamwork", description: "We collaborate across disciplines to deliver comprehensive care." },
  { icon: Target, title: "Innovation", description: "We embrace new technologies and methods to improve patient outcomes." },
];

const milestones = [
  { year: "1990", title: "Foundation", description: "Clinexa Hospital was established with a vision to provide quality healthcare." },
  { year: "2000", title: "Expansion", description: "Opened new wings for specialized departments and increased capacity." },
  { year: "2010", title: "Technology", description: "Implemented state-of-the-art medical technology and digital records." },
  { year: "2020", title: "Recognition", description: "Achieved national accreditation for healthcare excellence." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-clinexa-dark py-16 lg:py-24">
        <div className="container-wide">
          <div className="max-w-3xl animate-fade-in">
            <span className="text-primary font-medium">About Clinexa</span>
            <h1 className="text-3xl lg:text-5xl font-bold text-white mt-2 mb-6">
              Committed to Your Health and Well-being
            </h1>
            <p className="text-lg text-clinexa-secondary/90">
              For over three decades, Clinexa has been at the forefront of healthcare excellence, combining advanced medical technology with compassionate patient care.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Our Mission</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  To provide exceptional healthcare services that improve the quality of life for our patients and community. We are dedicated to delivering compassionate, accessible, and high-quality medical care through innovation, education, and a commitment to excellence.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Our Vision</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  To be the leading healthcare institution recognized for clinical excellence, innovative treatments, and unwavering commitment to patient-centered care. We envision a healthier community where everyone has access to world-class medical services.
                </p>
              </div>
            </div>
            <div className="relative animate-slide-up">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&q=80" 
                  alt="Modern hospital building" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card rounded-xl p-6 shadow-card-hover">
                <p className="text-4xl font-bold text-primary">25+</p>
                <p className="text-muted-foreground">Years of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-12 lg:mb-16 animate-fade-in">
            <span className="text-primary font-medium">Our Foundation</span>
            <h2 className="text-2xl lg:text-4xl font-bold text-foreground mt-2">
              Core Values
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              These principles guide everything we do and shape how we care for our patients.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 shadow-card card-hover animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Message */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl p-8 lg:p-12 shadow-card animate-fade-in">
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="lg:w-1/3">
                  <div className="aspect-square rounded-xl overflow-hidden mb-4">
                    <img 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80" 
                      alt="Dr. Richard Thompson" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-card-foreground">Dr. Richard Thompson</h3>
                  <p className="text-primary font-medium">Chief Executive Officer</p>
                </div>
                <div className="lg:w-2/3">
                  <blockquote className="text-lg text-muted-foreground leading-relaxed italic mb-6">
                    "At Clinexa, we believe that exceptional healthcare goes beyond treating illness—it's about nurturing wellness, building trust, and creating lasting relationships with our patients and community. Our team of dedicated professionals works tirelessly to ensure that every patient receives personalized, compassionate care that addresses their unique needs."
                  </blockquote>
                  <p className="text-muted-foreground">
                    "We are committed to investing in the latest medical technologies, continuous education for our staff, and sustainable practices that benefit both our patients and the environment. Thank you for trusting Clinexa with your health."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-12 lg:mb-16 animate-fade-in">
            <span className="text-primary font-medium">Our Journey</span>
            <h2 className="text-2xl lg:text-4xl font-bold text-foreground mt-2">
              Key Milestones
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="flex gap-6 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {milestone.year}
                    </div>
                    {index < milestones.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-2" />
                    )}
                  </div>
                  <div className="pb-8">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{milestone.title}</h3>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-clinexa-dark">
        <div className="container-wide text-center animate-fade-in">
          <h2 className="text-2xl lg:text-4xl font-bold text-white mb-6">
            Experience the Clinexa Difference
          </h2>
          <p className="text-lg text-clinexa-secondary/90 mb-8 max-w-2xl mx-auto">
            Join thousands of patients who trust us with their healthcare needs.
          </p>
          <Button asChild size="lg" className="btn-transition">
            <Link to="/appointment">Book Your Appointment</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
