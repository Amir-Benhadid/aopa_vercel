const express = require('express');
const next = require('next');

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
	const server = express();

	// ✅ Trust Passenger or any other proxy (needed for HTTPS)
	server.set('trust proxy', true);

	// All requests go through Next.js
	server.all('*', (req, res) => {
		console.log('Host:', req.headers.host);
		console.log('Protocol:', req.protocol);
		return handle(req, res);
	});

	server.listen(port, () => {
		console.log(`> Ready on http://localhost:${port}`);
	});
});
