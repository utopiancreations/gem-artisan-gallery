import { useState, useEffect, ChangeEvent } from 'react';
import { Plus, Edit, Trash2, Image, Save, X, Check, Upload } from 'lucide-react';
import { getCollection, createDocument, updateDocument, deleteDocument, uploadFile } from '../../lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import imageCompression from 'browser-image-compression';

interface ArtworkData {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category: string;
  isHighlighted: boolean;
  isFeatured: boolean;
  createdAt?: any;
  updatedAt?: any;
}

const ARTWORK_CATEGORIES = ["Rings", "Earrings", "Pearls", "Toggles", "Pendants"];

const AdminArtworks = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [artworks, setArtworks] = useState<ArtworkData[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [saving, setSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  
  // Form state
  const [artworkForm, setArtworkForm] = useState<ArtworkData>({
    title: '',
    description: '',
    imageUrl: '',
    thumbnailUrl: '',
    category: ARTWORK_CATEGORIES[0],
    isHighlighted: false,
    isFeatured: false
  });
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

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
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (artwork: ArtworkData) => {
    setFormMode('edit');
    setArtworkForm({...artwork});
    setPreviewUrl(artwork.imageUrl);
    setIsAddModalOpen(true);
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
      thumbnailUrl: '',
      category: ARTWORK_CATEGORIES[0],
      isHighlighted: false,
      isFeatured: false
    });
    setFile(null);
    setPreviewUrl('');
  };

  // Image compression function
  const compressAndResizeImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1, // Max file size in MB
      maxWidthOrHeight: 1200, // Max width or height in pixels
      useWebWorker: true,
      fileType: 'image/jpeg', // Convert all images to JPEG for better compression
    };
    
    try {
      console.log('Original image size:', file.size / 1024 / 1024, 'MB');
      const compressedFile = await imageCompression(file, options);
      console.log('Compressed image size:', compressedFile.size / 1024 / 1024, 'MB');
      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      return file; // Return original file if compression fails
    }
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Show a loading indicator
      setIsCompressing(true);
      
      try {
        // Compress and resize the image
        const compressedFile = await compressAndResizeImage(selectedFile);
        
        setFile(compressedFile);
        
        // Create preview URL for the selected image
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
          setIsCompressing(false);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error processing image:', error);
        setIsCompressing(false);
        
        // Fall back to original file if compression fails
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  };

  const handleSaveArtwork = async () => {
    setSaving(true);
    try {
      let imageUrl = artworkForm.imageUrl;
      let thumbnailUrl = artworkForm.thumbnailUrl || artworkForm.imageUrl;
      
      // Upload new image if selected
      if (file) {
        const timestamp = new Date().getTime();
        const path = `artworks/${artworkForm.category}/${timestamp}_${file.name}`;
        const urls = await uploadFile(file, path);
        imageUrl = urls.original;
        thumbnailUrl = urls.thumbnail;
      }
      
      const artworkData = {
        ...artworkForm,
        imageUrl,
        thumbnailUrl
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
      setIsAddModalOpen(false);
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
                <TableHead className="w-12">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="w-24">Highlighted</TableHead>
                <TableHead className="w-24">Featured</TableHead>
                <TableHead className="text-right w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artworks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No artworks found. Create your first artwork!
                  </TableCell>
                </TableRow>
              ) : (
                artworks.map(artwork => (
                  <TableRow key={artwork.id}>
                    <TableCell>
                      <div className="h-12 w-12 rounded-md overflow-hidden bg-muted">
                        {artwork.thumbnailUrl || artwork.imageUrl ? (
                          <img 
                            src={artwork.thumbnailUrl || artwork.imageUrl} 
                            alt={artwork.title} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                            No image
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{artwork.title}</TableCell>
                    <TableCell>{artwork.category}</TableCell>
                    <TableCell>
                      {artwork.isHighlighted ? (
                        <Check size={18} className="text-green-500" />
                      ) : (
                        <X size={18} className="text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      {artwork.isFeatured ? (
                        <Check size={18} className="text-green-500" />
                      ) : (
                        <X size={18} className="text-muted-foreground" />
                      )}
                    </TableCell>
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
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {formMode === 'add' ? 'Add New Artwork' : 'Edit Artwork'}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to {formMode === 'add' ? 'create a new' : 'update the'} artwork.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={artworkForm.title}
                    onChange={(e) => setArtworkForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter artwork title"
                  />
                </div>
                
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
                      {ARTWORK_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={artworkForm.description}
                    onChange={(e) => setArtworkForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe this artwork..."
                    rows={5}
                  />
                </div>
                
                <div className="flex space-x-6 pt-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="highlighted"
                      checked={artworkForm.isHighlighted}
                      onCheckedChange={(checked) => setArtworkForm(prev => ({ ...prev, isHighlighted: checked }))}
                    />
                    <Label htmlFor="highlighted">Highlighted</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={artworkForm.isFeatured}
                      onCheckedChange={(checked) => setArtworkForm(prev => ({ ...prev, isFeatured: checked }))}
                    />
                    <Label htmlFor="featured">Featured</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Artwork Image</Label>
                  <div className="flex items-center space-x-4 mb-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => document.getElementById('artwork-upload')?.click()}
                      className="flex items-center"
                      disabled={isCompressing}
                    >
                      {isCompressing ? (
                        <>
                          <span className="mr-2">Optimizing...</span>
                          {/* You can add a spinner here */}
                        </>
                      ) : (
                        <>
                          <Upload size={16} className="mr-2" />
                          Select Image
                        </>
                      )}
                    </Button>
                    <input
                      id="artwork-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={isCompressing}
                    />
                    <span className="text-sm text-muted-foreground">
                      {isCompressing 
                        ? 'Optimizing image...' 
                        : file 
                          ? file.name 
                          : 'No file selected'}
                    </span>
                  </div>
                  
                  <div className="border rounded-md overflow-hidden aspect-square">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Artwork preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
                        <span>No image selected</span>
                      </div>
                    )}
                  </div>
                  
                  {file && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <p>Image will be optimized and resized for web display.</p>
                      <p>Original file size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveArtwork}
              disabled={saving || isCompressing || !artworkForm.title}
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