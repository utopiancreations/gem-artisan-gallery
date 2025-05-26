
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Removed Navigate

// Public Pages
import PublicLayout from "./layouts/PublicLayout";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import EventsPage from "./pages/EventsPage";
import ContactPage from "./pages/ContactPage";
import GalleryPage from "./pages/GalleryPage";
import ArtworkDetailPage from "./pages/ArtworkDetailPage";

// Admin Pages
import LoginPage from "./pages/admin/LoginPage";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminAboutEdit from "./pages/admin/AdminAboutEdit";
import AdminArtworks from "./pages/admin/AdminArtworks";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminContactSubmissions from "./pages/admin/AdminContactSubmissions";
import AdminNewsletterSubscribers from "./pages/admin/AdminNewsletterSubscribers";
import AdminNewsletter from "./components/admin/AdminNewsletter";

// Not Found Page
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/artwork/:id" element={<ArtworkDetailPage />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="about" element={<AdminAboutEdit />} />
            <Route path="artworks" element={<AdminArtworks />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="contact" element={<AdminContactSubmissions />} />
            <Route path="subscribers" element={<AdminNewsletterSubscribers />} />
            <Route path="newsletter-stats" element={<AdminNewsletter />} />
          </Route>
          
          {/* Catch-all Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
