
import { useState, useEffect } from 'react';
import { Star, AlertTriangle } from 'lucide-react';
import { getCollection, updateDocument } from '../../lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ArtworkType {
  id: string;
  title: string;
  imageUrl: string;
  isFeatured: boolean;
}

const AdminArtworkFeaturedManager = () => {
  const { toast } = useToast();
  const [artworks, setArtworks] = useState<ArtworkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [featuredArtwork, setFeaturedArtwork] = useState<ArtworkType | null>(null);

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      const result = await getCollection('artworks');
      
      if (result && Array.isArray(result)) {
        const processedArtworks: ArtworkType[] = result.map((artwork: any) => ({
          id: String(artwork.id || ''),
          title: String(artwork.title || 'Untitled'),
          imageUrl: String(artwork.imageUrl || ''),
          isFeatured: Boolean(artwork.isFeatured),
        }));
        
        setArtworks(processedArtworks);
        
        // Find currently featured artwork
        const featured = processedArtworks.find(artwork => artwork.isFeatured);
        setFeaturedArtwork(featured || null);
      }
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

  const handleSetFeatured = async (artworkId: string) => {
    setUpdating(artworkId);
    
    try {
      // First, unfeature the currently featured artwork if it exists
      if (featuredArtwork && featuredArtwork.id !== artworkId) {
        await updateDocument('artworks', featuredArtwork.id, { isFeatured: false });
      }
      
      // Then feature the selected artwork
      await updateDocument('artworks', artworkId, { isFeatured: true });
      
      toast({
        title: "Success",
        description: "Featured artwork updated successfully!",
      });
      
      // Refresh the list
      fetchArtworks();
      
    } catch (error) {
      console.error('Error updating featured artwork:', error);
      toast({
        title: "Error",
        description: "Failed to update featured artwork.",
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveFeatured = async () => {
    if (!featuredArtwork) return;
    
    setUpdating(featuredArtwork.id);
    
    try {
      await updateDocument('artworks', featuredArtwork.id, { isFeatured: false });
      
      toast({
        title: "Success",
        description: "Featured artwork removed successfully!",
      });
      
      fetchArtworks();
      
    } catch (error) {
      console.error('Error removing featured artwork:', error);
      toast({
        title: "Error",
        description: "Failed to remove featured artwork.",
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star size={20} className="mr-2" />
            Featured Artwork Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Star size={20} className="mr-2" />
          Featured Artwork Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Only one artwork can be featured at a time. Setting a new featured artwork will automatically unfeature the previous one.
          </AlertDescription>
        </Alert>

        {featuredArtwork ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Currently Featured:</h4>
            <div className="flex items-center space-x-4">
              <img 
                src={featuredArtwork.imageUrl} 
                alt={featuredArtwork.title}
                className="w-16 h-16 object-cover rounded-md"
              />
              <div className="flex-1">
                <p className="font-medium">{featuredArtwork.title}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRemoveFeatured}
                disabled={updating === featuredArtwork.id}
              >
                {updating === featuredArtwork.id ? 'Removing...' : 'Remove Featured'}
              </Button>
            </div>
          </div>
        ) : (
          <Alert>
            <AlertDescription>
              No artwork is currently featured. Select one from the list below.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <h4 className="font-medium">Available Artworks:</h4>
          <div className="grid gap-2 max-h-64 overflow-y-auto">
            {artworks.filter(artwork => !artwork.isFeatured).map(artwork => (
              <div key={artwork.id} className="flex items-center space-x-4 p-2 border rounded-md hover:bg-gray-50">
                <img 
                  src={artwork.imageUrl} 
                  alt={artwork.title}
                  className="w-12 h-12 object-cover rounded-md"
                />
                <div className="flex-1">
                  <p className="font-medium">{artwork.title}</p>
                </div>
                <Button 
                  size="sm"
                  onClick={() => handleSetFeatured(artwork.id)}
                  disabled={updating === artwork.id}
                >
                  {updating === artwork.id ? 'Setting...' : 'Set Featured'}
                </Button>
              </div>
            ))}
            {artworks.filter(artwork => !artwork.isFeatured).length === 0 && (
              <p className="text-gray-500 text-center py-4">No other artworks available to feature.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminArtworkFeaturedManager;
