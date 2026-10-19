# Contributing to Mailven

Mailven is an independent project derived from [Aerion](https://github.com/hkdb/aerion). This repository is the home of Mailven; it is not a fork of Aerion on GitHub. Aerion's own contribution rules apply only to submissions made to Aerion.

## Workflow

- Keep changes focused and explain their purpose.
- Use [Mailven's issues](https://github.com/CaseyLabs/mailven/issues) for bugs, ideas, and questions. If a bug also exists in Aerion, mention it; upstream fixes may be cherry-picked (see below).
- Base changes on `main` unless the task specifies another target.
- Describe the behavior change, relevant issues, checks performed, and known limitations. Include screenshots for visible UI changes when useful.
- Use descriptive commit messages with prefixes such as `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, and `chore:`.

## AI project guidance

Shared policy and task triggers live in `AGENTS.md`; `CLAUDE.md` imports it.
Read linked references only when their trigger applies. Keep always-loaded policy
to rules that must always hold, and put procedures in their owning docs or
`.agents/skills/`. Do not add eager `@` imports for task references in `CLAUDE.md`; preserve its shared-policy import adapter. Keep shared workflows independent of host-specific tools.
Claude's `.claude/skills` directory symlink exposes the shared skills; preserve
it as a relative symlink. Claude uses `/skill-name`; Codex uses `$skill-name` or
`/skills`.

Host adapters in `.claude/agents/` and `.codex/agents/` set native model and
effort settings; both use shared briefs in `.agents/skills/`. Use
`project-worker` for delegated project work and `project-acceptance-checker`
for milestone acceptance. If a host cannot load the configured role, disclose
the fallback. Permissions, model availability, and explicit user choices take
precedence. Codex project agents require a trusted checkout; use normal onboarding
to trust a clone, and do not bypass trust with personal copies or discovery
overrides. For `unknown agent_type`, use the [trusted-checkout diagnostic](docs/validation/shared-skills-g3.md#cause-and-prerequisite) before changing configuration. Start a fresh session after changing role definitions. See the [official configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference).
The Claude-only `model: sonnet` frontmatter in `project-next-milestone/SKILL.md`
is a documented exception; see the [verification record](docs/validation/shared-skills-g3.md).

Resolve the active checkout with `git rev-parse --show-toplevel`; do not reuse
skill paths from another checkout. Resolve user-supplied relative plan and output
paths from the invocation directory before changing directories. For roadmap
work, use `python3 tools/project-context.py <milestone-id>` and follow the shared
[project-management lifecycle](docs/PROJECT_MANAGEMENT.md): `PLAN.md` owns the
roadmap, `ISSUES.md` owns findings, and substantial milestones use
`docs/plans/<milestone-id>.md` checkpoints. Work only on explicitly selected or
already authorized milestones; a bare continuation request without an active
authorization presents candidates for selection. Keep outstanding verification,
deferred work, and authorization limits explicit. Persist checkpoints before
handoff commits and include a host-neutral prompt. Follow the run-mailven skill's
safeguards for UI checks; it links optional references by task.

For Windows clones, preserve Git symlinks: enable Developer Mode or suitable
privileges and clone with `git -c core.symlinks=true`. Verify `.claude/skills` is
a directory symlink, not a text file or copied skill tree.

## Landing a branch

When all of a feature's milestones are done or an audit pass is complete, land the branch without being asked. Checks must pass and nothing may be uncommitted. `tools/project-land.sh` automates these steps with extra safeguards (see [Workflow helpers](#workflow-helpers)).

1. If `main` has commits the branch lacks, rebase the branch onto `main` and rerun the relevant checks. On conflicts, run `git rebase --abort`, stop, and report the conflicting files.
2. Run `git switch main` and `git merge --squash <branch>`, then commit once, listing each change the branch made in the commit body.
3. After the squash commit succeeds, push `main` to its configured upstream.
4. Run `git branch -D <branch>` only after `git diff main <branch>` prints nothing.

## Workflow helpers

These standard-library helpers reduce repeated shell recipes and returned context. They preserve the existing lifecycle and authorization rules; only the [unattended runner](#unattended-milestone-runs) selects milestones, and none performs review, authorizes live work or marks acceptance complete. Required guidance already read in a session may be reused while unchanged; new sessions load it again.

From the checkout root:

```bash
python3 tools/project-context.py                  # Portfolio/Progress and Git facts
python3 tools/project-context.py API-5            # Selected project, milestone, linked issues/checkpoint
python3 tools/check-doc-links.py --changed        # Staged/unstaged/untracked Markdown
python3 tools/project-check.py --base main        # Check plan only
python3 tools/project-check.py --base main --run  # Serial checks and private evidence/logs
```

`project-context.py` accepts `--plan`/`--issues`, `--json` and `--max-lines`; source line pointers identify bounded excerpts. User-supplied paths resolve from the invocation directory, including spaces and worktrees. Missing/ambiguous milestones and plans are errors. Context describes proposed/deferred status without authorizing it.

`check-doc-links.py` accepts explicit Markdown paths, `--changed`, `--base` and `--json`. It validates local destinations, anchors, reference links and `/docs/` routes against user-guide sources; it does not fetch external sites. Deleted sources are skipped during changed-file scans, but links to missing targets fail. Ordinary relative links may browse existing repository directories without an index; `/docs/` site routes require a `.md`, `.mdx` or `index.md` page. Code examples are ignored. Use `--max-errors` to bound console diagnostics and `--json-output` for a new full report file (existing files are refused). Keep archive/origin files outside checks unless the task changes or explicitly selects them.

`project-check.py` infers scopes from changes (an extension's `extensions/<name>/frontend/` counts as frontend) against the common ancestor of the supplied base (default `HEAD`) and the current branch and unions any `--scope docs|tooling|go|frontend` additions. Unsupported changed paths require manual validation; it never silently assumes they passed. Add milestone-specific checks with `--extra-command '["python3", "path/to/check.py"]'` (argv only, checkout-root cwd). Frontend includes lint/check/build and the full UI suite; Go includes `make test` and prepares missing embedded frontend assets. Tooling runs the Python helper tests, skill path checks and brand check. Existing native/live gates remain separate. Only one helper check/landing operation may run in a checkout at a time.

Execution saves complete logs and `evidence.json` in a new private directory under `~/.cache/mailven-project-checks/` (or `$XDG_CACHE_HOME`); `--output-dir` chooses a new directory outside the checkout. Console output is bounded by `--tail-lines` (default 6). Failure stops the batch, preserves logs and identifies unrun checks. Source fingerprints cover tracked and nonignored untracked files, their content, symlinks and executable modes; changing source invalidates evidence, while committing identical content does not. Review logs before sharing them. Tests/builds may legitimately change generated source, in which case review and rerun rather than claiming fresh evidence.

For the standard authorized squash landing, commit all milestone files, complete independent acceptance and review, and preview:

```bash
tools/project-land.sh feature-branch --evidence /absolute/path/evidence.json
# Supply a reviewed title and body file; --execute performs the authorized action.
tools/project-land.sh feature-branch --evidence /absolute/path/evidence.json \
  --title 'feat: describe the completed work' --body-file /absolute/path/body.txt --execute
```

Landing requires the feature checkout to be clean, checks/logs to match its source and scopes, and main to have a configured upstream. Evidence must start at the landing merge base or an earlier ancestor and cover every changed feature path; a later feature commit cannot serve as its baseline. Use `project-check.py --base main --run` for the whole branch, including when main has diverged; its recorded baseline is the common ancestor. Older evidence recorded directly against diverged main must be regenerated. It retains `recovery/project-land-...-feature` and `...-main` local branches before changes, rebases when needed and reruns the recorded checks, aborts on conflicts, respects configured identity/hooks, pushes main without force, and deletes the feature only after a successful push and equal-tree comparison. A main branch already checked out in another worktree requires landing from a checkout where it is available. Failure retains the feature/recovery branches and reports the Git state; fix the stated problem without bypassing safeguards. Recovery branches are intentionally not removed automatically.

Validate changes to helpers with `python3 -m unittest discover -s tools/tests -p 'test_*.py'` and `python3 .agents/skills/project-next-milestone/tests/paths.py`. These tests use disposable repositories/remotes and fake commands, never production accounts or project pushes.

### Unattended milestone runs

`tools/project-run.py` works through roadmap milestones without a user. Each milestone gets one fresh headless Claude Code (`claude -p`, default) or Codex (`--agent codex`) session running `project-next-milestone`, including its finish step and one local commit. From a clean feature-branch checkout (or a clean `main` with `--land`):

```bash
python3 tools/project-run.py --list                  # Ranked eligible milestones; runs nothing
python3 tools/project-run.py                         # Best eligible milestone, then the next, ...
python3 tools/project-run.py --milestones GOAUTH-4 --max-milestones 1
python3 tools/project-run.py --agent codex --verify-command 'make lint && make test'
make milestone ARGS='--list'                        # Same runner; options go in ARGS
make milestone ARGS='--land'                        # Also check and land each completed milestone
```

`make milestone` unsets every variable defined in `.env`/`.env.local` (which the Makefile otherwise exports) and make's own variables, so sessions never inherit OAuth credentials; their own `make` runs read those files again.

**Selection.** Without `--milestones`, the runner rereads `PLAN.md` before each milestone and picks the best eligible one: `active` first (resuming interrupted work), then `proposed`. Within each group, lower `P` priority wins, then plan order. A milestone is eligible only when its project isn't `blocked`, `deferred` or `done` and every milestone ID under its **Dependencies / gates** (links, bare IDs and ranges such as `UIX-1–5`) is `done`. Any milestone ID there counts as a dependency, which errs toward waiting. Deferred, blocked and done milestones are never selected, and issues without a milestone aren't candidates. `--milestones` runs the listed IDs in order and accepts only `active` or `proposed` ones.

**Authorization.** Starting the runner authorizes each selected milestone's local scope, one session at a time; the session records that authorization in its checkpoint. It never reopens deferred work and never permits live provider access, test emails, credential changes, mailbox migration, dependency upgrades, pushing or landing. Sessions leave those steps unrun and recorded. Without `--land`, review the commits and land the branch yourself.

**Landing.** `--land` makes the runner itself, never a session, land each completed milestone: it reruns `project-check.py --base main --run` for the whole branch, then calls `tools/project-land.sh <branch> --execute` with that evidence, the milestone commit's subject as the title (or `feat: <milestone title> (<ID>)` when the subject lacks a prefix) and its body. Started on `main`, the runner creates `milestone/<id>` for each milestone; started on a feature branch, the first milestone lands with that branch's earlier commits. Starting the runner with `--land` is the owner's authorization to push each landed milestone to `main`'s upstream; the session's own review and acceptance check (the finish step) are the review. A blocked milestone, failed checks or a failed landing stop the run with the branch and recovery branches retained; check and landing logs go to the run's log directory.

**Outcomes.** Each session returns `success` (milestone marked done and committed), `handoff` (checkpoint committed at a sub-step boundary; the runner continues the milestone in a fresh session, up to `--max-handoffs`) or `blocked` (blocker recorded; the runner skips to the next candidate). After each session the runner requires a clean tree, a new commit for success or handoff, and a `done` plan status for success. With `--verify-command` it then runs that command after each completed milestone. Exit codes: 0 when nothing eligible remains or `--max-milestones` is reached; 2 when a milestone was blocked, left uncommitted changes, exceeded its handoffs or failed verification; 1 on a session error or an inconsistent result; 130 on Ctrl+C. Rerun to resume.

**Usage limits.** On a usage limit the runner waits for the reported reset (or `--retry-minutes`) and resumes the same session, giving up after `--max-wait-hours` of continuous waiting. If the session can't be resumed, the milestone starts fresh.

**Sessions.** Defaults are `--permission-mode bypassPermissions` (Claude) or `--sandbox danger-full-access` (Codex, because `workspace-write` blocks the commit), so sessions run checks without prompts. `--chrome` (Claude in Chrome, on by default) needs Chrome open with the extension connected. `--playwright` (on by default) adds a pinned headless Playwright MCP server and needs `npx` and Google Chrome. `--model` and `--effort` apply to every session. Session logs and Playwright output go to a new private directory under `~/.cache/mailven-project-runs/` (or `$XDG_CACHE_HOME`). One runner may hold a checkout at a time.

## Development Setup

Use Go 1.26, Node.js 24 (matching CI), and the Wails v2 CLI. On Linux, install GTK 3 and WebKitGTK 4.1 development libraries.

Enable the tracked Git hooks once per clone:

```bash
git config core.hooksPath .githooks
```

`commit-msg` rejects AI co-author lines, assistant session trailers, and "Generated with/by" attribution, for people and agents alike.

The frontend uses TypeScript 6, the newest major accepted by both the lint and Svelte check tools.
Before upgrading TypeScript, check the published peer ranges of both tools:

```bash
npm view typescript-eslint@latest version peerDependencies --json
npm view svelte-check@latest version peerDependencies --json
```

Upgrade only to a version accepted by both, then run frontend lint, check, and build.

```bash
git clone https://github.com/CaseyLabs/mailven.git
cd mailven
go mod download
cd frontend
npm ci
npm run build
cd ..
make dev
```

For OAuth testing, copy `.env.example` to `.env` and configure your own credentials. `.env.local` overrides `.env`. Do not commit credentials or include private mail data in logs or issues.

`make dev` uses the same data directory (`~/.local/share/mailven` on Linux) and OS keyring as a native build. Refresh tokens belong to the OAuth client that issued them, so after the client ID in `.env`/`.env.local` changes, or for accounts added by a build with other credentials, sync fails with `token refresh failed: unauthorized_client`. Re-authorize the account once in the dev app (edit it in Settings → Accounts, then **Re-authorize**) to fix it.

`make dev` always renders the Dark theme, whatever theme is saved in Settings. Theme choices are still saved and apply in production builds.

Debug logging is off by default. Start Mailven with `--debug` or `MAILVEN_DEBUG=1` to log at debug level to the console and to `mailven.log` in the data directory (`~/.local/share/mailven/` natively, `~/.var/app/io.github.caseylabs.Mailven/data/mailven/` under Flatpak). The log rotates to `mailven.log.1` at 10 MB.

## Code and Validation

Prefer small changes, explicit Go error handling, and guard clauses. Format Go with `gofmt`, document exported functions, and use zerolog for logging. Frontend code uses two-space indentation, single quotes, no semicolons, PascalCase component names, and Svelte 5 runes. Keep components focused and under 500 lines. Preserve keyboard accessibility, resource efficiency, and user privacy.

- `make fmt`: format Go code.
- `make lint`: run golangci-lint v2, frontend ESLint, the theme contrast check (`tools/contrast-check.mjs`) and the brand check (`tools/brand-check.sh`; add a reasoned line to `tools/brand-check.allow` for any legitimate "Aerion" mention).
- `cd frontend && npm run check`: check Svelte and TypeScript.
- `make test`: run Go tests; build the frontend first because Go embeds `frontend/dist/`.
- `make test-ui`: run the backend-free UI audit and frontend regression tests headlessly with fake data; needs Playwright outside `frontend/package.json` (see `tests/ui/README.md`).
- `make build`: produce the desktop application.
- `make generate`: regenerate bindings after changing the Wails API.

Follow the [validation procedures](docs/VALIDATION.md) for database migrations, frontend checks, UI failure handling and visual coverage. Start with checks relevant to the change. Add Go tests for meaningful behavior and edge cases, using table-driven tests where appropriate. Frontend regression tests live in `tests/ui/`; add one for each confirmed frontend bug. No numeric coverage threshold is configured. Manually check affected UI flows the suite does not cover and report checks that could not run.

### Regenerating Wails bindings

`frontend/wailsjs/` holds generated bindings. Stop any running Mailven first (`.agents/skills/run-mailven/dev.sh stop`): the single-instance lock makes the generator exit without writing anything. `make generate` (`wails generate module`), `wails dev` and `wails build` (so `make dev`, `make build` and the run-mailven `dev.sh`) all regenerate the bindings. The committed files are the generator's output, including its file modes (`0755` under `go/`, `0644` under `runtime/`) and the tabs it writes on blank lines, so an unchanged API leaves no diff. `wails dev` and `wails build` write the runtime files as 0644, but `wails generate module` writes them as 0755, so the `generate` target in the `Makefile` runs `chmod 644 frontend/wailsjs/runtime/*` afterwards; if you run `wails generate module` directly, do the same. Don't strip that whitespace or change the modes: `.gitattributes` exempts `frontend/wailsjs/**` from whitespace checks, so `git diff --check` stays clean. Commit any remaining diff with the Go API change that caused it.

## Localization and Security

The UI is English-only; see [docs/LANGUAGE.md](docs/LANGUAGE.md) for how strings and locales work. Report vulnerabilities according to [SECURITY.md](SECURITY.md).

## Aerion Upstream and License

Upstream Aerion fixes can be cherry-picked into Mailven. In a clone that lacks the remote, run `git remote add upstream https://github.com/hkdb/aerion.git`, then `git fetch upstream` and `git cherry-pick <commit>`. Renamed paths and identifiers can make these conflict, so resolve them by hand. For changes meant for Aerion itself, consult Aerion's current contribution rules separately.

Replace "Aerion" only where it names this app. Keep it in attribution, history, `LICENSE`, `archive/`, statements of origin, and the persisted legacy identifiers listed in [AGENTS.md](AGENTS.md). Preserve the repository's Apache License 2.0 terms and the [NOTICE](NOTICE).
