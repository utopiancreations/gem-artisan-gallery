
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Image, Calendar, User, Mail } from 'lucide-react';
import { getCollection } from '../../lib/firebase';
import { ArtworkType } from '../ArtworkCard';
import { EventType } from '../EventItem';
import { isPastEvent } from '../../lib/dateUtils';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalArtworks: 0,
    upcomingEvents: 0,
    contactMessages: 0,
    subscribers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // For demo, we're using static data
        // In production, replace with actual data fetching
        
        const demoStats = {
          totalArtworks: 12,
          upcomingEvents: 3,
          contactMessages: 8,
          subscribers: 45
        };
        
        setStats(demoStats);
        
        // In production, use code like this instead:
        /*
        // Get artworks count
        const artworks = await getCollection('artworks') as ArtworkType[];
        
        // Get events and count upcoming ones
        const events = await getCollection('events') as EventType[];
        const upcomingEventsCount = events.filter(event => !isPastEvent(event)).length;
        
        // Get contact messages count
        const messages = await getCollection('contactSubmissions');
        
        // Get newsletter subscribers count
        const subscribers = await getCollection('newsletter');
        
        setStats({
          totalArtworks: artworks.length,
          upcomingEvents: upcomingEventsCount,
          contactMessages: messages.length,
          subscribers: subscribers.length
        });
        */
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  
  const dashboardItems = [
    {
      title: 'Artworks',
      value: stats.totalArtworks,
      icon: Image,
      color: 'bg-blue-50 text-blue-600',
      link: '/admin/artworks'
    },
    {
      title: 'Upcoming Events',
      value: stats.upcomingEvents,
      icon: Calendar,
      color: 'bg-green-50 text-green-600',
      link: '/admin/events'
    },
    {
      title: 'Contact Messages',
      value: stats.contactMessages,
      icon: Mail,
      color: 'bg-purple-50 text-purple-600',
      link: '/admin/messages'
    },
    {
      title: 'Newsletter Subscribers',
      value: stats.subscribers,
      icon: User,
      color: 'bg-amber-50 text-amber-600',
      link: '/admin/subscribers'
    }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-jewelry-dark mb-6">Dashboard</h1>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-5 w-24 bg-gray-200 mb-2"></div>
              <div className="h-8 w-16 bg-gray-300"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardItems.map((item) => (
            <Link
              key={item.title}
              to={item.link}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${item.color} mb-4`}>
                <item.icon size={24} />
              </div>
              <h3 className="text-jewelry-gray font-medium mb-1">{item.title}</h3>
              <p className="text-3xl font-bold text-jewelry-dark">{item.value}</p>
            </Link>
          ))}
        </div>
      )}
      
      <div className="mt-10">
        <h2 className="text-xl font-bold text-jewelry-dark mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/artworks/new"
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-blue-500"
          >
            <h3 className="font-semibold text-jewelry-dark mb-2">Add New Artwork</h3>
            <p className="text-sm text-jewelry-gray">Upload and publish a new jewelry piece to your collection.</p>
          </Link>
          
          <Link
            to="/admin/events/new"
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-green-500"
          >
            <h3 className="font-semibold text-jewelry-dark mb-2">Create New Event</h3>
            <p className="text-sm text-jewelry-gray">Schedule and publish a new exhibition or workshop.</p>
          </Link>
          
          <Link
            to="/admin/about"
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-purple-500"
          >
            <h3 className="font-semibold text-jewelry-dark mb-2">Update About Page</h3>
            <p className="text-sm text-jewelry-gray">Refresh your bio, profile picture, or studio information.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
