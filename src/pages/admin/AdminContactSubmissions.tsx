
import { useState, useEffect } from 'react';
import { MessageSquare, Check, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { getCollection, updateDocument } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ContactSubmission {
  id?: string;
  name: string;
  email: string;
  message: string;
  createdAt: any;
  status: 'unread' | 'read' | 'archived';
}

const AdminContactSubmissions = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const fetchedSubmissions = await getCollection('contactSubmissions');
      // Sort by date, newest first
      const sortedSubmissions = (fetchedSubmissions as ContactSubmission[]).sort((a, b) => {
        return new Date(b.createdAt?.toDate?.() || b.createdAt).getTime() - 
               new Date(a.createdAt?.toDate?.() || a.createdAt).getTime();
      });
      
      setSubmissions(sortedSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load contact submissions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmission = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
    
    // Mark as read if it's unread
    if (submission.status === 'unread') {
      handleUpdateStatus(submission.id!, 'read');
    }
  };

  const handleUpdateStatus = async (id: string, status: 'unread' | 'read' | 'archived') => {
    try {
      await updateDocument('contactSubmissions', id, { status });
      
      // Update local state
      setSubmissions(prev => 
        prev.map(submission => 
          submission.id === id ? { ...submission, status } : submission
        )
      );
      
      // Update the selected submission if it's open in modal
      if (selectedSubmission?.id === id) {
        setSelectedSubmission({ ...selectedSubmission, status });
      }
      
      toast({
        title: "Success",
        description: `Message marked as ${status}.`,
      });
    } catch (error) {
      console.error('Error updating submission status:', error);
      toast({
        title: "Error",
        description: "Failed to update message status.",
        variant: "destructive"
      });
    }
  };

  const getFormattedDate = (timestamp: any) => {
    try {
      // Handle Firestore timestamps and regular dates
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MMM d, yyyy - h:mm a');
    } catch (error) {
      return 'Unknown date';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <Badge variant="destructive">Unread</Badge>;
      case 'read':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Read</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
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
          <MessageSquare size={22} className="mr-2" />
          Contact Submissions
        </h1>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Message Preview</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No contact submissions found.
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map(submission => (
                  <TableRow key={submission.id} className={submission.status === 'unread' ? 'bg-blue-50' : ''}>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell className="font-medium">{submission.name}</TableCell>
                    <TableCell>{submission.email}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {submission.message}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1.5 text-muted-foreground" />
                        <span className="text-sm">{getFormattedDate(submission.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenSubmission(submission)}
                              >
                                <Eye size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View Message</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant={submission.status === 'archived' ? 'outline' : 'secondary'}
                                onClick={() => handleUpdateStatus(submission.id!, 
                                  submission.status === 'archived' ? 'read' : 'archived'
                                )}
                              >
                                {submission.status === 'archived' ? (
                                  <Check size={16} />
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                                  </svg>
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{submission.status === 'archived' ? 'Mark as Read' : 'Archive'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* View Message Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {selectedSubmission && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Message from {selectedSubmission.name}
              </DialogTitle>
              <DialogDescription>
                Received {getFormattedDate(selectedSubmission.createdAt)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium mb-1">Status</div>
                  <div>{getStatusBadge(selectedSubmission.status)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Name</div>
                  <div>{selectedSubmission.name}</div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Email</div>
                  <div>
                    <a href={`mailto:${selectedSubmission.email}`} className="text-blue-600 hover:underline">
                      {selectedSubmission.email}
                    </a>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">Message</div>
                <div className="bg-gray-50 rounded-md p-4 whitespace-pre-wrap">
                  {selectedSubmission.message}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              {selectedSubmission.status !== 'archived' && (
                <Button 
                  variant="secondary" 
                  onClick={() => handleUpdateStatus(selectedSubmission.id!, 'archived')}
                >
                  Archive Message
                </Button>
              )}
              {selectedSubmission.status === 'archived' && (
                <Button 
                  variant="outline" 
                  onClick={() => handleUpdateStatus(selectedSubmission.id!, 'read')}
                >
                  Mark as Read
                </Button>
              )}
              <Button onClick={() => setIsModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default AdminContactSubmissions;
