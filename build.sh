#!/bin/bash
set -e
echo "Building and starting all services..."
docker-compose up --build -d
echo "Done. Frontend: http://localhost:3000 | Backend: http://localhost:5000"
