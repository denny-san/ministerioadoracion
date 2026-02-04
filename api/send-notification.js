export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const appId = process.env.ONESIGNAL_APP_ID;
    const apiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!appId || !apiKey) {
        return res.status(500).json({ error: 'Missing OneSignal configuration' });
    }

    const { title, body, url, externalIds } = req.body || {};

    if (!title || !body) {
        return res.status(400).json({ error: 'Missing title or body' });
    }

    const payload = {
        app_id: appId,
        headings: { en: title },
        contents: { en: body },
        url: url || '/',
    };

    if (Array.isArray(externalIds) && externalIds.length > 0) {
        payload.include_external_user_ids = externalIds;
    } else {
        payload.included_segments = ['All'];
    }

    try {
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Basic ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: 'OneSignal API error', details: data });
        }

        return res.status(200).json({ success: true, response: data });
    } catch (error) {
        console.error('Error sending OneSignal notification:', error);
        return res.status(500).json({ error: 'Error sending notification', details: error.message });
    }
}
