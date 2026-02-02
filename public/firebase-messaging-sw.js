importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
    apiKey: "AIzaSyCe29S6ZV7xvvTgR8uzqZewreFFOom7ZwM",
    authDomain: "youth-ministry-fe91a.firebaseapp.com",
    projectId: "youth-ministry-fe91a",
    storageBucket: "youth-ministry-fe91a.firebasestorage.app",
    messagingSenderId: "281326513604",
    appId: "1:281326513604:web:c3e0a3e1a9c563e8164891",
    measurementId: "G-VBHQPK3Z00"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/vite.svg', // Verify if this icon exists, fallback to default
        badge: '/vite.svg'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
