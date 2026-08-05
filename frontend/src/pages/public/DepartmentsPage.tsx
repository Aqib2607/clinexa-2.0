import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DepartmentCard } from "@/components/cards/DepartmentCard";
import api from "@/lib/api";
import {
  Heart,
  Brain,
  Bone,
  Baby,
  Eye,
  Activity,
  Stethoscope,
  Pill,
  Microscope,
  Syringe,
  Thermometer,
  Radiation,
  Search,
  Stethoscope as DefaultIcon,
  type LucideIcon
} from "lucide-react";

interface Department {
  id: number;
  name: string;
  description: string;
  doctors_count: number;
}

const iconMapping: Record<string, LucideIcon> = {
  "Cardiology": Heart,
  "Neurology": Brain,
  "Orthopedics": Bone,
  "Pediatrics": Baby,
  "Ophthalmology": Eye,
  "Emergency Medicine": Activity,
  "General Medicine": Stethoscope,
  "Oncology": Radiation,
  "Dermatology": Thermometer,
  "Gastroenterology": Pill,
  "Pathology": Microscope,
  "Anesthesiology": Syringe,
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get('/departments');
        setDepartments(response.data);
      } catch (error) {
        console.error("Failed to fetch departments", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (name: string) => {
    // Try exact match or partial match
    const key = Object.keys(iconMapping).find(k => name.includes(k));
    return key ? iconMapping[key] : DefaultIcon;
  };


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-clinexa-dark py-16 lg:py-24">
        <div className="container-wide">
          <div className="max-w-3xl animate-fade-in">
            <span className="text-primary font-medium">Our Specialties</span>
            <h1 className="text-3xl lg:text-5xl font-bold text-white mt-2 mb-6">
              Medical Departments
            </h1>
            <p className="text-lg text-clinexa-secondary/90">
              Explore our comprehensive range of medical departments, each staffed with experienced specialists dedicated to providing exceptional care.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 bg-muted/50 border-b border-border">
        <div className="container-wide">
          <div className="relative max-w-md animate-fade-in">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>
        </div>
      </section>

      {/* Departments Grid */}
      <section className="py-12 lg:py-20 bg-background">
        <div className="container-wide">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredDepartments.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-6">
              {filteredDepartments.map((dept, index) => (
                <div
                  key={dept.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <DepartmentCard
                    name={dept.name}
                    description={dept.description || "Medical department providing specialized care."}
                    icon={getIcon(dept.name)}
                    doctorCount={dept.doctors_count}
                    href={`/departments/${dept.name.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No departments found matching your search.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchTerm("")}
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-secondary">
        <div className="container-wide text-center animate-fade-in">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
            Need Help Finding the Right Department?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our patient coordinators are available to help guide you to the appropriate specialist for your healthcare needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="btn-transition">
              <Link to="/appointment">Book Appointment</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="btn-transition">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
