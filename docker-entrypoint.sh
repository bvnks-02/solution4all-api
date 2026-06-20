#!/bin/sh
set -e

echo "Running database seed..."
node Database/seed.js || echo "⚠️  Seed failed or already seeded — continuing startup"

echo "Starting server..."
exec node index.js