
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
};

