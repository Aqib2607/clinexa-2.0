import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import { ArrowLeft, User, Clock, Award } from "lucide-react";

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  qualification: string;
  experience_years: number;
  consultation_fee: number;
  photo_url?: string;
}

interface Department {
  id: number;
  name: string;
  description: string;
  overview?: string;
  services?: string[];
  facilities?: string[];
  image_url?: string;
  conditions_treated?: string[];
  technologies?: string[];
  why_choose_us?: string;
}

export default function DepartmentDetailPage() {
  const { slug } = useParams();
  const [department, setDepartment] = useState<Department | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const deptResponse = await api.get('/departments');
        const deptName = slug?.replace(/-/g, ' ');
        const dept = deptResponse.data.find(
          (d: Department) => d.name.toLowerCase() === deptName?.toLowerCase()
        );
        
        if (dept) {
          setDepartment(dept);
          const doctorsResponse = await api.get(`/departments/${dept.id}/doctors`);
          const doctorsData = Array.isArray(doctorsResponse.data) 
            ? doctorsResponse.data 
            : doctorsResponse.data.doctors || [];
          setDoctors(doctorsData);
        }
      } catch (error) {
        console.error("Failed to fetch department data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  return (
    <div className="min-h-screen">
      <section className="bg-clinexa-dark py-16 lg:py-24">
        <div className="container-wide">
          <Button asChild variant="ghost" className="mb-4 text-white">
            <Link to="/departments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Departments
            </Link>
          </Button>
          <div className="max-w-3xl">
            <h1 className="text-3xl lg:text-5xl font-bold text-white capitalize">
              {department?.name || slug?.replace(/-/g, ' ')}
            </h1>
            <p className="text-lg text-clinexa-secondary/90 mt-4">
              {department?.description || "Specialized medical care and treatment."}
            </p>
          </div>
        </div>
      </section>

      {department?.image_url && (
        <section className="relative h-96 overflow-hidden">
          <img 
            src={department.image_url} 
            alt={department.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
        </section>
      )}

      <section className="py-12 lg:py-20 bg-muted/30">
        <div className="container-wide">
          {department?.overview && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Overview</h2>
              <p className="text-muted-foreground leading-relaxed">{department.overview}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {department?.services && Array.isArray(department.services) && department.services.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Services Offered</h2>
                <ul className="space-y-2">
                  {department.services.map((service, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-muted-foreground">{service}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {department?.facilities && Array.isArray(department.facilities) && department.facilities.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Facilities</h2>
                <ul className="space-y-2">
                  {department.facilities.map((facility, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-muted-foreground">{facility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {department?.conditions_treated && Array.isArray(department.conditions_treated) && department.conditions_treated.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Conditions Treated</h2>
                <ul className="space-y-2">
                  {department.conditions_treated.map((condition, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-muted-foreground">{condition}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {department?.technologies && Array.isArray(department.technologies) && department.technologies.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Technologies Used</h2>
                <ul className="space-y-2">
                  {department.technologies.map((tech, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-muted-foreground">{tech}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {department?.why_choose_us && (
            <div className="bg-primary/5 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Why Choose Us</h2>
              <p className="text-muted-foreground leading-relaxed">{department.why_choose_us}</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 lg:py-20 bg-background">
        <div className="container-wide">
          <h2 className="text-2xl font-bold mb-8">Our Doctors</h2>
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : doctors.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <Card key={doctor.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      {getImageUrl(doctor.photo_url) ? (
                        <img 
                          src={getImageUrl(doctor.photo_url)!} 
                          alt={doctor.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{doctor.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span>{doctor.qualification}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{doctor.experience_years} years experience</span>
                      </div>
                      <div className="pt-2 font-semibold text-primary">
                        ₹{doctor.consultation_fee} consultation fee
                      </div>
                    </div>
                    <Button asChild className="w-full mt-4">
                      <Link to={`/appointment?doctor=${doctor.id}`}>Book Appointment</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No doctors available in this department.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
