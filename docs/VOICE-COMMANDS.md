# Casynus studio dictation and voice conversation

The shared dock supports microphone dictation and opt-in spoken conversations in
Architecture, Interior drafting/3D and Infrastructure. Browser-native recognition
is tried first, independently of the selected AI text model. Server transcription
is an authenticated fallback using the existing server-only `GROQ_API_KEY` and
multilingual `whisper-large-v3`; native recognition needs no application speech key.
Text AI provider authentication, keys and quotas still apply.

## Root cause repaired

The original global response header explicitly set `microphone=()`, blocking the
page even when site permissions were Allow. All app documents now use
`microphone=(self)` because Next client navigation into a studio retains the
entry document's policy, including when entering from the homepage or login.
Browser/OS consent is still required, camera stays disabled, and microphone
capture still starts only after Start. Cross-origin embeds need an appropriate parent
policy and iframe allow attribute; the app cannot override a restricting parent.
The old controller also mislabeled browser recognition `not-allowed` as microphone
permission denial. Device access now uses explicit `getUserMedia({ audio: true })`;
speech-service errors are classified separately and can use server transcription.

## Use

1. Open a studio over HTTPS (localhost also works for development).
2. Click the microphone, Voice icon, or **Ctrl + Q** to open the shared compact
   **Voice Speech** modal. Click **Start** to capture; opening alone never records.
   Allow microphone access if your browser prompts. The shortcut also works
   while the dock is minimized or an editor input has focus.
3. Review ordinary native dictation in the composer. Known studio commands execute
   through the validated registry and preserve unrelated typed notes. Supported interim text appears only
   in the recording status and is not committed until final recognition. A small
   waveform indicates actual input activity; it is never a fake animation.
4. Click Send or say **Send** / **Dërgo** as a
   separate utterance. Ordinary non-command dictation is not automatically sent;
   recognized local studio commands execute through the shared registry.
   Reversible native 3D edits auto-apply after validation; deletion requires
   confirmation. Generated model imports retain preview and Apply/Discard.
5. Use **SQ**, **EN**, or **DE** for Albanian, English, or German recognition.
   Changing language stops the current microphone session; start it again.
6. Close or **Esc** cancels and releases resources. **Stop** finishes the current
   recording for transcription. Ctrl + Q also stops an active dictation session.
   Existing draft text remains editable.

7. The existing radio/Voice icon starts a **voice conversation** with a selected
   text provider. Each finalized utterance is sent once, the response is spoken,
   then Start can begin another turn. Listening never automatically restarts.
   Capture stops before AI processing/playback to avoid transcribing the reply.
   Close or Esc ends the session. Local studio commands work independently of the
   text model; conversational answers require a configured provider.
   The controller retains its legacy wake-mode behavior, but the Voice icon now
   directly starts conversation rather than requiring a wake phrase.

Nothing records on load/refresh. Capture, timers, pending uploads, speech playback
and voice-owned AI requests stop when canceled, hidden, unmounted or on account
change. Dictation idles out after 30 seconds. Browser-installed speech voices
provide TTS; unavailable language voices produce a clear error while retaining
the text response. Albanian recognition/TTS availability depends on the browser
or service; multilingual server transcription accepts sq/en/de language codes.

## Recording fallback and privacy

If native recognition is absent or refuses access despite a successfully opened
microphone, the client checks `/api/studio-voice/transcribe` availability. Sign-in,
configured Groq credentials and browser MediaRecorder support are required.
The modal indicates recording for server transcription when fallback is active.
Click Stop in Voice Speech (or use Ctrl+Q), or wait for the 30-second limit.
Ordinary dictation appends to the editable draft; local commands execute through
the registry, and an opted-in conversation submits the resulting turn. Close/Esc cancels and discards
audio. Fallback cannot recover audio spoken before recording actually started.

Only fallback captures a bounded in-memory audio blob, capped at 3 MB. The
authenticated server bounds multipart bytes even without Content-Length, checks
format/language, limits each user to 10 recordings per 15 minutes through the
existing persistent limiter, and calls Groq with a 20-second deadline. Responses
use no-store; the application writes no audio to storage or logs. Provider billing
and data-processing terms still apply. A reachable limiter database is required;
no unmetered fallback is enabled when it fails. No additional browser secret or
transcription dependency package is introduced.

## Browser support and data flow

The implementation detects `SpeechRecognition` / `webkitSpeechRecognition`.
Availability, language support and the recognition service depend on the browser.
Permission denial, missing microphones, unsupported languages, service/network
errors and unsupported browsers are shown separately in the dock. Typed input remains usable.
The shortcut can only be handled when the browser delivers it to the page.

Speech recognition may use a browser-operated remote service; this is not an
offline/local-only speech guarantee. The application receives transcripts and
sends submitted text through the existing AI adapters. The fallback uploads audio
only as needed for transcription and does not persist it. Only sent prompts enter
conversation history. Browser speech playback may also use the device/vendor's
speech service; availability and audible output need target-device verification.

API reference: [MDN: Using the Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API).

## Verification

- `node --test tests/studio-voice.test.mjs tests/studio-ai.test.mjs`: controller
  transitions, wake filtering, phonetic spellings, explicit send/cancel, stale
  callbacks, permission/language/network failures, timeouts and bounded retries.
- `tests/studio-microphone.test.mjs`: capture constraints, permission retry,
  policy/security/device errors, actual chunk handling, cancellation, late streams,
  speech-service refusal after mic grant and one-turn conversation submission.
- `tests/studio-transcription-route.test.mjs`: actual route with isolated auth,
  quota/provider adapters, multilingual uploads, limits and safe failures.
- `tests/studio-voice-policy.test.mjs`: route-scoped microphone response policy.
- With Next running on port 3003: `node scripts/verify-studio-voice.mjs` uses a
  real Chrome synthetic microphone, getUserMedia, MediaRecorder and AudioContext.
  Recognition, transcription/AI HTTP and TTS output are injected; checks cover
  all studios, text/voice submission, recording fallback, permission recovery,
  background cleanup, unsupported recognition, refresh and mobile controls.

Automated/browser checks inject speech results and mock AI HTTP responses.
They do not verify a physical microphone, real acoustic wake accuracy, vendor
speech-service availability or paid AI provider responses. Perform those checks
in the intended deployment/browser with an enabled microphone.
