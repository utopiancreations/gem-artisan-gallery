
import { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Save, Upload } from 'lucide-react';
import { getDocument, updateDocument, uploadFile } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

interface AboutData {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
}

const AdminAboutEdit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [about, setAbout] = useState<AboutData>({
    title: '',
    description: '',
    imageUrl: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const aboutData = await getDocument('siteContent', 'aboutMe');
        if (aboutData) {
          setAbout(aboutData as AboutData);
          setPreviewUrl(aboutData.imageUrl);
        }
      } catch (error) {
        console.error('Error fetching about data:', error);
        toast({
          title: "Error",
          description: "Failed to load about page data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, [toast]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let imageUrl = about.imageUrl;
      
      // Upload new image if selected
      if (file) {
        const timestamp = new Date().getTime();
        const path = `about/${timestamp}_${file.name}`;
        imageUrl = await uploadFile(file, path);
      }
      
      // Update Firestore document
      await updateDocument('siteContent', 'aboutMe', {
        ...about,
        imageUrl
      });
      
      toast({
        title: "Success",
        description: "About page updated successfully!",
      });
    } catch (error) {
      console.error('Error saving about data:', error);
      toast({
        title: "Error",
        description: "Failed to save changes.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-10 w-1/4" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Edit size={22} className="mr-2" />
          Edit About Page
        </h1>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center"
        >
          <Save size={18} className="mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>About Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Page Title
            </label>
            <Input
              id="title"
              value={about.title}
              onChange={(e) => setAbout(prev => ({ ...prev, title: e.target.value }))}
              placeholder="About Me"
              className="max-w-md"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea
              id="description"
              value={about.description}
              onChange={(e) => setAbout(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Write about yourself, your journey, your craftsmanship..."
              rows={8}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Primary Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Upload Image
              </label>
              <div className="flex items-center space-x-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="flex items-center"
                >
                  <Upload size={16} className="mr-2" />
                  Select Image
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <span className="text-sm text-muted-foreground">
                  {file ? file.name : 'No file selected'}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Recommended: High resolution, landscape orientation.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Image Preview
              </label>
              {previewUrl ? (
                <div className="border rounded-md overflow-hidden aspect-square max-w-xs">
                  <img 
                    src={previewUrl} 
                    alt="About me preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="border border-dashed rounded-md bg-muted p-8 text-center text-muted-foreground max-w-xs">
                  No image selected
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAboutEdit;
