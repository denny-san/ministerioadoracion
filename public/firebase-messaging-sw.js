
// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you are using another hosting provider, you might need to import them from a CDN
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCe29S6ZV7xvvTgR8uzqZewreFFOom7ZwM",
    authDomain: "youth-ministry-fe91a.firebaseapp.com",
    projectId: "youth-ministry-fe91a",
    storageBucket: "youth-ministry-fe91a.firebasestorage.app",
    messagingSenderId: "281326513604",
    appId: "1:281326513604:web:c3e0a3e1a9c563e8164891",
    measurementId: "G-VBHQPK3Z00"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/favicon.ico'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
