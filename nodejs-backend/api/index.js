const express = require('express');
const cors = require('cors');
// const https = require('https'); // No longer needed for Vercel
// const fs = require('fs'); // No longer needed for Vercel

const app = express();
// const HTTPS_PORT = 3443; // No longer needed for Vercel
const PORT = 3000; // Vercel will handle the actual port

// In-memory storage for participants (WARNING: This will reset with each serverless function invocation)
const participants = [];

app.use(cors());
app.use(express.json()); // To parse JSON request bodies

// Endpoint to receive participant data (POST)
app.post('/api/participants', (req, res) => {
	const { name, email, score, timeTaken } = req.body || {};

	const isNonEmptyString = (val) => typeof val === 'string' && val.trim().length > 0 && val.trim().length <= 200;
	const isValidEmail = (val) => typeof val === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
	const isFiniteNumber = (val) => Number.isFinite(Number(val));

	if (!isNonEmptyString(name) || !isValidEmail(email)) {
		return res.status(400).json({ message: 'Invalid name or email' });
	}
	if (!isFiniteNumber(score) || !isFiniteNumber(timeTaken)) {
		return res.status(400).json({ message: 'Invalid score or timeTaken' });
	}

	const participantData = {
		name: name.trim(),
		email: email.trim().toLowerCase(),
		score: Number(score),
		timeTaken: Number(timeTaken),
		timestamp: new Date()
	};
	participants.push(participantData);
	console.log(`Received participant data: Name: ${participantData.name}, Email: ${participantData.email}, Score: ${participantData.score}, Time Taken: ${participantData.timeTaken} seconds`);
	console.log(`Current participants count: ${participants.length}`);
	res.status(200).json({ message: 'Participant data received successfully!', data: participantData });
});

// Endpoint to get all participant data (GET)
app.get('/api/participants', (req, res) => {
	const apiKey = req.headers['x-api-key'] || req.query.key;
	if (!process.env.API_KEY || apiKey !== process.env.API_KEY) {
		return res.status(403).json({ message: 'Forbidden' });
	}
	res.status(200).json(participants);
});

// Public summary endpoint: name, email, timeTaken (and timestamp)
app.get('/api/participants/summary', (req, res) => {
	const summary = participants.map((p) => ({ name: p.name, email: p.email, timeTaken: p.timeTaken, timestamp: p.timestamp }));
	res.status(200).json(summary);
});

// // Load SSL/TLS certificates (No longer needed for Vercel)
// const sslOptions = {
//     key: fs.readFileSync('../key.pem'), 
//     cert: fs.readFileSync('../cert.pem') 
// };

// // Create an HTTPS server (No longer needed for Vercel)
// const httpsServer = https.createServer(sslOptions, app);

// // Make the server listen on all network interfaces for HTTPS (No longer needed for Vercel)
// httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
//     console.log(`Node.js Backend listening on HTTPS port ${HTTPS_PORT} on all network interfaces.`);
// });

// Export the app for Vercel to use as a serverless function
module.exports = app;

