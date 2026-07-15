#!/bin/sh
# Verifies every YouTube video ID found in js/program.js via the oEmbed
# endpoint. A bad or removed video returns a non-200 status. Exits 1 if
# any link fails, so this can gate a deploy.
set -u
PROGRAM_FILE="$(dirname "$0")/../js/program.js"
FAIL=0
IDS=$(grep -o 'video: *"[A-Za-z0-9_-]*"' "$PROGRAM_FILE" | sed 's/.*"\(.*\)"/\1/' | sort -u)
for ID in $IDS; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ID}&format=json")
  if [ "$CODE" = "200" ]; then
    TITLE=$(curl -s "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ID}&format=json" | sed 's/.*"title": *"\([^"]*\)".*/\1/')
    echo "OK   ${ID}  ${TITLE}"
  else
    echo "FAIL ${ID}  http ${CODE}"
    FAIL=1
  fi
done
exit $FAIL
