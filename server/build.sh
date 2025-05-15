#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "==> Installing server dependencies"
npm install

echo "==> Setting up environment"
# Ensure environment variables are set correctly
# If you have a build step, uncomment the line below
# npm run build

echo "==> Server build completed"