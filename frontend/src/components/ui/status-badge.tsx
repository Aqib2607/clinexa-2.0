import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "approved" | "pending" | "cancelled" | "active" | "completed" | "in-progress" | "confirmed" | "no_show" | "scheduled" | "rescheduled";
  className?: string;
}

const statusStyles = {
  approved: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
  active: "bg-blue-100 text-blue-800 border-blue-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  no_show: "bg-gray-100 text-gray-800 border-gray-200",
  scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  rescheduled: "bg-orange-100 text-orange-800 border-orange-200",
};

const statusLabels = {
  approved: "Approved",
  completed: "Completed",
  pending: "Pending",
  "in-progress": "In Progress",
  active: "Active",
  cancelled: "Cancelled",
  confirmed: "Confirmed",
  no_show: "No Show",
  scheduled: "Scheduled",
  rescheduled: "Rescheduled",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
