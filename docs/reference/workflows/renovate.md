# Renovate

**File:** central — `teqbench/.github/.github/workflows/renovate.yml` and `teqbench/.github/renovate-config.js`. There is no per-repo Renovate config in this repository.

---

## Purpose

Automatically opens pull requests to update dependencies. PRs target the `dev` branch (not `main`) and use [Conventional Commits ↗](https://www.conventionalcommits.org/) message prefixes so they integrate cleanly with the [release-please ↗](https://github.com/googleapis/release-please) workflow. [Renovate ↗](https://docs.renovatebot.com/) replaced [Dependabot ↗](https://github.com/dependabot) at the organisation level for richer grouping, scheduling, and auto-merge support.

---

## How It's Wired

The workflow lives in `teqbench/.github/.github/workflows/renovate.yml` and runs every three hours under the `teqbench-automation` GitHub App. It reads `teqbench/.github/renovate-config.js`, which lists the repositories Renovate should manage. This repository (`teqbench/tbx-ngx-errors`) is enrolled in that list.

To add a new repository, edit the `repositories[]` array in the central `renovate-config.js`. No file needs to live inside the consuming repo.

---

## Schedule

- **Workflow cron:** every 3 hours (`17 */3 * * *`).
- **PR opening window (default):** `before 9am on Monday`.
- **Internal `@teqbench/*` packages:** `at any time` — the schedule is overridden so internal updates flow as soon as a new version is published.

The workflow can also be triggered manually via `workflow_dispatch` from the org `.github` repo.

---

## Target Branch

All Renovate PRs target **`dev`** (`baseBranchPatterns: ["dev"]`). Updates flow through the standard PR review and CI pipeline before reaching production.

---

## Commit Message Conventions

| Ecosystem                | Commit prefix  | Labels               |
| ------------------------ | -------------- | -------------------- |
| `npm` packages           | `chore(deps):` | `dependencies`       |
| `github-actions` updates | `chore(ci):`   | `dependencies`, `ci` |

`gitAuthor` is set to the `teqbench-automation[bot]` account so commits are correctly attributed.

---

## Grouping

Related packages are grouped into a single PR to reduce noise:

| Group               | Packages                                                                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `teqbench packages` | All `@teqbench/*` packages — auto-merged                                                                                               |
| `tooling`           | `prettier`, `husky`, `lint-staged`, `vitest`, `prettier-*`, `@prettier/*`, `@vitest/*`, `eslint-*`, `@eslint/*`, `typescript-eslint`   |
| `typescript`        | `typescript`                                                                                                                           |
| `github-actions`    | All [GitHub Actions ↗](https://docs.github.com/en/actions) action updates (uses the `chore(ci):` prefix and `dependencies, ci` labels) |

Ungrouped packages (e.g., `@types/node`) get individual PRs.

---

## SHA Digest Pinning

[GitHub Actions ↗](https://docs.github.com/en/actions) references — including reusable workflow calls like `uses: teqbench/.github/.github/workflows/ci.yml@<sha>` — are pinned to full commit SHAs. The central `renovate-config.js` sets `pinDigests: true` on the `github-actions` rule, so [Renovate ↗](https://docs.renovatebot.com/) adds the SHA on first scan and keeps it current as the referenced tag moves.

Pinning to a full SHA is a supply-chain hardening: a compromised tag cannot silently redirect the workflow to malicious code between scheduled Renovate runs. The `# <tag>` comment after the SHA is preserved by [Renovate ↗](https://docs.renovatebot.com/) for human readability. The format in every workflow file is:

```yaml
uses: teqbench/.github/.github/workflows/ci.yml@7de482dbdfad13f3ca7ba3f9be3111d69881c56a # main
```

---

## Auto-Merge

Internal `@teqbench/*` packages are configured with `automerge: true` and `automergeType: "pr"`. When CI passes, Renovate merges the PR automatically — no human review required for internal version bumps.

All other packages require manual review and merge.

---

## Version Restrictions

Some packages are intentionally pinned below a major version. These are enforced in the central `renovate-config.js` via `allowedVersions`, not in this repo's `package.json`:

| Package       | Restriction | Rationale                                                                                                                                              |
| ------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `eslint`      | `< 10.0.0`  | ESLint majors are held until [angular-eslint ↗](https://github.com/angular-eslint/angular-eslint) supports them across the framework's package family. |
| `@types/node` | `< 25.0.0`  | Pinned to the major matching the [Node.js ↗](https://nodejs.org/) runtime (currently 24). Re-evaluated on each Node LTS bump.                          |

The `package.json` in this repo also documents these intents in the custom `devDependenciesPinned` metadata field (see `package.json`).

---

## CI Integration

Renovate PRs trigger the standard CI workflow like any other PR. Because Renovate runs as the `teqbench-automation[bot]` app (not the special `dependabot[bot]` actor), CI has full access to organisation secrets and submodules — there are no Renovate-specific carve-outs in the workflow.

---

## Disabling Updates

To stop Renovate from managing this repository, remove `teqbench/tbx-ngx-errors` from `repositories[]` in `teqbench/.github/renovate-config.js`. To pause individual packages, add a `packageRules` entry with `enabled: false` matched against the package name.
