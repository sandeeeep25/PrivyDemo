export default async function handler(req, res) {
	const API_BASE = process.env.API_BASE;
	const FUNCTION_KEY = process.env.FUNCTION_KEY || '';
	if (!API_BASE) return res.status(500).json({ error: 'Missing API_BASE' });

	const incoming = req.url || '/';
	const proxiedPath = incoming.replace(/^\/api\/azure-proxy/, '') || '/';

	// Normalize API_BASE and proxied path to avoid duplicated segments (e.g. /api/api/...)
	const API_BASE_CLEAN = API_BASE.replace(/\/+$/, ''); // remove trailing slash(es)
	let proxiedPathClean = proxiedPath || '/';
	if (!proxiedPathClean.startsWith('/')) proxiedPathClean = '/' + proxiedPathClean;

	let target;
	if (API_BASE_CLEAN.endsWith('/api') && proxiedPathClean.startsWith('/api')) {
		// avoid double '/api' when API_BASE already includes it
		target = API_BASE_CLEAN + proxiedPathClean.replace(/^\/api/, '');
	} else {
		target = API_BASE_CLEAN + proxiedPathClean;
	}

	// append function key if present
	if (FUNCTION_KEY) {
		const sep = target.includes('?') ? '&' : '?';
		target = `${target}${sep}code=${FUNCTION_KEY}`;
	}

	// Log target for debugging in Vercel function logs (without query)
	const targetNoQuery = target.split('?')[0];
	console.log('azure-proxy target:', targetNoQuery);

	// Safe debug mode: if caller adds ?debug=1 to the proxied request, return the computed
	// upstream URL WITHOUT query string so we don't leak function keys. Example:
	// /api/azure-proxy/api/LoginUser?debug=1
	try {
		const reqUrl = new URL(req.url || '/', 'http://localhost');
		if (reqUrl.searchParams.get('debug') === '1') {
			res.status(200).json({ target: targetNoQuery });
			return;
		}
	} catch (e) {
		// ignore parse errors and continue
	}

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

