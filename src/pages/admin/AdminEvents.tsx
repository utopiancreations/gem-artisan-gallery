import { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Edit, Trash, Save, X } from 'lucide-react';
import { getCollection, createDocument, updateDocument, deleteDocument } from '../../lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface EventDate {
  date: string;
  startTime: string;
  endTime: string;
}

interface EventType {
  id: string;
  title: string;
  address: string;
  description?: string;
  dates: EventDate[];
  createdAt?: any;
}

const AdminEvents = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<EventType>({
    id: '',
    title: '',
    address: '',
    description: '',
    dates: [{ date: '', startTime: '', endTime: '' }],
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const result = await getCollection('events');
      
      if (result && Array.isArray(result)) {
        const processedEvents: EventType[] = result.map((event: any) => ({
          id: String(event.id || ''),
          title: String(event.title || ''),
          address: String(event.address || ''),
          description: String(event.description || ''),
          dates: Array.isArray(event.dates) ? event.dates : [],
          createdAt: event.createdAt,
        }));
        
        // Sort by upcoming dates
        processedEvents.sort((a, b) => {
          const dateA = a.dates.length > 0 ? new Date(a.dates[0].date).getTime() : 0;
          const dateB = b.dates.length > 0 ? new Date(b.dates[0].date).getTime() : 0;
          return dateB - dateA;
        });
        
        setEvents(processedEvents);
      }
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

  const resetForm = () => {
    setFormData({
      id: '',
      title: '',
      address: '',
      description: '',
      dates: [{ date: '', startTime: '', endTime: '' }],
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  const handleEdit = (event: EventType) => {
    setFormData({ ...event });
    setEditingEvent(event);
    setShowForm(true);
  };

  const addDateEntry = () => {
    setFormData(prev => ({
      ...prev,
      dates: [...prev.dates, { date: '', startTime: '', endTime: '' }]
    }));
  };

  const updateDateEntry = (index: number, field: keyof EventDate, value: string) => {
    setFormData(prev => ({
      ...prev,
      dates: prev.dates.map((dateEntry, i) => 
        i === index ? { ...dateEntry, [field]: value } : dateEntry
      )
    }));
  };

  const removeDateEntry = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dates: prev.dates.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.address || formData.dates.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const eventData = {
        title: formData.title,
        address: formData.address,
        description: formData.description,
        dates: formData.dates.filter(d => d.date && d.startTime && d.endTime),
        createdAt: editingEvent ? editingEvent.createdAt : new Date(),
      };

      if (editingEvent) {
        await updateDocument('events', editingEvent.id, eventData);
        toast({
          title: "Success",
          description: "Event updated successfully!",
        });
      } else {
        await createDocument('events', eventData);
        toast({
          title: "Success",
          description: "Event created successfully!",
        });
      }

      resetForm();
      fetchEvents();
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

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await deleteDocument('events', eventId);
      toast({
        title: "Success",
        description: "Event deleted successfully!",
      });
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event.",
        variant: "destructive"
      });
    }
  };

  const formatEventDates = (dates: EventDate[]) => {
    if (dates.length === 0) return 'No dates set';
    
    return dates.map(dateEntry => {
      const formattedDate = new Date(dateEntry.date).toLocaleDateString();
      return `${formattedDate} ${dateEntry.startTime} - ${dateEntry.endTime}`;
    }).join(', ');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Calendar size={22} className="mr-2" />
          <h1 className="text-2xl font-bold">Manage Events</h1>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center">
          <Plus size={16} className="mr-2" />
          Add Event
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Art Fair, Gallery Opening, etc."
              />
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 Main St, City, State"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional event details..."
                rows={3}
              />
            </div>

            <div>
              <Label>Event Dates & Times *</Label>
              {formData.dates.map((dateEntry, index) => (
                <div key={index} className="flex gap-2 mt-2 items-end">
                  <div className="flex-1">
                    <Input
                      type="date"
                      value={dateEntry.date}
                      onChange={(e) => updateDateEntry(index, 'date', e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="time"
                      value={dateEntry.startTime}
                      onChange={(e) => updateDateEntry(index, 'startTime', e.target.value)}
                      placeholder="Start Time"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="time"
                      value={dateEntry.endTime}
                      onChange={(e) => updateDateEntry(index, 'endTime', e.target.value)}
                      placeholder="End Time"
                    />
                  </div>
                  {formData.dates.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeDateEntry(index)}
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDateEntry}
                className="mt-2"
              >
                <Plus size={16} className="mr-1" />
                Add Date
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>
                <Save size={16} className="mr-2" />
                {saving ? 'Saving...' : (editingEvent ? 'Update Event' : 'Save Event')}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {events.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No events found. Add your first event!</p>
            </CardContent>
          </Card>
        ) : (
          events.map(event => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <MapPin size={14} className="mr-1" />
                      {event.address}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                      <Edit size={16} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(event.id)}>
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Dates:</strong> {formatEventDates(event.dates)}
                </p>
                {event.description && (
                  <p className="text-sm text-gray-700">{event.description}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminEvents;
