import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, Clock, CheckCircle2, XCircle, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { useAppointmentSlots, useReplaceSchedule, useDeleteSlot } from "@/hooks/useAppointmentSlots";
import { useDoctorSchedule } from "@/hooks/useDoctorSchedule";
import { addDays, format, startOfWeek, isBefore, startOfDay, parseISO } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TimeSlot {
    id: string;
    time: string;
    start_time: string;
    end_time: string;
    available: boolean;
    status: 'available' | 'booked' | 'blocked';
}

interface DaySchedule {
    day: string;
    date: Date;
    dateString: string;
    slots: TimeSlot[];
    isActive: boolean;
    isPast: boolean;
}

export default function DoctorSchedule() {
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [currentWeekStart, setCurrentWeekStart] = useState(() => 
        startOfWeek(new Date(), { weekStartsOn: 1 })
    );
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [slotToDelete, setSlotToDelete] = useState<string | null>(null);
    const { toast } = useToast();
    const { data: userData } = useUser();
    const user = userData as any;

    // Schedule form state - one entry per day
    const [scheduleForm, setScheduleForm] = useState<Record<string, {
        enabled: boolean;
        start_time: string;
        end_time: string;
        slot_duration: number;
    }>>({
        Monday: { enabled: true, start_time: "09:00", end_time: "17:00", slot_duration: 30 },
        Tuesday: { enabled: true, start_time: "09:00", end_time: "17:00", slot_duration: 30 },
        Wednesday: { enabled: true, start_time: "09:00", end_time: "17:00", slot_duration: 30 },
        Thursday: { enabled: true, start_time: "09:00", end_time: "17:00", slot_duration: 30 },
        Friday: { enabled: true, start_time: "09:00", end_time: "17:00", slot_duration: 30 },
        Saturday: { enabled: false, start_time: "09:00", end_time: "13:00", slot_duration: 30 },
        Sunday: { enabled: false, start_time: "09:00", end_time: "13:00", slot_duration: 30 },
    });

    // Fetch existing schedule settings from doctor_schedules table
    const { data: scheduleData, isLoading: isLoadingSchedule } = useDoctorSchedule();
    const schedules = useMemo(() => (scheduleData || []) as any[], [scheduleData]);

    // Calculate week dates (Monday to Sunday)
    const weekDates = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
    }, [currentWeekStart]);

    const weekStartStr = format(currentWeekStart, 'yyyy-MM-dd');
    const weekEndStr = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');

    // Fetch appointment slots for the current week - ONLY source of truth
    const { data: slotsData, isLoading: isLoadingSlots, refetch: refetchSlots } = useAppointmentSlots({
        doctor_id: user?.doctor?.id || '',
        date_from: weekStartStr,
        date_to: weekEndStr,
    }, !!user?.doctor?.id);

    const appointmentSlots = useMemo(() => {
        console.log('Raw appointment slots data:', slotsData);
        return slotsData || [];
    }, [slotsData]);

    // Mutations
    const replaceSchedule = useReplaceSchedule();
    const deleteSlot = useDeleteSlot();

    // Build week schedule based ONLY on appointment_slots
    const weekSchedule: DaySchedule[] = useMemo(() => {
        const today = startOfDay(new Date());
        
        const schedule = weekDates.map((date) => {
            const dayName = format(date, 'EEEE');
            const dateString = format(date, 'yyyy-MM-dd');
            const isPast = isBefore(date, today);

            // Find all slots for this specific date from appointment_slots table
            const daySlotsData = appointmentSlots.filter(slot => slot.date === dateString);

            // Convert to display format
            const slots: TimeSlot[] = daySlotsData.map(slot => ({
                id: slot.id,
                time: format(parseISO(`2000-01-01T${slot.start_time}`), 'hh:mm a'),
                start_time: slot.start_time,
                end_time: slot.end_time,
                available: slot.status === 'available',
                status: slot.status,
            }));

            return {
                day: dayName,
                date: date,
                dateString: dateString,
                slots: slots,
                isActive: daySlotsData.length > 0,
                isPast: isPast,
            };
        });
        
        console.log('Week schedule computed:', schedule.map(s => ({ 
            day: s.day, 
            date: s.dateString, 
            isActive: s.isActive, 
            slotsCount: s.slots.length 
        })));
        
        return schedule;
    }, [weekDates, appointmentSlots]);

    const currentDaySchedule = weekSchedule[selectedDayIndex];

    // Calculate stats from current day slots ONLY
    const totalSlots = currentDaySchedule?.slots.length || 0;
    const availableSlots = currentDaySchedule?.slots.filter(s => s.status === 'available').length || 0;
    const bookedSlots = currentDaySchedule?.slots.filter(s => s.status === 'booked').length || 0;

    // Calculate week totals
    const weekTotalSlots = weekSchedule.reduce((sum, day) => sum + day.slots.length, 0);
    const weekAvailableSlots = weekSchedule.reduce((sum, day) => 
        sum + day.slots.filter(s => s.status === 'available').length, 0
    );
    const weekBookedSlots = weekSchedule.reduce((sum, day) => 
        sum + day.slots.filter(s => s.status === 'booked').length, 0
    );

    // Week navigation
    const handlePreviousWeek = () => {
        setCurrentWeekStart(addDays(currentWeekStart, -7));
        setSelectedDayIndex(0);
    };

    const handleNextWeek = () => {
        setCurrentWeekStart(addDays(currentWeekStart, 7));
        setSelectedDayIndex(0);
    };

    // Load existing schedule into form when dialog opens
    const handleOpenDialog = () => {
        if (schedules.length > 0) {
            const newForm: typeof scheduleForm = { ...scheduleForm };
            schedules.forEach((schedule: any) => {
                if (schedule.start_time && schedule.end_time) {
                    newForm[schedule.day_of_week] = {
                        enabled: schedule.is_available,
                        start_time: schedule.start_time.substring(0, 5),
                        end_time: schedule.end_time.substring(0, 5),
                        slot_duration: schedule.slot_duration || 30,
                    };
                }
            });
            setScheduleForm(newForm);
        }
        setIsDialogOpen(true);
    };

    // Save schedule and regenerate all slots
    const handleSaveSchedule = async () => {
        const scheduleData = Object.entries(scheduleForm).map(([day, config]) => ({
            day_of_week: day,
            start_time: config.start_time,
            end_time: config.end_time,
            is_available: config.enabled,
            slot_duration: config.slot_duration,
        }));

        try {
            // Call the backend to generate slots for the currently viewed week
            const response = await replaceSchedule.mutateAsync({
                schedules: scheduleData,
                week_start: weekStartStr,  // Current week being viewed
                week_end: weekEndStr,      // Current week being viewed
            });
            
            console.log('Slots generation response:', response);
            console.log('Generated for week:', weekStartStr, 'to', weekEndStr);
            
            // Wait for the slots to be refetched to ensure UI is in sync
            await refetchSlots();
            
            console.log('Slots refetched successfully');
            
            toast({
                title: "Success",
                description: `Schedule updated! ${response.slots_generated} appointment slots generated for this week.`,
            });
            
            setIsDialogOpen(false);
        } catch (error: any) {
            console.error('Failed to update schedule:', error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to update schedule",
                variant: "destructive",
            });
        }
    };

    // Delete a slot (only if available)
    const handleDeleteSlot = async (slotId: string, slotStatus: string) => {
        if (slotStatus !== 'available') {
            toast({
                title: "Cannot Delete",
                description: "Only available slots can be deleted. Booked slots cannot be removed.",
                variant: "destructive",
            });
            return;
        }

        setSlotToDelete(slotId);
    };

    const confirmDeleteSlot = async () => {
        if (!slotToDelete) return;

        try {
            await deleteSlot.mutateAsync(slotToDelete);
            toast({
                title: "Success",
                description: "Slot deleted successfully",
            });
            setSlotToDelete(null);
            refetchSlots();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to delete slot",
                variant: "destructive",
            });
            setSlotToDelete(null);
        }
    };

    if (isLoadingSchedule || isLoadingSlots || !user?.doctor?.id) {
        return (
            <div className="flex items-center justify-center h-96 animate-fade-in">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="My Schedule"
                description="Manage your availability and appointments based on configured slots"
            >
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePreviousWeek}>
                        Previous Week
                    </Button>
                    <Button variant="outline" onClick={handleNextWeek}>
                        Next Week
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={handleOpenDialog}>
                                <Calendar className="h-4 w-4 mr-2" />
                                Set Availability
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Set Your Availability</DialogTitle>
                                <DialogDescription>
                                    Configure your working hours for each day of the week. Slots will be generated for the currently viewed week ({format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}).
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                                {Object.entries(scheduleForm).map(([day, config]) => (
                                    <div 
                                        key={day} 
                                        className={`flex items-start gap-4 p-4 border rounded-lg transition-all ${
                                            config.enabled 
                                                ? 'border-green-200 bg-green-50/30' 
                                                : 'border-gray-200 bg-gray-50/50 opacity-60'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2 min-w-[120px] pt-2">
                                            <Checkbox
                                                id={`day-${day}`}
                                                checked={config.enabled}
                                                onCheckedChange={(checked) => {
                                                    setScheduleForm({
                                                        ...scheduleForm,
                                                        [day]: { ...config, enabled: checked as boolean }
                                                    });
                                                }}
                                            />
                                            <Label 
                                                htmlFor={`day-${day}`} 
                                                className={`font-semibold cursor-pointer ${
                                                    config.enabled ? 'text-green-700' : 'text-gray-500'
                                                }`}
                                            >
                                                {day}
                                                {!config.enabled && (
                                                    <span className="ml-2 text-xs font-normal">(Disabled)</span>
                                                )}
                                            </Label>
                                        </div>
                                        <div className="flex-1 grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`start-${day}`} className="text-xs">Start Time</Label>
                                                <Input
                                                    id={`start-${day}`}
                                                    type="time"
                                                    value={config.start_time}
                                                    disabled={!config.enabled}
                                                    onChange={(e) => {
                                                        setScheduleForm({
                                                            ...scheduleForm,
                                                            [day]: { ...config, start_time: e.target.value }
                                                        });
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`end-${day}`} className="text-xs">End Time</Label>
                                                <Input
                                                    id={`end-${day}`}
                                                    type="time"
                                                    value={config.end_time}
                                                    disabled={!config.enabled}
                                                    onChange={(e) => {
                                                        setScheduleForm({
                                                            ...scheduleForm,
                                                            [day]: { ...config, end_time: e.target.value }
                                                        });
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`duration-${day}`} className="text-xs">Slot (mins)</Label>
                                                <Input
                                                    id={`duration-${day}`}
                                                    type="number"
                                                    min="15"
                                                    step="15"
                                                    value={config.slot_duration}
                                                    disabled={!config.enabled}
                                                    onChange={(e) => {
                                                        setScheduleForm({
                                                            ...scheduleForm,
                                                            [day]: { ...config, slot_duration: parseInt(e.target.value) || 30 }
                                                        });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveSchedule} disabled={replaceSchedule.isPending}>
                                    {replaceSchedule.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Generating Slots...
                                        </>
                                    ) : (
                                        "Save & Generate Slots"
                                    )}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </PageHeader>

            {/* Week overview banner */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
                <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold">
                                Week of {format(currentWeekStart, 'MMMM d, yyyy')}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
                            </p>
                        </div>
                        <div className="flex gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">{weekTotalSlots}</div>
                                <div className="text-xs text-muted-foreground">Total Slots</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{weekAvailableSlots}</div>
                                <div className="text-xs text-muted-foreground">Available</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{weekBookedSlots}</div>
                                <div className="text-xs text-muted-foreground">Booked</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Day Selector - Shows Active/Off based on slot existence */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {weekSchedule.map((schedule, index) => {
                    const isSelected = selectedDayIndex === index;
                    
                    return (
                        <button
                            key={index}
                            onClick={() => setSelectedDayIndex(index)}
                            className={`flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all min-w-[120px] text-left ${
                                schedule.isActive
                                    ? isSelected
                                        ? "border-green-500 bg-green-100 shadow-md"
                                        : "border-green-300 bg-green-50 hover:border-green-400"
                                    : isSelected
                                        ? "border-gray-400 bg-gray-100 shadow-md"
                                        : "border-gray-200 bg-gray-50"
                            } ${schedule.isPast && !schedule.isActive ? "opacity-40" : ""}`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-medium">{schedule.day}</div>
                                {schedule.isActive ? (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-green-200 text-green-800">
                                        Active
                                    </span>
                                ) : (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-300 text-gray-700">
                                        Off
                                    </span>
                                )}
                            </div>
                            <div className="text-xs opacity-80 mt-1">
                                {format(schedule.date, 'MMM d')}
                            </div>
                            <div className="text-xs mt-1 font-semibold opacity-90">
                                {schedule.slots.length} slots
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Daily Stats - Based on selected day */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Slots
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            <span className="text-2xl font-bold">{totalSlots}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            For {currentDaySchedule?.day}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Available
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="text-2xl font-bold text-green-600">{availableSlots}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Can be booked
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Booked
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-blue-600" />
                            <span className="text-2xl font-bold text-blue-600">{bookedSlots}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Confirmed appointments
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Time Slots Display */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {currentDaySchedule?.day} - {currentDaySchedule && format(currentDaySchedule.date, 'PPP')}
                    </CardTitle>
                    <CardDescription>
                        {currentDaySchedule?.isPast && "This day is in the past"}
                        {!currentDaySchedule?.isPast && !currentDaySchedule?.isActive && 
                            "No appointment slots configured for this day"
                        }
                        {!currentDaySchedule?.isPast && currentDaySchedule?.isActive && 
                            `${totalSlots} appointment slots configured`
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {currentDaySchedule?.isActive ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {currentDaySchedule.slots.map((slot) => (
                                <div
                                    key={slot.id}
                                    className={`p-4 rounded-lg border-2 ${
                                        slot.status === 'available'
                                            ? "border-green-200 bg-green-50"
                                            : slot.status === 'booked'
                                            ? "border-blue-200 bg-blue-50"
                                            : "border-gray-200 bg-gray-50"
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            <span className="font-medium">{slot.time}</span>
                                        </div>
                                        {slot.status === 'available' ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        ) : slot.status === 'booked' ? (
                                            <XCircle className="h-4 w-4 text-blue-600" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-gray-600" />
                                        )}
                                    </div>
                                    <div className={`text-sm mb-2 ${
                                        slot.status === 'available' ? 'text-green-700' :
                                        slot.status === 'booked' ? 'text-blue-700' :
                                        'text-gray-700'
                                    }`}>
                                        <p className="font-medium capitalize">{slot.status}</p>
                                    </div>
                                    {slot.status === 'available' && (
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full mt-2"
                                            onClick={() => handleDeleteSlot(slot.id, slot.status)}
                                            disabled={deleteSlot.isPending}
                                        >
                                            <Trash2 className="h-3 w-3 mr-1" />
                                            Delete Slot
                                        </Button>
                                    )}
                                    {slot.status === 'booked' && (
                                        <div className="text-xs text-blue-600 mt-2 italic">
                                            Cannot delete booked slot
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <AlertCircle className="h-12 w-12 mb-4 text-muted-foreground/50" />
                            {currentDaySchedule?.isPast ? (
                                <>
                                    <p className="font-medium">This day has passed</p>
                                    <p className="text-sm mt-1">Navigate to future weeks to manage your schedule.</p>
                                </>
                            ) : (
                                <>
                                    <p className="font-medium">No slots configured for this day</p>
                                    <p className="text-sm mt-1">Click "Set Availability" to generate appointment slots.</p>
                                    <Button variant="outline" className="mt-4" onClick={handleOpenDialog}>
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Configure Schedule
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!slotToDelete} onOpenChange={() => setSlotToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Slot?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this appointment slot? This action cannot be undone.
                            The slot will be permanently removed from your schedule.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteSlot}>
                            Delete Slot
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}


