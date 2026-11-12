#!/usr/bin/env bash
# Resets the LOCAL development database to the demo set: three lecture notes, 19 cards, two focus blocks today.
# It deletes every material, card and focus block first. Never point it at a shared or production database.
#
# Needs: the backend running (IntelliJ or ./gradlew bootRun) and its Docker Postgres container.
# Usage: demo/reset-demo.sh            (backend on http://localhost:8080)
#        API_URL=http://localhost:8081 demo/reset-demo.sh
set -euo pipefail
cd "$(dirname "$0")"

API="${API_URL:-http://localhost:8080}"
CONTAINER="${DB_CONTAINER:-backend-postgres-1}"
psql_db() { docker exec -i "$CONTAINER" psql -U myuser -d mydatabase -v ON_ERROR_STOP=1 -q "$@"; }

curl -fsS -o /dev/null "$API/api/documents" || { echo "Backend is not reachable on $API. Start it first." >&2; exit 1; }

echo "Clearing materials, cards and focus blocks…"
psql_db -c "delete from documents; delete from focus_sessions;"

# Uploaded oldest first, so biology ends up at the top of the list.
for note in newtonovi-zakoni prvi-svjetski-rat biologija-stanice; do
  curl -fsS -o /dev/null -F "file=@notes/$note.pdf;type=application/pdf" "$API/api/documents"
  echo "Uploaded $note.pdf"
done

psql_db < seed.sql
echo "Demo ready: 3 materials, 19 cards, 2 focus blocks today. Open http://localhost:5173 (or 5174)."
