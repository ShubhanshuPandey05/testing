const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode-terminal');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const cors = require('cors')

const app = express();
const port = 3000;

app.use(cors());

// Middleware
app.use(express.json());

// Initialize WhatsApp Web Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
});

// Display QR Code for First-time Login
app.get('/start', async (req, res) => {
    client.once('qr', (qr) => {
        console.log('Scan the QR code below to log in:', qr);
        qrcode.generate(qr, { small: true });
        res.json({ qrCodeUrl: qr });
    });

    // Optionally, you can also ensure client is initialized here
    if (!client.info) {
        client.initialize();
    }
});


// Confirm when Bot is Ready
client.on('ready', () => {
    console.log('✅ WhatsApp bot is ready!');
});

// // Handle Incoming Messages
// client.on('message', async (message) => {
//     console.log(`📩 Message from ${message.from}: ${message.body}`);
//     if (message.body === '!sendfile') {
//         // Load the file from local storage
//         const media = MessageMedia.fromFilePath('./files/sample.pdf'); // Change path

//         // Send the file
//         client.sendMessage(msg.from, media, { caption: 'Here is your file 📄' });
//     }

//     if (message.body.toLowerCase() === 'hi') {
//         await client.sendMessage(message.from, 'Hello! How can I assist you?');
//     }
// });

// API Route to Send a Message
app.post('/send-message', async (req, res) => {
    const { number, message } = req.body;

    if (!number || !message) {
        return res.status(400).json({ error: 'Missing number or message' });
    }

    try {
        const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
        await client.sendMessage(chatId, message);
        res.json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message', details: error.message });
    }
});










/**
 * 📌 1. Send a text message
 * Endpoint: POST /send-message
 * Body: { "number": "919876543210", "message": "Hello from bot!" }
 */
app.post('/send-message', async (req, res) => {
    const { number, message } = req.body;
    if (!number || !message) return res.status(400).send('Missing number or message');

    try {
        await client.sendMessage(number + '@c.us', message);
        res.send('📨 Message sent successfully!');
    } catch (error) {
        res.status(500).send('❌ Error sending message');
    }
});

/**
 * 📌 Send an image via file upload
 * Endpoint: POST /send-image
 * Form Data: { "number": "919876543210", "caption": "Check this out!", "file": [upload file] }
 */
app.post('/send-image', upload.single('file'), async (req, res) => {
    const { number, caption } = req.body;
    if (!number || !req.file) return res.status(400).send('Missing number or file');

    try {
        const media = MessageMedia.fromFilePath(req.file.path);
        await client.sendMessage(number + '@c.us', media, { caption: caption || '' });

        // Delete uploaded file after sending
        fs.unlinkSync(req.file.path);

        res.send('📷 Image sent successfully!');
    } catch (error) {
        res.status(500).send('❌ Error sending image');
    }
});

/**
 * 📌 Send a document via file upload
 * Endpoint: POST /send-document
 * Form Data: { "number": "919876543210", "file": [upload file] }
 */
app.post('/send-document', upload.single('file'), async (req, res) => {
    const { number } = req.body;
    if (!number || !req.file) return res.status(400).send('Missing number or file');

    try {
        const media = MessageMedia.fromFilePath(req.file.path);
        await client.sendMessage(number + '@c.us', media);

        // Delete uploaded file after sending
        fs.unlinkSync(req.file.path);

        res.send('📄 Document sent successfully!');
    } catch (error) {
        res.status(500).send('❌ Error sending document');
    }
});

/**
 * 📌 5. Send a file from a URL
 * Endpoint: POST /send-file-url
 * Body: { "number": "919876543210", "fileUrl": "https://example.com/sample.pdf" }
 */
app.post('/send-file-url', async (req, res) => {
    const { number, fileUrl } = req.body;
    if (!number || !fileUrl) return res.status(400).send('Missing number or fileUrl');

    try {
        const media = await MessageMedia.fromUrl(fileUrl);
        await client.sendMessage(number + '@c.us', media);
        res.send('🌍 File sent successfully from URL!');
    } catch (error) {
        res.status(500).send('❌ Error sending file from URL');
    }
});













// Start Express Server
app.listen(port, () => {
    console.log(`📡 Server is running on http://localhost:${port}`);
});

// Initialize WhatsApp Client
client.initialize();
