export default async function handler(req, res) {
	const API_BASE = process.env.API_BASE;
	const FUNCTION_KEY = process.env.FUNCTION_KEY || '';
	if (!API_BASE) return res.status(500).json({ error: 'Missing API_BASE' });

	const incoming = req.url || '/';
	const proxiedPath = incoming.replace(/^\/api\/azure-proxy/, '') || '/';
	const sep = proxiedPath.includes('?') ? '&' : '?';
	const target = FUNCTION_KEY
		? `${API_BASE}${proxiedPath}${sep}code=${FUNCTION_KEY}`
		: `${API_BASE}${proxiedPath}`;

	async function readRawBody(r) {
		return new Promise((resolve, reject) => {
			let data = '';
			r.on('data', (chunk) => (data += chunk));
			r.on('end', () => resolve(data));
			r.on('error', reject);
		});
	}

	try {
		const headers = { ...req.headers };
		delete headers.host;

		const options = { method: req.method, headers };
		if (!['GET', 'HEAD'].includes(req.method)) {
			const raw = req.body && Object.keys(req.body).length ? JSON.stringify(req.body) : await readRawBody(req);
			options.body = raw && raw.length ? raw : undefined;
			if (options.body && !options.headers['content-type']) options.headers['content-type'] = 'application/json';
		}

		const upstream = await fetch(target, options);
		const buf = await upstream.arrayBuffer();
		const contentType = upstream.headers.get('content-type') || '';

		// If upstream returned a non-OK status, convert to JSON message so frontend can handle it safely
		if (!upstream.ok) {
			const text = buf && buf.byteLength ? Buffer.from(buf).toString('utf8') : '';
			res.status(upstream.status).json({ error: 'Upstream error', status: upstream.status, body: text });
			return;
		}

		res.status(upstream.status);
		if (contentType.includes('application/json')) res.setHeader('Content-Type', 'application/json');
		else if (contentType) res.setHeader('Content-Type', contentType);

		// Send raw buffer to preserve JSON or binary responses
		res.send(Buffer.from(buf));
	} catch (err) {
		res.status(502).json({ error: 'Upstream request failed', message: err.message });
	}
}

