# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

MindVault is an **Obsidian vault** — a personal knowledge management system, not a traditional software project. There are no build scripts, package.json, or test commands. The "codebase" is primarily markdown notes and Obsidian plugin configuration.

## Interacting With the Vault

### REST API (Obsidian Local REST API Plugin)
The vault exposes a REST API on `https://localhost:27124` with API key stored in `.obsidian/plugins/obsidian-local-rest-api/data.json`. This enables programmatic read/write access to notes without going through the file system directly.

### File System
Notes are plain `.md` files. The Claudian plugin gives Claude Code full read/write access to vault files — edits made here are immediately reflected in Obsidian.

## Vault Structure

- `工作/` — Work-related notes
- `学习/` — Learning materials
- Root `.md` files — Top-level notes and MOCs (Maps of Content)

Notes use Obsidian's `[[wikilink]]` syntax for internal linking. The knowledge graph is built from these links.

## Installed Plugins

| Plugin | Purpose |
|--------|---------|
| `claudian` (v1.3.70) | Embeds Claude Code as an AI collaborator in the sidebar |
| `obsidian-local-rest-api` (v3.5.0) | REST API access to vault on port 27124 |
| `calendar` (v1.5.10) | Calendar view for daily notes |

## Architecture

This vault uses an **Obsidian plugin architecture**. Plugins live under `.obsidian/plugins/<name>/` and each contains:
- `main.js` — Compiled plugin code (do not edit directly)
- `manifest.json` — Plugin metadata and version
- `data.json` — Plugin-specific settings/state
- `styles.css` — Optional UI styles

The `.claude/` directory is structured for future Claude Code extensions (agents, commands, skills) but is currently unused.

## Working Notes

- The vault interface is configured in Chinese; directory names like `工作` (Work) and `学习` (Learning) are intentional
- Obsidian Sync is enabled — changes propagate to other devices
- Daily notes use the Calendar plugin; configure template path in `.obsidian/core-plugins-migration.json` if needed
