// src/pages/AboutPage.tsx
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import SectionHeading from '../components/SectionHeading';
import LoadingSpinner from '../components/LoadingSpinner';
import LoadingSection from '../components/LoadingSection';

interface AboutContent {
  title: string;
  description: string;
  imageUrl: {
    original: string;
  };
}

const AboutPage = () => {
  // State for storing the fetched 'About Me' content
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  // State for loading status
  const [loading, setLoading] = useState(true);
  // State for error handling
  const [error, setError] = useState<string | null>(null);
  // State to control visibility during animation
  const [contentVisible, setContentVisible] = useState(false);

  // useEffect hook to fetch data when the component mounts
  useEffect(() => {
    // Asynchronous function to fetch data from Firestore
    const fetchAboutContent = async () => {
      try {
        setLoading(true);
        // Create a document reference to 'siteContent/aboutMe'
        const docRef = doc(db, 'siteContent', 'aboutMe');
        // Fetch the document snapshot
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // If the document exists, set its data to the state
          setAboutContent(docSnap.data() as AboutContent);
        } else {
          // If the document doesn't exist, set an error message
          console.log("No such document!");
          setError("About Me content not found.");
        }
      } catch (err) {
        // If any other error occurs during fetching, set an error message
        console.error("Error fetching document:", err);
        setError("Failed to load About Me content. Please try again later.");
      } finally {
        // Set loading to false once fetching is complete (either success or failure)
        setLoading(false);
      }
    };

    fetchAboutContent(); // Call the fetch function
  }, []); // Empty dependency array means this effect runs once when the component mounts

  // Effect to handle animation after content is loaded
  useEffect(() => {
    if (!loading) {
      // Set a very short timeout to ensure CSS transitions can take effect
      const timer = setTimeout(() => {
        setContentVisible(true);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Override the general section animation with a more controlled approach for this page
  useEffect(() => {
    // Only run this effect if content is visible
    if (!contentVisible) return;

    const sections = document.querySelectorAll('.about-section-animate');
    
    // Apply a staggered animation to each section
    sections.forEach((section, index) => {
      setTimeout(() => {
        section.classList.add('animated');
      }, 100 + index * 150); // Staggered delay
    });

  }, [contentVisible]);

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* --- About Me Section (Dynamic) --- */}
        <SectionHeading
          title="About Me"
          subtitle="My journey, inspiration, and approach to jewelry making"
          className="animated" // Always show the heading
        />
        
        {/* Conditional rendering based on loading and error states */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-10 items-start">
            {/* Skeleton for image */}
            <div className="rounded-xl overflow-hidden aspect-[3/4] bg-gray-200 animate-pulse"></div>
            
            {/* Skeleton for content */}
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 w-1/3 rounded animate-pulse"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 w-full rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 w-full rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 w-5/6 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 w-full rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 w-3/4 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : aboutContent && (
          // The main content
          <div className={`grid md:grid-cols-2 gap-10 items-start transition-opacity duration-500 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="rounded-xl overflow-hidden aspect-[3/4] about-section-animate opacity-0 transform translate-y-4 transition-all duration-500">
              <img 
                src={aboutContent.imageUrl.original || "https://images.unsplash.com/photo-1613042729592-34cd5fe588e1?auto=format&fit=crop&q=80"} // Fallback image
                alt={aboutContent.title || "Portrait of the jewelry artist"} // Alt text from data or fallback
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Failed to load image:', aboutContent.imageUrl.original);
                  e.currentTarget.src = "https://images.unsplash.com/photo-1613042729592-34cd5fe588e1?auto=format&fit=crop&q=80"; // Fallback image
                }}
              />
            </div>
            
            <div className="space-y-6 about-section-animate opacity-0 transform translate-y-4 transition-all duration-500 delay-100">
              <h3 className="text-2xl font-bold text-jewelry-dark">
                {aboutContent.title || "Melissa Collins"} {/* Fallback name */}
              </h3>
              
              <div className="space-y-4 text-jewelry-gray">
                {/* Split the description into paragraphs if it contains newline characters, or render as a single block */}
                {aboutContent.description ? (
                  aboutContent.description.split('\n').map((paragraph, index) => (
                    paragraph.trim() && <p key={index}>{paragraph}</p>
                  ))
                ) : (
                  <p>Default description if none is loaded.</p> // Fallback description
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* --- Studio Section (Static) --- */}
        <div className={`mt-20 about-section-animate opacity-0 transform translate-y-4 transition-all duration-500 delay-200 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}>
          <SectionHeading
            title="My Studio"
            subtitle="Where imagination meets craftsmanship"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-xl overflow-hidden aspect-square shadow-md transition-transform duration-300 hover:scale-[1.02]">
              <img 
                src="https://firebasestorage.googleapis.com/v0/b/ravenscroft-87ebb.firebasestorage.app/o/artworks%2FRings%2F1746905438559_5-25-20%2BMelissa%2BJewelry%2B-%2B1.jpg%2Foriginal?alt=media&token=d494f921-f131-489e-9dad-0dc47b27c556"
                alt="Jewelry studio workbench"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/600x600?text=Studio+Image"; // Fallback image
                }}
              />
            </div>
            <div className="rounded-xl overflow-hidden aspect-square shadow-md transition-transform duration-300 hover:scale-[1.02]">
              <img 
                src="https://firebasestorage.googleapis.com/v0/b/ravenscroft-87ebb.firebasestorage.app/o/artworks%2FRings%2F1746905806939_IMG_1904.jpeg%2Foriginal?alt=media&token=a828f153-a7e6-4db4-a853-77403807134d"
                alt="Tools and materials"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/600x600?text=Studio+Image"; // Fallback image
                }}
              />
            </div>
            <div className="rounded-xl overflow-hidden aspect-square shadow-md transition-transform duration-300 hover:scale-[1.02]">
              <img 
                src="https://firebasestorage.googleapis.com/v0/b/ravenscroft-87ebb.firebasestorage.app/o/artworks%2FRings%2F1746905416243_1-23-23%2BMelissa%2BJewelry%2B-%2B1.jpeg%2Foriginal?alt=media&token=cd304561-845e-4477-b38f-05a29c2bd97b"
                alt="Work in progress"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/600x600?text=Studio+Image"; // Fallback image
                }}
              />
            </div>
          </div>
        </div>
        
        {/* --- Process Section (Static) --- */}
        <div className={`mt-20 about-section-animate opacity-0 transform translate-y-4 transition-all duration-500 delay-300 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}>
          <SectionHeading
            title="My Process"
            subtitle="From concept to creation"
          />
          
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-4 text-jewelry-gray">
              <p>
                My creative process begins with sketching and ideation, often inspired by natural forms, architectural elements, or emotional concepts. From these initial drawings, I refine the design, considering not just aesthetics but also wearability and durability.
              </p>
              
              <p>
                Once a design is finalized, I select the materials—typically recycled precious metals and ethically sourced gemstones—and begin the fabrication process. This involves cutting, forming, soldering, and finishing the metal components, then setting any stones.
              </p>
              
              <p>
                The final steps involve meticulous polishing and quality checks to ensure each piece meets my standards for both beauty and craftsmanship. Only then is it ready to find its home with someone who will treasure it for years to come.
              </p>
            </div>
            
            <div className="rounded-xl overflow-hidden shadow-md">
              <img 
                src="https://firebasestorage.googleapis.com/v0/b/ravenscroft-87ebb.firebasestorage.app/o/artworks%2FRings%2F1746911626483_IMG_7789.jpg%2Foriginal?alt=media&token=38a3e280-d582-4f5d-b0d9-e3a4ea8e7122"
                alt="Creating jewelry at workbench"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/800x600?text=Process+Image"; // Fallback image
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;