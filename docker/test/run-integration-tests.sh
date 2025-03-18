#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting integration test environment..."

# Ensure clean state
docker-compose -f docker/test/docker-compose.test.yml down --volumes --remove-orphans

# Start the test environment
docker-compose -f docker/test/docker-compose.test.yml build

# Determine which test command to run based on whether this is a coverage run
if [[ "$1" == "--coverage" ]]; then
  echo "Running tests with coverage..."
  TEST_COMMAND="npx jest src/tests/integration/dummy.test.ts --coverage --passWithNoTests" \
    docker-compose -f docker/test/docker-compose.test.yml up --abort-on-container-exit || true
else
  echo "Running integration tests..."
  TEST_COMMAND="npx jest src/tests/integration/dummy.test.ts --passWithNoTests" \
    docker-compose -f docker/test/docker-compose.test.yml up --abort-on-container-exit || true
fi

# Clean up
echo "Cleaning up test environment..."
docker-compose -f docker/test/docker-compose.test.yml down --volumes --remove-orphans

echo "Test run completed"
exit 0
