#!/usr/bin/env python3
"""UX-0 string audit (docs/plans/ux-0.md).

Builds one Markdown audit table per namespace from the English locale files,
the components that use each key, and hand-written annotations.

Mechanical columns (recomputed on every run):
  component  files whose source contains the quoted key, or a template-literal
             prefix that can produce it (marked "dynamic")
  jargon     UX-TEST-2 terms found in the text; bare Enable/Disable is flagged
  FK         Flesch-Kincaid grade for help-like strings of 5+ words (UX-TEST-1);
             "label" for short primary labels, which are exempt
  control    heuristic: the control a <Label> or ariaLabel/label attribute names
  applies    "on Save" / "now" from the verified component map below

Judgement columns come from annotations/<namespace>.json:
  {"<full.key>": {"accurate": "yes|no|unverified", "proposed": "<rewrite or ''>",
                  "notes": "...", "control": "...", "applies": "..."}}
"control" and "applies" in an annotation override the heuristic.

Usage:
  python3 docs/plans/ux-0/audit.py           # write audit/<namespace>.md and summary.md
  python3 docs/plans/ux-0/audit.py --check   # fail if a key in scope lacks an annotation
  python3 docs/plans/ux-0/audit.py --dump NS # print rows for NS as JSON (for annotating)
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
CORE_LOCALE = REPO / "frontend/src/lib/i18n/locales/en.json"
EXT_LOCALES = {
    "calendar": REPO / "extensions/calendar/frontend/i18n/locales/en.json",
    "contacts": REPO / "extensions/contacts/frontend/i18n/locales/en.json",
}
SOURCE_ROOTS = [REPO / "frontend/src", REPO / "extensions"]
SOURCE_SUFFIXES = {".svelte", ".ts", ".js"}

# Core namespaces in scope (PLAN.md UX-0). A value is a key filter; None keeps every key.
CORE_SCOPE: dict[str, re.Pattern | None] = {
    "account": None, "identity": None, "security": None, "toast": None,
    "viewer": None, "images": None, "certificate": None, "mailApi": None,
    "sentPolicy": None, "oauth": None, "contactSource": None,
    "spellcheck": None, "setupDiagnostic": None, "googleGuide": None,
    "sidebar": re.compile(r"sync", re.I),      # sync status only
    "messageList": re.compile(r"sync", re.I),  # sync and resync actions only
}
CORE_PREFIX_SCOPE = "settings"  # settings, settingsGeneral, settingsChat, ...

# Extension strings that Settings shows: keys used in the import closure of the
# extension settings dialogs and the account-setup hook panels.
EXT_ROOTS = [
    "extensions/contacts/frontend/components/ContactsSettingsDialog.svelte",
    "extensions/calendar/frontend/components/CalendarSettingsDialog.svelte",
    "extensions/contacts/frontend/hooks/AccountContactsHookPanel.svelte",
    "extensions/calendar/frontend/hooks/AccountCalendarHookPanelGoogle.svelte",
    "extensions/calendar/frontend/hooks/AccountCalendarHookPanelMicrosoft.svelte",
]

# When a control's change takes effect, verified by reading each component
# (see docs/plans/ux-0.md, Control audit). Paths are relative to the repo.
S = "frontend/src/lib/components/settings/"
APPLIES = {
    S + "GeneralTab.svelte": "now",
    S + "GeneralBackgroundSections.svelte": "now",
    S + "ChatTab.svelte": "now",
    S + "ComposerTab.svelte": "now",
    S + "ImagesTab.svelte": "now",
    S + "AccountAddressDefaults.svelte": "now",
    S + "account/SMIMERevocationSetting.svelte": "now",
}

JARGON = re.compile(
    r"\b(IMAP|JMAP|POP3?|SMTP|OAuth|S/MIME|PGP|CardDAV|CalDAV|TLS|SSL|STARTTLS|KDF|CRL|OCSP|"
    r"MDN|MIME|RFC|IDLE|[Rr]e-?[Ss]ync|[Ss]ync)\b"
)
BARE_TOGGLE = re.compile(r"^\s*(Enable|Disable)d?\b")
HELP_KEY = re.compile(r"(Help|Desc|Description|Details|Hint|Explanation|Body|Message|Warning|Tooltip|Text|Info|Note)", re.I)
CONTROL_TAG = re.compile(r"<(Switch|Checkbox|Select\.Root|RadioGroup\.Root|RadioGroup|Input|Textarea|Button|NamedSelect)\b")
COLUMNS = ["key", "current text", "component", "jargon", "FK", "control", "applies",
           "accurate?", "proposed text", "notes"]


def flatten(d: dict, prefix: str = "") -> dict[str, str]:
    out: dict[str, str] = {}
    for k, v in d.items():
        key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            out.update(flatten(v, key))
        else:
            out[key] = str(v)
    return out


def in_scope_core(flat: dict[str, str]) -> dict[str, str]:
    keep = {}
    for key, text in flat.items():
        ns, _, rest = key.partition(".")
        if ns.startswith(CORE_PREFIX_SCOPE):
            keep[key] = text
            continue
        if ns not in CORE_SCOPE:
            continue
        pattern = CORE_SCOPE[ns]
        if pattern is None or pattern.search(rest):
            keep[key] = text
    return keep


def source_files() -> list[Path]:
    files = []
    for root in SOURCE_ROOTS:
        for p in root.rglob("*"):
            if p.suffix in SOURCE_SUFFIXES and "node_modules" not in p.parts and "wailsjs" not in p.parts:
                if p.name.endswith((".test.ts", ".spec.ts")):
                    continue
                files.append(p)
    return sorted(files)


IMPORT_RE = re.compile(r"""import\s+[^'"]*?from\s+['"]([^'"]+\.svelte)['"]""")


def import_closure(roots: list[str]) -> set[Path]:
    seen: set[Path] = set()
    stack = [REPO / r for r in roots]
    while stack:
        p = stack.pop()
        if p in seen or not p.exists():
            continue
        seen.add(p)
        for spec in IMPORT_RE.findall(p.read_text(encoding="utf-8")):
            if spec.startswith("$extensions/"):
                stack.append(REPO / "extensions" / spec[len("$extensions/"):])
            elif spec.startswith("$lib/"):
                continue  # host UI primitives carry no extension strings
            elif spec.startswith("."):
                stack.append((p.parent / spec).resolve())
    return seen


def syllables(word: str) -> int:
    w = re.sub(r"[^a-z]", "", word.lower())
    if not w:
        return 0
    if len(w) <= 3:
        return 1
    w = re.sub(r"(?:[^laeiouy]es|ed|[^laeiouy]e)$", "", w)
    w = re.sub(r"^y", "", w)
    return max(1, len(re.findall(r"[aeiouy]{1,2}", w)))


def fk_grade(text: str) -> float | None:
    clean = re.sub(r"<[^>]+>|\{[^}]*\}", " ", text)
    words = re.findall(r"[A-Za-z][A-Za-z'’-]*", clean)
    if len(words) < 5:
        return None
    sentences = max(1, len(re.findall(r"[.!?]+(?:\s|$)", clean.strip() + " ")))
    syl = sum(syllables(w) for w in words)
    return round(0.39 * len(words) / sentences + 11.8 * syl / len(words) - 15.59, 1)


def is_help(key: str, text: str) -> bool:
    leaf = key.rsplit(".", 1)[-1]
    return bool(HELP_KEY.search(leaf)) or len(text.split()) >= 12


class Usage:
    def __init__(self, files: list[Path]):
        self.files = {p: p.read_text(encoding="utf-8").splitlines() for p in files}
        self.prefixes: list[tuple[str, Path]] = []
        self.index: dict[str, list[tuple[Path, int]]] = {}
        for p, lines in self.files.items():
            for i, line in enumerate(lines):
                for m in re.finditer(r"(['\"`])([a-zA-Z]+\.[A-Za-z0-9_.]+)\1", line):
                    self.index.setdefault(m.group(2), []).append((p, i))
                for m in re.finditer(r"`([a-zA-Z]+\.[A-Za-z0-9_.]*)\$\{", line):
                    self.prefixes.append((m.group(1), p))

    def find(self, key: str) -> tuple[list[tuple[Path, int]], list[Path]]:
        hits = self.index.get(key, [])
        dynamic = sorted({p for pre, p in self.prefixes if key.startswith(pre)})
        return hits, dynamic

    def control(self, hits: list[tuple[Path, int]]) -> str:
        for p, i in hits:
            lines = self.files[p]
            line = lines[i]
            m = CONTROL_TAG.search(line)
            if m and ("ariaLabel" in line or "label=" in line or "placeholder" in line):
                return m.group(1)
            if "<Label" in line or (i > 0 and "<Label" in lines[i - 1]):
                for j in range(i, min(i + 15, len(lines))):
                    m = CONTROL_TAG.search(lines[j])
                    if m:
                        return m.group(1)
            back = "\n".join(lines[max(0, i - 3):i + 1])
            if re.search(r"<(Button|AlertDialog\.Action|AlertDialog\.Cancel)\b[^>]*$|<Button\b[^>]*>\s*$", back, re.M):
                return "Button"
            if re.search(r"toasts?\.(error|success|info|warning|show|add)", line):
                return "toast"
        return ""


def rel(p: Path) -> str:
    return str(p.relative_to(REPO))


def short(p: Path) -> str:
    return p.name.replace(".svelte", "")


def cell(s: str) -> str:
    return s.replace("\\", "\\\\").replace("|", "\\|").replace("\n", "<br>").strip()


def load_annotations() -> dict[str, dict]:
    ann: dict[str, dict] = {}
    adir = HERE / "annotations"
    if adir.exists():
        for f in sorted(adir.glob("*.json")):
            ann.update(json.loads(f.read_text(encoding="utf-8")))
    return ann


def build_rows() -> dict[str, list[dict]]:
    core = in_scope_core(flatten(json.loads(CORE_LOCALE.read_text(encoding="utf-8"))))
    files = source_files()
    usage = Usage(files)
    closure = import_closure(EXT_ROOTS)
    keys: dict[str, str] = dict(core)
    for path in EXT_LOCALES.values():
        for key, text in flatten(json.loads(path.read_text(encoding="utf-8"))).items():
            hits, _ = usage.find(key)
            if any(p in closure for p, _ in hits):
                keys[key] = text
    ann = load_annotations()
    rows: dict[str, list[dict]] = {}
    for key, text in keys.items():
        hits, dynamic = usage.find(key)
        if key.split(".")[0] in EXT_LOCALES:
            hits = [h for h in hits if h[0] in closure]
        comps = sorted({short(p) for p, _ in hits})
        comp = ", ".join(comps) or (("dynamic: " + ", ".join(sorted({short(p) for p in dynamic}))) if dynamic else "unused?")
        jargon = sorted(set(JARGON.findall(text)))
        if BARE_TOGGLE.search(text):
            jargon.append("bare Enable/Disable")
        grade = fk_grade(text) if is_help(key, text) else None
        fk = "label" if not is_help(key, text) else ("—" if grade is None else f"{grade:g}")
        applies = ""
        for p, _ in hits:
            applies = APPLIES.get(rel(p), applies) or applies
        control = usage.control(hits)
        if not control or control == "toast" or control == "Button":
            applies = "" if control != "Button" else applies
        a = ann.get(key, {})
        row = {
            "key": key, "current text": text, "component": comp,
            "jargon": ", ".join(jargon), "FK": fk,
            "control": a.get("control", control), "applies": a.get("applies", applies),
            "accurate?": a.get("accurate", ""),
            "proposed text": a.get("proposed", "") if a.get("proposed") else ("keep" if a else ""),
            "notes": a.get("notes", ""), "_annotated": bool(a), "_grade": grade,
            "_help": is_help(key, text),
        }
        rows.setdefault(key.split(".")[0], []).append(row)
    return rows


def write(rows: dict[str, list[dict]]) -> None:
    out = HERE / "audit"
    out.mkdir(exist_ok=True)
    for old in out.glob("*.md"):
        old.unlink()
    summary = ["# UX-0 audit summary", "",
               "Generated by `python3 docs/plans/ux-0/audit.py`; do not edit by hand. "
               "Plan, findings and recommendations: [UX-0 plan](../../ux-0.md).", "",
               "| namespace | keys | annotated | rewrites proposed | inaccurate | jargon hits in labels | help strings over grade 8 |",
               "|---|---|---|---|---|---|---|"]
    for ns in sorted(rows):
        rs = rows[ns]
        lines = [f"# UX-0 audit: `{ns}`", "",
                 "Generated by `python3 docs/plans/ux-0/audit.py`; edit `annotations/` and rerun. "
                 "Columns: [UX-0 plan](../../ux-0.md#audit-columns).", "",
                 "| " + " | ".join(COLUMNS) + " |", "|" + "---|" * len(COLUMNS)]
        for r in rs:
            lines.append("| " + " | ".join(cell(("`%s`" % r[c]) if c == "key" else r[c]) for c in COLUMNS) + " |")
        (out / f"{ns}.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
        ann = sum(r["_annotated"] for r in rs)
        rew = sum(1 for r in rs if r["proposed text"] not in ("", "keep"))
        bad = sum(1 for r in rs if r["accurate?"].startswith("no"))
        jl = sum(1 for r in rs if r["jargon"] and not r["_help"])
        hi = sum(1 for r in rs if r["_grade"] is not None and r["_grade"] > 8)
        summary.append(f"| [`{ns}`]({ns}.md) | {len(rs)} | {ann} | {rew} | {bad} | {jl} | {hi} |")
    tot = [r for rs in rows.values() for r in rs]
    summary.append(f"| **total** | {len(tot)} | {sum(r['_annotated'] for r in tot)} | "
                   f"{sum(1 for r in tot if r['proposed text'] not in ('', 'keep'))} | "
                   f"{sum(1 for r in tot if r['accurate?'].startswith('no'))} | "
                   f"{sum(1 for r in tot if r['jargon'] and not r['_help'])} | "
                   f"{sum(1 for r in tot if r['_grade'] is not None and r['_grade'] > 8)} |")
    (out / "summary.md").write_text("\n".join(summary) + "\n", encoding="utf-8")


def main(argv: list[str]) -> int:
    rows = build_rows()
    if argv[:1] == ["--dump"]:
        ns = argv[1]
        print(json.dumps([{k: v for k, v in r.items() if not k.startswith("_")} for r in rows.get(ns, [])],
                         indent=1, ensure_ascii=False))
        return 0
    if argv[:1] == ["--check"]:
        missing = [r["key"] for rs in rows.values() for r in rs if not r["_annotated"]]
        known = {r["key"] for rs in rows.values() for r in rs}
        stale = sorted(set(load_annotations()) - known)
        for k in missing:
            print("missing annotation:", k)
        for k in stale:
            print("annotation for key out of scope or removed:", k)
        print(f"{len(known)} keys in scope; {len(missing)} missing; {len(stale)} stale")
        return 1 if missing or stale else 0
    write(rows)
    print(f"wrote {sum(len(v) for v in rows.values())} rows in {len(rows)} namespaces to {HERE / 'audit'}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
