#!/bin/sh
set -e

echo "=== Solution4All API Startup ==="

# Wait for MongoDB to be ready before seeding
echo "Waiting for MongoDB..."
for i in $(seq 1 30); do
  if node -e "
    const mongoose = require('mongoose');
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/solution4all')
      .then(() => { mongoose.disconnect(); process.exit(0); })
      .catch(() => process.exit(1));
  " 2>/dev/null; then
    echo "✅ MongoDB is reachable"
    break
  fi
  echo "  Attempt $i/30 — MongoDB not ready yet..."
  sleep 2
done

# Run seed (idempotent — skips if admin user already exists)
echo "Running database seed..."
node Database/seed.js || echo "⚠️  Seed failed — continuing startup anyway"

# Start the server
echo "Starting server..."
exec node index.js