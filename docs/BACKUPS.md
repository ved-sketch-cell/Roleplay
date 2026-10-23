# Encrypted backups and restore drills

The optional backup service creates a PostgreSQL custom-format dump, streams it directly through age authenticated encryption, and saves only `.dump.age` archives plus SHA-256 checksums. The service uses a public encryption recipient; keep the private decryption key outside this project/container. No plaintext dump is written. Archives are created atomically, failure removes partial files, one process holds the backup lock, and retention runs after a successful backup.

## Enable locally

Install age on your own machine and generate a key outside the repository:

```sh
age-keygen -o /PATH/OUTSIDE/PROJECT/roleplay-backup-key.txt
```

Copy the **public** `age1…` recipient into `.env` as `BACKUP_AGE_RECIPIENT`. Preserve the private key securely; losing it makes backups unrecoverable. The private key must never be committed or mounted in the scheduled backup container.

```sh
docker compose --profile backups up -d --build backup
```

By default it runs immediately, then every 24 hours, and retains archives for 14 days in `./backups`. `BACKUP_RETENTION_DAYS` controls retention. Check the backup service logs and archive timestamps. A one-time run is also available:

```sh
docker compose --profile backups run --rm backup once
```

The backup is for a single application database. It includes application rows and schema, without role ownership/ACL assignments. Keep operator credentials, migrations, configuration, and encryption keys separately. Redis presence/tickets are ephemeral and are not needed to restore message history. PostgreSQL is the source of truth for messages, notifications, and delivery jobs.

## Restore only into an empty test database

The supplied drill refuses any destination named other than `roleplay_restore_test`, checks the checksum, requires an empty database, and restores transactionally. It never uses `--clean` or overwrites the running database.

1. Create an empty `roleplay_restore_test` database on an isolated PostgreSQL instance.
2. Set `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, and `PGDATABASE=roleplay_restore_test` for that instance.
3. Run with PostgreSQL client tools and age installed:

```sh
bash ops/backup/restore-test.sh /PATH/ARCHIVE.dump.age /PATH/PRIVATE_KEY.txt
```

Verify the schema revision, sample account/message counts, and access rules using a backend pointed at that test database. Do not start an email worker during a restore drill: pending jobs in a backup may deliver real email. The included CI roundtrip uses only disposable test data and does not start a worker against the restored database.

Before a real recovery, replay verified account deletions, revoke restored refresh sessions and reset tokens, discard old delivery jobs, validate configuration, and confirm access tests before reopening the service. This release provides the drill and runbook; reopening production is an operator decision, not an automatic script.

## Operational limits and next steps

Local encrypted archives protect against some mistakes, but do not survive loss of the host. Add a separately secured off-site storage destination, upload verification, freshness/failure alerts, and regular restore drills. Set explicit recovery objectives. Daily logical dumps have a maximum expected gap of roughly a day when successful; failures lengthen that gap. For shorter recovery gaps, configure managed PostgreSQL continuous WAL backups and point-in-time recovery. No off-site account or storage destination was supplied, so none is configured or contacted.

Backups retain old accounts/messages until archive retention expires. Define retention/deletion handling before onboarding real users. Testing the shell pipeline with stubs validates guards, not encryption or database restoration; the CI includes a real PostgreSQL/age roundtrip for that purpose.

References: [pg_dump](https://www.postgresql.org/docs/17/app-pgdump.html), [pg_restore](https://www.postgresql.org/docs/17/app-pgrestore.html), [age](https://github.com/FiloSottile/age).
