# PromptWise AI Engine

Optimize with evidence, not token count alone. PromptWise compares an original prompt with a
High-Context and a Low-Token alternative on tokens, cost, requirement preservation and
(optionally) benchmarked quality, then recommends one of the three.

Reference documents (do not modify): `CodeAkatsuki.pdf`, `PromptWise_Architecture.png`,
`PromptWiseFlowDiagram.png`.

## Status

- M0 â€” backend foundation (configuration + health endpoint).
- M1 â€” request/response schemas and enums (`backend/app/schemas/`).
- M2 â€” request validation and verified model catalog (`backend/app/modules/validation.py`,
  `backend/app/modules/catalog.py`, `backend/app/data/model_catalog.json`).
- M3 â€” failure-alerts collector and alert factories (`backend/app/modules/alerts.py`), structured
  error responses with secret redaction (`backend/app/core/errors.py`, `redaction.py`).
- M4a â€” offline token estimation and token-reduction maths (`backend/app/modules/tokens.py`).
- M6R â€” rule-based requirement extraction (`backend/app/modules/requirements/rules.py`): explicit
  wording only, with source text, certainty (`explicit` / `hedged` / `uncertain`), parsed
  quantities and duplicate counts. Module 2 audit: conditionals, time/percent quantities, clause
  splitting, scope-aware duplicates and contradiction flags (`possible_conflicts`); contradictions and
  uncertain critical requirements lower recommendation confidence. Limitations: see
  `docs/acceptance-criteria.md` (Module 2).
- M7R â€” rule-based generation of the two alternatives (`backend/app/modules/generation/rules.py`).
  High-Context = original verbatim + a checklist quoting every requirement sentence word for word.
  Low-Token = original minus repeated requirement sentences, pleasantries, filler and extra
  whitespace; edits that would change any extracted requirement are reverted. An unchanged or
  non-shorter result is reported as `failed`, never as a success. Preservation scoring (M8R),
  costs and recommendations are covered by later modules.

## Preservation checks (Module 3)

Each alternative is checked against the requirements extracted from the original: verbatim source
sentences, the same quantity *and comparison*, required (not negated) formats and fields, and key terms
with the action verb or negation/condition wording in one or two adjacent sentences. LLM output that fails
a critical check, is a placeholder, or duplicates the other alternative is replaced by a labelled rules
fallback. These are heuristics, not proof of semantic equivalence; ordering, added requirements and the
meaning of unclassified sentences are not checked (see `docs/acceptance-criteria.md`).

## Token counts

Groq models have no tokenizer that runs offline without extra downloads, so all token counts are
**estimates, always labelled `approximate`** (method `heuristic-v1`): ceil(ASCII characters / 4)
plus one token per non-ASCII character. The heuristic is meant for comparing variants of the
same prompt; its absolute error has not been measured. Missing text gives `unavailable`, never 0.

## Providers and models

**Groq is the only active provider in the current MVP.** Balanced mode will use rules plus Groq;
Advanced mode will be Groq-led; Economic mode is rules-only and works offline with no key.

The verified catalog lists Groq production models with prices copied from
https://console.groq.com/docs/models (verified 2026-10-25). Models shown there as
"Contact Sales" (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`) are accepted, but their
pricing is `unavailable` unless you supply your own rates. Gemini models are kept in the catalog,
verified from Google's official pages, for future support only; requests naming `gemini` are
rejected with `PROVIDER_NOT_ACTIVE`.

Catalog prices older than 90 days are treated as unavailable until the catalog is re-verified.

Validation errors are structured: `MISSING_CREDENTIALS`, `UNSUPPORTED_MODEL`,
`PROVIDER_NOT_ACTIVE` (returned as HTTP 400 once the API route exists in M12).

## Quick start (MVP demo)

Two terminals, from the project root:

```bash
backend\.venv\Scripts\python -m uvicorn app.main:app --app-dir backend --port 8000
```

```bash
npm --prefix frontend run dev
```

Open http://localhost:5173 (the frontend proxies `/api` to the backend on port 8000; the Groq
key stays on the server). API docs: http://127.0.0.1:8000/docs.

First-time setup: see "Backend setup" below, then `npm --prefix frontend install`.

### Demo checklist

1. **Economic (offline, no key):** keep the sample prompt, mode Economic, model "None" â†’ Optimize.
   Low-Token removes the greeting, the duplicate rule and filler; preservation Pass; approximate
   token labels; Quality: Unverified.
2. **Costs:** pick *GPT OSS 20B*, set output tokens/run to 300 â†’ costs per run and break-even appear,
   with the catalog source and verification date. Pick a *Llama* model â†’ "price unavailable".
3. **Balanced / Advanced (Groq):** needs `GROQ_API_KEY` in `backend/.env`. Shows `rules+llm` /
   `llm` generation, real token usage and overhead cost.
4. **Honest failures:** a Groq error or a bad LLM output (e.g. drops a critical rule) appears as an
   alert and a labelled *Rules fallback*, never as success; run status becomes `partial`.
5. **Copy / export:** copy any variant; "Export JSON report" downloads the full comparison.
6. **Benchmark:** open "Paired benchmark", tick it, keep the two sample test inputs and criteria,
   pick a Groq model â†’ per-case 0-4 scores, verified quality, and (if earned) `high` confidence.
   ~1 + 4 Groq calls per test case.

### MVP pipeline (what runs)

validate â†’ extract requirements (rules) â†’ generate High-Context + Low-Token (rules, or Groq with
rules fallback) â†’ heuristic token estimates â†’ rule-based preservation check â†’ cost/break-even â†’
staged recommendation (Low-Token only with â‰¥10% saving and every critical requirement passing;
High-Context when the short version is unsafe; otherwise Original).

**Paired benchmark (optional, Groq):** Original, High-Context and Low-Token run on the same test
cases with the same model, temperature 0 and max output tokens; one paired LLM judge call per case
scores all three on the PRD 0-4 rubric (labelled "LLM-judged, not human-reviewed"). Per-case results,
provider errors, truncated outputs and judge failures are reported; quality is `verified` only when
every case is fully scored, otherwise the run is `partial` and quality stays Unverified. Verified
quality feeds the recommendation (Low-Token blocked if >2 percentage points below the original).
Benchmark cost is reported separately from optimization overhead. `high` confidence needs a full
5-case benchmark; fewer cases are shown as limited evidence. Limitations: no automatic retry on Groq
rate limits (pace runs â€” the verified account has an 8,000 tokens/minute limit, ~2.5K tokens per case),
the judge is the same Groq model, and responses include 400-character output excerpts.

Deferred: LLM-assisted requirement extraction and LLM preservation judging (rules are used),
Gemini (inactive), history/library, replacing the output-token assumption with measured output.

## Backend setup (Windows, Python 3.11)

Run from the `backend` folder:

```bash
py -3.11 -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt -r requirements-dev.txt
```

Optional â€” Groq API key (needed only for Balanced/Advanced modes and benchmarking):

```bash
copy .env.example .env
```

Then set `GROQ_API_KEY` in `backend/.env`. It is git-ignored; never commit real keys.

## Run the API

```bash
.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

- Health check: http://127.0.0.1:8000/api/health
- Interactive docs: http://127.0.0.1:8000/docs

`credentials_configured` in the health response only shows whether a key is set. It does not
check that Groq or Gemini are reachable.

## API contract notes (schemas in `backend/app/schemas/`)

- Leading/trailing whitespace is trimmed from the prompt and other text fields before validation.
- `benchmark.test_cases` and `benchmark.criteria` are accepted but ignored when
  `benchmark.enabled` is `false`.
- Pricing has no defaults. If no prices are given, or no `expected_output_tokens` assumption is
  supplied, execution costs and break-even are reported as `unavailable` with a reason.
- Optimization overhead has two figures: `llm_cost` (optimization LLM calls) and `total_cost`
  (used for break-even). With zero LLM calls, `llm_cost` may be `$0` even without pricing; this
  never makes execution costs or break-even available on its own.
- Money values are exact decimals serialized as plain strings (e.g. `"0.0044"`, `"0.000000075"`); they are
  never rounded in the backend. `cost.projected_total` = one-time optimization overhead (0 for the
  original) + expected runs x cost per run, or null when the overhead is unknown.
- Provider token usage is used only when Groq reports valid non-negative integers; otherwise it is
  shown as unavailable rather than estimated.
- The response schema rejects internally inconsistent results, e.g. a `complete` status with a
  fallback/failed alternative, an eligible alternative whose critical requirement is not `pass`,
  or a cost marked available without pricing.

Calculation-dependent checks deferred to later modules are tracked in
[`docs/acceptance-criteria.md`](docs/acceptance-criteria.md).

## Run the tests

```bash
.venv\Scripts\python -m pytest -v
```

Tests never call real providers.

# Commit 17 by akshatab15: 2026-10-25 02:08:00

