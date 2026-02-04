# API client

This folder contains small wrappers for calling the real backend.

Environment variables (Vite):

- `VITE_API_BASE` — API base URL (include trailing `/api/` part if desired).
- `VITE_API_KEY` — API key to send with `x-api-key` header.

Local/testing: set `VITE_API_BASE` to `https://localhost:7094/api/` (see `.env.development`).
Production: set `VITE_API_BASE` to the Azure URL or configure these environment variables in Vercel.

Example usage in the app:

```ts
import { login } from "./api/auth";

await login({ email: "me@example.com", password: "secret" });
```

Notes:

- Do not commit real secrets to the repo. Prefer configuring `VITE_API_KEY` in your CI/hosting provider (Vercel) or use a local `.env` that is ignored by git.
- The client uses the `x-api-key` header when `VITE_API_KEY` is present.
