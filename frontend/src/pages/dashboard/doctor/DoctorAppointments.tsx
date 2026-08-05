import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, User, Phone, Filter, Search, Loader2, FileText, Save, Check, X, RotateCcw } from "lucide-react";
import { useAppointments, useUpdateAppointment, useCreateAppointment, Appointment } from "@/hooks/useAppointments";
import { StatusBadge } from "@/components/ui/status-badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function DoctorAppointments() {
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [notesText, setNotesText] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>("");
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [scheduleForm, setScheduleForm] = useState({
        patient_id: "",
        appointment_date: "",
        appointment_time: "",
        reason: "",
        notes: "",
    });

    // Fetch appointments from API
    const { data: appointmentsData, isLoading } = useAppointments(
        statusFilter !== "all" ? { status: statusFilter } : undefined
    );
    const updateAppointment = useUpdateAppointment();
    const createAppointment = useCreateAppointment();

    const appointments = (appointmentsData?.data || []) as Appointment[];

    const handleScheduleSubmit = async () => {
        if (!scheduleForm.patient_id || !scheduleForm.appointment_date || !scheduleForm.appointment_time || !scheduleForm.reason) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            await createAppointment.mutateAsync(scheduleForm);
            toast.success("Appointment scheduled successfully");
            setIsScheduleOpen(false);
            setScheduleForm({
                patient_id: "",
                appointment_date: "",
                appointment_time: "",
                reason: "",
                notes: "",
            });
        } catch (error) {
            toast.error("Failed to schedule appointment");
        }
    };

    const handleViewDetails = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setNotesText(appointment.notes || "");
        setSelectedStatus(appointment.status);
        setIsEditingNotes(false);
        setIsDetailsOpen(true);
    };

    const handleSaveNotes = async () => {
        if (!selectedAppointment) return;

        try {
            await updateAppointment.mutateAsync({
                id: selectedAppointment.id,
                data: { notes: notesText }
            });
            toast.success("Notes updated successfully");
            setSelectedAppointment({ ...selectedAppointment, notes: notesText });
            setIsEditingNotes(false);
        } catch (error) {
            toast.error("Failed to update notes");
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!selectedAppointment) return;

        try {
            await updateAppointment.mutateAsync({
                id: selectedAppointment.id,
                data: { status: newStatus }
            });
            toast.success("Appointment status updated");
            setSelectedAppointment({ ...selectedAppointment, status: newStatus as any });
            setSelectedStatus(newStatus);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleQuickStatusUpdate = async (appointmentId: string, newStatus: string) => {
        try {
            await updateAppointment.mutateAsync({
                id: appointmentId,
                data: { status: newStatus }
            });
            toast.success(`Appointment marked as ${newStatus}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const filteredAppointments = appointments.filter((apt) => {
        // Status filter is handled by API when specific status is selected, 
        // but we double check here if needed or for client-side filtering if API returned all
        const matchesStatus = statusFilter === "all" || apt.status === statusFilter;

        const patientName = apt.patient?.name || "Unknown Patient";
        const reason = apt.reason || "";

        const matchesSearch =
            patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reason.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96 animate-fade-in">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Appointments"
                description="Manage your appointment schedule"
            >
                <Button onClick={() => setIsScheduleOpen(true)}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Appointment
                </Button>
            </PageHeader>

            {/* Filters */}
            <div className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="appointment-search"
                            name="search"
                            placeholder="Search by patient name or reason..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="no_show">No Show</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-card rounded-xl shadow-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Patient</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAppointments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No appointments found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAppointments.map((appointment) => (
                                <TableRow key={appointment.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{appointment.patient?.name || "Unknown"}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {appointment.patient?.email}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">
                                                    {new Date(appointment.appointment_date).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {appointment.appointment_time}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            {appointment.patient?.phone || "N/A"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-xs">
                                        <p className="text-sm truncate">{appointment.reason}</p>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={appointment.status} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {appointment.status !== 'completed' && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    onClick={() => handleQuickStatusUpdate(appointment.id, 'completed')}
                                                    title="Mark as Completed"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleQuickStatusUpdate(appointment.id, 'cancelled')}
                                                    title="Cancel Appointment"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {(appointment.status === 'cancelled' || appointment.status === 'completed' || appointment.status === 'no_show') && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    onClick={() => handleQuickStatusUpdate(appointment.id, 'confirmed')}
                                                    title="Confirm Appointment"
                                                >
                                                    <RotateCcw className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(appointment)}>
                                                View Details
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Appointment Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Appointment Details</DialogTitle>
                        <DialogDescription>
                            View and manage appointment information
                        </DialogDescription>
                    </DialogHeader>
                    {selectedAppointment && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Patient Name</label>
                                    <p className="text-base">{selectedAppointment.patient?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    <p className="text-base">{selectedAppointment.patient?.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                    <p className="text-base">{selectedAppointment.patient?.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                                    <Select value={selectedStatus} onValueChange={handleStatusChange}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                            <SelectItem value="no_show">No Show</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Date</label>
                                    <p className="text-base">
                                        {new Date(selectedAppointment.appointment_date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Time</label>
                                    <p className="text-base">{selectedAppointment.appointment_time}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-muted-foreground">Reason for Visit</label>
                                    <p className="text-base mt-1">{selectedAppointment.reason || 'Not specified'}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-muted-foreground">Notes</label>
                                    {isEditingNotes ? (
                                        <Textarea
                                            value={notesText}
                                            onChange={(e) => setNotesText(e.target.value)}
                                            placeholder="Add notes about this appointment..."
                                            rows={4}
                                            className="mt-1"
                                        />
                                    ) : (
                                        <p className="text-base mt-1 text-muted-foreground">
                                            {selectedAppointment.notes || 'No notes added yet'}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                {isEditingNotes ? (
                                    <>
                                        <Button variant="outline" onClick={() => {
                                            setNotesText(selectedAppointment?.notes || "");
                                            setIsEditingNotes(false);
                                        }}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSaveNotes} disabled={updateAppointment.isPending}>
                                            <Save className="h-4 w-4 mr-2" />
                                            {updateAppointment.isPending ? 'Saving...' : 'Save Notes'}
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                                            Close
                                        </Button>
                                        <Button onClick={() => setIsEditingNotes(true)}>
                                            <FileText className="h-4 w-4 mr-2" />
                                            {selectedAppointment?.notes ? 'Edit Notes' : 'Add Notes'}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Schedule Appointment Dialog */}
            <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Schedule New Appointment</DialogTitle>
                        <DialogDescription>
                            Create a new appointment for a patient
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="patient_id">Patient ID *</Label>
                            <Input
                                id="patient_id"
                                value={scheduleForm.patient_id}
                                onChange={(e) => setScheduleForm(prev => ({ ...prev, patient_id: e.target.value }))}
                                placeholder="Enter patient user ID"
                                className="mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="appointment_date">Date *</Label>
                                <Input
                                    id="appointment_date"
                                    type="date"
                                    value={scheduleForm.appointment_date}
                                    onChange={(e) => setScheduleForm(prev => ({ ...prev, appointment_date: e.target.value }))}
                                    className="mt-1"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div>
                                <Label htmlFor="appointment_time">Time *</Label>
                                <Input
                                    id="appointment_time"
                                    type="time"
                                    value={scheduleForm.appointment_time}
                                    onChange={(e) => setScheduleForm(prev => ({ ...prev, appointment_time: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="reason">Reason for Visit *</Label>
                            <Textarea
                                id="reason"
                                value={scheduleForm.reason}
                                onChange={(e) => setScheduleForm(prev => ({ ...prev, reason: e.target.value }))}
                                placeholder="Enter reason for appointment"
                                rows={3}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="schedule_notes">Notes (Optional)</Label>
                            <Textarea
                                id="schedule_notes"
                                value={scheduleForm.notes}
                                onChange={(e) => setScheduleForm(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Additional notes"
                                rows={2}
                                className="mt-1"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button variant="outline" onClick={() => setIsScheduleOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleScheduleSubmit} disabled={createAppointment.isPending}>
                                {createAppointment.isPending ? 'Scheduling...' : 'Schedule Appointment'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}


