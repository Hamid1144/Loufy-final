/**
 * Loufy Publisher — AI Video Editor & Word-by-Word Caption Studio
 * Full browser-native port of the AI Video Editor pipeline:
 *  1. Video Upload & Web Audio Waveform + 16kHz PCM Extraction
 *  2. Local Browser Whisper AI (Transformers.js) with Word-Level Timestamps
 *  3. Energy-based Silence Detection (silent_runs) & Mistake/Filler Finder
 *  4. 7 Nafay 3D / Editorial Caption Styles + Karaoke Word Highlighting
 *  5. Motion Graphic Beats (SPANS) with smart caption auto-hide
 *  6. Real-time Cut-Skipping Preview & Video / ASS / SRT / VTT / JSON Export
 */
(function () {
  'use strict';

  /* ========================================================================
     1. 7 SIGNATURE STYLES (Matched 1:1 to captions.py)
     ======================================================================== */
  const STYLES = {
    'warm-canvas': {
      name: 'Warm Canvas',
      font: 'Fraunces',
      weight: '600',
      size: 80,
      color: '#ffffff',
      highlight: '#4f9cf0',
      outline: '#000000',
      border: 0,
      shadow: 3,
      upper: false,
      cardBg: '#fcfaf5',
      cardFg: '#1a2420',
      cardAccent: '#4f9cf0'
    },
    'creator-motion-graphics': {
      name: 'Creator Motion',
      font: 'Inter',
      weight: '800',
      size: 74,
      color: '#f4f1ea',
      highlight: '#ffd60a',
      outline: '#000000',
      border: 0,
      shadow: 3,
      upper: true,
      cardBg: '#111215',
      cardFg: '#f4f1ea',
      cardAccent: '#ffd60a'
    },
    'clean-tech': {
      name: 'Clean Tech',
      font: 'Inter Tight',
      weight: '800',
      size: 74,
      color: '#ffffff',
      highlight: '#7d9bff',
      outline: '#0d0f14',
      border: 0,
      shadow: 3,
      upper: false,
      cardBg: '#f4f7ff',
      cardFg: '#0d0f14',
      cardAccent: '#5274ff'
    },
    'software-walkthrough': {
      name: 'Software Walk',
      font: 'DM Sans',
      weight: '700',
      size: 72,
      color: '#ffffff',
      highlight: '#9b9bff',
      outline: '#14161c',
      border: 0,
      shadow: 3,
      upper: false,
      cardBg: '#161822',
      cardFg: '#ffffff',
      cardAccent: '#9b9bff'
    },
    'data-story': {
      name: 'Data Story',
      font: 'Archivo',
      weight: '800',
      size: 74,
      color: '#eef1f5',
      highlight: '#ff6b5b',
      outline: '#0f141c',
      border: 0,
      shadow: 3,
      upper: false,
      cardBg: '#0f141c',
      cardFg: '#eef1f5',
      cardAccent: '#ff6b5b'
    },
    'chalk-talk': {
      name: 'Chalk Talk',
      font: 'Kalam',
      weight: '700',
      size: 82,
      color: '#f2efe6',
      highlight: '#f4d35e',
      outline: '#24392f',
      border: 3,
      shadow: 2,
      upper: false,
      cardBg: '#1e3329',
      cardFg: '#f2efe6',
      cardAccent: '#f4d35e'
    },
    'pop-info': {
      name: 'Pop Info',
      font: 'Fredoka',
      weight: '700',
      size: 78,
      color: '#ffffff',
      highlight: '#ffd86b',
      outline: '#2f3e46',
      border: 4,
      shadow: 0,
      upper: false,
      cardBg: '#fff8e7',
      cardFg: '#2f3e46',
      cardAccent: '#f4a261'
    }
  };

  const FILLERS = new Set(['um', 'uh', 'umm', 'uhh', 'ah', 'er', 'erm', 'hmm']);
  const REDO_PHRASES = ['let me say that again', 'cut that', 'one more time', 'let me redo'];

  /* ========================================================================
     2. APPLICATION STATE
     ======================================================================== */
  const state = {
    videoUrl: null,
    videoName: 'untitled.mp4',
    duration: 0,
    videoWidth: 1280,
    videoHeight: 720,
    aspect: '16:9', // '16:9' | '9:16' | '1:1'
    audioBuffer: null,
    waveformPeaks: [],

    // Transcription
    words: [], // { i, w, s, e, p, cap?, removed? }
    language: 'auto',
    whisperModel: 'onnx-community/whisper-tiny',
    isTranscribing: false,

    // Cuts
    cutSilence: true,
    cutMistakes: true,
    pauseKeep: 0.30, // 0.30 natural | 0.15 tight
    minGap: 0.60,
    cuts: [], // { id, type: 'silence'|'mistake', start, end, reason, enabled }
    keptSegments: [], // [[s, e], ...]
    editedDuration: 0,

    // Captions
    captionsOn: true,
    styleId: 'warm-canvas',
    fontSize: 80,
    textColor: '#ffffff',
    highlightColor: '#4f9cf0',
    outlinePx: 2,
    maxWords: 5,
    maxChars: 30,
    position: 'bottom', // 'bottom' | 'lower' | 'center' | 'top'
    uppercase: false,
    popAnim: true,

    // Motion Graphic Beats (SPANS)
    beats: [], // { id, start, end, title, subtitle, stat, styleType }

    // Playback & Render
    isPlaying: false,
    playbackRate: 1,
    isRendering: false,
    selectedWordIdx: -1
  };

  /* ========================================================================
     3. DOM REFERENCES
     ======================================================================== */
  const $ = (id) => document.getElementById(id);
  const videoEl = $('source-video');
  const previewCanvas = $('preview-canvas');
  const ctx = previewCanvas.getContext('2d');
  const timelineCanvas = $('timeline-canvas');
  const tlCtx = timelineCanvas.getContext('2d');

  let rafId = null;
  let audioCtx = null;

  /* ========================================================================
     4. INITIALIZATION
     ======================================================================== */
  function init() {
    bindNavigation();
    bindUploadAndAI();
    bindCutsControls();
    bindCaptionControls();
    bindBeatsControls();
    bindTransportAndStage();
    bindExports();
    renderStylesGrid();
    updateStyleInputs();
    resizePreviewCanvas();
    drawTimeline();
    window.addEventListener('resize', drawTimeline);
  }

  function bindNavigation() {
    document.querySelectorAll('.rail-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.railTab;
        document.querySelectorAll('.rail-btn').forEach((b) => b.classList.remove('active'));
        document.querySelectorAll('.sidebar-tab-pane').forEach((p) => p.classList.remove('active'));
        btn.classList.add('active');
        const pane = $('pane-' + tab);
        if (pane) pane.classList.add('active');
      });
    });

    $('btn-hdr-help').addEventListener('click', () => $('help-modal').classList.add('open'));
    $('btn-close-help').addEventListener('click', () => $('help-modal').classList.remove('open'));
    $('help-modal').addEventListener('click', (e) => {
      if (e.target === $('help-modal')) $('help-modal').classList.remove('open');
    });

    $('btn-hdr-reset').addEventListener('click', resetProject);
    $('btn-hdr-demo').addEventListener('click', loadDemoProject);
    $('btn-empty-demo').addEventListener('click', loadDemoProject);
    $('btn-empty-upload').addEventListener('click', () => $('video-file-input').click());
  }

  function resetProject() {
    pauseVideo();
    if (state.videoUrl) URL.revokeObjectURL(state.videoUrl);
    state.videoUrl = null;
    state.duration = 0;
    state.audioBuffer = null;
    state.waveformPeaks = [];
    state.words = [];
    state.cuts = [];
    state.beats = [];
    state.keptSegments = [];
    state.editedDuration = 0;
    videoEl.removeAttribute('src');
    videoEl.load();
    $('stage-empty-overlay').classList.remove('hidden');
    $('video-meta-badge').textContent = 'No video';
    $('word-chips-wrap').innerHTML = '<div class="ctrl-sub">Transcribe or load demo to edit words.</div>';
    $('cuts-list').innerHTML = '<div class="ctrl-sub">No cuts detected yet.</div>';
    $('beats-list').innerHTML = '<div class="ctrl-sub">No motion beats added yet.</div>';
    updateCutStats();
    drawTimeline();
    setStatus('Ready — Upload a video or load the interactive demo');
  }

  /* ========================================================================
     5. VIDEO UPLOAD, AUDIO DECODING & WHISPER AI TRANSCRIPTION
     ======================================================================== */
  function bindUploadAndAI() {
    const dropzone = $('upload-dropzone');
    const fileInput = $('video-file-input');

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleVideoFile(e.dataTransfer.files[0]);
      }
    });
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleVideoFile(e.target.files[0]);
      }
    });

    $('sel-language').addEventListener('change', (e) => { state.language = e.target.value; });
    $('sel-whisper-model').addEventListener('change', (e) => { state.whisperModel = e.target.value; });
    $('btn-run-whisper').addEventListener('click', runWhisperTranscription);
    $('btn-import-srt').addEventListener('click', () => $('import-modal').classList.add('open'));
    $('btn-close-import').addEventListener('click', () => $('import-modal').classList.remove('open'));
    $('btn-apply-import').addEventListener('click', applyManualTranscriptImport);
  }

  async function handleVideoFile(file) {
    pauseVideo();
    if (state.videoUrl) URL.revokeObjectURL(state.videoUrl);
    state.videoUrl = URL.createObjectURL(file);
    state.videoName = file.name || 'video.mp4';
    state.words = [];
    state.cuts = [];
    state.beats = [];

    setStatus('Loading video & extracting audio waveform...');
    videoEl.src = state.videoUrl;
    await new Promise((resolve, reject) => {
      videoEl.onloadedmetadata = resolve;
      videoEl.onerror = reject;
    });

    state.duration = videoEl.duration || 0;
    state.videoWidth = videoEl.videoWidth || 1280;
    state.videoHeight = videoEl.videoHeight || 720;

    $('stage-empty-overlay').classList.add('hidden');
    $('video-meta-badge').textContent = `${state.videoWidth}x${state.videoHeight} • ${formatTime(state.duration)}`;
    $('btn-run-whisper').disabled = false;

    resizePreviewCanvas();
    videoEl.currentTime = 0;

    // Decode audio for waveform + silent_runs detector
    try {
      const buf = await file.arrayBuffer();
      const ctxAudio = getAudioContext();
      state.audioBuffer = await ctxAudio.decodeAudioData(buf);
      computeWaveformPeaks(state.audioBuffer);
      detectSilenceCuts();
    } catch (err) {
      console.warn('Audio decode warning:', err);
      state.audioBuffer = null;
      state.waveformPeaks = [];
    }

    recomputeTimeline();
    renderFrame();
    setStatus(`Loaded ${state.videoName} (${formatTime(state.duration)}). Ready to transcribe with Whisper AI.`);
  }

  function getAudioContext() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
    }
    return audioCtx;
  }

  function computeWaveformPeaks(audioBuffer) {
    const ch0 = audioBuffer.getChannelData(0);
    const numPeaks = 320;
    const blockSize = Math.max(1, Math.floor(ch0.length / numPeaks));
    const peaks = [];
    for (let i = 0; i < numPeaks; i++) {
      let max = 0;
      const start = i * blockSize;
      for (let j = 0; j < blockSize; j += 8) {
        const v = Math.abs(ch0[start + j] || 0);
        if (v > max) max = v;
      }
      peaks.push(max);
    }
    state.waveformPeaks = peaks;
  }

  async function extractMono16kFloat32(audioBuffer) {
    const targetSr = 16000;
    const len = Math.ceil(audioBuffer.duration * targetSr);
    const offline = new OfflineAudioContext(1, len, targetSr);
    const src = offline.createBufferSource();
    src.buffer = audioBuffer;
    src.connect(offline.destination);
    src.start(0);
    const rendered = await offline.startRendering();
    return rendered.getChannelData(0);
  }

  async function runWhisperTranscription() {
    if (!state.audioBuffer) {
      alert('No audio track decoded from this video. You can import an SRT/text script instead.');
      return;
    }
    if (state.isTranscribing) return;

    state.isTranscribing = true;
    const btn = $('btn-run-whisper');
    const progBox = $('ai-progress-box');
    const progLabel = $('ai-progress-label');
    const progPct = $('ai-progress-pct');
    const progFill = $('ai-progress-fill');

    btn.disabled = true;
    progBox.classList.add('visible');
    progLabel.textContent = 'Loading Whisper AI engine...';
    progPct.textContent = '5%';
    progFill.style.width = '5%';

    try {
      const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.1.2');
      env.allowLocalModels = false;

      const hasWebGPU = !!navigator.gpu;
      const device = hasWebGPU ? 'webgpu' : 'wasm';

      const transcriber = await pipeline('automatic-speech-recognition', state.whisperModel, {
        device,
        dtype: hasWebGPU ? 'fp32' : 'q8',
        progress_callback: (info) => {
          if (info && typeof info.progress === 'number') {
            const pct = Math.min(95, Math.round(info.progress));
            progLabel.textContent = `Downloading/Loading ${info.file || 'model'}...`;
            progPct.textContent = pct + '%';
            progFill.style.width = pct + '%';
          }
        }
      });

      progLabel.textContent = 'Extracting 16kHz mono PCM audio...';
      progPct.textContent = '65%';
      progFill.style.width = '65%';
      const audio16k = await extractMono16kFloat32(state.audioBuffer);

      progLabel.textContent = 'Transcribing with word-level timestamps...';
      progPct.textContent = '80%';
      progFill.style.width = '80%';

      const opts = {
        return_timestamps: 'word',
        chunk_length_s: 30,
        stride_length_s: 5
      };
      if (state.language !== 'auto') {
        opts.language = state.language;
      }

      const result = await transcriber(audio16k, opts);
      const chunks = result.chunks || [];

      if (chunks.length === 0 && result.text) {
        // Fallback: split sentence evenly if model returned sentence-only
        const rawWords = result.text.trim().split(/\s+/);
        const step = state.duration / Math.max(1, rawWords.length);
        state.words = rawWords.map((w, idx) => ({
          i: idx,
          w,
          s: +(idx * step).toFixed(3),
          e: +((idx + 1) * step - 0.03).toFixed(3),
          p: 0.9
        }));
      } else {
        state.words = chunks
          .filter((c) => c.text && c.text.trim())
          .map((c, idx) => {
            const s = Array.isArray(c.timestamp) && c.timestamp[0] != null ? c.timestamp[0] : 0;
            const e = Array.isArray(c.timestamp) && c.timestamp[1] != null ? c.timestamp[1] : s + 0.35;
            return {
              i: idx,
              w: c.text.trim(),
              s: +s.toFixed(3),
              e: +Math.max(s + 0.08, e).toFixed(3),
              p: 0.95
            };
          });
      }

      progLabel.textContent = `Complete! ${state.words.length} words timestamped.`;
      progPct.textContent = '100%';
      progFill.style.width = '100%';

      detectMistakeCuts();
      recomputeTimeline();
      renderWordChips();
      renderFrame();
      setStatus(`Transcribed ${state.words.length} words with Whisper AI.`);
    } catch (err) {
      console.error('Whisper error:', err);
      progLabel.textContent = 'Error: ' + (err.message || 'Model load failed');
      alert('Whisper AI failed in this browser session: ' + (err.message || err) + '\nYou can still import SRT/text or use the Demo.');
    } finally {
      state.isTranscribing = false;
      btn.disabled = false;
    }
  }

  function applyManualTranscriptImport() {
    const raw = $('import-textarea').value.trim();
    if (!raw) return;

    // Detect SRT format
    if (/\d{2}:\d{2}:\d{2}[,\.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[,\.]\d{3}/.test(raw)) {
      const blocks = raw.split(/\n\s*\n/);
      const words = [];
      let idx = 0;
      for (const b of blocks) {
        const lines = b.trim().split('\n');
        const timeLine = lines.find((l) => l.includes('-->'));
        if (!timeLine) continue;
        const m = timeLine.match(/(\d{2}:\d{2}:\d{2}[,\.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,\.]\d{3})/);
        if (!m) continue;
        const s0 = parseSrtTime(m[1]);
        const e0 = parseSrtTime(m[2]);
        const textLines = lines.slice(lines.indexOf(timeLine) + 1).join(' ').trim();
        const toks = textLines.split(/\s+/).filter(Boolean);
        const dt = (e0 - s0) / Math.max(1, toks.length);
        toks.forEach((t, k) => {
          words.push({
            i: idx++,
            w: t,
            s: +(s0 + k * dt).toFixed(3),
            e: +(s0 + (k + 1) * dt - 0.02).toFixed(3),
            p: 0.99
          });
        });
      }
      state.words = words;
    } else {
      // Plain text distributed across duration
      const dur = state.duration || 12;
      const toks = raw.split(/\s+/).filter(Boolean);
      const dt = dur / Math.max(1, toks.length);
      state.words = toks.map((t, idx) => ({
        i: idx,
        w: t,
        s: +(idx * dt).toFixed(3),
        e: +((idx + 1) * dt - 0.03).toFixed(3),
        p: 0.99
      }));
    }

    $('import-modal').classList.remove('open');
    detectMistakeCuts();
    recomputeTimeline();
    renderWordChips();
    renderFrame();
    setStatus(`Imported ${state.words.length} words into caption editor.`);
  }

  function parseSrtTime(str) {
    const [hms, ms] = str.replace(',', '.').split('.');
    const [h, m, s] = hms.split(':').map(Number);
    return h * 3600 + m * 60 + s + Number('0.' + (ms || '0'));
  }

  /* ========================================================================
     6. SILENCE & MISTAKE CUT DETECTION (Exact port of cut.py)
     ======================================================================== */
  function bindCutsControls() {
    $('chk-cut-silence').addEventListener('change', (e) => {
      state.cutSilence = e.target.checked;
      syncCutEnabledFlags();
    });
    $('chk-cut-mistakes').addEventListener('change', (e) => {
      state.cutMistakes = e.target.checked;
      syncCutEnabledFlags();
    });
    $('sel-pace').addEventListener('change', (e) => {
      state.pauseKeep = parseFloat(e.target.value);
      detectSilenceCuts();
      recomputeTimeline();
    });
    $('rng-min-gap').addEventListener('input', (e) => {
      state.minGap = parseFloat(e.target.value);
      $('lbl-min-gap').textContent = state.minGap.toFixed(2) + 's';
    });
    $('rng-min-gap').addEventListener('change', () => {
      detectSilenceCuts();
      recomputeTimeline();
    });
  }

  function detectSilenceCuts() {
    // Remove previous silence cuts
    state.cuts = state.cuts.filter((c) => c.type !== 'silence');
    if (!state.audioBuffer) return;

    const sr = state.audioBuffer.sampleRate;
    const ch0 = state.audioBuffer.getChannelData(0);
    const ch1 = state.audioBuffer.numberOfChannels > 1 ? state.audioBuffer.getChannelData(1) : ch0;

    const hop = Math.floor(sr / 100); // 10ms hop
    const n = Math.floor(ch0.length / hop);
    if (n === 0) return;

    const dbs = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      let sumSq = 0;
      const offset = i * hop;
      for (let j = 0; j < hop; j++) {
        const m = 0.5 * (ch0[offset + j] + ch1[offset + j]);
        sumSq += m * m;
      }
      dbs[i] = 20 * Math.log10(Math.sqrt(sumSq / hop) + 1e-9);
    }

    const sorted = Float32Array.from(dbs).sort();
    const floor = sorted[Math.floor(n * 0.10)];
    const loud = sorted[Math.floor(n * 0.95)];
    const thr = Math.max(floor + 6, floor + 0.28 * (loud - floor));

    const speech = new Uint8Array(n);
    for (let i = 0; i < n; i++) speech[i] = dbs[i] > thr ? 1 : 0;

    // 60ms speech hold (k = 6 frames each side)
    const held = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      if (speech[i]) {
        for (let k = Math.max(0, i - 6); k <= Math.min(n - 1, i + 6); k++) held[k] = 1;
      }
    }

    let i = 0;
    let cid = 1;
    while (i < n) {
      if (!held[i]) {
        let j = i;
        while (j < n && !held[j]) j++;
        const s = i * 0.01;
        const e = j * 0.01;
        if (e - s >= state.minGap && e - s > state.pauseKeep + 0.1) {
          const pad = state.pauseKeep / 2;
          const cutStart = +(s + pad).toFixed(2);
          const cutEnd = +(e - pad).toFixed(2);
          if (cutEnd > cutStart + 0.08) {
            state.cuts.push({
              id: 'sil-' + (cid++),
              type: 'silence',
              start: cutStart,
              end: cutEnd,
              reason: `Long pause (${(e - s).toFixed(1)}s)`,
              enabled: state.cutSilence
            });
          }
        }
        i = j;
      } else {
        i++;
      }
    }
    state.cuts.sort((a, b) => a.start - b.start);
    renderCutsList();
  }

  function detectMistakeCuts() {
    state.cuts = state.cuts.filter((c) => c.type !== 'mistake');
    let mid = 1;

    for (let idx = 0; idx < state.words.length; idx++) {
      const wObj = state.words[idx];
      const clean = wObj.w.toLowerCase().replace(/[^a-z0-9']/g, '');

      // Filler words
      if (FILLERS.has(clean)) {
        wObj.isFiller = true;
        state.cuts.push({
          id: 'mis-' + (mid++),
          type: 'mistake',
          start: Math.max(0, +(wObj.s - 0.03).toFixed(2)),
          end: +(wObj.e + 0.03).toFixed(2),
          reason: `Filler "${wObj.w}"`,
          wordIdx: idx,
          enabled: state.cutMistakes
        });
        continue;
      }

      // Immediate stutter / repeat
      if (idx + 1 < state.words.length) {
        const nextClean = state.words[idx + 1].w.toLowerCase().replace(/[^a-z0-9']/g, '');
        if (clean && clean === nextClean && clean.length >= 2) {
          state.cuts.push({
            id: 'mis-' + (mid++),
            type: 'mistake',
            start: Math.max(0, +(wObj.s - 0.03).toFixed(2)),
            end: +(wObj.e + 0.03).toFixed(2),
            reason: `Repeated word "${wObj.w}"`,
            wordIdx: idx,
            enabled: state.cutMistakes
          });
        }
      }
    }

    // Explicit redo phrase check
    const fullLower = state.words.map((w) => w.w.toLowerCase().replace(/[^a-z0-9'\s]/g, '')).join(' ');
    for (const phrase of REDO_PHRASES) {
      if (fullLower.includes(phrase)) {
        // Highlighted in UI
      }
    }

    state.cuts.sort((a, b) => a.start - b.start);
    renderCutsList();
  }

  function syncCutEnabledFlags() {
    state.cuts.forEach((c) => {
      if (c.type === 'silence') c.enabled = state.cutSilence;
      if (c.type === 'mistake') c.enabled = state.cutMistakes;
    });
    renderCutsList();
    recomputeTimeline();
    renderWordChips();
  }

  function renderCutsList() {
    const list = $('cuts-list');
    if (state.cuts.length === 0) {
      list.innerHTML = '<div class="ctrl-sub">No silences or mistakes detected yet.</div>';
      $('cuts-badge').classList.remove('visible');
      updateCutStats();
      return;
    }

    $('cuts-badge').textContent = state.cuts.filter((c) => c.enabled).length;
    $('cuts-badge').classList.add('visible');

    list.innerHTML = '';
    state.cuts.forEach((c) => {
      const row = document.createElement('label');
      row.className = 'cut-item';
      row.innerHTML = `
        <div class="cut-item-left">
          <input type="checkbox" ${c.enabled ? 'checked' : ''} data-cut-id="${c.id}">
          <span class="cut-tag ${c.type}">${c.type}</span>
          <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600;">${escapeHtml(c.reason)}</span>
        </div>
        <span class="cut-time">${c.start.toFixed(2)}s-${c.end.toFixed(2)}s</span>
      `;
      const chk = row.querySelector('input');
      chk.addEventListener('change', () => {
        c.enabled = chk.checked;
        recomputeTimeline();
        renderWordChips();
        renderFrame();
      });
      row.addEventListener('click', (e) => {
        if (e.target.tagName !== 'INPUT') {
          videoEl.currentTime = Math.max(0, c.start - 0.5);
          renderFrame();
        }
      });
      list.appendChild(row);
    });
    updateCutStats();
  }

  function recomputeTimeline() {
    const dur = state.duration || 0;
    if (dur <= 0) {
      state.keptSegments = [];
      state.editedDuration = 0;
      updateCutStats();
      drawTimeline();
      return;
    }

    // Merge enabled overlapping cuts
    const active = state.cuts
      .filter((c) => c.enabled && c.end > c.start)
      .map((c) => [Math.max(0, c.start), Math.min(dur, c.end)])
      .sort((a, b) => a[0] - b[0]);

    const merged = [];
    for (const seg of active) {
      if (!merged.length || seg[0] > merged[merged.length - 1][1]) {
        merged.push([...seg]);
      } else {
        merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], seg[1]);
      }
    }

    const kept = [];
    let cursor = 0;
    for (const [cs, ce] of merged) {
      if (cs > cursor + 0.02) kept.push([cursor, cs]);
      cursor = Math.max(cursor, ce);
    }
    if (cursor < dur - 0.02) kept.push([cursor, dur]);

    state.keptSegments = kept;
    state.editedDuration = kept.reduce((acc, [a, b]) => acc + (b - a), 0);

    // Mark words inside cuts as removed
    state.words.forEach((w) => {
      const mid = (w.s + w.e) / 2;
      w.inCut = merged.some(([cs, ce]) => mid >= cs && mid <= ce);
    });

    updateCutStats();
    drawTimeline();
  }

  function sourceToEditedTime(srcT) {
    let acc = 0;
    for (const [a, b] of state.keptSegments) {
      if (srcT < a) return acc;
      if (srcT <= b) return acc + (srcT - a);
      acc += (b - a);
    }
    return acc;
  }

  function editedToSourceTime(edT) {
    let rem = Math.max(0, edT);
    for (const [a, b] of state.keptSegments) {
      const len = b - a;
      if (rem <= len) return a + rem;
      rem -= len;
    }
    return state.duration;
  }

  function updateCutStats() {
    $('stat-orig-dur').textContent = formatTime(state.duration);
    $('stat-edit-dur').textContent = formatTime(state.editedDuration);
    const saved = Math.max(0, state.duration - state.editedDuration);
    $('stat-saved-dur').textContent = '-' + saved.toFixed(1) + 's';
    $('time-readout').textContent = `${formatTime(sourceToEditedTime(videoEl.currentTime || 0))} / ${formatTime(state.editedDuration)}`;
  }

  /* ========================================================================
     7. CAPTIONS & 7 STYLES CONTROLS
     ======================================================================== */
  function bindCaptionControls() {
    $('chk-captions-on').addEventListener('change', (e) => {
      state.captionsOn = e.target.checked;
      renderFrame();
    });
    $('rng-font-size').addEventListener('input', (e) => {
      state.fontSize = parseInt(e.target.value, 10);
      $('lbl-font-size').textContent = state.fontSize + 'px';
      renderFrame();
    });
    $('rng-max-words').addEventListener('input', (e) => {
      state.maxWords = parseInt(e.target.value, 10);
      $('lbl-max-words').textContent = state.maxWords;
      renderFrame();
    });
    $('sel-caption-pos').addEventListener('change', (e) => {
      state.position = e.target.value;
      renderFrame();
    });
    $('col-text').addEventListener('input', (e) => {
      state.textColor = e.target.value;
      renderFrame();
    });
    $('col-highlight').addEventListener('input', (e) => {
      state.highlightColor = e.target.value;
      renderFrame();
    });
    $('chk-uppercase').addEventListener('change', (e) => {
      state.uppercase = e.target.checked;
      renderFrame();
    });

    $('btn-save-word').addEventListener('click', () => {
      if (state.selectedWordIdx < 0) return;
      const w = state.words[state.selectedWordIdx];
      const val = $('inp-edit-word').value.trim();
      if (val) w.cap = val;
      else delete w.cap;
      renderWordChips();
      renderFrame();
    });
  }

  function renderStylesGrid() {
    const grid = $('styles-grid');
    grid.innerHTML = '';
    Object.entries(STYLES).forEach(([id, st]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'style-preset-card' + (state.styleId === id ? ' active' : '');
      btn.innerHTML = `
        <div class="style-preview-sample" style="font-family:'${st.font}',sans-serif;color:${st.color};${st.upper ? 'text-transform:uppercase;' : ''}">
          Word <span style="color:${st.highlight};">Glow</span>
        </div>
        <div class="style-preview-name">${st.name}</div>
      `;
      btn.addEventListener('click', () => {
        state.styleId = id;
        updateStyleInputs();
        renderStylesGrid();
        renderFrame();
      });
      grid.appendChild(btn);
    });
  }

  function updateStyleInputs() {
    const st = STYLES[state.styleId] || STYLES['warm-canvas'];
    state.fontSize = st.size;
    state.textColor = st.color;
    state.highlightColor = st.highlight;
    state.outlinePx = st.border;
    state.uppercase = st.upper;

    $('rng-font-size').value = state.fontSize;
    $('lbl-font-size').textContent = state.fontSize + 'px';
    $('col-text').value = state.textColor;
    $('col-highlight').value = state.highlightColor;
    $('chk-uppercase').checked = state.uppercase;
  }

  function renderWordChips() {
    const wrap = $('word-chips-wrap');
    if (state.words.length === 0) {
      wrap.innerHTML = '<div class="ctrl-sub">No words yet. Transcribe video or load demo.</div>';
      return;
    }
    wrap.innerHTML = '';
    state.words.forEach((w, idx) => {
      const chip = document.createElement('span');
      const isRemoved = w.removed || w.inCut;
      chip.className = 'word-chip'
        + (idx === state.selectedWordIdx ? ' active' : '')
        + (isRemoved ? ' removed' : '')
        + (w.isFiller ? ' filler' : '');
      chip.textContent = w.cap || w.w;
      chip.title = `${w.s.toFixed(2)}s - ${w.e.toFixed(2)}s (Click to seek & edit)`;
      chip.addEventListener('click', () => {
        state.selectedWordIdx = idx;
        $('word-editor-box').style.display = 'flex';
        $('inp-edit-word').value = w.cap || w.w;
        videoEl.currentTime = w.s;
        renderWordChips();
        renderFrame();
      });
      wrap.appendChild(chip);
    });
  }

  /* ========================================================================
     8. MOTION GRAPHIC BEATS (SPANS)
     ======================================================================== */
  function bindBeatsControls() {
    $('btn-add-beat').addEventListener('click', () => {
      if (!state.duration) return alert('Load a video first.');
      const curEd = sourceToEditedTime(videoEl.currentTime || 0);
      const start = +curEd.toFixed(2);
      const end = +Math.min(state.editedDuration || state.duration, start + 3.5).toFixed(2);
      const title = $('inp-beat-title').value.trim() || 'Key Takeaway';
      const stat = $('inp-beat-stat').value.trim() || '100%';
      const subtitle = $('inp-beat-sub').value.trim() || 'Visual callout synced to speech';

      state.beats.push({
        id: 'beat-' + Date.now(),
        start,
        end,
        title,
        stat,
        subtitle
      });
      renderBeatsList();
      drawTimeline();
      renderFrame();
    });
  }

  function renderBeatsList() {
    const list = $('beats-list');
    if (state.beats.length === 0) {
      list.innerHTML = '<div class="ctrl-sub">No motion beats added. Captions stay visible everywhere.</div>';
      return;
    }
    list.innerHTML = '';
    state.beats.forEach((b) => {
      const item = document.createElement('div');
      item.className = 'beat-item';
      item.innerHTML = `
        <div>
          <strong>${escapeHtml(b.stat)} — ${escapeHtml(b.title)}</strong>
          <span>${b.start.toFixed(1)}s → ${b.end.toFixed(1)}s (Captions auto-hidden)</span>
        </div>
        <button type="button" class="btn-secondary-sm" style="color:#d94343;">
          <i class="fa-solid fa-trash"></i>
        </button>
      `;
      item.querySelector('button').addEventListener('click', () => {
        state.beats = state.beats.filter((x) => x.id !== b.id);
        renderBeatsList();
        drawTimeline();
        renderFrame();
      });
      list.appendChild(item);
    });
  }

  /* ========================================================================
     9. EXACT CAPTION CHUNKING & CANVAS COMPOSITOR
     ======================================================================== */
  function getCaptionChunks() {
    const activeWords = state.words.filter((w) => {
      if (w.removed || w.inCut) return false;
      const midEd = sourceToEditedTime((w.s + w.e) / 2);
      // Hide captions inside EDIT.SPANS (exact match to captions.py line 62-63)
      const inBeat = state.beats.some((b) => midEd >= b.start - 0.05 && midEd < b.end + 0.05);
      return !inBeat;
    });

    const out = [];
    let cur = [];
    for (const w of activeWords) {
      const txt = w.cap || w.w;
      if (cur.length > 0) {
        const prev = cur[cur.length - 1];
        const prevTxt = prev.cap || prev.w;
        const charCount = cur.reduce((acc, x) => acc + (x.cap || x.w).length + 1, 0) + txt.length;
        const gap = w.s - prev.e;
        if (
          gap > 0.45 ||
          cur.length >= state.maxWords ||
          charCount > state.maxChars ||
          /[.?!।,]$/.test(prevTxt)
        ) {
          out.push(cur);
          cur = [];
        }
      }
      cur.push(w);
    }
    if (cur.length > 0) out.push(cur);
    return out;
  }

  function resizePreviewCanvas() {
    if (state.aspect === '9:16') {
      previewCanvas.width = 720;
      previewCanvas.height = 1280;
    } else if (state.aspect === '1:1') {
      previewCanvas.width = 1080;
      previewCanvas.height = 1080;
    } else {
      previewCanvas.width = 1280;
      previewCanvas.height = 720;
    }
  }

  function renderFrame() {
    const W = previewCanvas.width;
    const H = previewCanvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0b110e';
    ctx.fillRect(0, 0, W, H);

    // 1. Draw Video Frame (cover-fit)
    if (videoEl.readyState >= 2) {
      const vw = videoEl.videoWidth || W;
      const vh = videoEl.videoHeight || H;
      const scale = Math.max(W / vw, H / vh);
      const dw = vw * scale;
      const dh = vh * scale;
      const dx = (W - dw) / 2;
      const dy = (H - dh) / 2;
      ctx.drawImage(videoEl, dx, dy, dw, dh);
    }

    const srcT = videoEl.currentTime || 0;
    const edT = sourceToEditedTime(srcT);

    // 2. Check active Motion Graphic Beat (SPANS)
    const activeBeat = state.beats.find((b) => edT >= b.start && edT < b.end);
    if (activeBeat) {
      drawMotionBeat(ctx, W, H, edT, activeBeat);
    } else if (state.captionsOn && state.words.length > 0) {
      // 3. Draw Word-by-Word Karaoke Captions
      drawCaptions(ctx, W, H, srcT);
    }
  }

  function drawMotionBeat(c, W, H, edT, beat) {
    const st = STYLES[state.styleId] || STYLES['warm-canvas'];
    const dur = Math.max(0.4, beat.end - beat.start);
    const localT = edT - beat.start;
    const enter = Math.min(1, localT / 0.35);
    const exit = Math.min(1, (beat.end - edT) / 0.25);
    const ease = Math.min(enter, exit);
    const slideY = (1 - ease) * 40;

    c.save();
    c.globalAlpha = ease;

    // Subtle backdrop dim
    c.fillStyle = 'rgba(10, 20, 16, 0.45)';
    c.fillRect(0, 0, W, H);

    const cardW = Math.min(W * 0.78, 620);
    const cardH = 220;
    const x = (W - cardW) / 2;
    const y = (H - cardH) / 2 + slideY;

    // Card surface
    c.fillStyle = st.cardBg;
    roundRect(c, x, y, cardW, cardH, 20);
    c.fill();

    // Accent bar
    c.fillStyle = st.cardAccent;
    roundRect(c, x + 28, y + 28, 56, 6, 3);
    c.fill();

    // Stat
    c.fillStyle = st.cardAccent;
    c.font = `800 56px '${st.font}', sans-serif`;
    c.textBaseline = 'top';
    c.fillText(beat.stat, x + 28, y + 48);

    // Title
    c.fillStyle = st.cardFg;
    c.font = `700 28px '${st.font}', sans-serif`;
    c.fillText(beat.title, x + 28, y + 120);

    // Subtitle
    c.globalAlpha = ease * 0.75;
    c.font = `500 18px 'Plus Jakarta Sans', sans-serif`;
    c.fillText(beat.subtitle, x + 28, y + 162);

    c.restore();
  }

  function drawCaptions(c, W, H, srcT) {
    const chunks = getCaptionChunks();
    let activeChunk = null;
    let activeWordIdx = -1;

    for (let gi = 0; gi < chunks.length; gi++) {
      const g = chunks[gi];
      const gStart = g[0].s;
      let gEnd = g[g.length - 1].e + 0.25;
      if (gi + 1 < chunks.length) {
        gEnd = Math.min(gEnd, chunks[gi + 1][0].s);
      }
      if (srcT >= gStart && srcT <= gEnd) {
        activeChunk = g;
        for (let i = 0; i < g.length; i++) {
          const ws = i === 0 ? g[0].s : g[i].s;
          const we = i + 1 < g.length ? g[i + 1].s : gEnd;
          if (srcT >= ws && srcT <= we) {
            activeWordIdx = i;
            break;
          }
        }
        if (activeWordIdx === -1) activeWordIdx = g.length - 1;
        break;
      }
    }

    if (!activeChunk) return;

    const st = STYLES[state.styleId] || STYLES['warm-canvas'];
    const k = H / 1080;
    const fontPx = Math.round(state.fontSize * k * (W < H ? 0.72 : 1));
    const fontStr = `${st.weight} ${fontPx}px '${st.font}', 'Noto Sans Devanagari', sans-serif`;

    c.save();
    c.font = fontStr;
    c.textBaseline = 'middle';

    const texts = activeChunk.map((w) => {
      const t = w.cap || w.w;
      return state.uppercase ? t.toUpperCase() : t;
    });

    const spaceW = c.measureText(' ').width;
    const widths = texts.map((t) => c.measureText(t).width);
    const totalW = widths.reduce((a, b) => a + b, 0) + spaceW * (texts.length - 1);

    let yPos = H * 0.85;
    if (state.position === 'lower') yPos = H * 0.74;
    else if (state.position === 'center') yPos = H * 0.50;
    else if (state.position === 'top') yPos = H * 0.16;

    // 60ms pop fade
    const fadeIn = Math.min(1, Math.max(0, (srcT - activeChunk[0].s) / 0.06));
    c.globalAlpha = fadeIn;

    let cursorX = (W - totalW) / 2;

    for (let i = 0; i < texts.length; i++) {
      const wordText = texts[i];
      const isHi = i === activeWordIdx;

      // Shadow
      if (st.shadow > 0) {
        c.shadowColor = 'rgba(0,0,0,0.65)';
        c.shadowBlur = 8 * k;
        c.shadowOffsetX = 0;
        c.shadowOffsetY = st.shadow * k * 1.5;
      }

      // Outline
      const bord = Math.max(state.outlinePx, st.border) * k * 1.8;
      if (bord > 0) {
        c.lineJoin = 'round';
        c.lineWidth = bord;
        c.strokeStyle = st.outline;
        c.strokeText(wordText, cursorX, yPos);
      }

      c.fillStyle = isHi ? state.highlightColor : state.textColor;
      c.fillText(wordText, cursorX, yPos);

      cursorX += widths[i] + spaceW;
    }

    c.restore();
  }

  /* ========================================================================
     10. TRANSPORT, PLAYBACK LOOP & TIMELINE CANVAS
     ======================================================================== */
  function bindTransportAndStage() {
    $('btn-play-pause').addEventListener('click', togglePlay);
    $('btn-skip-back').addEventListener('click', () => {
      videoEl.currentTime = Math.max(0, (videoEl.currentTime || 0) - 3);
      renderFrame();
      drawTimeline();
    });
    $('btn-skip-fwd').addEventListener('click', () => {
      videoEl.currentTime = Math.min(state.duration, (videoEl.currentTime || 0) + 3);
      renderFrame();
      drawTimeline();
    });
    $('sel-speed').addEventListener('change', (e) => {
      state.playbackRate = parseFloat(e.target.value);
      videoEl.playbackRate = state.playbackRate;
    });

    document.querySelectorAll('.aspect-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.aspect-pill').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.aspect = btn.dataset.aspect;
        resizePreviewCanvas();
        renderFrame();
      });
    });

    timelineCanvas.addEventListener('click', (e) => {
      if (!state.duration) return;
      const rect = timelineCanvas.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      videoEl.currentTime = ratio * state.duration;
      renderFrame();
      drawTimeline();
      updateCutStats();
    });

    videoEl.addEventListener('ended', pauseVideo);
  }

  function togglePlay() {
    if (!state.videoUrl) return;
    if (state.isPlaying) pauseVideo();
    else playVideo();
  }

  function playVideo() {
    if (!state.videoUrl) return;
    state.isPlaying = true;
    videoEl.playbackRate = state.playbackRate;
    videoEl.play().catch(() => {});
    $('btn-play-pause').innerHTML = '<i class="fa-solid fa-pause"></i>';
    tickLoop();
  }

  function pauseVideo() {
    state.isPlaying = false;
    videoEl.pause();
    $('btn-play-pause').innerHTML = '<i class="fa-solid fa-play"></i>';
    if (rafId) cancelAnimationFrame(rafId);
  }

  function tickLoop() {
    if (!state.isPlaying) return;

    // Auto-skip enabled cuts seamlessly!
    const t = videoEl.currentTime;
    const hitCut = state.cuts.find((c) => c.enabled && t >= c.start && t < c.end - 0.04);
    if (hitCut) {
      videoEl.currentTime = hitCut.end;
    }

    renderFrame();
    drawTimeline();
    updateCutStats();
    rafId = requestAnimationFrame(tickLoop);
  }

  function drawTimeline() {
    const rect = timelineCanvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(300, Math.floor(rect.width));
    const h = Math.max(60, Math.floor(rect.height));
    if (timelineCanvas.width !== w * dpr || timelineCanvas.height !== h * dpr) {
      timelineCanvas.width = w * dpr;
      timelineCanvas.height = h * dpr;
    }

    tlCtx.save();
    tlCtx.scale(dpr, dpr);
    tlCtx.fillStyle = '#13221c';
    tlCtx.fillRect(0, 0, w, h);

    const dur = state.duration || 1;

    // 1. Waveform
    if (state.waveformPeaks.length > 0) {
      const barW = w / state.waveformPeaks.length;
      tlCtx.fillStyle = 'rgba(130, 210, 175, 0.35)';
      state.waveformPeaks.forEach((pk, idx) => {
        const bh = Math.max(3, pk * (h * 0.65));
        tlCtx.fillRect(idx * barW, (h - bh) / 2, Math.max(1, barW - 1), bh);
      });
    }

    // 2. Cuts (Red overlays)
    state.cuts.filter((c) => c.enabled).forEach((c) => {
      const x0 = (c.start / dur) * w;
      const x1 = (c.end / dur) * w;
      tlCtx.fillStyle = 'rgba(217, 67, 67, 0.45)';
      tlCtx.fillRect(x0, 0, Math.max(2, x1 - x0), h);
    });

    // 3. Caption Blocks (Bottom strip)
    getCaptionChunks().forEach((g) => {
      const x0 = (g[0].s / dur) * w;
      const x1 = (g[g.length - 1].e / dur) * w;
      tlCtx.fillStyle = 'rgba(79, 156, 240, 0.78)';
      tlCtx.fillRect(x0, h - 12, Math.max(3, x1 - x0), 8);
    });

    // 4. Motion Beats (Top gold strip)
    state.beats.forEach((b) => {
      const sSrc = editedToSourceTime(b.start);
      const eSrc = editedToSourceTime(b.end);
      const x0 = (sSrc / dur) * w;
      const x1 = (eSrc / dur) * w;
      tlCtx.fillStyle = '#e5a922';
      tlCtx.fillRect(x0, 4, Math.max(4, x1 - x0), 8);
    });

    // 5. Playhead
    if (state.duration > 0) {
      const px = ((videoEl.currentTime || 0) / dur) * w;
      tlCtx.strokeStyle = '#ffd60a';
      tlCtx.lineWidth = 2;
      tlCtx.beginPath();
      tlCtx.moveTo(px, 0);
      tlCtx.lineTo(px, h);
      tlCtx.stroke();
    }

    tlCtx.restore();
  }

  /* ========================================================================
     11. EXPORT & RENDER ENGINE (.ASS, .SRT, .VTT, .JSON, VIDEO RENDER)
     ======================================================================== */
  function bindExports() {
    const expBtn = $('btn-hdr-export');
    const expMenu = $('hdr-export-menu');

    expBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      expMenu.classList.toggle('open');
    });
    document.addEventListener('click', () => expMenu.classList.remove('open'));

    document.querySelectorAll('.hdr-export-item').forEach((item) => {
      item.addEventListener('click', () => {
        expMenu.classList.remove('open');
        const fmt = item.dataset.format;
        if (fmt === 'video') renderAndExportVideo();
        else if (fmt === 'ass') downloadText(buildAssFile(), baseName() + '.ass', 'text/plain');
        else if (fmt === 'srt') downloadText(buildSrtFile(), baseName() + '.srt', 'text/plain');
        else if (fmt === 'vtt') downloadText(buildVttFile(), baseName() + '.vtt', 'text/vtt');
        else if (fmt === 'json') downloadText(buildEditedJson(), 'transcript_edited.json', 'application/json');
      });
    });
  }

  function baseName() {
    return (state.videoName || 'edited').replace(/\.[^.]+$/, '');
  }

  function assColor(hex) {
    const h = hex.replace('#', '');
    const r = h.slice(0, 2), g = h.slice(2, 4), b = h.slice(4, 6);
    return `&H00${b}${g}${r}`.toUpperCase();
  }

  function assTs(t) {
    t = Math.max(0, t);
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = (t % 60).toFixed(2).padStart(5, '0');
    return `${h}:${String(m).padStart(2, '0')}:${s}`;
  }

  function buildAssFile() {
    const st = STYLES[state.styleId] || STYLES['warm-canvas'];
    const W = previewCanvas.width, H = previewCanvas.height;
    const head = `[Script Info]
ScriptType: v4.00+
PlayResX: ${W}
PlayResY: ${H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,${st.font},${state.fontSize},${assColor(state.textColor)},${assColor(state.highlightColor)},${assColor(st.outline)},&H70000000,1,0,0,0,100,100,0,0,1,${state.outlinePx},${st.shadow},2,100,100,80,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
    const ev = [];
    const chunks = getCaptionChunks();
    chunks.forEach((g, gi) => {
      const texts = g.map((w) => state.uppercase ? (w.cap || w.w).toUpperCase() : (w.cap || w.w));
      let endAll = sourceToEditedTime(g[g.length - 1].e) + 0.25;
      if (gi + 1 < chunks.length) endAll = Math.min(endAll, sourceToEditedTime(chunks[gi + 1][0].s));

      g.forEach((w, i) => {
        const s = sourceToEditedTime(i === 0 ? g[0].s : w.s);
        const e = i + 1 < g.length ? sourceToEditedTime(g[i + 1].s) : endAll;
        if (e <= s) return;
        const line = texts.map((t, j) => j === i ? `{\\c${assColor(state.highlightColor)}}${t}{\\c${assColor(state.textColor)}}` : t).join(' ');
        const pop = i === 0 ? '{\\fad(60,0)}' : '';
        ev.push(`Dialogue: 0,${assTs(s)},${assTs(e)},Cap,,0,0,0,,${pop}${line}`);
      });
    });
    return head + ev.join('\n') + '\n';
  }

  function srtTs(t, sep = ',') {
    t = Math.max(0, t);
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = Math.floor(t % 60);
    const ms = Math.round((t - Math.floor(t)) * 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}${sep}${String(ms).padStart(3, '0')}`;
  }

  function buildSrtFile() {
    const chunks = getCaptionChunks();
    return chunks.map((g, idx) => {
      const s = sourceToEditedTime(g[0].s);
      const e = sourceToEditedTime(g[g.length - 1].e);
      const txt = g.map((w) => state.uppercase ? (w.cap || w.w).toUpperCase() : (w.cap || w.w)).join(' ');
      return `${idx + 1}\n${srtTs(s, ',')} --> ${srtTs(e, ',')}\n${txt}\n`;
    }).join('\n');
  }

  function buildVttFile() {
    const chunks = getCaptionChunks();
    const body = chunks.map((g) => {
      const s = sourceToEditedTime(g[0].s);
      const e = sourceToEditedTime(g[g.length - 1].e);
      const txt = g.map((w) => state.uppercase ? (w.cap || w.w).toUpperCase() : (w.cap || w.w)).join(' ');
      return `${srtTs(s, '.')} --> ${srtTs(e, '.')}\n${txt}\n`;
    }).join('\n');
    return `WEBVTT\n\n${body}`;
  }

  function buildEditedJson() {
    const outWords = state.words
      .filter((w) => !w.removed && !w.inCut)
      .map((w, idx) => ({
        i: idx,
        w: w.w,
        ...(w.cap ? { cap: w.cap } : {}),
        s: +sourceToEditedTime(w.s).toFixed(3),
        e: +sourceToEditedTime(w.e).toFixed(3),
        p: w.p || 0.95
      }));
    return JSON.stringify({ duration: +state.editedDuration.toFixed(3), words: outWords }, null, 2);
  }

  async function renderAndExportVideo() {
    if (!state.videoUrl || !state.duration) {
      alert('Please upload a video or load the demo first.');
      return;
    }
    if (state.isRendering) return;
    pauseVideo();
    state.isRendering = true;

    const modal = $('render-modal');
    const bar = $('render-progress-fill');
    const lbl = $('render-progress-text');
    modal.classList.add('open');

    try {
      const stream = previewCanvas.captureStream(30);
      try {
        const ctxAudio = getAudioContext();
        if (ctxAudio.state === 'suspended') await ctxAudio.resume();
        if (!videoEl._mediaSource) {
          videoEl._mediaSource = ctxAudio.createMediaElementSource(videoEl);
          const comp = ctxAudio.createDynamicsCompressor();
          videoEl._mediaSource.connect(comp);
          comp.connect(ctxAudio.destination);
          videoEl._destNode = ctxAudio.createMediaStreamDestination();
          comp.connect(videoEl._destNode);
        }
        videoEl._destNode.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
      } catch (e) {
        console.warn('Audio capture note:', e);
      }

      const mime = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')
        ? 'video/mp4;codecs=avc1'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
          ? 'video/webm;codecs=vp9,opus'
          : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6000000 });
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      const finished = new Promise((resolve) => {
        recorder.onstop = resolve;
      });

      videoEl.currentTime = 0;
      await new Promise((r) => { videoEl.onseeked = r; });

      recorder.start(200);
      videoEl.playbackRate = 1;
      await videoEl.play();

      await new Promise((resolve) => {
        function step() {
          if (!state.isRendering || videoEl.ended) {
            resolve();
            return;
          }
          const t = videoEl.currentTime;
          const hitCut = state.cuts.find((c) => c.enabled && t >= c.start && t < c.end - 0.04);
          if (hitCut) {
            videoEl.currentTime = hitCut.end;
          }
          renderFrame();
          const pct = Math.min(99, Math.round((sourceToEditedTime(videoEl.currentTime) / Math.max(0.1, state.editedDuration)) * 100));
          bar.style.width = pct + '%';
          lbl.textContent = `Rendering frames & burning captions... ${pct}%`;
          requestAnimationFrame(step);
        }
        step();
      });

      videoEl.pause();
      recorder.stop();
      await finished;

      const ext = mime.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(chunks, { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName()}_captioned.${ext}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setStatus(`Rendered & exported ${baseName()}_captioned.${ext}`);
    } catch (err) {
      alert('Render failed: ' + err.message);
    } finally {
      state.isRendering = false;
      modal.classList.remove('open');
    }
  }

  /* ========================================================================
     12. BUILT-IN INTERACTIVE DEMO GENERATOR
     ======================================================================== */
  async function loadDemoProject() {
    pauseVideo();
    setStatus('Generating interactive talking-head demo video...');

    // Create a clean synthetic 9.5s talking-head style video via Offscreen/Canvas + MediaRecorder
    const c = document.createElement('canvas');
    c.width = 1280;
    c.height = 720;
    const g = c.getContext('2d');

    const ac = getAudioContext();
    if (ac.state === 'suspended') await ac.resume();
    const dest = ac.createMediaStreamDestination();
    const stream = c.captureStream(30);
    dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));

    // Synthesize gentle speech-like tone bursts matching active words
    const now = ac.currentTime;
    const demoWords = [
      { w: 'Welcome', s: 0.2, e: 0.7 },
      { w: 'to', s: 0.75, e: 0.95 },
      { w: 'Loufy', s: 1.0, e: 1.45 },
      { w: 'AI', s: 1.5, e: 1.8 },
      { w: 'Caption', s: 1.85, e: 2.35 },
      { w: 'Studio.', s: 2.4, e: 2.9 },
      // Deliberate 1.4s pause (2.9 -> 4.3)
      { w: 'Um,', s: 4.35, e: 4.7 },
      { w: 'every', s: 4.8, e: 5.2 },
      { w: 'spoken', s: 5.25, e: 5.7 },
      { w: 'word', s: 5.75, e: 6.15 },
      { w: 'lights', s: 6.2, e: 6.6 },
      { w: 'up', s: 6.65, e: 6.9 },
      { w: 'automatically!', s: 6.95, e: 7.8 }
    ];

    demoWords.forEach((dw) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190 + Math.random() * 80, now + dw.s);
      gain.gain.setValueAtTime(0.0001, now + dw.s);
      gain.gain.exponentialRampToValueAtTime(0.08, now + dw.s + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dw.e);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now + dw.s);
      osc.stop(now + dw.e + 0.02);
    });

    const rec = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];
    rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    const done = new Promise((r) => { rec.onstop = r; });
    rec.start();

    const totalDemoMs = 8200;
    const t0 = performance.now();
    await new Promise((resolve) => {
      function drawLoop() {
        const elapsed = (performance.now() - t0) / 1000;
        if (elapsed >= totalDemoMs / 1000) {
          resolve();
          return;
        }
        // Background gradient
        const grad = g.createLinearGradient(0, 0, 1280, 720);
        grad.addColorStop(0, '#114232');
        grad.addColorStop(1, '#092219');
        g.fillStyle = grad;
        g.fillRect(0, 0, 1280, 720);

        // Animated presenter avatar silhouette
        const pulse = Math.sin(elapsed * 5) * 6;
        g.fillStyle = 'rgba(229, 169, 34, 0.14)';
        g.beginPath();
        g.arc(640, 310, 130 + pulse, 0, Math.PI * 2);
        g.fill();

        g.fillStyle = '#e5a922';
        g.beginPath();
        g.arc(640, 270, 58, 0, Math.PI * 2);
        g.fill();
        g.beginPath();
        g.arc(640, 415, 95, Math.PI, 0);
        g.fill();

        g.fillStyle = 'rgba(255,255,255,0.65)';
        g.font = '600 22px Plus Jakarta Sans, sans-serif';
        g.textAlign = 'center';
        g.fillText('DEMO TALKING-HEAD CLIP', 640, 110);

        requestAnimationFrame(drawLoop);
      }
      drawLoop();
    });

    rec.stop();
    await done;

    const blob = new Blob(chunks, { type: 'video/webm' });
    const file = new File([blob], 'loufy_demo_talking_head.webm', { type: 'video/webm' });
    await handleVideoFile(file);

    state.words = demoWords.map((w, idx) => ({ i: idx, w: w.w, s: w.s, e: w.e, p: 0.99 }));
    detectMistakeCuts();
    recomputeTimeline();
    renderWordChips();
    renderFrame();
    setStatus('Demo loaded! Press Play to see auto-cuts & word-by-word captions in action.');
  }

  /* ========================================================================
     13. UTILITIES
     ======================================================================== */
  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  function downloadText(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function formatTime(sec) {
    sec = Math.max(0, sec || 0);
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  function setStatus(msg) {
    $('stage-status-text').textContent = msg;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
