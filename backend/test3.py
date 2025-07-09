import google.generativeai as genai
import requests
import os
import json
import statistics
import re
from dotenv import load_dotenv
from dataclasses import dataclass
from typing import List, Dict, Optional

# For handling DOCX and PDF
from docx import Document
import PyPDF2

load_dotenv()

# Configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
TED_API_KEY = os.getenv("TED_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set")

genai.configure(api_key=GEMINI_API_KEY)

@dataclass
class TenderAnalysis:
    keywords: List[str]
    similar_tenders: List[Dict]
    pricing_analysis: Dict
    bid_recommendation: Dict

class TenderAnalyzer:
    def __init__(self):
        self.model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        self.ted_headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": "TenderOptimizer/1.0"
        }

    def load_tender_from_file(self, file_path: str) -> Dict[str, str]:
        """Load tender information from TXT, DOCX, or PDF file"""
        ext = os.path.splitext(file_path)[1].lower()
        text = ""
        try:
            if ext == '.docx':
                doc = Document(file_path)
                text = '\n'.join([para.text for para in doc.paragraphs])
            elif ext == '.pdf':
                with open(file_path, 'rb') as f:
                    reader = PyPDF2.PdfReader(f)
                    pages = [page.extract_text() or '' for page in reader.pages]
                    text = '\n'.join(pages)
            else:
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
        except Exception as e:
            print(f"❌ Error loading file '{file_path}': {e}")
            return {}

        return self._parse_tender_content(text)

    def _parse_tender_content(self, content: str) -> Dict[str, str]:
        tender_data = {"title":"", "description":"", "estimated_value":""}
        lines = content.strip().split("\n")
        current_section = None
        current_content = []
        for line in lines:
            stripped = line.strip()
            if stripped.lower().startswith('title:'):
                if current_section:
                    tender_data[current_section] = "\n".join(current_content).strip()
                current_section = 'title'
                current_content = [stripped.split(':',1)[1].strip()]
            elif stripped.lower().startswith('description:'):
                if current_section:
                    tender_data[current_section] = "\n".join(current_content).strip()
                current_section = 'description'
                current_content = [stripped.split(':',1)[1].strip()]
            elif stripped.lower().startswith('estimated value:') or stripped.lower().startswith('estimated_value:'):
                if current_section:
                    tender_data[current_section] = "\n".join(current_content).strip()
                current_section = 'estimated_value'
                current_content = [stripped.split(':',1)[1].strip()]
            elif stripped and current_section:
                current_content.append(stripped)
        if current_section:
            tender_data[current_section] = "\n".join(current_content).strip()
        # Fallback to entire text as description
        if not tender_data['title'] and not tender_data['description']:
            tender_data['description'] = content
            tender_data['estimated_value'] = '1000000 EUR'
        return tender_data

    def extract_keywords_from_tender(self, desc: str, title: str="") -> List[str]:
        prompt = f"""
Extract 8-12 specific keywords for searching similar tenders in the TED database.
Title: {title}
Description: {desc}
Return ONLY a JSON array of keywords.
"""
        raw = self.model.generate_content(prompt).text.strip()
        raw = re.sub(r'```json\s*', '', raw)
        raw = re.sub(r'```\s*$', '', raw).strip()
        try:
            arr = re.search(r'\[.*?\]', raw, re.DOTALL).group(0)
            kws = json.loads(arr)
        except:
            kws = re.findall(r'"([^"]+)"', raw)
        simp_prompt = f"Rewrite to broader common procurement phrases: {kws}\nReturn only JSON array."
        try:
            simp_raw = self.model.generate_content(simp_prompt).text.strip()
            simp_raw = re.sub(r'```json\s*', '', simp_raw)
            simp_raw = re.sub(r'```\s*$', '', simp_raw).strip()
            simp_arr = re.search(r'\[.*?\]', simp_raw, re.DOTALL).group(0)
            simp_kws = json.loads(simp_arr)
            if simp_kws:
                kws = simp_kws
        except:
            pass
        return kws[:12]

# Console-driven fallback
if __name__ == '__main__':
    import sys
    analyzer = TenderAnalyzer()
    path = sys.argv[1] if len(sys.argv) > 1 else input("Enter path to tender file: ")
    data = analyzer.load_tender_from_file(path)
    if not data:
        sys.exit(1)
    kws = analyzer.extract_keywords_from_tender(data.get('description',''), data.get('title',''))
    print("\nExtracted Keywords:")
    for i, kw in enumerate(kws, 1): print(f"{i}. {kw}")
