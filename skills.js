// SimplyLingua — Writing & Speaking skills module
// Injected into every unit page

window.SLSkills = {

  // Unit writing prompts
  writingPrompts: {
    1: "Write 4–5 sentences introducing yourself. Include your name, where you are from, your job, and one hobby.",
    2: "Write about your daily routine. What do you do in the morning, afternoon and evening? Use present simple.",
    3: "Write about shopping. Describe a time you went shopping. What did you buy? How much did it cost?",
    4: "Write about your neighbourhood. What is near your home? Use 'there is' and 'there are'.",
    5: "Write about your favourite food. Do you like it? Why? Is it healthy? Use 'I like / I don't like'.",
    6: "Write about how you travel to work or school. What transport do you use right now or usually?",
    7: "Write about your plans for next week. What are you going to do? Use 'going to' for each plan.",
    8: "Write about an important memory. What happened? When was it? How did you feel? Use past simple."
  },

  // Unit speaking prompts
  speakingPrompts: {
    1: "Introduce yourself out loud. Say your name, where you are from, what your job is, and one thing you enjoy.",
    2: "Talk about your daily routine. Describe what you do every morning and evening.",
    3: "Talk about shopping. Describe something you want to buy and how much you think it costs.",
    4: "Describe your neighbourhood. Talk about what is near your home.",
    5: "Talk about food you like and food you don't like. Say why.",
    6: "Describe how you travel around your city. What transport do you use?",
    7: "Talk about your plans for the future. What are you going to do this week or next month?",
    8: "Tell a short story about something that happened to you in the past. Use past simple."
  },

  init(unitNumber, unitTitle) {
    this.unitNumber = unitNumber;
    this.unitTitle = unitTitle;
    this.writingPrompt = this.writingPrompts[unitNumber];
    this.speakingPrompt = this.speakingPrompts[unitNumber];
    this.renderWritingTab();
    this.renderSpeakingTab();
  },

  renderWritingTab() {
    const el = document.getElementById('tab-write');
    if (!el) return;
    el.innerHTML = `
      <div class="skills-wrap">
        <div class="skills-header">
          <h2>✍️ Writing Practice</h2>
          <p class="skills-task">${this.writingPrompt}</p>
        </div>
        <textarea id="writing-input" placeholder="Write your answer here..." rows="6"></textarea>
        <div class="skills-actions">
          <button class="btn-feedback" onclick="SLSkills.getWritingFeedback()">
            <span id="write-btn-text">Get Feedback</span>
          </button>
        </div>
        <div id="writing-feedback" class="feedback-box" style="display:none"></div>
      </div>`;
  },

  renderSpeakingTab() {
    const el = document.getElementById('tab-speak');
    if (!el) return;
    el.innerHTML = `
      <div class="skills-wrap">
        <div class="skills-header">
          <h2>🎤 Speaking Practice</h2>
          <p class="skills-task">${this.speakingPrompt}</p>
        </div>
        <div class="mic-area">
          <button class="btn-mic" id="mic-btn" onclick="SLSkills.toggleRecording()">
            <span id="mic-icon">🎤</span>
            <span id="mic-label">Start Speaking</span>
          </button>
          <div id="transcript-display" class="transcript-display" style="display:none">
            <strong>What you said:</strong>
            <p id="transcript-text"></p>
          </div>
        </div>
        <div class="skills-actions" id="speak-actions" style="display:none">
          <button class="btn-feedback" onclick="SLSkills.getSpeakingFeedback()">
            <span id="speak-btn-text">Get Feedback</span>
          </button>
        </div>
        <div id="speaking-feedback" class="feedback-box" style="display:none"></div>
        <div id="speech-warning" style="display:none" class="speech-warning">
          ⚠️ Speech recognition is not supported in this browser. Please use Chrome or Edge.
        </div>
      </div>`;

    this.setupSpeechRecognition();
  },

  setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const warn = document.getElementById('speech-warning');
      if (warn) warn.style.display = 'block';
      return;
    }
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.transcript = '';

    this.recognition.onresult = (e) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      this.transcript += final;
      const display = document.getElementById('transcript-text');
      if (display) display.textContent = this.transcript + interim;
    };

    this.recognition.onerror = () => {
      this.isRecording = false;
      this.updateMicUI(false);
    };

    this.recognition.onend = () => {
      if (this.isRecording) this.recognition.start();
    };
  },

  isRecording: false,
  transcript: '',

  toggleRecording() {
    if (!this.recognition) return;
    if (!this.isRecording) {
      this.transcript = '';
      const display = document.getElementById('transcript-display');
      const actions = document.getElementById('speak-actions');
      if (display) { display.style.display = 'block'; }
      if (actions) { actions.style.display = 'none'; }
      this.isRecording = true;
      this.recognition.start();
      this.updateMicUI(true);
    } else {
      this.isRecording = false;
      this.recognition.stop();
      this.updateMicUI(false);
      const actions = document.getElementById('speak-actions');
      if (actions) actions.style.display = 'flex';
    }
  },

  updateMicUI(recording) {
    const btn = document.getElementById('mic-btn');
    const icon = document.getElementById('mic-icon');
    const label = document.getElementById('mic-label');
    if (!btn) return;
    if (recording) {
      btn.classList.add('recording');
      if (icon) icon.textContent = '⏹️';
      if (label) label.textContent = 'Stop Recording';
    } else {
      btn.classList.remove('recording');
      if (icon) icon.textContent = '🎤';
      if (label) label.textContent = 'Start Speaking';
    }
  },

  async getWritingFeedback() {
    const text = document.getElementById('writing-input')?.value?.trim();
    if (!text || text.length < 10) {
      alert('Please write at least a sentence before getting feedback.');
      return;
    }
    const btn = document.getElementById('write-btn-text');
    const box = document.getElementById('writing-feedback');
    if (btn) btn.textContent = 'Getting feedback...';
    if (box) { box.style.display = 'block'; box.innerHTML = '<div class="feedback-loading">✨ Analysing your writing...</div>'; }

    try {
      const res = await fetch('/.netlify/functions/writing-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, unitTitle: this.unitTitle, prompt: this.writingPrompt })
      });
      const data = await res.json();
      if (box) box.innerHTML = `<div class="feedback-content">${data.feedback.replace(/\n/g, '<br>')}</div>`;
    } catch(e) {
      if (box) box.innerHTML = '<div class="feedback-error">Could not get feedback. Please check your connection and try again.</div>';
    }
    if (btn) btn.textContent = 'Get Feedback';
  },

  async getSpeakingFeedback() {
    const transcript = this.transcript?.trim();
    if (!transcript || transcript.length < 5) {
      alert('No speech detected. Please try recording again.');
      return;
    }
    const btn = document.getElementById('speak-btn-text');
    const box = document.getElementById('speaking-feedback');
    if (btn) btn.textContent = 'Getting feedback...';
    if (box) { box.style.display = 'block'; box.innerHTML = '<div class="feedback-loading">✨ Analysing your speaking...</div>'; }

    try {
      const res = await fetch('/.netlify/functions/speaking-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, unitTitle: this.unitTitle, prompt: this.speakingPrompt })
      });
      const data = await res.json();
      if (box) box.innerHTML = `<div class="feedback-content">${data.feedback.replace(/\n/g, '<br>')}</div>`;
    } catch(e) {
      if (box) box.innerHTML = '<div class="feedback-error">Could not get feedback. Please check your connection and try again.</div>';
    }
    if (btn) btn.textContent = 'Get Feedback';
  }
};
