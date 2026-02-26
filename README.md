# Wonga Assessment

A streamlined full-stack authentication system featuring an "email-first" login flow and a conversational chat assistant.

## Quick Start

The entire stack is containerized. Ensure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is running, then execute:

```bash
docker-compose up --build

```

* **Frontend:** [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)
* **Backend API:** [http://localhost:5000](https://www.google.com/search?q=http://localhost:5000)

## Tech Stack

* **Frontend:** React 18 + React Router
* **Backend:** C# .NET 8 (Minimal API)
* **Database:** PostgreSQL 15 (Auto-migrating)

## Key Features

* **Smart Auth Flow:** Automatically detects if a user is new or returning based on their email.
* **Chat Assistant:** A floating bot guides users through the registration and login process.
* **Secure:** Passwords are hashed with **BCrypt**, and sessions are handled via **JWT** (JSON Web Tokens).
* **Protected Routes:** Users cannot access the profile (`/profile`) without a valid token.

## Testing

To run the backend unit tests:

```bash
cd backend
dotnet test

