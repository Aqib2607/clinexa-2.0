import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DoctorCard } from "@/components/cards/DoctorCard";
import { Search, Filter } from "lucide-react";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/utils";

interface Doctor {
  id: number;
  user_id: number;
  department_id: number;
  specialization: string;
  experience_years: number;
  is_active: boolean;
  photo_url?: string;
  user: {
    name: string;
    email: string;
  };
  department: {
    name: string;
  };
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [specialties, setSpecialties] = useState<string[]>(["All Specialties"]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get('/doctors?per_page=100');
        const doctorData = response.data.data || [];
        setDoctors(doctorData);

        // Extract unique specialties
        const uniqueSpecialties = Array.from(new Set(doctorData.map((d: Doctor) => d.specialization))) as string[];
        setSpecialties(["All Specialties", ...uniqueSpecialties]);

      } catch (error) {
        console.error("Failed to fetch doctors", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === "All Specialties" || doctor.specialization === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-clinexa-dark py-16 lg:py-24">
        <div className="container-wide">
          <div className="max-w-3xl animate-fade-in">
            <span className="text-primary font-medium">Expert Care</span>
            <h1 className="text-3xl lg:text-5xl font-bold text-white mt-2 mb-6">
              Our Doctors
            </h1>
            <p className="text-lg text-clinexa-secondary/90">
              Meet our team of experienced physicians committed to providing you with the highest quality healthcare services.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-6 lg:py-8 bg-muted/50 border-b border-border">
        <div className="container-wide">
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card"
              />
            </div>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className="w-full sm:w-[200px] bg-card">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent className="bg-card z-50">
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Doctors Grid */}
      <section className="py-12 lg:py-20 bg-background">
        <div className="container-wide">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredDoctors.length > 0 ? (
            <>
              <p className="text-muted-foreground mb-6">
                Showing {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-6">
                {filteredDoctors.map((doctor, index) => (
                  <div
                    key={doctor.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <DoctorCard
                      name={doctor.user.name}
                      specialty={doctor.specialization}
                      experience={`${doctor.experience_years} years`}
                      rating={5.0} // Placeholder
                      availability={doctor.is_active ? "Available" : "Unavailable"}
                      image={getImageUrl(doctor.photo_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.user.name)}&background=random`}
                      doctorId={doctor.id}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No doctors found matching your criteria.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSpecialty("All Specialties");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-secondary">
        <div className="container-wide text-center animate-fade-in">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
            Can't Find the Right Doctor?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our patient coordinators can help match you with the perfect specialist for your healthcare needs.
          </p>
          <Button asChild size="lg" className="btn-transition">
            <Link to="/contact">Get Assistance</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
