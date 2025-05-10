import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc 
} from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCVWkpMpy_VeH7QCcSOdCwN3DqRm22Ab2Y",
    authDomain: "ravenscroft-87ebb.firebaseapp.com",
    projectId: "ravenscroft-87ebb",
    storageBucket: "ravenscroft-87ebb.firebasestorage.app",
    messagingSenderId: "856425088130",
    appId: "1:856425088130:web:3e6ce464e8c16701b3e09b",
    measurementId: "G-WYCRQ07SX6"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initializeFirestore() {
  try {
    // Add about page content
    await setDoc(doc(db, "siteContent", "aboutMe"), {
      title: "About Me",
      description: "My journey into jewelry making began over a decade ago when I discovered the meditative joy of working with metals and gemstones. What started as a creative outlet quickly evolved into a passionate pursuit of mastering traditional techniques while developing my unique artistic voice.",
      imageUrl: "https://images.unsplash.com/photo-1613042729592-34cd5fe588e1?auto=format&fit=crop&q=80",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Add sample artwork
    await setDoc(doc(db, "artworks", "sample1"), {
      title: "Golden Twist Earrings",
      description: "Hand-forged gold-filled wire with a gentle twist design and freshwater pearl accents.",
      imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80",
      category: "Earrings",
      isHighlighted: true,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Add sample event
    await setDoc(doc(db, "events", "sample1"), {
      title: "Spring Collection Launch",
      address: "Art Gallery East, 123 Main Street, Portland",
      description: "Join us for the launch of our Spring Collection featuring live music, refreshments, and exclusive first access to new designs.",
      dates: [
        { 
          date: new Date(new Date().getFullYear() + 1, 5, 15), // Next year, June 15th
          time: "6:00 PM - 9:00 PM" 
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log("Successfully initialized Firestore with sample data!");
  } catch (error) {
    console.error("Error initializing Firestore:", error);
  }
}

initializeFirestore();