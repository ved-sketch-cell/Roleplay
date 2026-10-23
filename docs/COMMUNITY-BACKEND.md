# Chat, presence, recovery, moderation, and notifications

## Local walkthrough

1. Run `python backend/scripts/setup_env.py` and `docker compose up --build`. Existing installs can run `python backend/scripts/setup_env.py --upgrade` to add missing settings while keeping existing secrets. This does not replace existing empty/invalid values.
2. Open `http://localhost:8080/#/app/people` in two browser profiles. Register two accounts, add overlapping interests and languages, select text, save, and opt into discovery.
3. Find people and click **Connect**. The recipient reviews the request in **Messages**. Only the recipient can accept/decline; the requester can cancel. A decline suppresses future matching between that pair.
4. After acceptance, send messages from both profiles. History is durable in PostgreSQL; retrying the same message UUID does not create another copy. Read receipts are monotonic. Messages have sequence cursors and bounded pages.
5. Turn on **Show when I’m online** in Find people to share presence with accepted connections. It starts off. Presence tracks active live sockets, not whether a person is available or their mood. Separate tabs/devices have separate TTL entries.
6. Open **Notifications** to review generic updates, choose in-app/message/email notifications, and see your report status. Notification emails exclude private message text and sender identity.
7. Choose **Forgot password**. Open the local Mailpit inbox at `http://localhost:8025` to see the captured recovery email. Mailpit does not deliver these messages to external inboxes by default. The link opens a new-password form; changing it signs out existing sessions and invalidates other reset links.
8. Report a message/account in the chat. Reports go to the database queue; they are not automatically reviewed by a staffed team. The operator must assign actual moderators and define review coverage.

Assign an operator account after registering it:

```sh
docker compose exec api python -m scripts.grant_moderator --email OPERATOR_EMAIL
```

Open `/#/app/moderation` as that account. A role cannot be assigned through profile edits or public API calls. Revoke with `--revoke`. Moderators cannot act on a case they submitted or one about themselves. Review evidence, record a note, then dismiss a report, remove a message, suspend an account, or restore it. Actions append audit rows. Suspension ends sessions and discovery; restoration creates neither a session nor discovery consent.

## Delivery model

The message, in-app notification, and outbox events are committed in one database transaction. A separate worker claims jobs with a row lock and expiring lease, performs delivery, and records success/retry. Expired leases are reclaimed. Transient failures retry with bounded exponential backoff; exhausted or expired jobs become dead and their encrypted payload is cleared. Sent email payloads are cleared as well. Run `python -m scripts.prune_expired` daily to remove finished jobs after seven days and expired sessions/reset records.

Redis Pub/Sub broadcasts refresh hints to each user's authenticated sockets. Hints never include private message bodies. Redis's at-most-once delivery can miss events, so clients periodically catch up using PostgreSQL-backed HTTP endpoints. HTTP message sending is a fallback when a socket is down. Writes acknowledge only after commit. Clients use a stable UUID for retrying a send, sequence ordering for messages, and cursors for history. Do not treat a successful Redis publish as proof that a recipient read a message.

SMTP delivery is at least once, not exactly once: a worker crash after SMTP accepts a message but before the job is finalized can deliver a duplicate. A stable Message-ID helps identify retries but does not guarantee deduplication. Recovery links remain single use. Production SMTP credentials, a valid sender, STARTTLS, and delivery monitoring must be supplied by the operator. Mailpit is only for local testing. Notification preferences do not disable necessary recovery/security emails.

## Socket contract

`POST /v1/ws-ticket` requires the caller's bearer access token. It returns a random single-use ticket expiring after 30 seconds, stored hashed in Redis. Connect to `/v1/ws`, then send:

```json
{"type":"authenticate","ticket":"SHORT_LIVED_TICKET"}
```

Bearer/refresh tokens never appear in socket URLs. Browser Origin must exactly match an allowed origin. The server returns `ready` only after Redis subscription is active. Send `{"type":"ping"}` every 20 seconds; stale sockets close, and presence entries expire after 60 seconds. Sessions are checked on sends/heartbeats and before outgoing hints. Sockets renew after 15 minutes; revoked/suspended sessions cannot keep sending. A logout or password reset closes an idle socket at its next heartbeat, within the heartbeat timeout; its sends are rejected immediately.

```json
{
  "type":"message.send",
  "conversation_id":"UUID",
  "client_message_id":"UUID_FOR_THIS_SEND",
  "body":"Hello"
}
```

The response is `message.ack` with the persisted message, or a bounded `error`. Other events (`chat.updated`, `connections.updated`, `notifications.updated`) tell the client to fetch authorized data. There are body size, input, rate, member, account-state, and block checks. The same rules apply to HTTP message sends. Pair mutations acquire user locks in UUID order to serialize a send against a block.

## Privacy and retention

- Connections need explicit mutual consent; recommendations alone grant no chat access.
- Only participants can read/send a conversation. A block in either direction closes the connection and denies both history access and new sends. Unblocking does not automatically restore consent. A newly accepted request can resume the previous thread; blocking does not erase historical messages.
- Retracted/removed messages retain sequence positions but return an empty body/tombstone. A reported message's submitted evidence snapshot stays available to authorized moderators while the report exists.
- Moderators can review reported evidence, not browse arbitrary private conversations. Reporter IDs/evidence are omitted from the submitter's ordinary report response.
- Presence is hidden unless explicitly shared, and is visible only to an accepted connection. Redis failures show unknown status instead of pretending someone is offline.
- Notification titles are generic, and notifications from blocked actors are hidden. Account email addresses never appear in public profiles, matches, or socket events.
- Recovery requests have the same HTTP behavior for known and unknown emails. Account lookup occurs in the worker. Tokens are random, hashed, expiring, single use, and delivered through encrypted outbox payloads; they never appear in API responses or logs.
- API-to-worker encryption uses a dedicated Fernet key. Preserve that key in separate secret storage if pending email jobs must survive a restore; rotating it without draining/re-encrypting jobs makes those jobs unreadable. It is not the backup decryption key or the JWT secret.
- Account deletion cascades through connections and their messages, reset tokens, notification data, and reports involving that account. The account export includes only that person's sent messages, report submissions, and notification metadata, not another person's email or message text.
- Backups can contain older deleted data until retention removes those archives. Apply a verified deletion ledger after recovery before reopening a restored instance. There is no automatic backup erasure or deletion-ledger replay in this release.
- Preview posts/communities and the supplied original mobile app still use local sample data. Their local report forms do not submit to the new moderator queue.

References: [FastAPI WebSockets](https://fastapi.tiangolo.com/advanced/websockets/), [Redis Pub/Sub](https://redis.io/docs/latest/develop/use-cases/pub-sub/), [OWASP account recovery](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html), [Fernet](https://cryptography.io/en/latest/fernet/), [Mailpit Docker setup](https://mailpit.axllent.org/docs/install/docker/).
