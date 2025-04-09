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

	// Redirect HTTP to HTTPS in production
	if (!dev) {
		server.use((req, res, next) => {
			if (req.secure) {
				// Request is already secure, proceed as normal
				return next();
			}
			// Redirect to the same URL but with HTTPS
			const httpsUrl = `https://${req.headers.host}${req.url}`;
			return res.redirect(301, httpsUrl);
		});
	}

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
