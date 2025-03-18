#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
  echo "Docker Compose is not installed. Using direct database connection."

  # Try direct database connection
  NODE_ENV=test node scripts/check-db-connection.js
  DB_CONNECTION_RESULT=$?

  if [ $DB_CONNECTION_RESULT -ne 0 ]; then
    echo "Database connection failed. Starting test database with Docker..."

    if ! command -v docker &> /dev/null; then
      echo "Docker is not installed. Cannot start test database."
      exit 1
    fi

    # Start the database container
    docker-compose -f docker-compose.test.yml up -d postgres-test

    # Wait for database to be ready
    echo "Waiting for database to be ready..."
    for i in {1..30}; do
      echo "Attempt $i/30..."
      if NODE_ENV=test node scripts/check-db-connection.js; then
        echo "Database is ready!"
        break
      fi

      if [ $i -eq 30 ]; then
        echo "Database failed to start after 30 attempts."
        docker-compose -f docker-compose.test.yml down
        exit 1
      fi

      sleep 1
    done
  fi
else
  # Use docker-compose for consistency
  echo "Using Docker Compose for test database..."

  # Check if database is already running
  if docker-compose -f docker-compose.test.yml ps postgres-test | grep -q "Up"; then
    echo "Test database is already running."
  else
    echo "Starting test database..."
    docker-compose -f docker-compose.test.yml up -d postgres-test

    # Wait for database to be ready
    echo "Waiting for database to be ready..."
    for i in {1..30}; do
      echo "Attempt $i/30..."
      if docker-compose -f docker-compose.test.yml exec postgres-test pg_isready -U postgres; then
        echo "Database is ready!"
        break
      fi

      if [ $i -eq 30 ]; then
        echo "Database failed to start after 30 attempts."
        docker-compose -f docker-compose.test.yml down
        exit 1
      fi

      sleep 1
    done
  fi
fi

echo "Database is available. Ready to run tests."
exit 0
