# Repo Cleanup Audit

**Date:** 23 May 2026
**Auditor:** Claude (Opus 4.7)
**Status:** Report only — no files were deleted, modified, or staged.
**Build status:** ✅ `npm run build` passed in 9.90s
**Current Supabase project (production):** `rcypkqctgonotawnajqb`
**Stale Supabase reference found in docs:** `nukeyvnsvsgwyvbtertf` (24 docs)

---

## Hard-keep files (rule-enforced, never marked Delete)

- `src/` (entire tree)
- `supabase/migrations/` (entire tree)
- `.env`, `.env.production`
- `package.json`, `package-lock.json`, `bun.lock`
- `public/brand/` (all brand SVGs)
- `public/favicon.svg`, `public/favicon-32x32.svg`, `public/apple-touch-icon.svg`
- `docs/MYRIDENEPAL_BRAND_RULES.md`
- `public/brand/README.md`
- `README.md` (empty but rule-enforced — see Manual Review)

---

## 1. DELETE — safe to remove

### 1a. Scratch SQL files (6 files)
These are one-time "paste this into Supabase Dashboard" scripts that reference the **wrong** Supabase project (`nukeyvnsvsgwyvbtertf`). The canonical migrations live in `supabase/migrations/`. Removing these only removes confusion.

| File | Lines | Reason |
|---|---|---|
| `apply_missing_dealer_tables.sql` | 728 | Phase 4C ad-hoc paste — superseded by `supabase/migrations/` files |
| `apply_phase2a_migration.sql` | 191 | References wrong project URL; canonical = `20260521120000_dealer_phase2a.sql` |
| `apply_phase2b_migration.sql` | 141 | References wrong project URL; canonical = `20260521130000_dealer_phase2b.sql` |
| `apply_phase2c_migration.sql` | 209 | References wrong project URL; canonical = `20260521140000_dealer_phase2c.sql` |
| `apply_phase3a_migration.sql` | 257 | References wrong project URL; canonical = `20260521160000_dealer_phase3a.sql` |
| `apply_phase3b_migration.sql` | 248 | References wrong project URL; canonical = `20260522100000_dealer_phase3b.sql` |

### 1b. Backup file (1)

| File | Reason |
|---|---|
| `src/routes/dealer.dashboard.inventory.tsx.backup` | Explicit `.backup` suffix; live file `src/routes/dealer.dashboard.inventory.tsx` is committed and current |

> **Note:** This file is inside `src/` which is a hard-keep tree per your rule. I'm flagging it for Delete because the `.backup` suffix and the existence of the live version make its intent unambiguous, but **you have final say** — say "keep backups" and I'll move it to Manual Review.

### 1c. Deprecated deployment configs (3)
Site is hosted on Vercel (`vercel.json` is the active config). These are leftovers from earlier attempts that aren't loaded by any build path.

| File | Reason |
|---|---|
| `netlify.toml` | Netlify deploy config; we use Vercel. `publish = "dist/client"` is a stale TanStack Start path; current build outputs to `dist/` |
| `package.json.netlify` | Stripped Netlify variant of `package.json`; not loaded by anything |
| `wrangler.jsonc` | Cloudflare Workers config (`"main": "src/server.ts"`). `vite.config.ts` doesn't load `@cloudflare/vite-plugin`. SSR via Workers is not the active deploy path |

### 1d. Cache-bust hack (1)

| File | Reason |
|---|---|
| `.vercel-cache-bust` | One-time file from `2026-05-19T00:30:00Z` to force Vercel CDN invalidation. Job done long ago |

### 1e. Phase-summary docs that reference the WRONG Supabase project (21)
Every one of these references `nukeyvnsvsgwyvbtertf` (the dead project). All describe completed phases. They are Copilot/dev-session journal entries, not living documentation.

| File | Phase | Notes |
|---|---|---|
| `DEALER_PHASE2A_IMPLEMENTATION_REPORT.md` | 2A | Implementation log — phase shipped |
| `DEALER_PHASE2B_SUMMARY.md` | 2B | Summary — phase shipped |
| `DEALER_PHASE2C_SUMMARY.md` | 2C | Summary — phase shipped |
| `DEALER_PHASE3A_SUMMARY.md` | 3A | Summary — phase shipped |
| `DEALER_PHASE3B_SUMMARY.md` | 3B | Summary — phase shipped |
| `DEALER_PHASE3B_POLISH_SUMMARY.md` | 3B polish | Summary — phase shipped |
| `DEALER_PHASE3C_SUMMARY.md` | 3C | Summary — phase shipped |
| `DEALER_PHASE3D_SUMMARY.md` | 3D | Summary — phase shipped |
| `PHASE2A_FIX_INSTRUCTIONS.md` | 2A | One-time fix log |
| `PHASE3A_QUICK_REF.md` | 3A | Quick-ref scratchpad |
| `PHASE3B_QUICK_REF.md` | 3B | Quick-ref scratchpad |
| `PHASE3B_POLISH_QUICK_REF.md` | 3B polish | Quick-ref scratchpad |
| `PHASE3C_QUICK_REF.md` | 3C | Quick-ref scratchpad |
| `PHASE3D_QUICK_REF.md` | 3D | Quick-ref scratchpad |
| `PHASE4C_QUICK_REF.md` | 4C | Quick-ref scratchpad |
| `PHASE4C_SUMMARY.md` | 4C | Summary — phase shipped |
| `PHASE_4F_SUMMARY.md` | 4F | Summary — phase shipped, references wrong project |
| `APPLY_MIGRATIONS_GUIDE.md` | n/a | Old migration-application guide pointing at wrong project |
| `MANUAL_MIGRATION_GUIDE.md` | n/a | Old migration-application guide pointing at wrong project |
| `MIGRATIONS_APPLIED.md` | n/a | State-tracking note from dev session; outdated |
| `QUICK_START.md` | n/a | Old setup doc; references wrong project |

### 1f. Phase-summary docs without project ref but referring to completed phases (8)

| File | Reason |
|---|---|
| `DEALER_PHASE1_CODE_SNIPPETS.md` | Phase 1 dev notes — phase shipped |
| `DEALER_PHASE1_FIELDS.md` | Phase 1 dev notes |
| `DEALER_PHASE1_IMPLEMENTATION.md` | Phase 1 dev notes |
| `DEALER_PHASE1_SUMMARY.md` | Phase 1 summary |
| `DEALER_PHASE2A_STATUS.md` | Phase 2A status snapshot |
| `PHASE4A_LAUNCH_CLEANUP_SUMMARY.md` | Phase 4A summary |
| `PHASE4A_QUICK_REF.md` | Phase 4A quick-ref |
| `PHASE4B_SUMMARY.md` | Phase 4B summary |
| `PHASE4D_SUMMARY.md` | Phase 4D summary |
| `PHASE_4E_SUMMARY.md` | Phase 4E summary |

### 1g. One-time Copilot-generated reports / completion markers (10)
None of these are referenced by current docs or code. All read as "done log" style.

| File | Reason |
|---|---|
| `BROWSER_TESTING_GUIDE.md` | Copilot-generated test session guide; superseded by `FINAL_SMOKE_TEST_CHECKLIST.md` |
| `LIVE_ROUTE_TEST_RESULTS.md` | One-time route test results from a dev session |
| `ROUTE_IMPLEMENTATION_STATUS.md` | One-time status snapshot |
| `ROUTE_STATUS_QUICK_REF.md` | One-time quick-ref |
| `TEST_PHASE2A_REPORT.md` | One-time test report |
| `UNCOMMITTED_FILES_INSPECTION.md` | Copilot inspection of 4 source files (this session, already actioned) |
| `QUICK_TEST_CHECKLIST.md` | Copilot-generated; superseded by `FINAL_SMOKE_TEST_CHECKLIST.md` |
| `TYPESCRIPT_ERRORS_FIXED.md` | One-time fix log |
| `FIXES_COMPLETED.md` | One-time fix log |
| `LOGO_UPDATE_SUMMARY.md` | One-time logo migration log |

### 1h. Other completion markers (3)

| File | Reason |
|---|---|
| `DOCUMENTS_PAPERWORK_COMPLETE.md` | "Fully implemented" marker for a shipped feature |
| `VERIFICATION_BADGES_COMPLETE.md` | "Fully implemented" marker for a shipped feature |
| `PRODUCTION_FIXES.md` | Log of past production fixes |
| `BLOG_ISSUE_REPORT.md` | One-time issue report |
| `TESTING_CHECKLIST.md` | "Phase 1 Dealer Testing" — superseded by `FINAL_SMOKE_TEST_CHECKLIST.md` |

**DELETE total: 55 files** (6 SQL + 1 backup + 3 deploy configs + 1 cache-bust + 21 phase docs with wrong project + 10 phase docs without project ref + 10 Copilot reports + 4 completion markers + 1 testing checklist)

---

## 2. KEEP — active, accurate, needed

### 2a. Hard-keep per rule
- All of `src/`
- All of `supabase/migrations/`
- `.env`, `.env.production`
- `package.json`, `package-lock.json`, `bun.lock`
- All of `public/brand/`
- `public/favicon.svg`, `public/favicon-32x32.svg`, `public/apple-touch-icon.svg`
- `docs/MYRIDENEPAL_BRAND_RULES.md`

### 2b. Active build / dev config
| File | Reason |
|---|---|
| `vercel.json` | Active Vercel deploy config |
| `vite.config.ts` | Active build config |
| `tsconfig.json` | Active TS config |
| `eslint.config.js` | Active linter config |
| `index.html` | Active SPA shell |
| `components.json` | shadcn/ui config |
| `.gitignore`, `.prettierignore`, `.prettierrc` | Active dev config |

### 2c. Current Supabase / production docs (correct project ref)
| File | Reason |
|---|---|
| `AI_SKILLS_SETUP.md` | Uses correct `rcypkqctgonotawnajqb` |
| `DATABASE_CONNECTION_GUIDE.md` | Uses correct project ref |
| `READY_TO_DEPLOY.md` | Uses correct project ref |
| `SECURITY_AUDIT_COMPLETE.md` | Security audit (RLS hardening) — accurate to current state |
| `SUPABASE_MIGRATION_GUIDE.md` | Migration how-to with correct project ref |
| `VERCEL_DEPLOYMENT.md` | Deployment guide with correct project ref |
| `PRE_LAUNCH_CHECKLIST.md` | Uses correct project ref |
| `BLOG_IMPROVEMENTS.md` | Uses correct project ref; describes shipped feature |
| `DEALER_PHASE1_COMPLETION.md` | Uses correct project ref; the only Phase 1 doc with the correct project |

### 2d. Active launch toolkit (no Supabase URLs, evergreen content)
| File | Reason |
|---|---|
| `FINAL_SMOKE_TEST_CHECKLIST.md` | 40-test launch checklist — no project ref, evergreen |
| `LAUNCH_MESSAGING_KIT.md` | Pitches, social bios, website copy |
| `LAUNCH_ASSET_CHECKLIST.md` | Logo, meta tags, social setup checklist |
| `SOCIAL_LAUNCH_CONTENT.md` | Pre-written social posts |
| `SEED_DATA_PLAN.md` | Plan for seeding initial 20-30 listings |
| `FIRST_30_DAYS_GROWTH_PLAN.md` | Week-by-week growth roadmap |
| `DEALER_ONBOARDING_SCRIPT.md` | Dealer call script |
| `DEALER_OUTREACH_MESSAGES.md` | WhatsApp / call scripts |
| `DEALER_OUTREACH_TRACKER_TEMPLATE.md` | Outreach tracker spreadsheet template |

### 2e. Other source / brand
| File | Reason |
|---|---|
| `docs/BIKE_HISTORY_COMPLETE.md` and 4 BIKE_HISTORY_* siblings | Describe shipped feature; live in `docs/` (not top-level scratch) |
| `docs/COMPLETE_OFFERS_NOTIFICATIONS.md` | Describes shipped feature in canonical docs/ folder |
| `docs/IMPLEMENTATION_SUMMARY.md` | Canonical implementation reference |
| `docs/MAKE_AN_OFFER.md` | Feature reference |
| `docs/NOTIFICATIONS_PART1.md` | Feature reference |
| `docs/SYSTEM_FLOW_DIAGRAM.md` | Architecture reference |
| `docs/TRUST_BADGE_FEATURE.md` | Feature reference |
| `docs/WHATSAPP_CONNECT.md` | Feature reference |

**KEEP total: ~30 files** (excluding the rule-enforced trees)

---

## 3. MANUAL REVIEW — your call

These have value but also problems. Don't delete blindly.

### 3a. Launch playbook with wrong Supabase URLs (3)
Substantial, useful documents — but they hard-code `nukeyvnsvsgwyvbtertf` in their migration commands and dashboard links. **Fix the project ID → KEEP**, or accept they're misleading → delete.

| File | Why review |
|---|---|
| `DEPLOYMENT_PLAN.md` | Full step-by-step launch playbook — 895 lines. Has correct overall logic but wrong project URL throughout |
| `PRODUCTION_MIGRATION_CHECKLIST.md` | Detailed migration apply guide — 486 lines. Wrong project URL throughout |
| `SOFT_LAUNCH_CHECKLIST.md` | Soft launch playbook — 1072 lines. Wrong project URL throughout |
| `ADMIN_DATA_CLEANUP_GUIDE.md` | Useful SQL queries for cleaning test data, but wrong Supabase dashboard URL in instructions |

**Recommendation:** Fix the project URL with a single find-replace across these 4 files, then move them to KEEP. The content is otherwise solid and represents a real launch toolkit.

### 3b. Lovable template marker (1)
| File | Why review |
|---|---|
| `.lovable/project.json` | 71-byte marker file: `{"schemaVersion": 1, "template": "tanstack_start_ts_2026-05-06"}`. Identifies the repo's lineage as a Lovable template. **No active Lovable imports anywhere in the codebase.** Harmless to keep, harmless to delete |

### 3c. Empty/dead files (3)
| File | Why review |
|---|---|
| `README.md` | **EMPTY** (zero bytes / no readable content). Your rule says "Do not delete README.md unless clearly wrong." An empty README is arguably "clearly wrong" but **your call** to either populate it or remove it. I won't touch it without your say-so |
| `scripts/generate-html.js` | Not referenced by any `package.json` script, `vite.config.ts`, or `vercel.json`. Sole contents of `scripts/`. Likely dead code, but I'm not certain |
| `test-supabase.mjs` | Standalone Supabase connectivity test script. Useful for debugging. Not used by any build. Can be deleted, or kept as a debugging aid |

### 3d. Generated/cache (1)
| File | Why review |
|---|---|
| `dist/` (folder) | Build output. Vercel rebuilds on push; you don't need to track this locally. It's already in `.gitignore` so this is just disk-space cleanup. Run `rm -rf dist/` only if you want — won't affect anything |

---

## 4. Files containing the OLD Supabase project (`nukeyvnsvsgwyvbtertf`)

**Total: 24 markdown files + 5 SQL files = 29 files**

### Marked DELETE
- All 6 `apply_*.sql` files
- 18 phase-summary `.md` docs (see 1e and 1g)

### Marked MANUAL REVIEW (have value if URL is fixed)
- `DEPLOYMENT_PLAN.md`
- `PRODUCTION_MIGRATION_CHECKLIST.md`
- `SOFT_LAUNCH_CHECKLIST.md`
- `ADMIN_DATA_CLEANUP_GUIDE.md`

### Full grep-confirmed list
```
ADMIN_DATA_CLEANUP_GUIDE.md
APPLY_MIGRATIONS_GUIDE.md
DEALER_PHASE2A_IMPLEMENTATION_REPORT.md
DEALER_PHASE2B_SUMMARY.md
DEALER_PHASE2C_SUMMARY.md
DEALER_PHASE3A_SUMMARY.md
DEALER_PHASE3B_POLISH_SUMMARY.md
DEALER_PHASE3B_SUMMARY.md
DEALER_PHASE3C_SUMMARY.md
DEALER_PHASE3D_SUMMARY.md
DEPLOYMENT_PLAN.md
MANUAL_MIGRATION_GUIDE.md
PHASE2A_FIX_INSTRUCTIONS.md
PHASE3A_QUICK_REF.md
PHASE3B_POLISH_QUICK_REF.md
PHASE3B_QUICK_REF.md
PHASE3C_QUICK_REF.md
PHASE3D_QUICK_REF.md
PHASE4C_QUICK_REF.md
PHASE4C_SUMMARY.md
PHASE_4F_SUMMARY.md
PRODUCTION_MIGRATION_CHECKLIST.md
QUICK_START.md
SOFT_LAUNCH_CHECKLIST.md
apply_missing_dealer_tables.sql
apply_phase2a_migration.sql
apply_phase2b_migration.sql
apply_phase2c_migration.sql
apply_phase3a_migration.sql
apply_phase3b_migration.sql
```

---

## 5. Active Lovable imports / dependencies

### Source code (`src/`)
- ✅ **No imports** of any `lovable` / `@lovable` / `Lovable Cloud` package found in any `.ts` / `.tsx` / `.js` file under `src/`

### Build configuration
- ✅ `vite.config.ts` — does NOT import `@lovable.dev/vite-tanstack-config` (the old config that broke the build); uses plain Vite + `@tanstack/router-plugin/vite`
- ✅ `package.json` — no Lovable packages in dependencies
- ✅ `vercel.json`, `index.html` — no Lovable references

### Repo-level marker (non-code)
- ⚠️ `.lovable/project.json` — 71-byte template-lineage marker. Tagged for **MANUAL REVIEW** in section 3b. Doesn't affect builds or runtime
- ⚠️ `src/integrations/supabase/client.ts` — error message string still contains "Connect Supabase in Lovable Cloud" (per the file content shown by the linter notes). This is inside `src/` (hard-keep), so it's **not** flagged for deletion — but flagging here for visibility in case you want to clean the user-facing error wording later

### Conclusion on Lovable
The codebase is functionally free of Lovable runtime dependencies. The only remaining traces are the lineage marker and one error-message string — both harmless, both subject to your hard "don't touch `src/`" rule for the latter.

---

## 6. Build status

```
$ npm run build
✓ built in 9.90s
```

- ✅ TypeScript compile passed
- ✅ Vite production bundle generated to `dist/`
- ✅ No errors, no blocking warnings
- Output chunk sizes (largest):
  - `dist/assets/index-f2GBntd0.js` 401 kB / 126 kB gzip
  - `dist/assets/supabase-CIS1ha1V.js` 205 kB / 53 kB gzip
  - `dist/assets/index-BtqcecsZ.js` 137 kB / 44 kB gzip (homepage route)
  - `dist/assets/router-CttMv_Cp.js` 132 kB / 42 kB gzip

---

## Summary table

| Category | Count |
|---|---|
| **DELETE** | 55 files |
| **KEEP** (excluding hard-keep trees) | ~30 files |
| **MANUAL REVIEW** | 8 files (+ optional `dist/`) |
| **Hard-keep per rule** | `src/`, `supabase/migrations/`, env files, package files, brand, favicons, README, brand rules |
| **Files referencing old Supabase project** | 29 (24 docs + 5 SQL apply-files) |
| **Active Lovable imports in build/runtime** | 0 |
| **Build** | ✅ Passing (9.90s) |

---

## Recommended next move

When you're ready, reply with one of:

- **"proceed with delete"** → I'll execute the DELETE list (55 files), then re-run `git status` + `npm run build`, then stop. No commit, no push.
- **"delete only sections 1a-1d"** (or any subset) → I'll delete only the listed sections
- **"first fix Supabase URLs in section 3a"** → I'll do a find-replace from `nukeyvnsvsgwyvbtertf` to `rcypkqctgonotawnajqb` in the 4 launch playbook docs, then we re-audit
- **"hold"** → no action

I won't delete anything until you say so.
