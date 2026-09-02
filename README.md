# Static CMS

A personal tool for editing static sites without leaving the browser.

## What it does

Static cms lets you log in with GitHub, link a repository, and edit its markdown files through a web-based editor — no local clone, no editor setup, no terminal. Changes are committed straight back to the linked repo.

Built to solve a personal annoyance: editing a static site's content shouldn't require pulling up a full dev environment for a one-line copy change.

## How it works

- **GitHub OAuth** handles login and repo access — no separate account system, no stored credentials.
- **Repo linking** lets you pick which repository to edit against.
- **In-browser markdown editor** reads and writes files directly through the GitHub API, so edits land as real commits to the real repo.

## Status

Personal tool, currently private; built for my own static sites rather than as a public product. S
