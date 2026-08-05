import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatCard } from "@/components/dashboard/StatCard";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    ClipboardList,
    Filter,
    Loader2,
    Activity,
    Pill,
    FileText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface Task {
    id: string;
    title: string;
    patient_name: string;
    ward: string;
    priority: "high" | "medium" | "low";
    due_time: string;
    completed: boolean;
    type: string;
    admission_id: string;
    notes?: string;
}

type TaskTypeMeta = {
    label: string;
    icon: LucideIcon;
    chipClass: string;
    actionText?: string;
    actionTo?: (task: Task) => string;
};

const TASK_TYPE_META: Record<string, TaskTypeMeta> = {
    vitals: {
        label: "Vitals",
        icon: Activity,
        chipClass: "bg-blue-50 text-blue-700",
        actionText: "Record Vitals",
        actionTo: (task) => `/nurse/vitals?patientId=${task.admission_id}`,
    },
    medication: {
        label: "Medication",
        icon: Pill,
        chipClass: "bg-purple-50 text-purple-700",
        actionText: "View Patient Chart",
        actionTo: (task) => `/nurse/patients/${task.admission_id}`,
    },
    notes: {
        label: "Nursing Notes",
        icon: FileText,
        chipClass: "bg-amber-50 text-amber-700",
        actionText: "View Patient Chart",
        actionTo: (task) => `/nurse/patients/${task.admission_id}`,
    },
    default: {
        label: "Task",
        icon: ClipboardList,
        chipClass: "bg-slate-50 text-slate-700",
        actionText: "View Patient Chart",
        actionTo: (task) => `/nurse/patients/${task.admission_id}`,
    },
};

export default function NurseTasks() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [priorityFilter, setPriorityFilter] = useState<string>("all");
    const [hiddenTaskIds, setHiddenTaskIds] = useState<Set<string>>(new Set());

    const { data: tasks = [], isLoading } = useQuery<Task[]>({
        queryKey: ["nurse-tasks"],
        queryFn: async () => {
            const res = await api.get("/nurse/tasks");
            return res.data;
        },
    });

    const completeTaskMutation = useMutation({
        mutationFn: async (taskId: string) => {
            return api.patch(`/nurse/tasks/${taskId}/complete`);
        },
        onSuccess: (_, taskId) => {
            toast({ title: "Task completed", description: "Task marked as completed." });
            if (taskId.startsWith('vital-')) {
                setHiddenTaskIds(prev => new Set(prev).add(taskId));
            }
            queryClient.invalidateQueries({ queryKey: ["nurse-tasks"] });
            queryClient.invalidateQueries({ queryKey: ["nurse-vitals"] });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to complete task.", variant: "destructive" });
        },
    });

    const filteredTasks = tasks
        .filter((task) => !task.completed && !hiddenTaskIds.has(task.id)) // Hide completed and temporarily hidden tasks
        .filter((task) => {
            if (priorityFilter === "all") return true;
            return task.priority === priorityFilter;
        });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;
    const pendingTasks = tasks.filter((t) => !t.completed).length;
    const highPriorityTasks = tasks.filter(
        (t) => t.priority === "high" && !t.completed
    ).length;

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-700";
            case "medium":
                return "bg-amber-100 text-amber-700";
            case "low":
                return "bg-blue-100 text-blue-700";
            default:
                return "bg-slate-100 text-slate-700";
        }
    };

    const getPriorityAccent = (priority: string) => {
        switch (priority) {
            case "high":
                return "border-l-4 border-l-red-500 bg-red-50/40";
            case "medium":
                return "border-l-4 border-l-amber-500 bg-amber-50/30";
            case "low":
                return "border-l-4 border-l-blue-500 bg-blue-50/20";
            default:
                return "border-l-4 border-l-slate-300";
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="My Tasks"
                description="Manage your nursing tasks and assignments"
            />

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Tasks" value={totalTasks} icon={ClipboardList} />
                <StatCard
                    title="Completed"
                    value={completedTasks}
                    icon={CheckCircle2}
                    description="Tasks finished"
                />
                <StatCard
                    title="Pending"
                    value={pendingTasks}
                    icon={Clock}
                    description="Tasks remaining"
                />
                <StatCard
                    title="High Priority"
                    value={highPriorityTasks}
                    icon={AlertCircle}
                    description="Urgent tasks"
                />
            </div>

            {/* Filter */}
            <div className="bg-card rounded-xl p-4 shadow-card">
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Tasks List */}
            <div className="space-y-3">
                {filteredTasks.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <ClipboardList className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                            <p className="font-medium text-muted-foreground">No tasks found</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {priorityFilter !== "all"
                                    ? "Try changing the filter"
                                    : "All vitals are up to date"}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredTasks.map((task) => {
                        const typeInfo = TASK_TYPE_META[task.type] ?? TASK_TYPE_META.default;
                        const TypeIcon = typeInfo.icon;
                        const cardAccent = getPriorityAccent(task.priority);

                        return (
                        <Card
                            key={task.id}
                            className={`transition-all ${cardAccent} ${
                                task.completed ? "opacity-60" : "hover:shadow-md"
                            }`}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start gap-4">
                                    <Checkbox
                                        checked={task.completed}
                                        onCheckedChange={() => {
                                            if (!task.completed) {
                                                completeTaskMutation.mutate(task.id);
                                            }
                                        }}
                                        className="mt-1"
                                        disabled={task.completed || completeTaskMutation.isPending}
                                    />
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <CardTitle
                                                className={`text-base ${
                                                    task.completed
                                                        ? "line-through text-muted-foreground"
                                                        : ""
                                                }`}
                                            >
                                                {task.title}
                                            </CardTitle>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                                                        typeInfo.chipClass
                                                    }`}
                                                >
                                                    <TypeIcon className="h-3.5 w-3.5" />
                                                    {typeInfo.label}
                                                </span>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                                                        task.priority
                                                    )}`}
                                                >
                                                    {task.priority}
                                                </span>
                                            </div>
                                        </div>
                                        <CardDescription>
                                            {task.patient_name} • {task.ward}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>Due: {task.due_time}</span>
                                </div>
                                {task.notes && (
                                    <p className="text-sm text-muted-foreground">{task.notes}</p>
                                )}
                                {!task.completed && typeInfo.actionTo && typeInfo.actionText && (
                                    <Button variant="outline" size="sm" className="mt-2" asChild>
                                        <Link to={typeInfo.actionTo(task)}>{typeInfo.actionText}</Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
