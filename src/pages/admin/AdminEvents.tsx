
import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Edit, Trash2, Save, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { getCollection, createDocument, updateDocument, deleteDocument } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { isInFuture } from "@/lib/dateUtils";

interface DateTimeEntry {
  date: Date;
  time: string;
}

interface EventData {
  id?: string;
  title: string;
  address: string;
  description: string;
  dates: DateTimeEntry[];
  createdAt?: any;
  updatedAt?: any;
}

const AdminEvents = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [eventForm, setEventForm] = useState<EventData>({
    title: '',
    address: '',
    description: '',
    dates: [{ date: new Date(), time: '6:00 PM - 9:00 PM' }]
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const fetchedEvents = await getCollection('events');
      // Sort events by upcoming date
      const sortedEvents = (fetchedEvents as EventData[]).sort((a, b) => {
        // Find the earliest upcoming date for each event
        const aDate = a.dates.find(d => isInFuture(new Date(d.date)))?.date || new Date(9999, 0);
        const bDate = b.dates.find(d => isInFuture(new Date(b.date)))?.date || new Date(9999, 0);
        return new Date(aDate).getTime() - new Date(bDate).getTime();
      });
      
      setEvents(sortedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setFormMode('add');
    resetForm();
    setIsModalOpen(true);
  };

const handleOpenEditModal = (event: EventData) => {
  setFormMode('edit');
  // Convert date strings or Firestore timestamps to Date objects
  const formattedEvent = {
    ...event,
    dates: event.dates.map(d => {
      let dateObj;
      try {
        if (d.date instanceof Date) {
          dateObj = d.date;
        } else if (d.date?.toDate && typeof d.date.toDate === 'function') {
          // Handle Firestore timestamps
          dateObj = d.date.toDate();
        } else if (typeof d.date === 'string') {
          dateObj = new Date(d.date);
        } else if (typeof d.date === 'object' && d.date !== null) {
          // Handle serialized dates from Firestore
          dateObj = new Date(d.date.seconds * 1000 + d.date.nanoseconds / 1000000);
        } else {
          dateObj = new Date(); // Fallback to current date
        }
      } catch (error) {
        console.error('Error parsing date:', error);
        dateObj = new Date(); // Fallback to current date
      }
      
      return {
        ...d,
        date: dateObj
      };
    })
  };
  setEventForm(formattedEvent);
  setIsModalOpen(true);
};

  const handleOpenDeleteDialog = (id: string) => {
    setSelectedEvent(id);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setEventForm({
      title: '',
      address: '',
      description: '',
      dates: [{ date: new Date(), time: '6:00 PM - 9:00 PM' }]
    });
  };

  const addDateTimeEntry = () => {
    setEventForm(prev => ({
      ...prev,
      dates: [...prev.dates, { date: new Date(), time: '6:00 PM - 9:00 PM' }]
    }));
  };

  const removeDateTimeEntry = (index: number) => {
    if (eventForm.dates.length <= 1) return;
    
    setEventForm(prev => ({
      ...prev,
      dates: prev.dates.filter((_, i) => i !== index)
    }));
  };

  const updateDateTimeEntry = (index: number, field: 'date' | 'time', value: Date | string) => {
    setEventForm(prev => ({
      ...prev,
      dates: prev.dates.map((entry, i) => {
        if (i === index) {
          return { ...entry, [field]: value };
        }
        return entry;
      })
    }));
  };

  const handleSaveEvent = async () => {
    setSaving(true);
    try {
      // Ensure dates are properly formatted
      const eventData = {
        ...eventForm
      };
      
      if (formMode === 'add') {
        await createDocument('events', eventData);
        toast({
          title: "Success",
          description: "Event added successfully!",
        });
      } else {
        if (!eventForm.id) return;
        await updateDocument('events', eventForm.id, eventData);
        toast({
          title: "Success",
          description: "Event updated successfully!",
        });
      }
      
      fetchEvents();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Error",
        description: "Failed to save event.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    try {
      await deleteDocument('events', selectedEvent);
      setEvents(prev => prev.filter(event => event.id !== selectedEvent));
      toast({
        title: "Success",
        description: "Event deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event.",
        variant: "destructive"
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
    }
  };

const getDisplayDate = (dateObj: any) => {
  try {
    // Try different approaches to create a valid date
    let date;
    if (dateObj instanceof Date) {
      date = dateObj;
    } else if (dateObj?.toDate && typeof dateObj.toDate === 'function') {
      // Handle Firestore timestamps
      date = dateObj.toDate();
    } else if (typeof dateObj === 'string') {
      date = new Date(dateObj);
    } else if (typeof dateObj === 'object' && dateObj !== null) {
      // Handle serialized dates from Firestore
      date = new Date(dateObj.seconds * 1000 + dateObj.nanoseconds / 1000000);
    } else {
      throw new Error('Invalid date format');
    }
    
    return format(date, 'MMMM d, yyyy');
  } catch (error) {
    console.error('Date parsing error:', error, dateObj);
    return 'Invalid date';
  }
};

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <CalendarIcon size={22} className="mr-2" />
          Events Management
        </h1>
        <Button onClick={handleOpenAddModal} className="flex items-center">
          <Plus size={18} className="mr-2" />
          Add New Event
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No events found. Create your first event!
                  </TableCell>
                </TableRow>
              ) : (
                events.map(event => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>
                      {event.dates.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center">
                            <CalendarIcon size={14} className="mr-1.5 text-muted-foreground" />
                            {getDisplayDate(event.dates[0].date)}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock size={14} className="mr-1.5" />
                            {event.dates[0].time}
                          </div>
                          {event.dates.length > 1 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              + {event.dates.length - 1} more date(s)
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No dates</span>
                      )}
                    </TableCell>
                    <TableCell>{event.address}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEditModal(event)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleOpenDeleteDialog(event.id!)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add/Edit Event Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {formMode === 'add' ? 'Add New Event' : 'Edit Event'}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to {formMode === 'add' ? 'create a new' : 'update the'} event.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={eventForm.title}
                  onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter event title"
                />
              </div>
              
              <div>
                <Label htmlFor="address">Location / Address</Label>
                <Input
                  id="address"
                  value={eventForm.address}
                  onChange={(e) => setEventForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter event location"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={eventForm.description}
                  onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this event..."
                  rows={3}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Event Dates & Times</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDateTimeEntry}
                    className="flex items-center text-xs"
                  >
                    <Plus size={14} className="mr-1" />
                    Add Date/Time
                  </Button>
                </div>
                
                {eventForm.dates.map((dateEntry, index) => (
                  <div key={index} className="flex gap-2 items-start mb-4">
                    <div className="w-1/3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateEntry.date ? format(dateEntry.date, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={dateEntry.date}
                            onSelect={(date) => updateDateTimeEntry(index, 'date', date || new Date())}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <Input
                      className="w-1/3"
                      value={dateEntry.time}
                      onChange={(e) => updateDateTimeEntry(index, 'time', e.target.value)}
                      placeholder="e.g. 6:00 PM - 9:00 PM"
                    />
                    
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeDateTimeEntry(index)}
                      disabled={eventForm.dates.length <= 1}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEvent}
              disabled={saving || !eventForm.title || !eventForm.address}
              className="flex items-center"
            >
              <Save size={16} className="mr-2" />
              {saving ? 'Saving...' : formMode === 'add' ? 'Create Event' : 'Update Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this event from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEvent} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminEvents;
