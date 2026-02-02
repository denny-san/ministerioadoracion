import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// You will need to put your Service Account JSON here or in environment variables
// For Vercel, use process.env.FIREBASE_SERVICE_ACCOUNT
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : null;

if (!getApps().length && serviceAccount) {
    initializeApp({
        credential: cert(serviceAccount)
    });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!serviceAccount) {
        return res.status(500).json({ error: 'Missing Server Configuration (Service Account)' });
    }

    const { title, body, tokens } = req.body;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
        return res.status(400).json({ error: 'No tokens provided' });
    }

    try {
        const message = {
            notification: {
                title,
                body,
            },
            tokens: tokens, // 'multicast' message
            webpush: {
                fcmOptions: {
                    link: '/'
                }
            }
        };

        const response = await getMessaging().sendEachForMulticast(message);

        console.log('Successfully sent message:', response);

        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(tokens[idx]);
                }
            });
            console.log('List of tokens that caused failures: ' + failedTokens);
        }

        return res.status(200).json({ success: true, response });
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({ error: 'Error sending message', details: error.message });
    }
}
