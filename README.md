# AgentGrid — Multi-Agent Code Engine

A local multi-agent coding assistant powered by LangGraph + Claude (or OpenAI / Gemini).
Give it a task in plain English — four specialized agents plan, write, execute, and review the code for you.

## Agent Flow

```
You → Orchestrator → Planner → Coder → Reviewer → Done
                                  ↑         |
                                  └─────────┘  (max 3 retries)
```

| Agent | Role |
|---|---|
| **Orchestrator** | Understands and contextualizes the task |
| **Planner** | Breaks it into ≤5 ordered steps |
| **Coder** | Writes files + runs shell commands |
| **Reviewer** | Checks output, loops back if incomplete |

## Setup

```bash
git clone https://github.com/bossgghere/AgentGrid-backend.git
cd AgentGrid-backend
npm install
cp .env.example .env   # add your API key
npm start
```

## Configuration (`.env`)

```env
# Provider — anthropic | openai | gemini
PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Optional overrides
MODEL=claude-sonnet-4-6
MAX_ITERATIONS=3
SHELL_TIMEOUT=30000
```

## CLI Commands

| Command | Description |
|---|---|
| `help` | Show available commands |
| `history` | View past sessions |
| `config` | Show active provider, model, dir |
| `exit` | Quit |

## Providers

| Provider | Default Model | Key |
|---|---|---|
| `anthropic` | `claude-sonnet-4-6` | `ANTHROPIC_API_KEY` |
| `openai` | `gpt-4o` | `OPENAI_API_KEY` |
| `gemini` | `gemini-1.5-pro` | `GEMINI_API_KEY` |

## Roadmap

- [ ] Web UI dashboard
- [ ] GitHub integration
- [ ] Multi-project support (floors)
- [ ] Voice input support

## Example

```
▶ Task: create an express server with /health and /version endpoints
```

AgentGrid will create the files, run `npm install`, and verify it works — all autonomously.
