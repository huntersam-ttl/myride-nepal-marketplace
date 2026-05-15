// Vercel serverless function — wraps the TanStack Start Cloudflare Worker handler
// The worker uses Web Fetch APIs (Request/Response) which Node 18+ supports natively.

export const config = { runtime: "nodejs18.x" };

export default async function handler(req, res) {
  // Lazy-import so the built bundle is resolved at request time (after npm run build)
  const mod = await import("../dist/server/index.js");
  const worker = mod.default;

  const protocol = req.headers["x-forwarded-proto"] ?? "https";
  const host = req.headers.host ?? "localhost";
  const url = new URL(req.url, `${protocol}://${host}`);

  // Collect body for non-GET/HEAD requests
  let bodyInit = undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    bodyInit = await new Promise((resolve) => {
      const chunks = [];
      req.on("data", (c) => chunks.push(c));
      req.on("end", () => resolve(Buffer.concat(chunks)));
    });
  }

  const webRequest = new Request(url.toString(), {
    method: req.method,
    headers: Object.fromEntries(
      Object.entries(req.headers).filter(([, v]) => v !== undefined)
    ),
    body: bodyInit,
  });

  let webResponse;
  try {
    webResponse = await worker.fetch(webRequest, {}, { waitUntil: () => {} });
  } catch (err) {
    console.error("SSR error:", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
    return;
  }

  res.statusCode = webResponse.status;
  for (const [key, value] of webResponse.headers.entries()) {
    res.setHeader(key, value);
  }

  const buf = Buffer.from(await webResponse.arrayBuffer());
  res.end(buf);
}
