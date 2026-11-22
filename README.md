Personal Trainer Management System

A web-based Personal Trainer Management System developed as a Final Year Project (FYP).

The system provides user authentication and supports personal training management activities.

Live Demo

Access the application here:

Frontend (GitHub Pages):

https://chunyen1109.github.io/personal-trainer-management-system/

Backend API Health Check (Cloudflare Tunnel):

https://comfort-bulletin-toe-lined.trycloudflare.com/actuator/health

A successful backend health check returns:

{
  "status": "UP"
}

Technology Stack

Frontend

* Next.js
* React
* TypeScript
* GitHub Pages

Backend

* Java 21
* Spring Boot
* REST API
* JWT Authentication

Database

* MySQL

Deployment

* Frontend: GitHub Pages
* Backend: Locally hosted on macOS
* Backend HTTPS access: Cloudflare Quick Tunnel
* Database: Local MySQL

System Architecture

User / Web Browser
        |
        v
GitHub Pages (Next.js Frontend)
        |
        v
Cloudflare Quick Tunnel (HTTPS)
        |
        v
Spring Boot Backend (localhost:8080)
        |
        v
MySQL Database (Local)

Important Note

The frontend is deployed publicly using GitHub Pages.

The backend API and MySQL database are currently hosted locally on the developer’s Mac and exposed through Cloudflare Quick Tunnel.

The backend is only accessible while the developer’s Mac, Spring Boot application, MySQL database, and Cloudflare Tunnel are running.

Cloudflare Quick Tunnel generates a temporary public URL. If the tunnel is restarted, the URL may change, requiring the frontend API configuration to be updated and redeployed.

The frontend can remain accessible on GitHub Pages even when the backend is offline, but features requiring API access will not work.

Deployment Documentation

Backend deployment notes:

backend/DEPLOYMENT.md

Note: The deployment documentation may contain instructions for the previous Railway deployment and should be treated as historical information until updated.
