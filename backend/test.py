#!/usr/bin/env python3
"""
Tender Analyzer – Singapore GeBIZ version (Claude / AWS Bedrock)
----------------------------------------------------------------
• Extracts keywords for a tender using Claude 3 Sonnet on Bedrock.
• Searches the Government‑Procurement‑via‑GeBIZ open dataset for similar awards.
• Analyses historical pricing and asks Claude for a recommended bid range.
• Prints a concise console report.

Requirements:
  pip install python-dotenv boto3 requests
  (Add your AWS credentials as Replit secrets or env vars.)
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

# ---------------------------------------------------------------------------
# 1  Config & Bedrock client
# ---------------------------------------------------------------------------

load_dotenv()

import boto3

AWS_REGION   = os.getenv("AWS_REGION", "us-west-2")
BEDROCK_KEY  = os.getenv("BEDROCK_X_API_KEY")  # optional x-api-key gateway token
_BEDROCK_MODEL_ID = "anthropic.claude-3-5-haiku-20241022-v1:0"


# ❌ REMOVE this:
# from botocore.handlers import convert_dict_to_headers

def _bedrock_client():
    """Return a boto3 Bedrock Runtime client."""
    return boto3.client("bedrock-runtime", region_name=AWS_REGION)
_bedrock = _bedrock_client() 



def call_claude(prompt: str,
                max_tokens: int = 512,
                temperature: float = 0.2) -> str:
    """Send a prompt to Claude (Bedrock) and return the reply text."""
    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": max_tokens,
        "temperature": temperature,
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    response = _bedrock.invoke_model(
        modelId=_BEDROCK_MODEL_ID,
        contentType="application/json",
        accept="application/json",
        body=json.dumps(body).encode("utf-8"),
    )
    raw = response["body"].read()
    data = json.loads(raw)
    return data["content"][0]["text"]


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

    def __init__(self) -> None:
        pass  # nothing to initialise for Bedrock

    # ................................................................. utils

    @staticmethod
    def _fmt_sgd(amount: float | None) -> str:
        return "–" if amount is None else f"SGD {amount:,.0f}"

    @staticmethod
    def _extract_numeric_value(v: str | float | int | None) -> Optional[float]:
        original = v  # Keep original for debugging

        if v in (None, "", "N/A", "–", "0", 0):
            print(f"⚠️ Value '{original}' is considered empty or zero.")
            return None

        if isinstance(v, (int, float)):
            val = float(v) if float(v) > 0 else None
            if val is None:
                print(f"⚠️ Numeric value '{original}' ignored as <= 0.")
            return val

        # Normalize string: strip, replace non-breaking spaces, remove "SGD", etc.
        s = str(v).strip().replace("\xa0", " ").replace("SGD", "").strip()

        # Remove any remaining non-digit or decimal characters except commas/periods
        cleaned = re.sub(r"[^\d.,]", "", s)

        # Remove thousands separators (assume ',' used)
        cleaned = cleaned.replace(",", "")

        try:
            val = float(cleaned)
            if val <= 0:
                print(f"⚠️ Value '{original}' cleaned to '{cleaned}' but ignored as <= 0.")
                return None
            print(f"✅ Parsed '{original}' → {val}")
            return val
        except ValueError:
            print(f"❌ Failed to parse '{original}' cleaned to '{cleaned}'")
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
            r = call_claude(prompt, max_tokens=200, temperature=0)
            text = self._clean_json_response(r.strip())
            kws  = json.loads(text)
            return kws[:12] if isinstance(kws, list) else []
        except Exception as e:
            print("⚠️ Claude keyword error:", e)
            return self._extract_basic_keywords(f"{title} {desc}")

    # ............................................................ GeBIZ API

    def search_similar_tenders(self, keywords: List[str], limit: int = 20) -> List[Dict]:
        results, seen = [], set()
        for kw in keywords:
            params = {"resource_id": GEBIZ_DATASET_ID, "q": kw, "limit": min(20, limit)}
            try:
                r = requests.get(GEBIZ_ENDPOINT, params=params, timeout=20)
                r.raise_for_status()
                for rec in r.json()["result"]["records"]:
                    tid = rec.get("tender_no") or rec.get("ref_no")
                    if tid and tid not in seen:
                        seen.add(tid)
                        results.append(rec)
                        if len(results) >= limit:
                            return results
            except Exception as e:
                print(f"⚠️ GeBIZ error for '{kw}':", e)
        return results


    # ....................................................... pricing stats

    def analyse_pricing(self, awards: List[Dict], est_value: str) -> Dict:
        out = {
            "total": len(awards),
            "with_price": 0,
            "awards": [],
            "ratios": [],
            "stats": {},
            "target_estimate": est_value
        }

        est = self._extract_numeric_value(est_value)
        if not est:
            print("❌ Invalid estimated value provided.")
            return out

        for idx, a in enumerate(awards):
            raw_amt = a.get("awarded_amt")
            val = self._extract_numeric_value(raw_amt)
            if val is not None and val >= 1000:
                print(f"✅ Valid award #{idx+1}: {val}")
                out["awards"].append(val)
                out["ratios"].append(val / est)
                out["with_price"] += 1
            else:
                print(f"⚠️ Skipped award #{idx+1}: {raw_amt}")

        print(f"✅ Found {len(out['awards'])} usable pricing values out of {len(awards)} tenders.")

        if len(out["awards"]) >= 1:
            out["stats"] = {
                "avg_awarded": statistics.mean(out["awards"]),
                "avg_ratio": statistics.mean(out["ratios"]),
                "min_ratio": min(out["ratios"]),
                "max_ratio": max(out["ratios"]),
            }
            print("✅ Statistics calculated successfully:", out["stats"])
        else:
            print("❌ Not enough valid data points to compute statistics.")

        return out                                                                                                                                                        


    # ........................................................ bid strategy

    def generate_bid_range(self, pricing: Dict, tender_ctx: str) -> Dict:
        if not pricing.get("stats"):
            return {"error": "Too little pricing data"}
        p = pricing["stats"]
        est_val = pricing.get("target_estimate", "an unknown value")  # ✅ fix here

        prompt = f"""
        Using the tender context and historical pricing below, recommend an optimal
        numeric bid range (minimum and maximum) in SGD and percentages relative to
        our estimated tender value.

        {tender_ctx}

        PRICING SUMMARY:
        - Total analyzed awards: {pricing['total']}
        - Awards with valid pricing: {pricing['with_price']}
        - Average awarded amount: SGD {p['avg_awarded']:.2f}
        - Average bid‑to‑estimate ratio: {p['avg_ratio']:.2%}
        - Minimum ratio: {p['min_ratio']:.2%}, Maximum ratio: {p['max_ratio']:.2%}

        Provide ONLY a JSON response in this exact format:
        {{
          "bid_range_min_sgd": number,
          "bid_range_max_sgd": number,
          "bid_range_min_pct": decimal,
          "bid_range_max_pct": decimal,
          "risk_level": "Low" | "Medium" | "High",
          "confidence_level": "Low" | "Medium" | "High",
          "reasoning": "Brief reasoning"
        }}
        """
        try:
            reply = call_claude(prompt, max_tokens=400)
            data = json.loads(self._clean_json_object(reply.strip()))
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
        print("🔍 Requesting bid range from Claude")
        strategy = self.generate_bid_range(pricing, ctx)

        # convert range to SGD values if present
        est_num = self._extract_numeric_value(est_val)
        for key in ("bid_range_min_pct", "bid_range_max_pct"):
            try:
                strategy[key] = float(strategy.get(key, 0))
            except (TypeError, ValueError):
                strategy[key] = 0.0
        if est_num and all(strategy.get(k) for k in ("bid_range_min_pct", "bid_range_max_pct")):
            strategy["bid_range_min_amt"] = est_num * strategy["bid_range_min_pct"]
            strategy["bid_range_max_amt"] = est_num * strategy["bid_range_max_pct"]

        return TenderAnalysis(kws, similar, pricing, strategy)

    # ...................................................... pretty‑printer

    def print_report(self, a: TenderAnalysis) -> None:
        line = "="*90
        print("\n", line, "\nTENDER ANALYSIS REPORT\n", line, sep="")

        print("\n📋 KEYWORDS:", ", ".join(a.keywords))

        # show up to 15 similar awards
        print(f"\n📊 SIMILAR AWARDS ({len(a.similar_tenders)}) – showing first 15")
        for rec in a.similar_tenders[:15]:
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

    tender_file = "data/sample.txt"   # change to your file
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
