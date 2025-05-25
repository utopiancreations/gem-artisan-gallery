
import { useState, useEffect } from 'react';
import { User, Save, Upload, Image } from 'lucide-react';
import { getDocument, updateDocument, uploadFile } from '../../lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface AboutData {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
}

const AdminAboutEdit = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aboutData, setAboutData] = useState<AboutData>({
    id: 'aboutMe',
    title: '',
    description: '',
    imageUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      const data = await getDocument('siteContent', 'aboutMe');
      if (data) {
        const typedData = data as AboutData;
        setAboutData(typedData);
        if (typedData.imageUrl) {
          setImagePreview(typedData.imageUrl);
        }
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

  const handleSave = async () => {
    setSaving(true);
    try {
      let imageUrl = aboutData.imageUrl;
      
      if (selectedFile) {
        const uploadResult = await uploadFile(selectedFile, `about/profile-${Date.now()}`);
        imageUrl = uploadResult.original;
      }

      const updatedData = {
        ...aboutData,
        imageUrl
      };

      await updateDocument('siteContent', 'aboutMe', updatedData);
      setAboutData(updatedData);
      setSelectedFile(null);
      
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
      <div className="space-y-6">
        <div className="flex items-center">
          <Skeleton className="h-6 w-6 mr-2" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <User size={22} className="mr-2" />
        <h1 className="text-2xl font-bold">Edit About Me Page</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>About Page Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="title">Page Title</Label>
            <Input
              id="title"
              value={aboutData.title}
              onChange={(e) => setAboutData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="About Melissa Zahm"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={aboutData.description}
              onChange={(e) => setAboutData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Tell your story..."
              rows={8}
            />
          </div>

          <div>
            <Label htmlFor="photo">Primary Photo</Label>
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
              >
                <Upload size={16} className="mr-2" />
                Choose Photo
              </Button>
            </div>
            
            {imagePreview && (
              <div className="mt-4">
                <div className="relative w-64 h-64 rounded-lg overflow-hidden border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  {selectedFile && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                        New Image
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Button 
            onClick={handleSave}
            disabled={saving || !aboutData.title || !aboutData.description}
            className="flex items-center"
          >
            <Save size={16} className="mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAboutEdit;
