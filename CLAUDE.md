# CLAUDE.md

This file provides guidance for Claude Code when working in this repository.

## Package Overview

Pluggable two-layer error handling pipeline for Angular. Provides an HTTP error interceptor, a global error handler, and a swappable `TbxNgxErrorLoggerService` abstraction that unifies all error routing through a single extension point.

This is a `@teqbench` Angular package (`tbx-ngx-*`) built with TypeScript and ng-packagr.

## Tech Stack

- **Language:** TypeScript 5.9+ (strict mode, ES2022 target, bundler module resolution)
- **Testing:** Vitest (globals enabled)
- **Linting:** ESLint flat config with typescript-eslint
- **Formatting:** Prettier (enforced via pre-commit hook and CI)
- **Git Hooks:** Husky + lint-staged
- **Versioning:** Release Please (Conventional Commits)
- **Registry:** GitHub Packages (`@teqbench` scope)

## Key Commands

- `npm ci` — Install dependencies (use this, not `npm install`)
- `npm run build` — Compile TypeScript to `dist/`
- `npm test` — Run tests with Vitest
- `npm run test:coverage` — Run tests with coverage enforcement (used in CI)
- `npm run typecheck` — Full TypeScript type-check (`tsc --noEmit`)
- `npm run lint` — Run ESLint
- `npm run format` — Format all files with Prettier
- `npm run format:check` — Check formatting (CI mode)

## Project Structure

- `src/` — Source code (all `.ts` files live here)
- `src/index.ts` — Barrel file (public API exports)
- `dist/` — Compiled output (git-ignored, only this directory is published)
- `docs/` — Documentation (placeholder for package-specific guides)
- `.github/workflows/` — CI/CD pipelines (ci, release, sync, dep-compat-check, claude)
- `.github/dependabot.yml` — Automated dependency update PRs targeting `dev`

## Publishing

- Packages are published to GitHub Packages (`@teqbench` scope) via the release workflow.
- Coverage thresholds are enforced in CI: 80% lines/functions/statements, 75% branches, per file.
- **Build tooling:** ng-packagr is used to build Angular Package Format (APF) output. It uses bundler module resolution internally, so source files use extensionless relative imports (e.g., `'./foo.service'`). The `ng-package.json` at the repo root configures the entry point and output directory. ng-packagr generates its own `package.json` inside `dist/` with the correct APF entry points (`fesm2022/`, etc.). The release workflow publishes from `dist/` directly (`npm publish ./dist`), so consumers resolve against ng-packagr's generated `package.json`. The root `package.json` does not need `main`, `types`, or `exports` fields.

## TSDoc Convention

All exported TypeScript declarations must have TSDoc comments validated by `eslint-plugin-tsdoc`. Custom tags are defined in `tsdoc.json` and consumed downstream by API Extractor and the AI HTML documentation generator.

### Standard Tags (always use)

- `@remarks` — Extended description, separated from the summary line.
- `@typeParam` — Document generic type parameters (not `@template`).
- `@param` — Document function/method parameters.
- `@returns` — Document return values.
- `@example` — Code examples in fenced TypeScript blocks.
- `@public` / `@internal` — Release tag on every export. Use `@public` unless the export is not part of the package API surface.
- `@packageDocumentation` — Required on every barrel file (`index.ts`) to describe the package entry point. Use `{@link ExportName}` to cross-reference primary exports.
- `@see` — Reference to related external resources or docs.
- `@deprecated` — Mark deprecated APIs with migration guidance.

### Custom Tags

- `@category` — Group exports by domain for navigation and table-of-contents generation (e.g., "Models", "Services", "Utilities", "Pipes", "Guards"). Repeatable — an export can belong to multiple categories (e.g., "Models", "Foundational", "Interface").
- `@since` — The package version when the export was first introduced (e.g., "1.0.0"). Allows the docs generator to render version badges and filter by release.
- `@related` — Cross-reference to a related export, optionally in another `@teqbench` package (e.g., "TbxAuthService" or "@teqbench/tbx-auth#TbxAuthService"). Repeatable — use one `@related` tag per reference.
- `@usage` — Prose description of when and why to use this export, distinct from `@example` which shows code. Helps the AI generator produce contextual KB articles rather than raw API listings.
- `@displayName` — Human-friendly label used as the heading in generated docs (e.g., "Base Model" for `TbxModel`). When omitted, the export name is used as-is.
- `@order` — Numeric sort hint controlling display sequence. Applied at two levels:
    - Top-level exports: controls display sequence within a `@category` on generated pages.
    - Members (properties, methods): controls display sequence within the parent class/interface page. Members without `@order` are sorted by precedence group (see Member Ordering below), then alphabetically.

### Member Ordering

The documentation generator groups and sorts members within a class or interface page using the following precedence. Within each group, members are sorted by `@order` (lowest first), then alphabetically.

1. Constructor(s)
2. Identity properties (named `id`)
3. Required readonly properties
4. Required mutable properties
5. Optional properties
6. Abstract methods
7. Public methods
8. Protected methods
9. Static members
10. Events / callbacks
11. Deprecated members

Add `@order` to any member where alphabetical sorting within its group produces the wrong result. Common cases:

- `id` should appear before `createdAt` and `updatedAt` — give `id` `@order 1`.
- Lifecycle-related properties should appear in logical sequence — use `@order` to enforce creation-before-update ordering.

### Comment Structure

Top-level exports:

````typescript
/**
 * Summary line — one sentence, no period
 *
 * @remarks
 * Extended description. Multiple paragraphs allowed.
 *
 * @typeParam T - Description of the generic parameter.
 *
 * @usage
 * When and why to use this export.
 *
 * @example
 * ```typescript
 * // usage example
 * ```
 *
 * @category Models
 * @category Foundational
 * @displayName Base Model
 * @order 1
 * @since 1.0.0
 * @related OtherExport
 *
 * @public
 */
````

Member-level comment structure (properties, methods):

```typescript
/**
 * Summary line — one sentence, no period
 *
 * @remarks
 * Extended description if needed.
 *
 * @order 1
 *
 * @public
 */
```

### Tag Ordering

Follow this order within a TSDoc comment:

Top-level exports:

summary line
@remarks
@typeParam / @param / @returns
@usage
@example
@category (repeatable)
@displayName
@order
@since
@related (repeatable)
@public / @internal

Members (properties, methods):

summary line
@remarks
@param / @returns (methods only)
@order
@public / @internal

### Reference Implementation

`@teqbench/tbx-models` `src/base-model.ts` is the reference for a fully migrated TSDoc comment on an interface with member-level docs including `@order` tags. `src/index.ts` is the reference for a `@packageDocumentation` barrel file comment.

### Verification

After migration, run `npm run lint` and confirm no `tsdoc/syntax` warnings. Run `npm run format:check` and `npm test` to ensure nothing broke.

## Commit Convention

Follow **Conventional Commits** strictly:

- `feat(scope): ...` — New feature (minor bump)
- `fix(scope): ...` — Bug fix (patch bump)
- `feat(scope)!: ...` — Breaking change (major bump)
- `docs(scope): ...` — Documentation
- `refactor(scope): ...` — Refactor
- `chore(scope): ...` — Maintenance

## Branching & Workflow

- `main` — Production. Only receives merges from `release/*`, `hotfix/*`, or `release-please--*` branches.
- `dev` — Integration branch. Receives merges from `feature/*` and `bugfix/*` branches.
- Create feature/bugfix branches off `dev`, PR back to `dev`.
- Use `release/*` branches to carry `dev` to `main`.
- Use `hotfix/*` branches off `main` for urgent fixes.

### What Claude Should Do

- Create feature or bugfix branches off `dev` when implementing issues.
- Write clean, well-tested code that passes lint, typecheck, and tests.
- Use conventional commit messages.
- Create PRs targeting `dev` (never directly target `main`).
- Keep PRs focused and atomic — one issue per PR.

### What Claude Should NOT Do

- Never push directly to `main` or `dev`.
- Never force-push to any branch.
- Never delete branches.
- Never modify CI workflow files without explicit instruction.
- Never modify `release-please-config.json`, `.release-please-manifest.json`, or `CHANGELOG.md`.
