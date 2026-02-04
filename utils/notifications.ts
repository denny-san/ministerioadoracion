
/**
 * Utility for handling browser notifications in the Youth Ministry Platform.
 * Mimics real push notifications by using the Browser Notification API.
 */

export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        console.log("This browser does not support desktop notification");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
};

export const sendNotification = (title: string, body: string, icon?: string) => {
    if (Notification.permission === "granted") {
        new Notification(title, {
            body,
            icon: icon || "/church-logo.png", // Fallback to a logo if provided
        });
    } else {
        // Fallback for demo purposes if permission not granted
        console.log(`[Notification Simulation] ${title}: ${body}`);
    }
};

// FCM via Backend API (HTTP v1)
// We call our own serverless function which handles the secure communication with Firebase
// This separates client logic from secret keys
const API_URL = '/api/send-notification';

import { collection, getDocs } from 'firebase/firestore';
import { db, COLLECTIONS } from '../firebase';

export const sendPushToAll = async (title: string, body: string) => {
    try {
        // 1. Get all users with FCM tokens
        const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
        const tokensSet = new Set<string>();

        snapshot.forEach(doc => {
            const data = doc.data();
            if (Array.isArray(data.fcmTokens)) {
                data.fcmTokens.forEach((t: string) => tokensSet.add(t));
            } else if (data.fcmToken) {
                tokensSet.add(data.fcmToken);
            }
        });

        const tokens = Array.from(tokensSet);

        if (tokens.length === 0) {
            console.log('No devices registered for push notifications.');
            return;
        }

        console.log(`Sending push to ${tokens.length} devices via API...`);

        // 2. Send to our Backend API (which uses firebase-admin)
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                body,
                tokens
            })
        });

        if (!response.ok) {
            // Note: This might fail locally if 'npm run dev' doesn't support /api functions (needs 'vercel dev')
            console.warn('Backend API call failed. If running locally, you might need "vercel dev" or a backend server.');
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

    } catch (error) {
        console.error('Error sending push notification via API:', error);
    }
};

/**
 * Triggers a personalized notification based on a leader's action.
 * @param leaderName Name of the leader (e.g., Solemny Matos)
 * @param actionType 'song' | 'notice' | 'event'
 * @param contentTitle Title of the content (e.g., 'Rey de Reyes')
 */
export const notifyLeaderAction = (leaderName: string, actionType: 'song' | 'notice' | 'event', contentTitle: string) => {
    let title = "Nueva actualización";
    let body = "";

    switch (actionType) {
        case 'song':
            title = "Nueva Música";
            body = `${leaderName} acaba de subir una nueva música: ${contentTitle}`;
            break;
        case 'notice':
            title = "Nuevo Aviso Oficial";
            body = `${leaderName} acaba de publicar un aviso: ${contentTitle}`;
            break;
        case 'event':
            title = "Nuevo Evento Agendado";
            body = `${leaderName} ha programado un nuevo evento: ${contentTitle}`;
            break;
    }

    // Send local (fallback)
    sendNotification(title, body);

    // Send Push (Real-time)
    sendPushToAll(title, body);
};
