
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// REPLACE WITH YOUR ACTUAL FIREBASE CONFIG FROM CONSOLE
// https://console.firebase.google.com/
const firebaseConfig = {
    apiKey: "AIzaSyCe29S6ZV7xvvTgR8uzqZewreFFOom7ZwM",
    authDomain: "youth-ministry-fe91a.firebaseapp.com",
    projectId: "youth-ministry-fe91a",
    storageBucket: "youth-ministry-fe91a.firebasestorage.app",
    messagingSenderId: "281326513604",
    appId: "1:281326513604:web:c3e0a3e1a9c563e8164891",
    measurementId: "G-VBHQPK3Z00"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const messaging = getMessaging(app);

// Collection helper
export const COLLECTIONS = {
    SONGS: 'songs',
    NOTICES: 'notices',
    EVENTS: 'events',
    USERS: 'users',
    MEMBERS: 'members',
    NOTIFICATIONS: 'notifications'
};

// Real-time synchronization helper
export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void) => {
    const q = query(collection(db, collectionName), orderBy('timestamp', 'desc'));
    if (collectionName === 'events') {
        // Events might need special ordering by date
        return onSnapshot(collection(db, collectionName), (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(items);
        });
    }

    return onSnapshot(collection(db, collectionName), (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(items);
    });
};

// Push Notifications Setup
export const requestPushPermission = async () => {
    try {
        const supported = await isSupported();
        if (!supported) {
            console.log('Push messaging is not supported in this browser.');
            return null;
        }

        if (!('serviceWorker' in navigator)) {
            console.log('Service workers are not supported in this browser.');
            return null;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            const token = await getToken(messaging, {
                vapidKey: 'BF-vKjfzI9U4eSe2LUZ7MXB2Dzd02IRGeJssbHB8V1NhtD8MvqBSRr2wJ6Tj3kzhRuxH7HZKHsyVBFyA5l0rRfA',
                serviceWorkerRegistration: swRegistration
            });
            console.log('FCM Token:', token);
            return token;
        }
    } catch (error) {
        console.error('Error getting push permission', error);
    }
    return null;
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    });
