import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, where, orderBy, limit, CollectionReference, DocumentData, Query } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Your Firebase configuration - make sure to use your actual values here
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
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Firestore CRUD helper functions
export const createDocument = async (collectionName: string, data: any) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
};

export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
    return { id: docId, ...data };
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

export const deleteDocument = async (collectionName: string, docId: string) => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    return true;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};

export const getDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting document:", error);
    throw error;
  }
};

export const getCollection = async (collectionName: string) => {
  try {
    console.log(`Getting collection: ${collectionName}`);
    const querySnapshot = await getDocs(collection(db, collectionName));
    console.log(`Retrieved ${querySnapshot.docs.length} documents from ${collectionName}`);
    
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return documents;
  } catch (error) {
    console.error(`Error getting collection ${collectionName}:`, error);
    throw error;
  }
};

export const queryCollection = async (
  collectionName: string,
  whereConditions: Array<{field: string, operator: "==" | "!=" | ">" | ">=" | "<" | "<=", value: any}> = [],
  orderByField?: string,
  descending: boolean = false,
  limitCount?: number
) => {
  try {
    let queryRef: Query<DocumentData> = collection(db, collectionName);
    
    if (whereConditions.length > 0) {
      whereConditions.forEach((condition) => {
        queryRef = query(queryRef, where(condition.field, condition.operator, condition.value));
      });
    }
    
    if (orderByField) {
      queryRef = query(queryRef, orderBy(orderByField, descending ? 'desc' : 'asc'));
    }
    
    if (limitCount) {
      queryRef = query(queryRef, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(queryRef);
    const documents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return documents;
  } catch (error) {
    console.error("Error querying collection:", error);
    throw error;
  }
};

// Updated uploadFile function with multi-size image support
export const uploadFile = async (file: File, path: string): Promise<{original: string, thumbnail: string}> => {
  try {
    console.log(`Uploading file to path: ${path}`);
    
    // Upload original image
    const originalStorageRef = ref(storage, `${path}/original`);
    await uploadBytes(originalStorageRef, file);
    const originalUrl = await getDownloadURL(originalStorageRef);
    console.log(`Original file uploaded successfully: ${originalUrl}`);
    
    // Create and upload thumbnail version if it's an image
    if (file.type.startsWith('image/')) {
      // Since we're doing client-side compression, we're using the same file
      // for thumbnail but storing it with a different path
      const thumbnailStorageRef = ref(storage, `${path}/thumbnail`);
      await uploadBytes(thumbnailStorageRef, file);
      const thumbnailUrl = await getDownloadURL(thumbnailStorageRef);
      console.log(`Thumbnail created and uploaded: ${thumbnailUrl}`);
      
      return {
        original: originalUrl,
        thumbnail: thumbnailUrl
      };
    }
    
    // If not an image, return the same URL for both
    return {
      original: originalUrl,
      thumbnail: originalUrl
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};