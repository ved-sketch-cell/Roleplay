#!/usr/bin/env bash
set -euo pipefail
umask 077
: "${BACKUP_AGE_RECIPIENT:?Configure a public age recipient before enabling backups}"
: "${PGDATABASE:?Set PGDATABASE}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
BACKUP_INTERVAL_SECONDS="${BACKUP_INTERVAL_SECONDS:-86400}"
[[ "$BACKUP_RETENTION_DAYS" =~ ^[0-9]+$ && "$BACKUP_RETENTION_DAYS" -ge 1 ]] || exit 2
[[ "$BACKUP_INTERVAL_SECONDS" =~ ^[0-9]+$ && "$BACKUP_INTERVAL_SECONDS" -ge 60 ]] || exit 2
mkdir -p "$BACKUP_DIR"
exec 9>"$BACKUP_DIR/.backup.lock"
flock -n 9 || { echo "Another backup process is running" >&2; exit 1; }
partial=""
trap '[[ -z "$partial" ]] || rm -f -- "$partial"' EXIT
run_once() {
  local name="roleplay-$(date -u +%Y%m%dT%H%M%SZ)-$$.dump.age"
  partial="$BACKUP_DIR/$name.partial"
  # Plaintext is streamed directly into authenticated age encryption.
  if ! pg_dump --format=custom --no-owner --no-acl | age --encrypt --recipient "$BACKUP_AGE_RECIPIENT" --output "$partial"; then
    rm -f -- "$partial"; partial=""; echo "Backup failed; no archive was retained" >&2; return 1
  fi
  mv -- "$partial" "$BACKUP_DIR/$name"; partial=""
  (cd "$BACKUP_DIR"; sha256sum "$name" > "$name.sha256")
  find "$BACKUP_DIR" -maxdepth 1 -type f -name 'roleplay-*.dump.age' -mtime "+$BACKUP_RETENTION_DAYS" -exec sh -c 'for file do rm -f -- "$file" "$file.sha256"; done' sh {} +
  echo "Encrypted backup completed: $name"
}
case "${1:-once}" in
  once) run_once ;;
  loop) while true; do run_once || true; sleep "$BACKUP_INTERVAL_SECONDS"; done ;;
  *) echo "Use once or loop" >&2; exit 2 ;;
esac
