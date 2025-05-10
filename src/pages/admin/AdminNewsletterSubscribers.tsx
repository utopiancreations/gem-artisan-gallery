
import { useState, useEffect } from 'react';
import { Mail, Trash2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { getCollection, deleteDocument } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
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

interface Subscriber {
  id?: string;
  email: string;
  createdAt: any;
}

const AdminNewsletterSubscribers = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const fetchedSubscribers = await getCollection('newsletterSubscriptions');
      // Sort by date, newest first
      const sortedSubscribers = (fetchedSubscribers as Subscriber[]).sort((a, b) => {
        return new Date(b.createdAt?.toDate?.() || b.createdAt).getTime() - 
               new Date(a.createdAt?.toDate?.() || a.createdAt).getTime();
      });
      
      setSubscribers(sortedSubscribers);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast({
        title: "Error",
        description: "Failed to load newsletter subscribers.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (id: string) => {
    setSelectedSubscriber(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSubscriber = async () => {
    if (!selectedSubscriber) return;
    
    try {
      await deleteDocument('newsletterSubscriptions', selectedSubscriber);
      setSubscribers(prev => prev.filter(subscriber => subscriber.id !== selectedSubscriber));
      toast({
        title: "Success",
        description: "Subscriber removed successfully!",
      });
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      toast({
        title: "Error",
        description: "Failed to remove subscriber.",
        variant: "destructive"
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedSubscriber(null);
    }
  };

  const exportSubscribersCSV = () => {
    // Create CSV content
    const headers = ["Email", "Subscription Date"];
    const csvContent = subscribers.map(sub => {
      const date = sub.createdAt?.toDate ? 
        format(sub.createdAt.toDate(), 'yyyy-MM-dd') : 
        format(new Date(sub.createdAt), 'yyyy-MM-dd');
      return `${sub.email},${date}`;
    });
    
    const csvString = [
      headers.join(','),
      ...csvContent
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `newsletter_subscribers_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFormattedDate = (timestamp: any) => {
    try {
      // Handle Firestore timestamps and regular dates
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Unknown date';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Mail size={22} className="mr-2" />
          Newsletter Subscribers
          <span className="ml-3 text-sm font-normal bg-gray-100 text-gray-700 rounded-full px-2 py-0.5">
            {subscribers.length} subscribers
          </span>
        </h1>
        <Button 
          variant="outline" 
          onClick={exportSubscribersCSV}
          className="flex items-center"
          disabled={subscribers.length === 0}
        >
          <Download size={16} className="mr-2" />
          Export CSV
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Subscription Date</TableHead>
                <TableHead className="text-right w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No newsletter subscribers found.
                  </TableCell>
                </TableRow>
              ) : (
                subscribers.map(subscriber => (
                  <TableRow key={subscriber.id}>
                    <TableCell>
                      <a href={`mailto:${subscriber.email}`} className="text-blue-600 hover:underline">
                        {subscriber.email}
                      </a>
                    </TableCell>
                    <TableCell>{getFormattedDate(subscriber.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleOpenDeleteDialog(subscriber.id!)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this email from your newsletter subscribers list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSubscriber} className="bg-red-600 hover:bg-red-700">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminNewsletterSubscribers;
