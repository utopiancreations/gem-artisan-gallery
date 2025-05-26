// src/components/admin/AdminNewsletter.tsx
import { useState, useEffect } from 'react';
import { getFunctions, httpsCallable, HttpsCallableError } from 'firebase/functions'; // Added HttpsCallableError
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from '../LoadingSpinner';

// Define an interface for the stats data expected from the function
interface MailchimpStats {
  success: boolean;
  member_count?: number;
  total_contacts?: number;
  unsubscribe_count?: number;
  cleaned_count?: number;
  campaign_count?: number;
  avg_sub_rate?: number;
  avg_unsub_rate?: number;
  message?: string;
}

const AdminNewsletter = () => {
  const [stats, setStats] = useState<MailchimpStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const firebaseFunctions = getFunctions();
        const getMailchimpStatsFunction = httpsCallable<void, MailchimpStats>(firebaseFunctions, 'getMailchimpStats');
        
        const result = await getMailchimpStatsFunction();
        
        if (result.data.success) {
          setStats(result.data);
        } else {
          throw new Error(result.data.message || 'Failed to fetch stats, success was false.');
        }
      } catch (err) {
        console.error('Failed to fetch newsletter stats:', err);
        let errorMessage = 'An unknown error occurred while fetching stats.';
        if (err instanceof HttpsCallableError) {
          errorMessage = err.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        toast({
          title: "Error Fetching Stats",
          description: errorMessage,
          variant: "destructive",
        });
        setStats(null); // Clear any previous stats
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
        Newsletter Management (Mailchimp)
      </h2>
      
      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <LoadingSpinner text="Loading Mailchimp stats..." />
        </div>
      )}

      {error && !isLoading && (
        <div className="text-red-600 bg-red-50 p-4 rounded-md">
          <h3 className="font-semibold">Failed to load statistics:</h3>
          <p>{error}</p>
          <p className="mt-2 text-sm">
            Ensure you are logged in as an admin and that the Mailchimp Firebase Function is correctly configured with API keys.
          </p>
        </div>
      )}

      {!isLoading && !error && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Total Subscribers" value={stats.member_count} />
          <StatCard title="Total Contacts" value={stats.total_contacts} />
          <StatCard title="Unsubscribe Count" value={stats.unsubscribe_count} />
          <StatCard title="Cleaned Count" value={stats.cleaned_count} />
          <StatCard title="Campaigns" value={stats.campaign_count} />
          <StatCard title="Avg. Subscription Rate" value={stats.avg_sub_rate ? `${(stats.avg_sub_rate * 100).toFixed(2)}%` : undefined} />
          <StatCard title="Avg. Unsubscribe Rate" value={stats.avg_unsub_rate ? `${(stats.avg_unsub_rate * 100).toFixed(2)}%` : undefined} />
        </div>
      )}
      
      {!isLoading && !error && !stats && (
        <div className="text-center text-gray-500 py-10">
          No statistics available or loaded.
        </div>
      )}
    </div>
  );
};

// Helper component for displaying individual stats
const StatCard = ({ title, value }: { title: string; value?: number | string }) => {
  if (value === undefined || value === null) {
    // Render it as N/A
    return (
      <div className="bg-gray-50 p-4 rounded-lg shadow">
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        <p className="text-2xl font-bold text-gray-400">N/A</p>
      </div>
    );
  }
  return (
    <div className="bg-gray-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <h4 className="text-md font-semibold text-gray-600 mb-1">{title}</h4>
      <p className="text-3xl font-bold text-jewelry-dark">
        {value}
      </p>
    </div>
  );
};

export default AdminNewsletter;
