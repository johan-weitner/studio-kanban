#!/bin/sh
set -eu

chown -R node:node /data
exec gosu node "$@"
