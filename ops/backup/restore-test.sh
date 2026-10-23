#!/usr/bin/env bash
set -euo pipefail
umask 077
[[ $# -eq 2 ]] || { echo "Usage: restore-test.sh ARCHIVE.dump.age PRIVATE_KEY_FILE" >&2; exit 2; }
: "${PGDATABASE:?Set PGDATABASE to roleplay_restore_test}"
[[ "$PGDATABASE" == "roleplay_restore_test" ]] || { echo "Restore drills only target roleplay_restore_test" >&2; exit 2; }
archive="$1"; key="$2"
[[ -f "$archive" && -f "$key" && -f "$archive.sha256" ]] || { echo "Archive, checksum, or key is missing" >&2; exit 2; }
read -r expected _ < "$archive.sha256"
[[ "$expected" =~ ^[a-f0-9]{64}$ ]] || { echo "Invalid checksum" >&2; exit 2; }
actual="$(sha256sum "$archive")"; actual="${actual%% *}"
[[ "$actual" == "$expected" ]] || { echo "Archive integrity check failed" >&2; exit 1; }
tables="$(psql --no-psqlrc --tuples-only --no-align --command "SELECT count(*) FROM pg_tables WHERE schemaname='public'")"
[[ "$tables" == "0" ]] || { echo "Restore-test database must be empty" >&2; exit 2; }
age --decrypt --identity "$key" "$archive" | pg_restore --exit-on-error --single-transaction --no-owner --no-acl --dbname "$PGDATABASE"
psql --no-psqlrc --tuples-only --no-align --command 'SELECT version_num FROM alembic_version; SELECT count(*) FROM users;'
echo "Encrypted archive restored into the empty test database"
