/**
 * Natural AI Assistant • Modern Client Application
 * Autonomous Planner -> Tool -> Assistant Pipeline Frontend
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM References
  const chatForm = document.getElementById("chatForm");
  const userInput = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const messagesContainer = document.getElementById("messagesContainer");
  const messagesList = document.getElementById("messagesList");
  const welcomeHero = document.getElementById("welcomeHero");
  const thinkingIndicator = document.getElementById("thinkingIndicator");
  const thinkingStepText = document.getElementById("thinkingStepText");
  const clearChatBtn = document.getElementById("clearChatBtn");
  const systemStatusText = document.getElementById("systemStatusText");
  const modelNameEl = document.getElementById("modelName");
  const soundToggleBtn = document.getElementById("soundToggleBtn");
  const soundIcon = document.getElementById("soundIcon");
  const toastContainer = document.getElementById("toastContainer");

  // Tool Drawer & Architecture Modal
  const toolsDrawerOverlay = document.getElementById("toolsDrawerOverlay");
  const openToolsBtn = document.getElementById("openToolsBtn");
  const closeToolsDrawerBtn = document.getElementById("closeToolsDrawerBtn");
  const toolCardsList = document.getElementById("toolCardsList");
  const playgroundToolSelect = document.getElementById("playgroundToolSelect");
  const playgroundArgsContainer = document.getElementById("playgroundArgsContainer");
  const runToolDirectBtn = document.getElementById("runToolDirectBtn");
  const playgroundOutputBox = document.getElementById("playgroundOutputBox");
  const playgroundOutputPre = document.getElementById("playgroundOutputPre");
  const playgroundLatency = document.getElementById("playgroundLatency");

  const archModalBackdrop = document.getElementById("archModalBackdrop");
  const openArchitectureBtn = document.getElementById("openArchitectureBtn");
  const closeArchModalBtn = document.getElementById("closeArchModalBtn");

  // State
  let isThinking = false;
  let soundEnabled = localStorage.getItem("natural_ai_sound") !== "false";
  let toolsData = [];
  let audioCtx = null;

  // =========================================================================
  // Web Audio Synthetic Sound Engine
  // =========================================================================
  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
  }

  function playSound(type = "click") {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === "receive") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === "error") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(150, now + 0.18);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      }
    } catch (e) {
      // Ignore audio failure
    }
  }

  function updateSoundUI() {
    if (soundEnabled) {
      soundIcon.className = "ph-bold ph-speaker-high";
      soundToggleBtn.title = "Sound Feedback: Enabled (Click to Mute)";
    } else {
      soundIcon.className = "ph-bold ph-speaker-slash";
      soundToggleBtn.title = "Sound Feedback: Muted (Click to Unmute)";
    }
  }
  updateSoundUI();

  soundToggleBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem("natural_ai_sound", soundEnabled);
    updateSoundUI();
    showToast(soundEnabled ? "Sound enabled" : "Sound muted", "info");
    if (soundEnabled) playSound("click");
  });

  // =========================================================================
  // Dynamic Coordinate Ripple Effect on All Buttons
  // =========================================================================
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".ripple-btn");
    if (!btn) return;

    playSound("click");

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const wave = document.createElement("span");
    wave.className = "ripple-wave";
    wave.style.width = wave.style.height = `${size}px`;
    wave.style.left = `${x}px`;
    wave.style.top = `${y}px`;

    btn.appendChild(wave);
    setTimeout(() => wave.remove(), 600);
  });

  // =========================================================================
  // Toast Notifications
  // =========================================================================
  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = "ph-info";
    if (type === "success") icon = "ph-check-circle";
    if (type === "error") icon = "ph-warning-circle";

    toast.innerHTML = `<i class="ph-bold ${icon}"></i><span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px) scale(0.95)";
      toast.style.transition = "all 200ms ease";
      setTimeout(() => toast.remove(), 200);
    }, 2800);
  }

  // =========================================================================
  // Textarea Auto-resize & Input Handler
  // =========================================================================
  function adjustTextareaHeight() {
    userInput.style.height = "auto";
    const newHeight = Math.min(userInput.scrollHeight, 120);
    userInput.style.height = `${Math.max(newHeight, 24)}px`;
  }

  userInput.addEventListener("input", adjustTextareaHeight);

  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatForm.requestSubmit();
    }
  });

  // =========================================================================
  // Quick Prompt Chips & Mini Pills
  // =========================================================================
  document.addEventListener("click", (e) => {
    const promptBtn = e.target.closest("[data-prompt]");
    if (promptBtn) {
      const promptText = promptBtn.getAttribute("data-prompt");
      if (promptText && !isThinking) {
        userInput.value = promptText;
        adjustTextareaHeight();
        userInput.focus();
        chatForm.requestSubmit();
      }
    }
  });

  // =========================================================================
  // Fetch System Health & Tools Metadata
  // =========================================================================
  async function loadSystemMetadata() {
    try {
      const [healthRes, toolsRes] = await Promise.all([
        fetch("/api/health"),
        fetch("/api/tools")
      ]);

      if (healthRes.ok) {
        const health = await healthRes.json();
        if (modelNameEl && health.model) {
          modelNameEl.textContent = health.model;
        }
        if (systemStatusText) {
          systemStatusText.textContent = "Online • Ready";
        }
      }

      if (toolsRes.ok) {
        const data = await toolsRes.json();
        toolsData = data.tools || [];
        renderToolCards(toolsData);
        populatePlaygroundTools(toolsData);
      }
    } catch (err) {
      console.warn("Could not load backend metadata:", err);
      if (systemStatusText) {
        systemStatusText.textContent = "Connected Locally";
      }
    }
  }
  loadSystemMetadata();

  // =========================================================================
  // Tool Drawer & Direct Execution Playground
  // =========================================================================
  function renderToolCards(tools) {
    if (!toolCardsList) return;
    toolCardsList.innerHTML = "";

    tools.forEach((tool) => {
      const card = document.createElement("div");
      card.className = "tool-info-card";

      const paramEntries = Object.entries(tool.parameters || {});
      const paramHtml = paramEntries.length > 0
        ? paramEntries.map(([name, info]) => `<div><strong>${name}</strong> (${info.type}${info.required ? ", required" : ""}): ${info.description}</div>`).join("")
        : "<div><em>No arguments required</em></div>";

      card.innerHTML = `
        <div class="tool-card-head">
          <div class="tool-name-wrap">
            <i class="ph-bold ph-gear"></i>
            <span>${tool.displayName || tool.name}</span>
          </div>
          <span class="tool-cat-badge">${tool.category || "Utility"}</span>
        </div>
        <p class="tool-card-desc">${tool.description}</p>
        <div class="tool-param-list">${paramHtml}</div>
      `;
      toolCardsList.appendChild(card);
    });
  }

  function populatePlaygroundTools(tools) {
    if (!playgroundToolSelect) return;
    playgroundToolSelect.innerHTML = "";

    tools.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.name;
      opt.textContent = `${t.displayName || t.name} (${t.name})`;
      playgroundToolSelect.appendChild(opt);
    });

    renderPlaygroundInputs();
  }

  function renderPlaygroundInputs() {
    if (!playgroundArgsContainer || !playgroundToolSelect) return;
    const selectedName = playgroundToolSelect.value;
    const tool = toolsData.find((t) => t.name === selectedName);
    playgroundArgsContainer.innerHTML = "";

    if (!tool || !tool.parameters || Object.keys(tool.parameters).length === 0) {
      playgroundArgsContainer.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-muted);">This tool takes no parameters.</span>`;
      return;
    }

    Object.entries(tool.parameters).forEach(([paramName, paramInfo]) => {
      const group = document.createElement("div");
      group.className = "form-group";
      group.innerHTML = `
        <label for="arg_${paramName}">${paramName} <span style="color: var(--text-muted); font-weight: normal;">(${paramInfo.description})</span></label>
        <input type="${paramInfo.type === 'integer' ? 'number' : 'text'}" id="arg_${paramName}" class="form-input" value="${paramInfo.default || ''}" placeholder="Enter ${paramName}..." />
      `;
      playgroundArgsContainer.appendChild(group);
    });
  }

  if (playgroundToolSelect) {
    playgroundToolSelect.addEventListener("change", renderPlaygroundInputs);
  }

  if (runToolDirectBtn) {
    runToolDirectBtn.addEventListener("click", async () => {
      const toolName = playgroundToolSelect.value;
      const tool = toolsData.find((t) => t.name === toolName);
      const args = {};

      if (tool && tool.parameters) {
        Object.entries(tool.parameters).forEach(([pName, pInfo]) => {
          const inputEl = document.getElementById(`arg_${pName}`);
          if (inputEl) {
            let val = inputEl.value;
            if (pInfo.type === "integer") val = parseInt(val, 10);
            args[pName] = val;
          }
        });
      }

      runToolDirectBtn.disabled = true;
      runToolDirectBtn.innerHTML = `<i class="ph-bold ph-spinner animate-spin"></i> Executing...`;

      try {
        const res = await fetch("/api/tools/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tool: toolName, arguments: args })
        });
        const json = await res.json();
        
        playgroundOutputBox.classList.remove("hidden");
        playgroundLatency.textContent = `${json.duration_ms || 0}ms`;
        playgroundOutputPre.textContent = JSON.stringify(json.result !== undefined ? json.result : json, null, 2);
        showToast("Tool executed successfully!", "success");
      } catch (err) {
        showToast(`Execution failed: ${err.message}`, "error");
      } finally {
        runToolDirectBtn.disabled = false;
        runToolDirectBtn.innerHTML = `<i class="ph-bold ph-play"></i> Run Tool Directly`;
      }
    });
  }

  // Drawer Toggles
  openToolsBtn.addEventListener("click", () => {
    toolsDrawerOverlay.classList.add("active");
  });
  closeToolsDrawerBtn.addEventListener("click", () => {
    toolsDrawerOverlay.classList.remove("active");
  });
  toolsDrawerOverlay.addEventListener("click", (e) => {
    if (e.target === toolsDrawerOverlay) {
      toolsDrawerOverlay.classList.remove("active");
    }
  });

  // Architecture Modal Toggles
  openArchitectureBtn.addEventListener("click", () => {
    archModalBackdrop.classList.add("active");
  });
  closeArchModalBtn.addEventListener("click", () => {
    archModalBackdrop.classList.remove("active");
  });
  archModalBackdrop.addEventListener("click", (e) => {
    if (e.target === archModalBackdrop) {
      archModalBackdrop.classList.remove("active");
    }
  });

  // Clear Chat Handler
  clearChatBtn.addEventListener("click", () => {
    if (messagesList.children.length === 0) return;
    if (confirm("Clear conversation history?")) {
      messagesList.innerHTML = "";
      welcomeHero.style.display = "flex";
      showToast("Conversation cleared", "info");
    }
  });

  // =========================================================================
  // Chat Messaging & Pipeline Lifecycle
  // =========================================================================
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message || isThinking) return;

    // Reset input
    userInput.value = "";
    adjustTextareaHeight();
    userInput.blur();

    // Hide welcome hero on first message
    if (welcomeHero) {
      welcomeHero.style.display = "none";
    }

    // Append User Message
    appendUserMessage(message);

    // Set UI to thinking state
    setThinking(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        playSound("receive");
        appendBotMessage(result.data);
      } else {
        playSound("error");
        appendErrorMessage(result.error || result.message || "Failed to process request through the AI pipeline.");
      }
    } catch (err) {
      playSound("error");
      appendErrorMessage(`Network error: ${err.message}. Is the server running?`);
    } finally {
      setThinking(false);
      userInput.focus();
    }
  });

  function setThinking(active) {
    isThinking = active;
    sendBtn.disabled = active;

    if (active) {
      thinkingIndicator.classList.remove("hidden");
      thinkingStepText.textContent = "AI Planner analyzing intent & choosing tool...";
      scrollToBottom();

      // Progressive simulated step updates for immersive feel
      setTimeout(() => {
        if (isThinking) thinkingStepText.textContent = "Executing selected tool & parsing arguments...";
      }, 700);
      setTimeout(() => {
        if (isThinking) thinkingStepText.textContent = "Assistant synthesizing final response...";
      }, 1500);
    } else {
      thinkingIndicator.classList.add("hidden");
    }
  }

  function scrollToBottom() {
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 50);
  }

  function appendUserMessage(text) {
    const row = document.createElement("div");
    row.className = "message-row user-row";
    row.innerHTML = `
      <div class="message-body">
        <div class="user-bubble">${escapeHtml(text)}</div>
        <span class="message-timestamp">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div class="message-avatar user-avatar">
        <i class="ph-bold ph-user"></i>
      </div>
    `;
    messagesList.appendChild(row);
    scrollToBottom();
  }

  function appendBotMessage(data) {
    const row = document.createElement("div");
    row.className = "message-row bot-row";

    const responseText = data.response || "No response generated.";
    const plan = data.plan || {};
    const toolName = plan.tool || "None";
    const toolArgs = plan.arguments || {};
    const toolResult = data.tool_result !== undefined ? data.tool_result : "None";
    const metrics = data.metrics || {};
    const totalDuration = metrics.total_duration_ms || 0;

    const toolResultStr = typeof toolResult === "object"
      ? JSON.stringify(toolResult, null, 2)
      : String(toolResult);

    const argsStr = JSON.stringify(toolArgs, null, 2);

    row.innerHTML = `
      <div class="message-avatar bot-avatar">
        <i class="ph-bold ph-sparkle"></i>
      </div>
      <div class="message-body">
        <div class="bot-bubble">
          ${formatMarkdown(responseText)}
        </div>

        <!-- AI Execution Pipeline Inspector Card -->
        <div class="pipeline-card">
          <div class="pipeline-header ripple-btn">
            <div class="pipeline-title">
              <i class="ph-bold ph-tree-structure"></i>
              <span>Pipeline: <strong>${escapeHtml(toolName)}</strong></span>
            </div>
            <div class="pipeline-metrics">
              <span class="metric-pill success">${totalDuration}ms</span>
              <i class="ph-bold ph-caret-down chevron-icon"></i>
            </div>
          </div>

          <div class="pipeline-body">
            <!-- Stage 1: Planner -->
            <div class="pipeline-step-node">
              <div class="node-bullet bullet-planner"><i class="ph-bold ph-brain"></i></div>
              <div class="node-content">
                <div class="node-title">
                  <span>1. Planner Decision</span>
                  <span class="node-badge">tool: ${escapeHtml(toolName)}</span>
                </div>
                <div class="node-code">${escapeHtml(argsStr)}</div>
              </div>
            </div>

            <!-- Stage 2: Tool Execution -->
            <div class="pipeline-step-node">
              <div class="node-bullet bullet-tool"><i class="ph-bold ph-wrench"></i></div>
              <div class="node-content">
                <div class="node-title">
                  <span>2. Tool Output</span>
                  <span class="node-badge">${metrics.tool_duration_ms || 0}ms</span>
                </div>
                <div class="node-code">${escapeHtml(toolResultStr)}</div>
              </div>
            </div>

            <!-- Stage 3: Assistant Synthesis -->
            <div class="pipeline-step-node">
              <div class="node-bullet bullet-assistant"><i class="ph-bold ph-chat-teardrop-text"></i></div>
              <div class="node-content">
                <div class="node-title">
                  <span>3. Assistant Synthesis</span>
                  <span class="node-badge">${metrics.assistant_duration_ms || 0}ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bot Actions Row -->
        <div class="bot-actions-row">
          <button class="msg-action-btn copy-msg-btn ripple-btn" title="Copy response to clipboard">
            <i class="ph-bold ph-copy"></i> Copy
          </button>
          <span class="message-timestamp">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    `;

    // Collapsible pipeline inspector toggle
    const pipelineHeader = row.querySelector(".pipeline-header");
    const pipelineCard = row.querySelector(".pipeline-card");
    if (pipelineHeader && pipelineCard) {
      pipelineHeader.addEventListener("click", () => {
        pipelineCard.classList.toggle("collapsed");
      });
    }

    // Copy response button
    const copyBtn = row.querySelector(".copy-msg-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(responseText);
        copyBtn.innerHTML = `<i class="ph-bold ph-check"></i> Copied!`;
        showToast("Response copied to clipboard", "success");
        setTimeout(() => {
          copyBtn.innerHTML = `<i class="ph-bold ph-copy"></i> Copy`;
        }, 2000);
      });
    }

    messagesList.appendChild(row);
    scrollToBottom();
  }

  function appendErrorMessage(errorText) {
    const row = document.createElement("div");
    row.className = "message-row bot-row";
    row.innerHTML = `
      <div class="message-avatar bot-avatar" style="background: var(--accent-rose);">
        <i class="ph-bold ph-warning"></i>
      </div>
      <div class="message-body">
        <div class="bot-bubble" style="border-color: rgba(244, 63, 94, 0.4); background: rgba(244, 63, 94, 0.08);">
          <strong style="color: #fda4af;">Pipeline Error:</strong>
          <p style="margin-top: 4px; color: #fecdd3;">${escapeHtml(errorText)}</p>
        </div>
      </div>
    `;
    messagesList.appendChild(row);
    scrollToBottom();
  }

  // =========================================================================
  // Formatting & Sanitization Helpers
  // =========================================================================
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatMarkdown(text) {
    if (!text) return "";
    let html = escapeHtml(text);

    // Code blocks with syntax container
    html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/gi, (match, lang, code) => {
      return `<pre class="node-code" style="margin: 8px 0;"><code>${code.trim()}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="node-badge" style="color: var(--accent-secondary);">$1</code>');

    // Bold text
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italics
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Line breaks to paragraphs
    const paragraphs = html.split(/\n\n+/).filter(p => p.trim().length > 0);
    if (paragraphs.length > 1) {
      return paragraphs.map(p => `<p>${p.replace(/\n/g, "<br/>")}</p>`).join("");
    }

    return `<p>${html.replace(/\n/g, "<br/>")}</p>`;
  }
});
