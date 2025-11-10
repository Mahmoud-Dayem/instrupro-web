import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, query, where, getDocs, setDoc, doc, getDoc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getAuth, createUserWithEmailAndPassword, updateProfile, getReactNativePersistence, initializeAuth, signInWithEmailAndPassword } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants'; 
const {
  firebaseApiKey,
  firebaseAuthDomain,
  firebaseProjectId,
  firebaseStorageBucket,
  firebaseMessagingSenderId,
  firebaseAppId,
} = Constants.expoConfig.extra;


const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectId,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId: firebaseAppId,
};

const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication and get a reference to the service

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});


export async function signup({ email, password, displayName, companyId }) {

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Set display name
    await updateProfile(user, {
      displayName: displayName,
    });
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      displayName,
      companyId,
      createdAt: new Date().toISOString(),
      isAdmin:false ,
      isPrivileged:false
    });



    return {
      status: 'ok',
      error: false,
      message: user,
    };
  } catch (error) {
    return {
      status: 'error',
      error: true,
      message: error.message,
    };
  }
}

export async function signin({ email, password }) {

  const auth = getAuth();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    const companyId = docSnap.data().companyId;
    const isAdmin = docSnap.data().isAdmin;
    const isPrivileged = docSnap.data().isPrivileged;
    // await AsyncStorage.setItem("companyId", companyId);

 
    return {
      status: 'ok',
      error: false,
      message: user,
      companyId,
      isAdmin,
      isPrivileged
    };
  } catch (error) {
    return {
      status: 'error',
      error: true,
      message: error.message,
    };
  }
}
export const db = getFirestore(app);

// Firestore → SQLite local DB
const updateLocalTasks = async () => {
  const querySnapshot = await getDocs(collection(db, "PMTasks"));
  const tasks = [];

  querySnapshot.forEach((doc) => {
    tasks.push({ id: doc.id, ...doc.data() });
  });

  // Clear old and insert new into SQLite
  await saveTasksToSQLite(tasks);
};

/* use it to get detailed tasks from firestore */

export const updateDetailedTasks = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "allTasks"));
    const tasks = [];

    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });

    // Save to cache
    await storeData('cached_tasks', tasks);

  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
};


//  updateDetailedTasks();

const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Error saving to storage', e);
  }
};


export const loadData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Failed to load data from cache', e);
    return null;
  }
};


// const cached  = await loadData('cached_tasks');
//
//
//
//
export const updateSpares = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "spares"));
    const spares = [];

    querySnapshot.forEach((doc) => {
      spares.push({ id: doc.id, ...doc.data() });
    });

    // Save to cache
    await storeData('cached_spares', spares);

  } catch (error) {
    console.error("Error fetching spares:", error);
  }
};


//  Load spares from cache();
export const loadSpares = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Failed to load data from cache', e);
    return null;
  }
};
////////////////////////// Load favorites
export const loadFavorites = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Failed to load favorites from cache', e);
    return null;
  }
};

//////////////////// update to favorites
export const storeFavorites = async (key, value) => {

  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Error saving to storage', e);
  }
};

//////////////////


/**
 * Loads the companyId for the current user.
 * 1. Checks AsyncStorage first
 * 2. If not found, fetch from Firestore
 * 3. Cache it in AsyncStorage
 */
export async function loadCompanyId() {
  const auth = getAuth();
 
  try {
    // 1️⃣ Check AsyncStorage first
    const cachedId = await AsyncStorage.getItem("companyId");
    if (cachedId) {
       return cachedId;
    }

    // 2️⃣ Get from Firestore if not cached
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user is signed in");
    }

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("User document not found");
    }

    const companyId = docSnap.data().companyId;
    if (!companyId) {
      throw new Error("companyId is missing in user document");
    }

    // 3️⃣ Save to AsyncStorage for future use
    await AsyncStorage.setItem("companyId", companyId);

     return companyId;
  } catch (error) {
    console.error("Error loading companyId:", error);
    return null;
  }
}
