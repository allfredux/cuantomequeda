# Optional private Buffer connection

The existing per-user Buffer OAuth adapter and its separate records are preserved. The additional /buffer route is behind the same signed Access identity as the workspace. It offers a personal Buffer API key for the owner who does not yet have a registered OAuth client. Keys must be entered only in the protected HTTPS form, never in Git or chat. The form verifies the Buffer account via its official GraphQL API before storing an AES-GCM ciphertext in kajon_buffer_personal_accounts, bound to the verified owner. It does not modify kajon_buffer_accounts OAuth records.

The page lists only organizations returned by Buffer and channels from the selected authorized organization. It can export an approved LinkedIn/X text post as a Buffer draft, never publish or schedule. Same-origin and CSRF controls are mandatory. The submitted hash and version must match the currently stored approval, and the destination channel must match the post platform. A durable export reservation prevents automatic replays after successes or uncertain failures. The official API input has saveToDraft:true; its returned status must be draft before confirming success. No like, comment, message or follow operation exists.

Users must grant their own social authorizations in Buffer. This code does not mean an account is already connected and does not retrieve analytics. The personal key may access all of its owner's Buffer organizations; use a dedicated key and revoke it when no longer required. The application uses an internal 80-request/day ceiling for this optional path; the provider's own quotas still apply. No plan is upgraded and no fees are authorized by this code.

Tests use synthetic keys and mock Buffer responses. A real account authorization is pending until the user completes it. The requested cuantomequeda.com domain is still not present among accessible Cloudflare zones, so no DNS change to it has been made.

References checked: https://developers.buffer.com/reference.html ; https://developers.buffer.com/guides/authentication.html ; https://buffer.com/pricing
