# Project Page Body Content

Copy-paste the content below into each project's Notion page body.
This tests various Notion block types that get rendered on the detail page.

---

## Project 1: DevFlow — Developer Dashboard

### Paste this into the page body:

---

**DevFlow** is a real-time developer productivity dashboard designed to unify your development workflow.

## The Problem

Most developers juggle multiple tools daily — GitHub for code, Jira for tickets, Slack for communication. Context-switching between these tools kills productivity and makes it hard to get a clear picture of what's happening across your team.

## How It Works

DevFlow connects to your existing tools and provides:

1. Real-time GitHub PR status and review tracking
2. Jira ticket progress with automatic status sync
3. Slack notification aggregation with smart filtering
4. Custom widgets for metrics you care about
5. Team activity feed with cross-tool correlation

## Technical Architecture

The system is built on three main layers:

- **Data Layer** — PostgreSQL with Prisma ORM for structured data, Redis for real-time state
- **API Layer** — Next.js API routes with WebSocket support for live updates
- **Frontend** — React with server components, optimistic UI updates, drag-and-drop dashboard

### Key Technical Decisions

We chose WebSockets over Server-Sent Events because the dashboard requires bidirectional communication — users can trigger actions (merge PR, transition ticket) directly from the dashboard.

```typescript
// WebSocket connection with automatic reconnection
const ws = useWebSocket('wss://api.devflow.dev/ws', {
  reconnectAttempts: 10,
  reconnectInterval: 3000,
  onMessage: (event) => {
    const update = JSON.parse(event.data);
    dispatch({ type: update.type, payload: update.data });
  },
});
```

## Challenges & Learnings

> Building real-time features at scale taught us that optimistic updates aren't optional — they're essential for perceived performance.

The hardest part was handling rate limits across multiple third-party APIs while keeping the dashboard feeling instant. We implemented a smart caching layer that:

- Prefetches likely-needed data based on user patterns
- Falls back gracefully when APIs are unavailable
- Syncs state across tabs using BroadcastChannel API

## What's Next

- [ ] Add Linear integration
- [ ] Build mobile companion app
- [ ] Open-source the widget SDK

---

## Project 2: MarkdownMail

### Paste this into the page body:

---

Write emails the way you write code — in Markdown.

## Why Markdown for Email?

As developers, we think in Markdown. We write READMEs, documentation, and messages in it daily. But every time we compose an email, we're forced into clunky rich-text editors.

MarkdownMail bridges this gap.

## Features

1. Live preview as you type
2. Syntax highlighting in code blocks
3. Template system with variables
4. Scheduled sending with timezone support
5. Contact groups and mailing lists

## The Editor

The editor is built on CodeMirror 6 with custom extensions:

- **Markdown highlighting** with GFM support
- **Inline image preview** from drag-and-drop uploads
- **Smart completions** for template variables

```javascript
const editor = new EditorView({
  extensions: [
    markdown({ base: markdownLanguage }),
    EditorView.lineWrapping,
    livePreview(),
    templateCompletion(userTemplates),
  ],
  parent: document.getElementById('editor'),
});
```

## Email Rendering Pipeline

The rendering pipeline converts Markdown to beautiful HTML emails:

- Parse Markdown to AST using remark
- Apply email-safe CSS transformations
- Inline all styles (email clients don't support external CSS)
- Generate plain-text fallback automatically

> The biggest challenge was making emails look consistent across Gmail, Outlook, and Apple Mail. Each has its own quirks with CSS support.

---

## Project 3: APIBench

### Paste this into the page body:

---

Benchmark your APIs with confidence.

## Overview

APIBench is a lightweight, developer-friendly API benchmarking tool. Unlike heavy load-testing frameworks, APIBench focuses on quick, repeatable measurements with beautiful reports.

## Usage

```bash
# Install
go install github.com/shahbazfayaz/apibench@latest

# Run a benchmark
apibench run --url https://api.example.com/users \
  --method GET \
  --concurrency 50 \
  --duration 30s \
  --header "Authorization: Bearer $TOKEN"

# Compare two endpoints
apibench compare \
  --baseline https://api-v1.example.com/users \
  --candidate https://api-v2.example.com/users \
  --report html
```

## Report Features

The generated HTML report includes:

- Latency distribution (p50, p90, p95, p99)
- Requests per second over time
- Error rate analysis
- Response size distribution
- Comparison charts when benchmarking two endpoints

## Architecture

- **Core engine** — Written in Go for maximum performance
- **Visualization** — React + D3.js for interactive charts
- **Storage** — SQLite for local benchmark history

---

## Project 4: Dotfiles Manager

### Paste this into the page body:

---

Your terminal setup, everywhere.

## The Problem

Every developer has spent hours setting up a new machine. Dotfiles managers exist, but most are either too simple (just symlinks) or too complex (require learning a DSL).

## How It's Different

This tool focuses on three things:

1. **Security** — Encrypted secrets that are safe to commit
2. **Flexibility** — Machine-specific configs with a simple override system
3. **Speed** — Written in Rust, installs in under a second

## Configuration

```toml
# dotfiles.toml
[global]
shell = "zsh"
editor = "nvim"

[profiles.work]
git_email = "shahbaz@company.com"
extra_packages = ["awscli", "terraform"]

[profiles.personal]
git_email = "hello@shahbazfayaz.com"
extra_packages = ["hugo", "ffmpeg"]

[secrets]
# Encrypted with age — safe to commit
github_token = "encrypted:age1..."
```

## How Secrets Work

- Secrets are encrypted using the `age` encryption tool
- Your key stays on your machine, never committed
- On a new machine, just provide your key and secrets are decrypted automatically

> I built this because I accidentally committed an API key to a public repo. Never again.

---

## Project 5: Notecraft

### Paste this into the page body:

---

A local-first note-taking app for developers.

## Philosophy

Your notes should be:

- **Fast** — Instant search across thousands of notes
- **Private** — Your data stays on your device
- **Connected** — Backlinks and graph view reveal hidden connections
- **Portable** — Standard Markdown files you own forever

## Key Features

1. Full Markdown editor with live preview
2. Bidirectional links with [[wiki-style]] syntax
3. Interactive graph visualization of note connections
4. Full-text search with fuzzy matching
5. Offline-first with optional sync
6. Daily notes and templates

## Technical Stack

- **Frontend** — SvelteKit for a snappy, lightweight UI
- **Storage** — SQLite via sql.js compiled to WebAssembly
- **Search** — Custom inverted index stored in IndexedDB
- **Sync** — CRDTs for conflict-free multi-device sync

```typescript
// CRDT-based sync for conflict-free merging
import { Automerge } from '@automerge/automerge';

const doc = Automerge.change(currentDoc, (d) => {
  d.notes[noteId].content = newContent;
  d.notes[noteId].updatedAt = Date.now();
});

// Sync with remote peers
const syncMessage = Automerge.generateSyncMessage(doc, syncState);
await peer.send(syncMessage);
```

## Why Local-First?

Cloud note apps can:
- Shut down (RIP Google Keep alternatives)
- Change pricing (looking at you, Notion)  
- Have outages when you need your notes most

Local-first means your notes work offline, sync when available, and the files are always yours.

---
