# EmailServiceNg

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Docker

The image builds the app and serves it with nginx, which also proxies `/api`
to the email-service backend (like `proxy.conf.json` does in development), so
the browser only ever talks to one origin and no CORS setup is needed.

```bash
# Backend first (creates the Docker network email-service_default)
cd ../email-service && npm run services:up

# Dashboard on http://localhost:8080
cd ../email-service-ng && docker compose up -d --build
```

| Variable | Default | Meaning |
|---|---|---|
| `API_UPSTREAM` | `http://app:3000` | Where `/api` goes. Use `http://host.docker.internal:3000` for a backend running on the host. |
| `API_TIMEOUT` | `60s` | Read/send timeout for API calls. |
| `WEB_PORT` | `8080` | Host port (Compose only; bound to 127.0.0.1). |
| `BACKEND_NETWORK` | `email-service_default` | Docker network shared with the backend (Compose only). |

Files: `Dockerfile`, `nginx/default.conf.template` (SPA routing, `/api` proxy,
caching, gzip, `/healthz`), `nginx/security-headers.conf`.

Caching: hashed JS/CSS for a year, `index.html` never (deploys show up at
once), logos and fonts for a day, API responses never.

In production, put HTTPS in front (host nginx, Caddy or a load balancer) and
add HSTS there. If that proxy sits in front of this container, the backend
sees two proxy hops: set its `trust proxy` to 2 (or forward the real client IP)
so login rate limiting stays per user rather than per proxy.
