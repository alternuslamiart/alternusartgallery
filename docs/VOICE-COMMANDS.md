# Casynus studio voice commands

The shared Casynus AI dock supports browser speech recognition in Architecture,
Interior drafting/3D and Infrastructure, without a separate speech API key.
AI provider authentication, keys, quotas and scene proposal approval still apply.

## Use

1. Open a studio over HTTPS (localhost also works for development).
2. Click the microphone or press **Ctrl + Q** to open the dock and dictate.
   Allow microphone access if your browser prompts. The shortcut also works
   while the dock is minimized or an editor input has focus.
3. For wake activation, enable the adjacent radio/wake button, then say
   **Hey, Casynus** followed by the task, or pause and speak the task afterwards.
   Background speech before the wake phrase is ignored by the composer.
4. Review the recognized text. Click Send or say **Send** / **Dërgo** as a
   separate utterance. Recognition alone does not automatically submit a task.
   Generated 3D changes still use the existing preview and Apply/Discard flow.
5. Use **SQ**, **EN**, or **DE** for Albanian, English, or German recognition.
   Changing language stops the current microphone session; start it again.
6. **Esc**, the Stop control, or saying **Stop**, **Cancel**, **Ndalo**, or
   **Anulo** stops listening. Ctrl + Q also stops an active dictation session.
   Existing draft text remains editable.

Wake listening starts only after explicit activation, never on load or refresh.
The minimized dock indicates an enabled voice session. Microphone sessions stop
when the document is hidden, the editor unmounts, or the account changes.
Dictation idles out after 30 seconds; an enabled wake session returns to listening
for the wake phrase. Repeated speech-service termination has bounded retries.

## Browser support and data flow

The implementation detects `SpeechRecognition` / `webkitSpeechRecognition`.
Availability, language support and the recognition service depend on the browser.
Permission denial, missing microphones, unsupported languages, service/network
errors and unsupported browsers are shown in the dock. Typed input remains usable.
The shortcut can only be handled when the browser delivers it to the page.

Speech recognition may use a browser-operated remote service; this is not an
offline/local-only speech guarantee. The application receives transcripts and
sends submitted text through the existing AI adapters; it does not add a server
audio upload/storage endpoint. Only sent prompts enter conversation history.

API reference: [MDN: Using the Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API).

## Verification

- `node --test tests/studio-voice.test.mjs tests/studio-ai.test.mjs`: controller
  transitions, wake filtering, phonetic spellings, explicit send/cancel, stale
  callbacks, permission/language/network failures, timeouts and bounded retries.
- With Next running on port 3003: `node scripts/verify-studio-voice.mjs` verifies
  keyboard opening, minimized wake activation, dictation, a single submitted
  request through each studio adapter, 3D preview, permission errors, tab hiding,
  unsupported browsers and the mobile Interior workspace controls.

Automated/browser checks inject speech results and mock AI HTTP responses.
They do not verify a physical microphone, real acoustic wake accuracy, vendor
speech-service availability or paid AI provider responses. Perform those checks
in the intended deployment/browser with an enabled microphone.
