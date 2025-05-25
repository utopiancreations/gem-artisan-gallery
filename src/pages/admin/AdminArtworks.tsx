
import { useState, useEffect } from 'react';
import { Image, Plus, Edit, Trash2, Save, Upload } from 'lucide-react';
import { getCollection, createDocument, updateDocument, deleteDocument, uploadFile } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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

interface ArtworkData {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  status: 'active' | 'sold' | 'archive'; // Updated to include status
  isHighlighted?: boolean;
  isFeatured?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

const categories = ["Rings", "Earrings", "Pearls", "Toggles", "Pendants", "Necklaces", "Bracelets"];
const statusOptions = [
  { value: 'active', label: 'Active (Available)' },
  { value: 'sold', label: 'Sold' },
  { value: 'archive', label: 'Archive' }
];

const AdminArtworks = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [artworks, setArtworks] = useState<ArtworkData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  // Form state
  const [artworkForm, setArtworkForm] = useState<ArtworkData>({
    title: '',
    description: '',
    imageUrl: '',
    category: 'Rings',
    status: 'active',
    isHighlighted: false,
    isFeatured: false
  });

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    try {
      const fetchedArtworks = await getCollection('artworks');
      setArtworks(fetchedArtworks as ArtworkData[]);
    } catch (error) {
      console.error('Error fetching artworks:', error);
      toast({
        title: "Error",
        description: "Failed to load artworks.",
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

  const handleOpenEditModal = (artwork: ArtworkData) => {
    setFormMode('edit');
    setArtworkForm(artwork);
    setImagePreview(artwork.imageUrl);
    setIsModalOpen(true);
  };

  const handleOpenDeleteDialog = (id: string) => {
    setSelectedArtwork(id);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setArtworkForm({
      title: '',
      description: '',
      imageUrl: '',
      category: 'Rings',
      status: 'active',
      isHighlighted: false,
      isFeatured: false
    });
    setSelectedFile(null);
    setImagePreview('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveArtwork = async () => {
    setSaving(true);
    try {
      let imageUrl = artworkForm.imageUrl;
      
      if (selectedFile) {
        setUploading(true);
        const uploadResult = await uploadFile(selectedFile, `artworks/${Date.now()}-${selectedFile.name}`);
        imageUrl = uploadResult.original;
        setUploading(false);
      }

      const artworkData = {
        ...artworkForm,
        imageUrl
      };
      
      if (formMode === 'add') {
        await createDocument('artworks', artworkData);
        toast({
          title: "Success",
          description: "Artwork added successfully!",
        });
      } else {
        if (!artworkForm.id) return;
        await updateDocument('artworks', artworkForm.id, artworkData);
        toast({
          title: "Success",
          description: "Artwork updated successfully!",
        });
      }
      
      fetchArtworks();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving artwork:', error);
      toast({
        title: "Error",
        description: "Failed to save artwork.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDeleteArtwork = async () => {
    if (!selectedArtwork) return;
    
    try {
      await deleteDocument('artworks', selectedArtwork);
      setArtworks(prev => prev.filter(artwork => artwork.id !== selectedArtwork));
      toast({
        title: "Success",
        description: "Artwork deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting artwork:', error);
      toast({
        title: "Error",
        description: "Failed to delete artwork.",
        variant: "destructive"
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedArtwork(null);
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
          <Image size={22} className="mr-2" />
          Artworks Management
        </h1>
        <Button onClick={handleOpenAddModal} className="flex items-center">
          <Plus size={18} className="mr-2" />
          Add New Artwork
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Highlighted</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artworks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No artworks found. Create your first artwork!
                  </TableCell>
                </TableRow>
              ) : (
                artworks.map(artwork => (
                  <TableRow key={artwork.id}>
                    <TableCell>
                      <img 
                        src={artwork.imageUrl} 
                        alt={artwork.title}
                        className="w-16 h-16 object-cover rounded-md"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/64x64?text=No+Image';
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{artwork.title}</TableCell>
                    <TableCell>{artwork.category}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        artwork.status === 'active' ? 'bg-green-100 text-green-800' :
                        artwork.status === 'sold' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {artwork.status?.toUpperCase() || 'ACTIVE'}
                      </span>
                    </TableCell>
                    <TableCell>{artwork.isHighlighted ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{artwork.isFeatured ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEditModal(artwork)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleOpenDeleteDialog(artwork.id!)}
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
      
      {/* Add/Edit Artwork Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {formMode === 'add' ? 'Add New Artwork' : 'Edit Artwork'}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to {formMode === 'add' ? 'create a new' : 'update the'} artwork.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="title">Artwork Title</Label>
                <Input
                  id="title"
                  value={artworkForm.title}
                  onChange={(e) => setArtworkForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter artwork title"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={artworkForm.description}
                  onChange={(e) => setArtworkForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this artwork..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="photo">Artwork Photo</Label>
                <div className="mt-2">
                  <input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('photo')?.click()}
                    className="flex items-center"
                    disabled={uploading}
                  >
                    <Upload size={16} className="mr-2" />
                    {uploading ? 'Uploading...' : 'Choose Photo'}
                  </Button>
                </div>
                
                {imagePreview && (
                  <div className="mt-4">
                    <div className="relative w-48 h-48 rounded-lg overflow-hidden border">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      {selectedFile && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                            New
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={artworkForm.category} 
                    onValueChange={(value) => setArtworkForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={artworkForm.status} 
                    onValueChange={(value: 'active' | 'sold' | 'archive') => setArtworkForm(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="highlighted"
                    checked={artworkForm.isHighlighted}
                    onCheckedChange={(checked) => setArtworkForm(prev => ({ ...prev, isHighlighted: checked }))}
                  />
                  <Label htmlFor="highlighted">Is Highlighted?</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="featured"
                    checked={artworkForm.isFeatured}
                    onCheckedChange={(checked) => setArtworkForm(prev => ({ ...prev, isFeatured: checked }))}
                  />
                  <Label htmlFor="featured">Is Featured?</Label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveArtwork}
              disabled={saving || uploading || !artworkForm.title || !artworkForm.description || (!artworkForm.imageUrl && !selectedFile)}
              className="flex items-center"
            >
              <Save size={16} className="mr-2" />
              {saving ? 'Saving...' : formMode === 'add' ? 'Create Artwork' : 'Update Artwork'}
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
              This action cannot be undone. This will permanently delete this artwork from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteArtwork} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminArtworks;
