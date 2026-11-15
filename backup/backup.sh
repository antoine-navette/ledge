#!/bin/sh
# Dumps the database into /dumps, then keeps only the most recent dumps with the same label.
# Usage: backup.sh <label>, e.g. daily (the cron) or deploy (before the migrations)
#
# To restore a dump, from the environment's folder on the server (replaces the current data):
#   docker compose run --rm -T backup sh -c 'mongorestore --host mongo --username "$MONGO_USER" \
#       --password "$MONGO_PASSWORD" --authenticationDatabase admin --archive --gzip --drop' < dumps/<file>
set -eu

LABEL="$1"
KEEP=7

file="/dumps/$(date -u +%Y%m%d%H%M%S)_$LABEL.archive.gz"

# Written under a temporary name, so that a failed dump never looks like a valid one, and removed if it fails
trap 'rm -f "$file.part"' EXIT
mongodump --host mongo --username "$MONGO_USER" --password "$MONGO_PASSWORD" --authenticationDatabase admin \
    --db ledge --archive="$file.part" --gzip
mv "$file.part" "$file"
echo "Database dumped into $file"

# Names start with the date: sorted in reverse, the most recent come first
ls /dumps/*_"$LABEL".archive.gz | sort -r | tail -n +$((KEEP + 1)) | xargs -r rm -v
