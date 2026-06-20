# AI Chat

A self-hosted AI chat application powered by [Ollama](https://ollama.com), with real-time web search and AI image generation. Everything runs locally via Docker — no data leaves your machine except for web searches.

## Features

- **Chat** with a local LLM (default: `gemma3:12b`) via a streaming UI
- **Web search** — the model automatically detects when it needs current information and queries Google via [Serper](https://serper.dev)
- **Image generation** — text-to-image and image cartoonization powered by [FLUX.1-schnell](https://huggingface.co/black-forest-labs/FLUX.1-schnell)
- **Session isolation** — each browser tab gets its own UUID session so conversations never cross-pollute
- **GPU accelerated** — Ollama and the image service both use NVIDIA GPUs when available

## Architecture

```
Browser (React + Vite)
    │
    ├── /api/chat       → ai-chat-service  (Hono / Node.js)
    │                         └── Ollama  (local LLM)
    │                         └── Serper  (web search, optional)
    │
    └── /api/images     → create-image-service  (FastAPI / Python)
                              └── FLUX.1-schnell (HuggingFace)
```

| Service | Port | Description |
|---|---|---|
| `client` | 80 | React frontend served by nginx |
| `ai-chat-service` | 3001 | Chat API + web search orchestration |
| `create-image-service` | 3012 | Image generation / cartoonization |
| `ollama` | 11434 (internal) | Local LLM runtime |

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/)
- NVIDIA GPU + [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html) (required for Ollama and image generation)
- A free [Serper API key](https://serper.dev) for web search
- A [HuggingFace token](https://huggingface.co/settings/tokens) with read access (for FLUX model download)

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/ai-chat.git
cd ai-chat
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
SERPER_API_KEY=your_serper_api_key_here
MODEL=gemma3:12b
HF_TOKEN=hf_your_huggingface_token_here
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `SERPER_API_KEY` | Yes | — | Serper.dev API key for web search |
| `MODEL` | No | `gemma3:12b` | Ollama model to pull and use |
| `HF_TOKEN` | Yes | — | HuggingFace token to download FLUX.1-schnell |

### 3. Start everything

```bash
docker compose up --build
```

On first run Ollama will automatically pull the configured model — this can take a few minutes depending on your connection. The FLUX model is downloaded on first image request and cached in a Docker volume.

### 4. Open the app

Navigate to [http://localhost](http://localhost).

## Changing the Model

Set `MODEL` in your `.env` to any model available on [ollama.com/library](https://ollama.com/library):

```env
MODEL=llama3.2:3b
```

Restart the stack and the new model will be pulled automatically:

```bash
docker compose down && docker compose up
```

## Running Without a GPU

Remove the `deploy.resources` blocks from `docker-compose.yml` for both the `ollama` and `create-image-service` services. Image generation will be very slow on CPU; chat performance depends on the model size.

## Development

### ai-chat-service (Node.js / TypeScript)

```bash
cd services/ai-chat-service
cp .env.example .env   # set SERPER_API_KEY
npm install
npm run dev
```

Requires a locally running Ollama instance (`ollama serve`).

### create-image-service (Python / FastAPI)

```bash
cd services/create-image-service
pip install -r requirements.txt
HF_TOKEN=hf_... uvicorn app.main:app --reload
```

### client (React / Vite)

```bash
cd client
npm install
npm run dev
```

The Vite dev server proxies `/api/chat` to `localhost:3001` and `/api/images` to `localhost:3012`.

## Project Structure

```
ai-chat/
├── client/                     # React + Vite frontend
│   └── src/
│       ├── api/                # fetch wrappers (chatApi, imageApi)
│       ├── components/         # UI components
│       ├── hooks/              # useChat, useImageCreate, useAutoScroll
│       ├── store/              # ChatContext + reducer
│       └── types/
├── services/
│   ├── ai-chat-service/        # Hono API — chat + web search
│   │   └── src/
│   │       ├── routes/chat.ts
│   │       ├── services/ollama.ts
│   │       └── services/webSearch.ts
│   └── create-image-service/   # FastAPI — image generation
│       └── app/
│           ├── main.py
│           └── cartoonizer.py
├── docker-compose.yml
├── ollama-entrypoint.sh        # pulls model on first start
└── .env.example
```

## License

MIT
