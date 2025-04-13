#!/bin/sh
# wait-for-it.sh - More resilient version for Azure

set -e

host="${1:-postgres}"
shift
cmd="$@"

MAX_RETRIES=30
RETRY_INTERVAL=2

# Extract hostname and port if provided in host:port format
hostname=$(echo "$host" | cut -d: -f1)
port="${2:-5432}"

echo "Waiting for PostgreSQL at $hostname:$port..."
retry_count=0

while [ $retry_count -lt $MAX_RETRIES ]; do
  if PGPASSWORD=postgres_password pg_isready -h "$hostname" -p "$port" -U postgres -d careerhub > /dev/null 2>&1; then
    echo "PostgreSQL is available at $hostname:$port"
    break
  fi
  
  retry_count=$((retry_count+1))
  echo "PostgreSQL is unavailable (attempt $retry_count/$MAX_RETRIES) - sleeping for ${RETRY_INTERVAL}s"
  sleep $RETRY_INTERVAL
done

if [ $retry_count -eq $MAX_RETRIES ]; then
  echo "WARNING: Could not connect to PostgreSQL after $MAX_RETRIES attempts"
  echo "Continuing anyway - application will retry connections..."
fi

echo "Executing command: $cmd"
exec $cmd 