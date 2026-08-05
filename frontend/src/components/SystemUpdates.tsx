import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X, AlertTriangle, Info, Wrench } from "lucide-react";
import api from "@/lib/api";

interface SystemUpdate {
    id: string;
    title: string;
    message: string;
    type: "maintenance" | "feature" | "alert";
    is_active: boolean;
    scheduled_at: string | null;
    created_at: string;
}

export function SystemUpdates() {
    const [updates, setUpdates] = useState<SystemUpdate[]>([]);
    const [dismissed, setDismissed] = useState<string[]>([]);

    useEffect(() => {
        loadUpdates();
    }, []);

    const loadUpdates = async () => {
        try {
            const response = await api.get('/system-updates');
            setUpdates(response.data);
        } catch (error) {
            console.error("Failed to load system updates", error);
        }
    };

    const handleDismiss = (id: string) => {
        setDismissed([...dismissed, id]);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "maintenance":
                return <Wrench className="h-4 w-4" />;
            case "alert":
                return <AlertTriangle className="h-4 w-4" />;
            case "feature":
                return <Info className="h-4 w-4" />;
            default:
                return <Info className="h-4 w-4" />;
        }
    };

    const getVariant = (type: string): "default" | "destructive" => {
        return type === "alert" ? "destructive" : "default";
    };

    const visibleUpdates = updates.filter(update => !dismissed.includes(update.id));

    if (visibleUpdates.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4 mb-6">
            {visibleUpdates.map((update) => (
                <Alert key={update.id} variant={getVariant(update.type)} className="relative">
                    <button
                        onClick={() => handleDismiss(update.id)}
                        className="absolute top-2 right-2 p-1 rounded-md hover:bg-background/20 transition-colors"
                        aria-label="Dismiss"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    <div className="flex items-start gap-3">
                        {getIcon(update.type)}
                        <div className="flex-1 pr-8">
                            <AlertTitle>{update.title}</AlertTitle>
                            <AlertDescription className="mt-2">
                                {update.message}
                                {update.scheduled_at && (
                                    <div className="mt-2 text-sm font-medium">
                                        Scheduled: {new Date(update.scheduled_at).toLocaleString()}
                                    </div>
                                )}
                            </AlertDescription>
                        </div>
                    </div>
                </Alert>
            ))}
        </div>
    );
}
