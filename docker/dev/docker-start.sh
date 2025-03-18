#!/bin/bash

# Load environment variables from .env file
if [ -f ../../.env ]; then
  export $(grep -v '^#' ../../.env | xargs)
else
  echo "Warning: .env file not found. Using default values."
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo "Error: Docker is not installed. Please install Docker first."
  exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
  echo "Error: Docker Compose is not installed. Please install Docker Compose first."
  exit 1
fi

echo "Starting PostgreSQL container..."
docker-compose -f docker/dev/docker-compose.yml up -d postgres

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Check if PostgreSQL is running
if docker-compose -f docker/dev/docker-compose.yml ps postgres | grep -q "Up"; then
  echo "PostgreSQL is running!"
  echo "Database URL: postgres://${DB_USER:-postgres}:${DB_PASSWORD:-postgres}@localhost:5433/${DB_NAME:-physipro}"
else
  echo "Error: PostgreSQL failed to start."
  docker-compose -f docker/dev/docker-compose.yml logs postgres
  exit 1
fi

echo "Starting PhysiPro Docker environment..."

# Start Docker Compose
docker-compose -f docker/dev/docker-compose.yml up -d

echo "Docker environment started successfully."
echo "PostgreSQL is running on port 5433"
echo ""
echo "To stop the environment, run: docker-compose -f docker/dev/docker-compose.yml down"
echo "To view logs, run: docker-compose -f docker/dev/docker-compose.yml logs -f postgres"
echo ""
echo "Database connection details:"
echo "  Host: localhost"
echo "  Port: 5433"
echo "  Database: physipro"
echo "  Username: postgres"
echo "  Password: postgres"
