/**
 * Utility for handling notifications in the Youth Ministry Platform.
 * Uses OneSignal for real push + Browser Notification API as local fallback.
 */

const API_URL = '/api/send-notification';

declare global {
    interface Window { OneSignalDeferred?: any[]; }
}

const withOneSignal = (callback: (OneSignal: any) => void) => {
    if (typeof window === 'undefined') return;
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(callback);
};

export const requestNotificationPermission = async () => {
    if (typeof window === 'undefined') return false;

    return new Promise<boolean>((resolve) => {
        withOneSignal(async (OneSignal) => {
            try {
                const permission = await OneSignal.Notifications.requestPermission();
                resolve(permission === 'granted' || permission === true);
            } catch (e) {
                console.error('OneSignal permission error:', e);
                resolve(false);
            }
        });
    });
};

export const setOneSignalUser = async (externalId: string) => {
    if (!externalId) return;
    withOneSignal(async (OneSignal) => {
        try {
            await OneSignal.login(externalId);
        } catch (e) {
            console.error('OneSignal login error:', e);
        }
    });
};

export const clearOneSignalUser = async () => {
    withOneSignal(async (OneSignal) => {
        try {
            await OneSignal.logout();
        } catch (e) {
            console.error('OneSignal logout error:', e);
        }
    });
};

export const sendNotification = (title: string, body: string, icon?: string) => {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: icon || '/church-logo.png',
        });
    } else {
        console.log(`[Notification Simulation] ${title}: ${body}`);
    }
};

export const sendPushToAll = async (title: string, body: string) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, body })
        });

        if (!response.ok) {
            console.warn('Backend API call failed. If running locally, you might need "vercel dev".');
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
 */
export const notifyLeaderAction = (leaderName: string, actionType: 'song' | 'notice' | 'event', contentTitle: string) => {
    let title = 'Nueva actualización';
    let body = '';

    switch (actionType) {
        case 'song':
            title = 'Nueva Música';
            body = `${leaderName} acaba de subir una nueva música: ${contentTitle}`;
            break;
        case 'notice':
            title = 'Nuevo Aviso Oficial';
            body = `${leaderName} acaba de publicar un aviso: ${contentTitle}`;
            break;
        case 'event':
            title = 'Nuevo Evento Agendado';
            body = `${leaderName} ha programado un nuevo evento: ${contentTitle}`;
            break;
    }

    // Local fallback
    sendNotification(title, body);

    // Push
    sendPushToAll(title, body);
};
