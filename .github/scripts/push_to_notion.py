#!/usr/bin/env python3
"""Push a daily-brief markdown file to a Notion database."""
from __future__ import annotations
import os, re, sys
from pathlib import Path
from typing import Any
import requests, yaml

NOTION_VERSION = "2022-06-28"
API = "https://api.notion.com/v1"


def parse_frontmatter(text):
    match = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.DOTALL)
    if not match:
        raise SystemExit("No YAML front-matter found")
    return yaml.safe_load(match.group(1)) or {}, match.group(2).lstrip()


def rich_text(content):
    pattern = re.compile(
        r"(\*\*(?P<bold>[^*]+)\*\*)"
        r"|(\[(?P<link_text>[^\]]+)\]\((?P<link_url>[^)]+)\))"
        r"|(`(?P<code>[^`]+)`)"
    )
    spans, pos = [], 0
    for m in pattern.finditer(content):
        if m.start() > pos:
            spans.append(_span(content[pos:m.start()]))
        if m.group("bold"):
            spans.append(_span(m.group("bold"), bold=True))
        elif m.group("link_text"):
            spans.append(_span(m.group("link_text"), link=m.group("link_url")))
        elif m.group("code"):
            spans.append(_span(m.group("code"), code=True))
        pos = m.end()
    if pos < len(content):
        spans.append(_span(content[pos:]))
    return [s for s in spans if s["text"]["content"]]


def _span(text, *, bold=False, code=False, link=None):
    s = {"type": "text", "text": {"content": text},
         "annotations": {"bold": bold, "code": code}}
    if link:
        s["text"]["link"] = {"url": link}
    return s


def markdown_to_blocks(body):
    blocks, lines, i = [], body.splitlines(), 0
    while i < len(lines):
        line = lines[i].rstrip()
        if not line.strip():
            i += 1; continue
        if line.startswith("### "):
            blocks.append(_h(line[4:], 3))
        elif line.startswith("## "):
            blocks.append(_h(line[3:], 2))
        elif line.startswith("# "):
            blocks.append(_h(line[2:], 1))
        elif line.startswith(("- ", "* ")):
            blocks.append({"object": "block", "type": "bulleted_list_item",
                           "bulleted_list_item": {"rich_text": rich_text(line[2:])}})
        elif line.startswith("|") and i + 1 < len(lines) and re.match(r"^\|[\s\-|:]+\|$", lines[i + 1]):
            tbl = [line]; i += 2
            while i < len(lines) and lines[i].startswith("|"):
                tbl.append(lines[i]); i += 1
            blocks.append({"object": "block", "type": "code",
                           "code": {"language": "markdown",
                                    "rich_text": [{"type": "text", "text": {"content": "\n".join(tbl)}}]}})
            continue
        else:
            blocks.append({"object": "block", "type": "paragraph",
                           "paragraph": {"rich_text": rich_text(line)}})
        i += 1
    return blocks


def _h(text, level):
    k = f"heading_{level}"
    return {"object": "block", "type": k, k: {"rich_text": rich_text(text)}}


def build_properties(meta):
    p = {"Name": {"title": [{"text": {"content": str(meta.get("title", "Untitled"))}}]}}
    if "date" in meta: p["Date"] = {"date": {"start": str(meta["date"])}}
    if "domain" in meta: p["Domain"] = {"select": {"name": str(meta["domain"])}}
    if "confidence" in meta: p["Confidence"] = {"number": float(meta["confidence"]) / 100.0}
    if "replicable" in meta: p["Replicable?"] = {"checkbox": bool(meta["replicable"])}
    if "tags" in meta and isinstance(meta["tags"], list):
        p["Tags"] = {"multi_select": [{"name": str(t)} for t in meta["tags"]]}
    if "source" in meta: p["Source"] = {"url": str(meta["source"])}
    return p


def main():
    token = os.environ["NOTION_TOKEN"]
    db_id = os.environ["NOTION_DATABASE_ID"]
    text = Path(os.environ["BRIEF_FILE"]).read_text(encoding="utf-8")
    meta, body = parse_frontmatter(text)
    blocks = markdown_to_blocks(body)
    h = {"Authorization": f"Bearer {token}",
         "Notion-Version": NOTION_VERSION,
         "Content-Type": "application/json"}
    payload = {"parent": {"database_id": db_id},
               "properties": build_properties(meta),
               "children": blocks[:100]}
    r = requests.post(f"{API}/pages", headers=h, json=payload, timeout=30)
    if r.status_code >= 300:
        print(f"Notion API error {r.status_code}: {r.text}", file=sys.stderr); return 1
    pid = r.json().get("id", "")
    print(f"Created Notion page: {pid}")
    for start in range(100, len(blocks), 100):
        rr = requests.patch(f"{API}/blocks/{pid}/children", headers=h,
                            json={"children": blocks[start:start + 100]}, timeout=30)
        if rr.status_code >= 300:
            print(f"Append failed: {rr.text}", file=sys.stderr); return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
