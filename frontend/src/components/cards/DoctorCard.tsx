import { cn } from "@/lib/utils";
import { Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface DoctorCardProps {
  name: string;
  specialty: string;
  image?: string;
  rating?: number;
  experience?: string;
  availability?: string;
  href?: string;
  className?: string;
  doctorId?: number;
}

export function DoctorCard({
  name,
  specialty,
  image,
  rating,
  experience,
  availability,
  href,
  className,
  doctorId,
}: DoctorCardProps) {
  return (
    <div className={cn("bg-card rounded-xl overflow-hidden shadow-card card-hover h-full flex flex-col", className)}>
      {/* Image */}
      <div className="aspect-[4/3] bg-secondary relative overflow-hidden">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-accent">
            <span className="text-5xl font-bold text-muted-foreground/30">
              {name.charAt(0)}
            </span>
          </div>
        )}
        {availability && (
          <span className="absolute top-3 right-3 px-2 py-1 rounded-md bg-success text-success-foreground text-xs font-medium">
            {availability}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-card-foreground line-clamp-1">{name}</h3>
        <p className="text-sm text-primary font-medium mb-3 line-clamp-1">{specialty}</p>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4 flex-1">
          {rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span>{rating.toFixed(1)}</span>
            </div>
          )}
          {experience && <span>{experience}</span>}
        </div>

        <Button asChild variant="outline" className="w-full h-auto whitespace-nowrap text-xs sm:text-sm px-4 sm:px-6 py-3 sm:py-4">
          <Link to={doctorId ? `/appointment?doctor=${doctorId}` : (href || "/appointment")} className="flex items-center justify-center w-full">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Book Appointment
          </Link>
        </Button>
      </div>
    </div>
  );
}
