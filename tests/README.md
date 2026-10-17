# Security and localization tests

Version: **2.6.0**, iOS build **49**. Run from the `ppp-ios` repository root:

```bash
npm ci
npm run test:security
npm run test:attachments
npm run test:i18n
npm run build
npx cap sync ios
```

The iOS Simulator build command is in the [main README](../README_EN.md#6-command-line-simulator-build). Keep local signing enabled for Keychain access. These checks have passed locally; real-device and two-client acceptance remain manual.

## Cryptographic and synchronization coverage

The client security tests use the real sodium signatures,
X25519/secretbox encryption, PBKDF2 and AES-GCM. HTTP, WebSocket, identity-key
loading and encrypted-secret persistence are replaced with in-memory adapters.
They cover both copies of signed messages, message/context/signature tampering,
exact identity plaintext and AEAD binding, missing/wrong passwords, the complete
three-message mutual handshake, repeated proofs, stale challenges, unsigned
messages after pinning and substituted identity keys.

The group suite additionally covers signed, identity-pinned key distribution,
message type/sender/group/epoch/nonce/ciphertext tampering, authenticated nickname
display, concurrent key publication, revoked-member exclusion, old-key failure on
new ciphertext, multi-epoch catch-up, unsigned history labelling and account
isolation. The sync suite covers more than 100 pages, ciphertext persistence
before cursor advancement (including an asynchronous native-cache flush), storage/network failures and account changes.

The attachment suite checks authenticated downloads, access-token refresh, external URL rejection, legacy R2 URL mapping, relative avatar normalization and same-origin fallback.

## Server integration test

The server and its MySQL integration fixtures live in the upstream Paperphone-plus repository, not this iOS fork. Use that repository's `client/tests/README.md` for server test setup and deployment migration instructions. The iOS regression commands above do not execute server tests.

## Protocol and trust model

Both contacts need a client build incorporating these changes. Older clients cannot parse the signed
header. Legacy unsigned messages are explicitly labelled before identity
verification; once a peer is pinned, unsigned messages are refused, including
old unsigned history. Pins are local, account-scoped Keychain secrets.
A changed identity requires a new offline password check and explicit initiation
from the contact's identity-verification action.

The existing 12-group safety-number algorithm is retained. It uses the local
identity key and the peer identity key; the password-authenticated verification
transcript also binds both identities, the sender signing key, the safety
number, a fresh challenge and the receipt of the other party's challenge.
AES-GCM encrypts exactly `paperphone.app`, with the full transcript as AAD.
Ed25519 signs the resulting encrypted private-message envelope. A green badge
requires a valid peer proof and a password-authenticated receipt for the local
challenge. A signature alone is not evidence that a previously unknown key
belongs to the intended person.

The existing registration API's `kem_pub` field actually contains an Ed25519
signing public key. The signed path uses that field as a signing key and uses
X25519 encryption rather than passing it to ML-KEM and silently falling back.
This change does not introduce working post-quantum key registration. A future
migration must add a separate signing-key field and publish real ML-KEM keys.


## Group protocol and upgrade behavior
Both the server and every client must be upgraded together. New group messages
require signatures and sender-key encryption. Existing unencrypted groups are
migrated once, and encryption cannot be disabled through the API. Available
legacy history remains readable with an explicit unsigned warning and no badge.
Existing encrypted history whose sender key was already lost before this change
cannot be recovered cryptographically.

Every group participant's identity must first be established through the private
password-authenticated handshake. No server-provided signing key is silently
trusted. The group message signature covers group ID, sender ID, key epoch,
client message ID, message type, identity/signing keys, nonce, nickname and
ciphertext. Only successful signature verification produces a green message badge;
missing decryption keys keep the content locked and eligible for retry. Badges are not loaded as trusted state from the encrypted message cache.

Membership changes advance a server-enforced monotonic epoch under a group row
lock. Old sender-key publications cannot authorize sends in a new epoch. Uploads
must cover exactly the current recipients, including an encrypted self copy,
and each sender can publish only once per epoch. The same lock serializes sends
and uploads against leave/kick/join. Online clients rotate on notification;
offline clients discover the durable epoch when reconnecting and before sending.
If an identity is unverified, sending remains blocked with a verification prompt.

Historical distributions for continuing recipients are retained by epoch,
including distributions authored by members who later leave. All distributions
addressed to a departed member are removed, and membership checks prevent further
message/key downloads or sending. Rejoining starts a new membership interval.
Already-held old keys and already-read messages cannot be remotely erased from
a departed member's device; rotation prevents those keys decrypting future
messages. Group membership and ordering remain server-authoritative; this is
not an MLS membership-consensus implementation and cannot prevent an authorized
member from sharing plaintext or keys.

Catch-up uses server_seq, not session.last_active. A short database barrier
serializes message allocation/commit with sync reads so a global cursor cannot
skip an uncommitted lower sequence. The client paginates to completion, retains
ciphertexts awaiting keys, selects exact historical key versions, retries after
key/identity recovery, deduplicates replays and saves its ciphertext cache before
advancing the account-scoped cursor. Group history also paginates by immutable sequence rather than timestamps,
with no fixed total-history cap. The existing auto-delete retention remains
in effect; already-expired messages are intentionally unavailable.

## Automatic trust refresh

Opening a private profile refreshes published identity keys, rechecks the pin,
and replays relevant signed verification receipts from history. An unlocked
presentation password resumes or initiates a pending handshake automatically.
Repeated opens share an in-flight refresh and preserve the existing challenge;
automatic retries are throttled. Key changes revoke trust without replacing the
pin. Opening the group member list refreshes the member-key snapshot and checks
each member against the same trust records, without starting group-wide private
handshakes. Fresh keys propagate to existing contact caches. Both views refresh
on focus/visibility and update labels and badges on trust changes.

## Eight-language validation

Run `npm run test:i18n` from the repository root to validate all 92 security-related text keys
in Chinese, English, Japanese, Korean, French, German, Russian and Spanish.
The suite checks explicit coverage (without fallback), duplicate keys,
placeholder consistency, current-language error rendering and verbatim handling
of protocol constants and user-supplied text.


## Manual acceptance and boundaries

Use two compatible native clients to verify password setup/unlock, both directions of the handshake, profile refresh, focus/visibility refresh and changed-key rejection. Reopen profiles while verification is pending to confirm that challenges survive and retries are throttled. Open the group member list to check refreshed trust, then exercise leave/kick, offline reconnect and pending-key recovery. Check all eight languages, especially interpolated errors, verification prompts and the green badge's meaning.

This local iOS source is version 2.6.0 (build 49); this update does not publish an App Store release. Tests of this shared source do not validate published native clients or Docker images. Local caches retain at most 2,000 messages per conversation; server-side auto-delete and attachment retention remain applicable. Message signing does not end-to-end encrypt uploaded file bytes, and no upgrade can recreate previously lost keys.

See the [main README](../README_EN.md) and [中文说明](../README.md) for operating requirements. The client suites use cryptographic implementations with mocked transport/persistence; upstream server fixtures use real database/routes with transport signature fixtures. They provide regression coverage, not an independent audit or a native-device UI test.
