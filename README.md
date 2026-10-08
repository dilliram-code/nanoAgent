# ✨ Natural AI Assistant • Autonomous Pipeline & Modern Web UI

A high-performance AI assistant platform demonstrating the **Planner ➔ Tool ➔ Assistant** architecture, featuring an asynchronous **FastAPI** backend, interactive **Pipeline Telemetry Inspector**, and a vibrant **Cyber-Aurora Glassmorphism Frontend**.

---

## 🌟 Architecture Overview

```
User Query ──▶ 1. Planner (LLM) ──▶ 2. Tool Execution (Python) ──▶ 3. Assistant (LLM) ──▶ User Response
                     │                          │                          │
              Extracts tool + args         Runs calculation,         Synthesizes raw
              as structured JSON          password gen, or clock     output naturally
```

1. **Planner**: Evaluates user intent and dynamically chooses exactly one registered tool, providing validated JSON arguments.
2. **Tools**: Modular deterministic functions:
   - 🧮 **Math Calculator**: Safe AST-based arithmetic parser supporting `+`, `-`, `*`, `/`, `**`, `%`, and parentheses.
   - 🔐 **Password Generator**: Cryptographically secure alphanumeric & symbol key generator.
   - 🕒 **System Clock**: Local timezone-aware date and time resolver.
3. **Assistant**: Transforms raw deterministic tool output into natural, friendly conversational prose.

---

## 🚀 Quick Start (Local Setup)

### 1. Clone & Environment Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd carbonCopy

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate   # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-5.6-luna
PORT=8000
```

### 3. Run the Web Application & API

```bash
python run.py
```
Or with Uvicorn directly:
```bash
uvicorn app.api:app --reload --port 8000
```

- 🌐 **Web Interface**: [http://localhost:8000](http://localhost:8000)
- 📖 **Interactive API Docs (Swagger UI)**: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- 📕 **ReDoc**: [http://localhost:8000/api/redoc](http://localhost:8000/api/redoc)

### 4. Run the Terminal CLI (Optional)

```bash
python -m app
```

---

## 🎨 Frontend Features

- 🌌 **Cosmic Aurora Glassmorphism UI**: Dynamic ambient background with floating glowing mesh orbs, subtle cybernetic grid overlay, and glass cards with backdrop blur.
- ⚡ **AI Pipeline Inspector**: Every AI response reveals the exact tool selected, structured arguments, raw execution return, and millisecond latency metrics.
- 💫 **Tactile Micro-Interactions**: Dynamic click-coordinate ripple animations, 3D button press bounce, glowing gradient borders, and synthetic audio feedback.
- 🧰 **Tool Explorer & Playground**: Slide-out drawer with direct tool runner for testing functions without LLM routing.
- 💡 **One-Click Prompt Chips**: Instant calculation, key generation, and time queries.

---

## 📡 API Reference

### `POST /api/chat`
Process natural user query through the Planner ➔ Tool ➔ Assistant pipeline.

**Request:**
```json
{
  "message": "Calculate (450 * 12) + (1024 / 4)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_request": "Calculate (450 * 12) + (1024 / 4)",
    "plan": {
      "tool": "calculator",
      "arguments": {
        "expression": "(450 * 12) + (1024 / 4)"
      }
    },
    "tool_result": 5656.0,
    "response": "The result of (450 * 12) + (1024 / 4) is 5,656.",
    "metrics": {
      "tool_duration_ms": 0.45,
      "assistant_duration_ms": 310.2,
      "total_duration_ms": 520.8
    },
    "timestamp": "2026-10-08T09:30:00.000Z"
  }
}
```

### `GET /api/tools`
List all registered tools, descriptions, parameter schemas, and sample prompts.

### `POST /api/tools/execute`
Directly execute a registered tool with parameters without LLM routing.

### `GET /api/health`
Service health check and active model status.

---

## 🚢 Deployment Guide

### Option 1: Render (Recommended 1-Click)

1. Push your repository to GitHub / GitLab.
2. In Render, create a **New Web Service** and connect your repository.
3. Set the following settings:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.api:app --host 0.0.0.0 --port $PORT`
4. Add environment variables under **Environment Variables**:
   - `OPENAI_API_KEY`: `your_openai_api_key`
   - `OPENAI_MODEL`: `gpt-5.6-luna` (or preferred model)

*(Alternatively, connect the provided [`render.yaml`](file:///Users/dilliramchaudhary/carbonCopy/render.yaml) blueprint).*

---

### Option 2: Railway

1. Connect repository in Railway dashboard.
2. Railway will automatically detect the [`Procfile`](file:///Users/dilliramchaudhary/carbonCopy/Procfile) and [`requirements.txt`](file:///Users/dilliramchaudhary/carbonCopy/requirements.txt).
3. In variables, add `OPENAI_API_KEY`.
4. Deploy!

---

### Option 3: Docker Deployment

```bash
# Build Docker image
docker build -t natural-ai-assistant .

# Run container
docker run -d -p 8000:8000 \
  -e OPENAI_API_KEY="your_api_key_here" \
  -e OPENAI_MODEL="gpt-5.6-luna" \
  natural-ai-assistant
```

Or using **Docker Compose**:
```bash
docker compose up -d --build
```

---

## 🧪 Testing

Run unit and integration test suite:

```bash
pytest
```

---

## 📁 Project Structure

```
.
├── app/
│   ├── __init__.py
│   ├── __main__.py          # CLI runner
│   ├── agent.py             # Agent pipeline orchestrator
│   ├── api.py               # FastAPI backend with static file server
│   ├── assistant.py         # OpenAI response synthesizer
│   ├── config.py            # Environment & model settings
│   ├── planner.py           # OpenAI structured JSON tool selector
│   └── tools/
│       ├── __init__.py
│       ├── calculator_tool.py   # AST arithmetic engine
│       ├── password_tool.py     # Secure key generator
│       ├── registry.py          # Tool registry & metadata schemas
│       └── time_tool.py         # Timezone datetime resolver
├── static/
│   ├── app.js               # Frontend controller & Web Audio
│   ├── index.html           # Modern glassmorphism web interface
│   └── styles.css           # Cyber-Aurora CSS design system
├── tests/
│   ├── test_api.py          # FastAPI endpoint integration tests
│   └── test_tools.py        # Core tool unit tests
├── Dockerfile               # Production container image
├── docker-compose.yml       # Local multi-service config
├── Procfile                 # PaaS deployment entrypoint
├── render.yaml              # Render blueprint config
├── requirements.txt         # Production dependencies
├── run.py                   # Local server starter
└── README.md
```
