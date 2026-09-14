#!/bin/sh
# Fix ownership of the data directory after the named volume is mounted.
# The volume is initially owned by root; this ensures the 'node' user can write.
mkdir -p /app/data
chown -R node:node /app/data
exec su-exec node "$@"
