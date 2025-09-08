#!/bin/bash

echo "========================================"
echo "   DesignSight - MERN Prototype"
echo "========================================"
echo

# Check if Docker is running
if ! docker --version >/dev/null 2>&1; then
    echo "ERROR: Docker is not installed or not running"
    echo "Please install Docker and try again"
    exit 1
fi

echo "Docker is running ✓"
echo

# Check environment variables
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp server/env.example .env
    echo
    echo "IMPORTANT: Please edit .env file and add your OpenAI API key"
    echo "Then run this script again"
    exit 1
fi

echo "Environment file found ✓"
echo

echo "Starting DesignSight application..."
echo "This may take a few minutes on first run..."
echo

docker-compose up --build

echo
echo "Application stopped"


