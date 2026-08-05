import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface DepartmentCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  doctorCount?: number;
  href?: string;
  className?: string;
}

export function DepartmentCard({ name, description, icon: Icon, doctorCount, href, className }: DepartmentCardProps) {
  const content = (
    <div className={cn("bg-card rounded-xl p-6 shadow-card card-hover group h-full flex flex-col", className)}>
      <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300 flex-shrink-0">
        <Icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
      </div>
      <h3 className="text-lg font-semibold text-card-foreground mb-2 line-clamp-1">{name}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{description}</p>
      {doctorCount !== undefined && (
        <p className="text-sm font-medium text-primary">{doctorCount} Doctors</p>
      )}
    </div>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
}
