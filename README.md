# Mox SF Website

A simple public-demo build of the Mox member rolodex: tactile paper cards, visible name tails, and static public member data.

## Local Development

```sh
pnpm install
pnpm dev
```

The Vite app is configured for GitHub Pages at `/mox-sf-website/`. For a local-root build, run:

```sh
VITE_BASE=/ pnpm build
```

## Demo Deploy

GitHub Pages deploys from `.github/workflows/pages.yml` on every push to `main`.

Expected public URL after the first successful Pages run:

https://pauljunsukhan.github.io/mox-sf-website/

Before sharing, confirm the repository is public and GitHub Pages is set to deploy from GitHub Actions.
