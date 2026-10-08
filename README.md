# Natural AI Assistant

A minor-level project demonstrating the Planner -> Tool -> Assistant architecture.

## Architecture

User -> Planner -> One Tool -> Assistant -> User

### Planner
Uses the OpenAI API to select exactly one tool.

### Tools
Three simple tools are included:
- calculator
- password_generator
- current_time

### Assistant
Uses the OpenAI API to turn the raw tool result into a natural response.

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Put your real OpenAI API key into `.env`.

## Run

```bash
python -m app
```

Try:
- Give me a secure password
- Calculate 25 * 18
- What time is it?

## Test

```bash
pytest
```

## Important limitation

The planner deliberately selects only ONE tool for each request. This mirrors the lecture and makes the architecture easy to understand.

A future version can support multi-step plans such as:

User -> Planner -> Tool A -> Tool B -> Assistant
