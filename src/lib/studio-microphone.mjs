export function microphoneError(error) {
  const messages = {
    NotAllowedError: 'Microphone access was denied or restricted by the browser, operating system, or embedding page. Check site/OS microphone settings and try again.',
    NotFoundError: 'No audio input device was found. Connect or enable a microphone and retry.',
    NotReadableError: 'The microphone could not be opened. Close other audio apps or check the operating system input device, then retry.',
    OverconstrainedError: 'The microphone does not support the requested audio settings. Choose a working default input device and retry.',
    SecurityError: 'Microphone access is blocked by browser security or page policy. Open the studio directly over HTTPS.',
    AbortError: 'Microphone initialization was interrupted. Try again.',
  };
  return messages[error?.name] ?? 'Microphone initialization failed. Check your audio input device and try again.';
}

export async function openStudioMicrophone({ environment = globalThis, onLevel = () => {}, onFailure = () => {} } = {}) {
  if (!environment.isSecureContext) throw new Error('Microphone access requires HTTPS or localhost.');
  const policy = environment.document?.permissionsPolicy ?? environment.document?.featurePolicy;
  if (policy?.allowsFeature && !policy.allowsFeature('microphone')) throw new Error('This page or embedding frame blocks microphone access through Permissions Policy. Open the studio directly or ask the host to allow microphone access.');
  if (!environment.navigator?.mediaDevices?.getUserMedia) throw new Error('This browser does not support microphone capture. Use an updated supported browser over HTTPS.');
  let stream;
  try { stream = await environment.navigator.mediaDevices.getUserMedia({ audio: true }); }
  catch (error) {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') console.debug('Studio microphone failure', { name: error?.name });
    throw new Error(microphoneError(error));
  }
  let context, source, analyser, timer, recorder, chunks = [], bytes = 0, closed = false, finishPromise, resolveRecording, rejectRecording;
  let tracksStopped=false;
  const stopTracks = () => { if(!tracksStopped){tracksStopped=true;stream.getTracks().forEach(track => track.stop());} };
  const trackEnded = () => { close(); onFailure('The microphone was disconnected or stopped by the operating system. Reconnect it and retry.'); };
  const close = () => {
    if (closed) return; closed = true;
    clearInterval(timer); source?.disconnect(); analyser?.disconnect();
    if (recorder?.state === 'recording') { recorder.ondataavailable = null; recorder.onstop = null; recorder.stop(); }
    rejectRecording?.(new Error('Recording canceled.')); rejectRecording = resolveRecording = null;
    stream.getTracks().forEach(track=>track.removeEventListener?.('ended',trackEnded));
    stopTracks(); void context?.close().catch(() => {}); onLevel(0); chunks = [];
  };
  stream.getTracks().forEach(track=>track.addEventListener?.('ended',trackEnded,{once:true}));
  try {
    const Context = environment.AudioContext ?? environment.webkitAudioContext;
    if (Context) {
      context = new Context(); source = context.createMediaStreamSource(stream); analyser = context.createAnalyser(); analyser.fftSize = 256;
      source.connect(analyser); const values = new Uint8Array(analyser.fftSize);
      void context.resume().catch(() => {});
      timer = setInterval(() => { if (closed) return; analyser.getByteTimeDomainData(values); const rms = Math.sqrt(values.reduce((sum, value) => sum + ((value - 128) / 128) ** 2, 0) / values.length); onLevel(Math.min(1, rms * 4)); }, 100);
    }
  } catch { /* Meter availability must not prevent working audio capture. */ }
  return {
    stream, close,
    record() {
      if (closed || recorder) throw new Error('The microphone recording session is unavailable. Retry recording.');
      const Recorder = environment.MediaRecorder;
      if (!Recorder) throw new Error('This browser has no supported audio recorder or speech service. Try an updated Chrome, Edge, or Safari browser.');
      const mimeType = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'].find(type => Recorder.isTypeSupported(type));
      if (!mimeType) throw new Error('This browser cannot record a supported audio format. Try another browser.');
      recorder = new Recorder(stream, { mimeType, audioBitsPerSecond: 64000 });
      finishPromise = new Promise((resolve, reject) => { resolveRecording = resolve; rejectRecording = reject; });
      // Cancellation may happen before callers request the final recording.
      finishPromise.catch(() => {});
      recorder.onerror = () => { const message='Audio recording failed. Check the input device and retry.'; rejectRecording?.(new Error(message)); close(); onFailure(message); };
      recorder.ondataavailable = event => {
        bytes += event.data.size;
        if (bytes > 3_000_000) { const message='Recording exceeded the 3 MB limit. Use a shorter recording.'; rejectRecording?.(new Error(message)); close(); onFailure(message); return; }
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onstop = () => { const blob = new Blob(chunks, { type: mimeType }); resolveRecording?.(blob); resolveRecording = rejectRecording = null; close(); };
      recorder.start(250);
    },
    finish() {
      if (!recorder || closed) return finishPromise ?? Promise.reject(new Error('No recording is active.'));
      if (recorder.state === 'recording') recorder.stop();
      stopTracks();
      return finishPromise;
    },
  };
}
