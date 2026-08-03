# Backend Cloud Deployment

The backend is ready to deploy as a Dockerized Spring Boot service.

## Required Environment Variables

Set these variables in the cloud backend service:

```text
DB_URL=jdbc:mysql://<host>:<port>/<database>?useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USERNAME=<mysql-user>
DB_PASSWORD=<mysql-password>
JWT_SECRET=<long-random-secret-at-least-32-characters>
FRONTEND_URL=https://chunyen1109.github.io
CORS_ALLOWED_ORIGINS=https://chunyen1109.github.io
JPA_DDL_AUTO=update
JPA_SHOW_SQL=false
```

Use `JPA_DDL_AUTO=update` for the first demo deployment so Hibernate creates or
updates the schema. For a stricter production setup, replace this with database
migrations later.

## Railway

1. Create a Railway project from the GitHub repository.
2. Add a MySQL service.
3. Add a backend service from this repository.
4. Set the backend service root directory to `backend`.
5. Use Dockerfile deployment.
6. Add the environment variables above.
7. Generate a public domain for the backend service.
8. Update GitHub Pages with the new backend URL.

## Render

1. Create a MySQL-compatible database service or connect an external MySQL
   database.
2. Create a Web Service from the GitHub repository.
3. Set the root directory to `backend`.
4. Use Docker as the runtime.
5. Add the environment variables above.
6. Deploy and copy the public backend URL.
7. Update GitHub Pages with the new backend URL.

## GitHub Pages Frontend

After the cloud backend gives you a fixed URL, update:

```text
.github/workflows/deploy-frontend-pages.yml
```

Change:

```text
NEXT_PUBLIC_API_BASE_URL=<your-cloud-backend-url>
```

Commit and push to redeploy the frontend.

Current Railway backend URL:

```text
https://backend-production-3db4.up.railway.app
```
