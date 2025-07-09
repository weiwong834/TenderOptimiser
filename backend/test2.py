#!/usr/bin/env python3
"""
Tender Analyzer – Singapore GeBIZ version
----------------------------------------
• Extracts keywords for a tender using Gemini 1.5 Flash.
• Searches the Government‑Procurement‑via‑GeBIZ open dataset for similar awards.
• Analyses historical pricing and asks Gemini for a recommended bid *range*.
• Prints a concise console report.

Requires:
  pip install python-dotenv google-generativeai
"""

from __future__ import annotations

import os
import json
import re
import statistics
import requests
from dataclasses import dataclass
from typing import List, Dict, Optional

from dotenv import load_dotenv
import google.generativeai as genai

# ---------------------------------------------------------------------------
# 1  Config
# ---------------------------------------------------------------------------

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise EnvironmentError("GEMINI_API_KEY env var not set")

genai.configure(api_key=GEMINI_API_KEY)

GEBIZ_DATASET_ID = "d_acde1106003906a75c3fa052592f2fcb"
GEBIZ_ENDPOINT   = "https://data.gov.sg/api/action/datastore_search"

# ---------------------------------------------------------------------------
# 2  Dataclass to hold the full result
# ---------------------------------------------------------------------------


@dataclass
class TenderAnalysis:
    keywords: List[str]
    similar_tenders: List[Dict]
    pricing_analysis: Dict
    bid_recommendation: Dict


# ---------------------------------------------------------------------------
# 3  Main analyzer
# ---------------------------------------------------------------------------


class TenderAnalyzer:
    _GEMINI_MODEL = "gemini-1.5-flash"

    def __init__(self) -> None:
        self.model = genai.GenerativeModel(model_name=self._GEMINI_MODEL)

    # ................................................................. utils

    @staticmethod
    def _fmt_sgd(amount: float | None) -> str:
        return "–" if amount is None else f"SGD {amount:,.0f}"

    @staticmethod
    def _extract_numeric_value(v: str | float | int | None) -> Optional[float]:
        if v in (None, "", "N/A"):
            return None
        if isinstance(v, (int, float)):
            return float(v)
        cleaned = re.sub(r"[^\d.,]", "", str(v)).replace(",", "")
        try:
            return float(cleaned)
        except ValueError:
            return None

    # .......................................................... file loading

    def load_tender_from_file(self, fp: str) -> Dict[str, str]:
        try:
            with open(fp, "r", encoding="utf-8") as f:
                text = f.read()
        except Exception as e:
            print("❌ File error:", e)
            return {}
        return self._parse_tender_content(text)

    def _parse_tender_content(self, content: str) -> Dict[str, str]:
        tender = {"title": "", "description": "", "estimated_value": ""}
        lines  = content.strip().split("\n")
        current, bucket = None, []
        for ln in lines:
            l = ln.strip(); low = l.lower()
            if low.startswith("title:"):
                if current: tender[current] = "\n".join(bucket).strip()
                current, bucket = "title", [l[6:].strip()]
            elif low.startswith("description:"):
                if current: tender[current] = "\n".join(bucket).strip()
                current, bucket = "description", [l[12:].strip()]
            elif low.startswith("estimated value") or low.startswith("estimated_value"):
                if current: tender[current] = "\n".join(bucket).strip()
                current = "estimated_value"
                bucket  = [l.split(":", 1)[1].strip()] if ":" in l else []
            else:
                if current: bucket.append(l)
        if current: tender[current] = "\n".join(bucket).strip()
        # fallbacks
        if not tender["title"]:
            tender["title"] = lines[0] if lines else "Untitled tender"
            tender["description"] = "\n".join(lines[1:])
            tender["estimated_value"] = "1000000 SGD"
        return tender

    # ...................................................... keyword extract

    def extract_keywords(self, desc: str, title: str = "") -> List[str]:
        prompt = f"""
        Extract 10–12 specific search keywords for locating similar awards in the
        GeBIZ dataset. Focus on technologies, service categories and standards.

        Title: {title}
        Description: {desc}

        Return ONLY a valid JSON list.
        """
        try:
            r = self.model.generate_content(prompt)
            text = self._clean_json_response(r.text.strip())
            kws  = json.loads(text)
            return kws[:12] if isinstance(kws, list) else []
        except Exception as e:
            print("⚠️ Gemini keyword error:", e)
            return self._extract_basic_keywords(f"{title} {desc}")

    # ............................................................ GeBIZ API

    def search_similar_tenders(self, keywords: List[str], limit: int = 50) -> List[Dict]:
        results, seen = [], set()
        for kw in keywords:
            params = {"resource_id": GEBIZ_DATASET_ID, "q": kw, "limit": min(20, limit)}
            try:
                r = requests.get(GEBIZ_ENDPOINT, params=params, timeout=20)
                r.raise_for_status()
                for rec in r.json()["result"]["records"]:
                    tid = rec.get("tender_no") or rec.get("ref_no")
                    if tid and tid not in seen:
                        seen.add(tid); results.append(rec)
                        if len(results) >= limit: return results
            except Exception as e:
                print(f"⚠️ GeBIZ error for '{kw}':", e)
        return results

    # ....................................................... pricing stats

    def analyse_pricing(self, awards: List[Dict], est_value: str) -> Dict:
        out = {
            "total": len(awards),
            "with_price": 0,
            "awards": [],
            "ratios": [],
            "stats": {},
            "target_estimate": est_value,
        }
        est = self._extract_numeric_value(est_value)
        for a in awards:
            val = self._extract_numeric_value(a.get("awarded_amt"))
            if val and est:
                out["awards"].append(val)
                out["ratios"].append(val/est)
                out["with_price"] += 1
        if out["awards"]:
            out["stats"] = {
                "avg_awarded": statistics.mean(out["awards"]),
                "avg_ratio":   statistics.mean(out["ratios"]),
                "min_ratio":   min(out["ratios"]),
                "max_ratio":   max(out["ratios"]),
            }
        return out

    # ........................................................ bid strategy

    def generate_bid_range(self, pricing: Dict, tender_ctx: str) -> Dict:
        if not pricing.get("stats"):
            return {"error": "Too little pricing data"}
        p = pricing["stats"]
        prompt = f"""
        Using the tender context and historical pricing below, recommend a *bid
        percentage range* (minimum & maximum) relative to our own cost model.

        {tender_ctx}

        PRICING SUMMARY
            Awards analysed  : {pricing['total']}  (with price {pricing['with_price']})
            Average bid ratio: {p['avg_ratio']:.3f}
            Min ↔ Max ratio  : {p['min_ratio']:.3f} – {p['max_ratio']:.3f}

        Return ONLY valid JSON with keys:
            bid_range_min_pct, bid_range_max_pct,
            risk_level, confidence_level,
            reasoning (1 short paragraph).
        """
        try:
            r    = self.model.generate_content(prompt)
            data = json.loads(self._clean_json_object(r.text.strip()))
            return data
        except Exception as e:
            return {"error": str(e)}

    # .................................................... orchestration

    def analyse_tender(self, title: str, desc: str, est_val: str) -> TenderAnalysis:
        print("🔍 Extracting keywords")
        kws = self.extract_keywords(desc, title)
        print("🔍 Searching GeBIZ")
        similar = self.search_similar_tenders(kws)
        print("🔍 Analysing pricing")
        pricing = self.analyse_pricing(similar, est_val)
        ctx = f"Title: {title}\nDescription: {desc}\nOur estimate: {est_val}"
        print("🔍 Requesting bid range from Gemini")
        strategy = self.generate_bid_range(pricing, ctx)

        # convert range to SGD values if present
        est_num = self._extract_numeric_value(est_val)
        for key in ("bid_range_min_pct", "bid_range_max_pct"):
            try: strategy[key] = float(strategy.get(key, 0))
            except (TypeError, ValueError): strategy[key] = 0.0
        if est_num and all(strategy[k] for k in ("bid_range_min_pct", "bid_range_max_pct")):
            strategy["bid_range_min_amt"] = est_num * strategy["bid_range_min_pct"]
            strategy["bid_range_max_amt"] = est_num * strategy["bid_range_max_pct"]

        return TenderAnalysis(kws, similar, pricing, strategy)

    # ...................................................... pretty‑printer

    def print_report(self, a: TenderAnalysis) -> None:
        line = "="*90
        print("\n", line, "\nTENDER ANALYSIS REPORT\n", line, sep="")

        print("\n📋 KEYWORDS:", ", ".join(a.keywords))

        # show up to 5 similar awards
        print(f"\n📊 SIMILAR AWARDS ({len(a.similar_tenders)}) – showing first 5")
        for rec in a.similar_tenders[:5]:
            tno   = rec.get("tender_no") or rec.get("ref_no", "–")
            price = self._fmt_sgd(self._extract_numeric_value(rec.get("awarded_amt")))
            desc  = (rec.get("tender_description") or rec.get("description") or "").replace("\n", " ")
            print(f"  • {tno}  |  {price}  |  {desc[:75]}…")

        if stats := a.pricing_analysis.get("stats"):
            print("\n💰 HISTORICAL PRICING")
            print("  Avg award :", self._fmt_sgd(stats['avg_awarded']))
            print("  Avg ratio :", f"{stats['avg_ratio']:.2%}")
            print("  Min–Max   :", f"{stats['min_ratio']:.2%} – {stats['max_ratio']:.2%}")

        print("\n🎯 BID RANGE RECOMMENDATION")
        s = a.bid_recommendation
        if "error" in s:
            print("  ❌ ", s["error"])
        else:
            print(f"  {s['bid_range_min_pct']:.1%} – {s['bid_range_max_pct']:.1%} of est. value")
            if "bid_range_min_amt" in s:
                lo = self._fmt_sgd(s['bid_range_min_amt'])
                hi = self._fmt_sgd(s['bid_range_max_amt'])
                print(f"  → {lo} – {hi}")
            print("  Risk      :", s.get("risk_level"))
            print("  Confidence:", s.get("confidence_level"))
            print("  Reasoning :", s.get("reasoning"))

        print("\n", line, "\n", sep="")

    # ----------------------------------------------------------------- helpers

    @staticmethod
    def _clean_json_response(text: str) -> str:
        text = re.sub(r"```json\s*|```", "", text).strip()
        m = re.search(r"\[.*?\]", text, re.DOTALL)
        if m: return m.group(0)
        return json.dumps(re.findall(r'"(.*?)"', text))

    @staticmethod
    def _clean_json_object(text: str) -> str:
        text = re.sub(r"```json\s*|```", "", text).strip()
        m = re.search(r"\{.*?\}", text, re.DOTALL)
        if m: return m.group(0)
        raise ValueError("No JSON object found")

    @staticmethod
    def _extract_basic_keywords(text: str) -> List[str]:
        stop = set("and or the of to in for with by from on at is are this that will".split())
        words = [w.lower() for w in re.findall(r"[a-zA-Z]{4,}", text)]
        return list({w for w in words if w not in stop})[:10]


# ---------------------------------------------------------------------------
# 4  CLI runner
# ---------------------------------------------------------------------------


def main() -> None:
    ta = TenderAnalyzer()

    tender_file = "backend/fake_tender.txt"   # change to your file
    if os.path.exists(tender_file):
        t = ta.load_tender_from_file(tender_file)
    else:
        t = {
            "title": "Software Development Services for Public Administration",
            "description": (
                "Comprehensive web & mobile application development, database design, "
                "API integration and maintenance for modernising citizen‑service portals."
            ),
            "estimated_value": "1200000 SGD",
        }
        print("⚠️ Using hard‑coded sample tender")

    analysis = ta.analyse_tender(t["title"], t["description"], t["estimated_value"])
    ta.print_report(analysis)


if __name__ == "__main__":
    main()
