# Biodiversity Hub Project Plan

## Current phase: feature implementation and verification

- [x] Clone repository and install locked dependencies with `npm ci`.
- [x] Configure the Supabase URL and browser-safe publishable key locally.
- [x] Configure localhost magic-link authentication and run `setup.sql`.
- [x] Start the unchanged app and sign in successfully at `/species`.
- [x] Confirm the signed-in user has a `profiles` row.
- [x] Check for existing species before running `seed.sql`; seeded once with the sole profile as owner.
- [x] Confirm seeded species cards render.
- [x] Add a clearly labeled test species and confirm it persists after refresh.
- [x] Run lint and TypeScript checks; both pass with no reported errors.

### Observed baseline issues

- Diagnosed the seeded image failures: Wikimedia rejects the seed's obsolete `440px` thumbnail URLs (HTTP 400); some standard thumbnails also returned HTTP 429. The shared image component now requests a supported `960px` thumbnail and falls back once to the same raster original. All 16 starter records have a source checked to return HTTP 200 with an image content type (thumbnail, original, or unchanged external URL). No database URLs or records were rewritten. Missing, invalid, or failed images end in a locally rendered botanical illustration labeled “Photo not available.” External hosts can still become unavailable.

## Required features (later phase)

1. **Species details:** implemented. Manually verified that the popup opens and displays the selected species information correctly. ESLint, TypeScript, and live compilation pass. Manual keyboard, responsive layout, long-content scrolling, optional-value fallback, and population `0` checks remain pending.
2. **Creator-only editing:** implemented. The existing `sessionId` controls edit-button visibility, while the unchanged Row Level Security policy remains the authorization boundary. The form prefills current values, allowlists editable fields, validates input, handles saving/no-row/duplicate-name errors, and refreshes server data after success. ESLint, TypeScript, and live compilation pass. Dialog scrolling and full Cancel/Save visibility when scrolled down are manually verified. Manual save, refresh persistence, cancel/reopen behavior, population `0`, optional-field clearing, error-state, small-screen width, heading autofocus, keyboard navigation/focus restoration, and second-user authorization checks remain pending. A real second-user authorization test is explicitly pending because all current records belong to the current account.
3. **Feature 3 — Field Guide chatbot:** implemented. The authenticated page, server-only provider integration, bounded context, species-profile handoff, starters, safe Markdown, retry, and New conversation flow are in place. ESLint, TypeScript, local route compilation, request validation, unauthenticated rejection, strict off-topic redirection, and a contextual animal follow-up pass. See pending manual verification below.
4. **Feature 4 — Wikipedia autofill and collection search:** implemented. Wikipedia lookup is authenticated, excludes detected disambiguation pages, offers matching-article choices, imports only editable description/image values with replacement confirmation, and preserves attribution in the existing description field. Collection search filters already-fetched records across scientific name, common name, and description. Automated and manual checks are listed below.

## Feature 3 — Field Guide chatbot

### Current setup state

- The OpenAI SDK and safe Markdown dependencies are installed and recorded in the lockfile.
- `OPENAI_API_KEY` is configured only in the private, gitignored `.env`; `.env.example` documents the variable with no value, and neither OpenAI setting uses a `NEXT_PUBLIC_` prefix.
- API billing is confirmed ready. `OPENAI_MODEL` is configured server-side with `gpt-5.6-luna` as the initial baseline and documented in `.env.example`, so the model can change without rewriting the integration.
- One bounded paid API request verified `gpt-5.6-luna` access and returned a nonempty response using 37 total tokens. No retries or alternate models were used.

### Required baseline — implemented

- Implement the existing chatbot page, `POST /api/chat` route, and `generateResponse` service.
- Preserve the required `{ message: string }` request and `{ response: string }` success response.
- Answer questions about wildlife, species, habitats, ecology, and conservation. Clearly unrelated requests receive only a brief, friendly redirect without an answer or analogy.
- Return `400` for malformed or invalid requests and `502` for upstream provider failures.
- Display safe, helpful errors without disguising provider failures as successful answers.

### Focused enhancements — implemented

- Support bounded optional conversation context for natural follow-ups while preserving the single-message contract.
- Add “Ask about this species” to the details dialog. Open the existing chatbot route with a species ID and prefilled, unsent question.
- Resolve the ID through the authenticated Supabase server pattern and handle missing or inaccessible species gracefully.
- Show a removable “Discussing: [species]” chip.
- Send only necessary species fields as context; exclude author and personal information.
- Clearly distinguish user-contributed app records from general model knowledge; never present sample data as independently verified.
- Treat record descriptions and conversation content as untrusted data, never as system instructions.
- Provide three contextual starters—habitat, diet, and threats—or three concrete animal-question examples when no species is selected.
- Format concise answers with safe Markdown paragraphs, lists, and comparison tables when useful; never render raw HTML.
- Ask a short clarifying question for ambiguous species names or requests.
- Preserve user messages on failure and support retry without duplicating messages.
- Add New conversation to safely clear history, selected species, pending errors, and any in-flight response.

### UI direction

- One clean conversation screen titled “Field Guide,” with a small species chip, readable messages, and a composer near the bottom.
- Show starter questions only in the empty state.
- Provide clear waiting feedback, accessible labels/status announcements, and keyboard-friendly controls.
- Enter sends; Shift+Enter inserts a line break; respect IME composition.
- Do not force-scroll users who are reading earlier messages.
- Support responsive layouts and existing light/dark themes; defer the full aesthetic redesign to the coordinated app-wide pass.

### Reliability and boundaries

- Keep the API key and all provider calls server-side; verify the Supabase session server-side before paid requests.
- Validate and bound message length, optional history size, allowed roles, and output length.
- Keep system instructions server-controlled.
- Handle missing configuration, provider timeouts, and upstream failures without breaking unrelated pages.
- Plan effective deployment-wide request limits before publishing.
- Do not invent sources, claim live data, or guarantee factual accuracy.
- Exclude image recognition, voice, browsing, persistent chat storage, database-writing tools, and extra agent frameworks.

### Verification still pending

- The bounded provider checks verified that “Explain quicksort” receives only a one-sentence scope redirect and that “What does it eat?” correctly follows giant-panda conversation context. The three-call setup/testing budget is now fully used.
- Post-Feature-4 non-paid regression checks confirm the strict redirect example, contextual-follow-up rule, and untrusted-data boundary remain in the server prompt; invalid and unauthenticated chat requests still return `400` and `401` without contacting the model.
- Manually verify an authenticated browser conversation, ambiguity handling, and safe list/table rendering.
- Verify the species-details handoff prefills but does not auto-send, the context chip can be removed, and missing/inaccessible records are handled gracefully.
- Verify retry preserves one copy of the failed user message, and New conversation cancels an in-flight request and clears all conversation state.
- Verify Enter, Shift+Enter, IME composition, status announcements, focus behavior, responsive layout, light/dark themes, and non-forced scrolling while reading older messages.
- Verify a real upstream failure returns `502` with a safe message; do not cause a paid failure solely for this check.
- Before deployment, add an effective deployment-wide request limit and review the currently reported dependency vulnerabilities.
- A Luna/Sol comparison is optional only if observed answer quality is inadequate. If needed, use the same small prompt set and evaluate factual accuracy, follow-ups, ambiguity, redirection, latency, and measured cost before drawing a conclusion.

## Feature 4 — Wikipedia autofill and species search

### Implemented

- The Add Species dialog has a labeled, explicit Wikipedia search that accepts common or scientific names.
- An authenticated server route makes one bounded MediaWiki Action API request with an identifying API user agent and returns only allowlisted article fields.
- Results provide a small article choice, plain-text introduction, thumbnail when available, and Wikipedia link. Pages marked as disambiguation pages are excluded from import choices.
- “Use description and image” changes only those two editable fields, never submits, confirms before replacing existing input, and preserves an existing image when Wikipedia has none.
- Closing the dialog aborts its lookup; newer searches abort and supersede older searches. Lookup errors leave the manual form available.
- Imported descriptions append the article URL and identify adapted Wikipedia text as CC BY-SA 4.0. When an image is imported, a separate file-page source/licensing link is appended and explicitly notes that image licensing may differ.
- Collection search uses trimmed, case-insensitive literal substring matching across scientific name, common name, and description. It includes a visible label, clear controls, count, and no-results state, and derives results from current props so refreshes do not retain stale records.

### Verification

- Live Wikimedia API check passed with current plain-text extracts, thumbnails, article URLs, and multiple choices for the ambiguous query “jaguar.”
- Local route checks passed: empty query `400`, unauthenticated query `401`, and the route compiled successfully.
- ESLint, TypeScript, and the Next.js 14.2.35 production build pass.
- Manual signed-in checks remain: import a Wikipedia result and review persisted attribution; confirm replacement prompts; confirm no-image preservation; simulate/observe a lookup failure then create manually; verify a disambiguation-heavy search; and confirm a closed/rapidly repeated search cannot update stale UI.
- Manual collection checks remain: scientific/common/description matching, whitespace/case behavior, clear, no results, and refreshed add/edit records while preserving Learn more, owner editing, and Ask about this species.

## Product and design — implemented, manual review pending

### Refined ecological design pass

- Added an editorial field-guide look: forest/ivory light theme, green-charcoal dark theme, serif display headings with readable sans-serif body text, subtle surface depth, and consistent rounded controls.
- Added a leaf brand mark, pill navigation with active-page indication, coordinated settings tabs, and a keyboard skip link. Narrow layouts and reduced-motion preferences are supported.
- Reworked the homepage around a snow-leopard photo and a concise introduction. Hero credit links to Irbis1983's public-domain Wikimedia file. Existing T4SG README attribution is preserved.
- Refined species cards with consistent image proportions, kingdom badges, aligned bottom actions, short descriptions, and clearer name hierarchy. Search, details, editing, Wikipedia import, and Field Guide remain available. Add/Edit scrolling and footer structure remain unchanged.
- Shared Wikimedia thumbnail repair and local fallbacks across cards, the homepage, and Wikipedia previews. Official thumbnail-size reference: https://www.mediawiki.org/wiki/Common_thumbnail_sizes. Wikipedia requests now ask for 960px thumbnails.
- Automated verification: lint, TypeScript, and production build pass. Image helper checks cover empty/invalid URLs, non-HTTP URLs, unchanged unrelated hosts, normalization, and raster-only original fallback. The build still emits the nonblocking outdated Browserslist-data warning; no packages were upgraded in this pass.
- Browser verification: the actual public homepage photograph loads, and homepage/login fit a 375px viewport. Isolated React component fixtures (no real database or model calls) verify loaded snow-leopard/polar-bear photos, missing/broken-image illustrations, case/whitespace/description search, clear/no-results, edit visibility for fixture owners, details with population 0 and long scrolling content, Escape/focus restoration, and edit-heading focus. Desktop light/dark collection and mobile forms/Field Guide were visually inspected. These are component checks, not authenticated end-to-end verification.
- Signed-in verification is still pending: inspect all real collection cards, save/edit persistence, Wikipedia import, and real second-user authorization after login works. No extra paid model requests, emails, database writes, commits, pushes, or deployments were performed.

- Applied a cohesive modern field-guide direction with warm ivory/forest green light colors and green-charcoal dark colors.
- Replaced applicant-facing homepage copy with product-focused copy and a clear Explore species action.
- Improved common/scientific-name hierarchy, compact classification/population details, card proportions, description previews, aligned actions, and missing/failed-image fallbacks.
- Removed visible repetitive details-dialog boilerplate while retaining a screen-reader description.
- Kept full descriptions in the details view and kept Add/Edit/Field Guide surfaces visually consistent and responsive.
- Removed the Species Speed navigation link while preserving its route scaffold.
- Keep T4SG attribution in the README.
- Manual visual checks remain for narrow screens, keyboard/focus behavior, contrast, dialog reachability, and cohesive light/dark rendering.

## Authentication and release (later phase)

- Assignment constraint verified: README “Run the webapp and log in,” step 2 explicitly requires email magic-link authentication and says to open the link in the same browser. Per the agreed decision rule, magic links are preserved; email/password signup, password login, and password recovery were not substituted for the required flow.
- Successful authentication returns to a validated same-origin `next` path, defaulting to `/species`. Explore species targets `/species`, and protected pages send unauthenticated visitors to login with an internal return path. Absolute, protocol-relative, and backslash-based external return paths are rejected.
- Fixed session refresh persistence: middleware now returns every refreshed Supabase cookie chunk to the browser, keeps Server Components on the same refreshed request cookies, and marks refresh responses private/no-store. Protected pages now verify the user with `getUser()` rather than trusting `getSession()`.
- Invalid, expired, or PKCE-mismatched magic links now return safely to the login page instead of producing a server error. After one successful email send, the form prevents repeat clicks that would replace the PKCE verifier and invalidate the earlier link.
- Logout now blocks duplicate submissions, reports failures, clears the Supabase session, and returns home.
- Automated checks pass for email validation code paths, safe callback failure, protected-route redirect output, internal-return validation, external-return rejection, ESLint, TypeScript, and production build. These do not prove a real browser session persists.
- Manual verification remains: sign in with one fresh link, refresh `/species`, revisit the original login tab, confirm the session remains active across a dev-server restart, and verify logout denies later access.
- Configure and test custom SMTP before submission so non-team visitors can sign in.
- The built-in mail quota was exhausted. The user then configured custom Google SMTP, but Google rejected the credentials with SMTP `535 5.7.8 Username and Password not accepted`. Recheck the exact Google account username/sender and its app password privately in Supabase; email delivery and refresh persistence remain unverified. After fixing delivery, request exactly one fresh link and open the newest email in the same browser.
- Local Supabase configuration: Site URL `http://localhost:3000`; allowed redirect URL `http://localhost:3000/auth/callback`. After Vercel provides a domain, add `https://<production-domain>` as the Site URL and `https://<production-domain>/auth/callback` to the redirect allowlist before testing production login.
- Configure Vercel with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENAI_API_KEY`, and `OPENAI_MODEL`. `SECRET_SUPABASE_CONNECTION_STRING` is only for the local type-generation command and is not required for app startup or Vercel runtime.
- Configure and test production Supabase Site URL and redirect allowlist for the final Vercel domain.
- Add an effective deployment-wide Field Guide request limit before publishing.
- Dependency review: updated Next.js from 14.0.4 to the compatible 14.2.35 release and verified the production build. The audit still reports 20 total findings (2 low, 5 moderate, 11 high, 2 critical); production dependencies contain 13 (2 low, 4 moderate, 6 high, 1 critical). The remaining production critical is in Next.js and npm proposes a major update to 16.3.5; plan and test that migration before deployment. The other critical is `tar` through the development-only Supabase CLI and also requires a major CLI update. Both remain release-review blockers; no forced audit fix was used.
- Deploy on Vercel, complete domain approval, and verify final submission requirements.

## Engineering guidelines

- Keep code simple, readable, concise, and well typed.
- Reuse existing patterns and share logic when it meaningfully prevents duplication.
- Explain important decisions for interview discussion.
- Diagnose errors before changes; avoid unrelated fixes or automatic dependency upgrades.
