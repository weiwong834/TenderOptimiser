import google.generativeai as genai
import requests
import os
import json
import statistics
import re
from dotenv import load_dotenv
from dataclasses import dataclass
from typing import List, Dict, Optional, Tuple

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
        """Load tender information from a text file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()

            # Parse the content - you can adjust this based on your file format
            tender_data = self._parse_tender_content(content)
            return tender_data

        except FileNotFoundError:
            print(f"❌ File not found: {file_path}")
            return {}
        except Exception as e:
            print(f"❌ Error reading file: {e}")
            return {}

    def _parse_tender_content(self, content: str) -> Dict[str, str]:
        """Parse tender content from text file"""
        tender_data = {
            "title": "",
            "description": "",
            "estimated_value": ""
        }

        lines = content.strip().split('\n')
        current_section = None
        current_content = []

        for line in lines:
            line = line.strip()

            # Check for section headers
            if line.lower().startswith('title:'):
                if current_section:
                    tender_data[current_section] = '\n'.join(current_content).strip()
                current_section = 'title'
                current_content = [line[6:].strip()]  # Remove 'title:' prefix

            elif line.lower().startswith('description:'):
                if current_section:
                    tender_data[current_section] = '\n'.join(current_content).strip()
                current_section = 'description'
                current_content = [line[12:].strip()]  # Remove 'description:' prefix

            elif line.lower().startswith('estimated value:') or line.lower().startswith('estimated_value:'):
                if current_section:
                    tender_data[current_section] = '\n'.join(current_content).strip()
                current_section = 'estimated_value'
                # Extract value after the colon
                if ':' in line:
                    current_content = [line.split(':', 1)[1].strip()]
                else:
                    current_content = []

            elif line and current_section:
                current_content.append(line)

        # Don't forget the last section
        if current_section:
            tender_data[current_section] = '\n'.join(current_content).strip()

        # If no structured format found, try to extract from plain text
        if not tender_data['title'] and not tender_data['description']:
            # Try to parse as simple format or use entire content as description
            if len(lines) > 0:
                tender_data['title'] = lines[0] if lines[0] else "Tender Analysis"
                tender_data['description'] = '\n'.join(lines[1:]) if len(lines) > 1 else content
                tender_data['estimated_value'] = "1000000 EUR"  # Default value

        return tender_data

    def extract_keywords_from_tender(self, tender_description: str, tender_title: str = "") -> List[str]:
        """Use Gemini to extract relevant keywords for TED API search"""
        prompt = f"""
        Extract 8-12 specific keywords for searching similar tenders in the TED database.

        Title: {tender_title}
        Description: {tender_description}

        Focus on:
        - Technical specifications (e.g., "React.js", "PostgreSQL", "REST API")
        - Service types (e.g., "mobile app development", "web application", "database migration")
        - Industry terms (e.g., "e-government", "digital transformation", "citizen services")
        - Technical standards (e.g., "WCAG 2.1", "ISO 27001", "GDPR compliance")

        Return ONLY a valid JSON array of keywords, nothing else:
        ["keyword1", "keyword2", "keyword3"]
        """

        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()

            print(f"🔍 Gemini raw response: {response_text[:200]}...")

            # Clean up the response text
            response_text = self._clean_json_response(response_text)

            # Try to parse as JSON
            keywords = json.loads(response_text)

            # Validate that we got a list
            if not isinstance(keywords, list):
                raise ValueError("Response is not a list")

            print(f"✅ Successfully extracted {len(keywords)} keywords")
            return keywords[:12]  # Limit to 12 keywords

        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing error: {e}")
            print(f"🔍 Response text: {response_text}")
            return self._extract_basic_keywords(tender_description + " " + tender_title)
        except Exception as e:
            print(f"❌ Error extracting keywords: {e}")
            return self._extract_basic_keywords(tender_description + " " + tender_title)

    def _clean_json_response(self, response_text: str) -> str:
        """Clean up Gemini response to extract valid JSON"""
        # Remove any markdown formatting
        response_text = re.sub(r'```json\s*', '', response_text)
        response_text = re.sub(r'```\s*$', '', response_text)

        # Remove any leading/trailing whitespace
        response_text = response_text.strip()

        # Look for JSON array pattern
        json_pattern = r'\[.*?\]'
        match = re.search(json_pattern, response_text, re.DOTALL)

        if match:
            return match.group(0)
        else:
            # If no array found, try to find individual quoted strings and create an array
            quoted_strings = re.findall(r'"([^"]*)"', response_text)
            if quoted_strings:
                return json.dumps(quoted_strings)
            else:
                raise ValueError("No valid JSON found in response")

    def _extract_basic_keywords(self, text: str) -> List[str]:
        """Enhanced fallback method for detailed keyword extraction"""
        print("🔄 Using fallback keyword extraction method")

        # Technical keywords commonly found in IT tenders
        technical_keywords = [
            "software development", "web application", "mobile app", "database", 
            "API integration", "system integration", "digital transformation",
            "cybersecurity", "cloud services", "maintenance", "support",
            "legacy system", "modernization", "user interface", "backend",
            "frontend", "DevOps", "agile", "testing", "deployment"
        ]

        # Industry-specific keywords
        industry_keywords = [
            "public administration", "e-government", "citizen services",
            "healthcare IT", "financial services", "education technology",
            "municipal services", "government portal", "digital services"
        ]

        # Compliance and standards
        compliance_keywords = [
            "GDPR compliance", "data protection", "accessibility", "security",
            "ISO standards", "quality assurance", "performance optimization"
        ]

        text_lower = text.lower()
        found_keywords = []

        # Check for technical keywords
        for keyword in technical_keywords:
            if keyword.lower() in text_lower:
                found_keywords.append(keyword)

        # Check for industry keywords
        for keyword in industry_keywords:
            if keyword.lower() in text_lower:
                found_keywords.append(keyword)

        # Check for compliance keywords
        for keyword in compliance_keywords:
            if keyword.lower() in text_lower:
                found_keywords.append(keyword)

        # If we found specific keywords, return them
        if found_keywords:
            print(f"✅ Found {len(found_keywords)} relevant keywords using fallback method")
            return found_keywords[:10]

        # Otherwise fall back to word extraction with better filtering
        common_words = [
            'and', 'or', 'the', 'of', 'to', 'in', 'for', 'with', 'by', 'from', 
            'on', 'at', 'is', 'are', 'was', 'were', 'this', 'that', 'will', 
            'shall', 'must', 'should', 'would', 'could', 'may', 'can', 'also',
            'including', 'such', 'other', 'any', 'all', 'each', 'both', 'either'
        ]

        words = text.lower().split()
        keywords = []

        # Extract meaningful phrases and words
        for i, word in enumerate(words):
            if len(word) > 4 and word not in common_words:
                # Try to create 2-word phrases for better context
                if i < len(words) - 1:
                    next_word = words[i + 1]
                    if len(next_word) > 3 and next_word not in common_words:
                        phrase = f"{word} {next_word}"
                        if phrase not in keywords:
                            keywords.append(phrase)

                # Also add single word if meaningful
                if word not in keywords:
                    keywords.append(word)

        result = list(set(keywords))[:10]  # Return unique keywords, max 10
        print(f"✅ Extracted {len(result)} keywords using basic word extraction")
        return result

    def search_similar_tenders(self, keywords: List[str], limit: int = 15) -> List[Dict]:
        """Search for similar tenders using TED API with generated keywords"""
        # Create more sophisticated search query from keywords
        query_parts = []

        # Group keywords by importance/specificity
        high_priority_keywords = []
        medium_priority_keywords = []

        for keyword in keywords:
            # Multi-word keywords are usually more specific
            if ' ' in keyword and any(tech in keyword.lower() for tech in ['development', 'integration', 'services', 'system', 'application']):
                high_priority_keywords.append(keyword)
            else:
                medium_priority_keywords.append(keyword)

        # Build query with priority weighting
        if high_priority_keywords:
            # High priority keywords with AND logic for better precision
            for keyword in high_priority_keywords[:5]:  # Limit to avoid overly complex queries
                query_parts.append(f'description-glo ~ "{keyword}"')

        if medium_priority_keywords:
            # Medium priority keywords with OR logic
            medium_query = " OR ".join([f'description-glo ~ "{keyword}"' for keyword in medium_priority_keywords[:6]])
            if medium_query:
                query_parts.append(f"({medium_query})")

        # Combine with AND logic between groups
        if len(query_parts) > 1:
            query = " AND ".join(query_parts)
        else:
            query = query_parts[0] if query_parts else 'description-glo ~ "software"'

        payload = {
            "query": query,
            "limit": limit,
            "page": 1,
            "onlyLatestVersions": True,
            "paginationMode": "PAGE_NUMBER",
            "fields": [
                "TI", "CY", "estimated-value-lot", "tender-value",
                "winner-country", "winner-name", "BT-711-LotResult",
                "award-criterion-name-lot"
            ]
        }

        try:
            response = requests.post(
                "https://api.ted.europa.eu/v3/notices/search",
                json=payload,
                headers=self.ted_headers,
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                tenders = data.get("notices", [])

                # If we get few results, try a simpler query
                if len(tenders) < 5 and len(query_parts) > 1:
                    print(f"⚠️  Found only {len(tenders)} tenders, trying broader search...")

                    # Try with just the most important keywords
                    simple_query = " OR ".join([f'description-glo ~ "{keyword}"' for keyword in keywords[:5]])
                    payload["query"] = simple_query

                    response = requests.post(
                        "https://api.ted.europa.eu/v3/notices/search",
                        json=payload,
                        headers=self.ted_headers,
                        timeout=30
                    )

                    if response.status_code == 200:
                        data = response.json()
                        tenders = data.get("notices", [])

                return tenders
            else:
                print(f"TED API error: {response.status_code} - {response.text}")
                return []
        except Exception as e:
            print(f"Error searching TED API: {e}")
            return []

    def _unwrap_field(self, field):
        """Helper method to unwrap TED API field values"""
        if isinstance(field, list):
            return ", ".join(str(x) for x in field)
        elif isinstance(field, dict):
            return field.get("eng") or next(iter(field.values()), "N/A")
        return field or "N/A"

    def _extract_numeric_value(self, value_str: str) -> Optional[float]:
        """Extract numeric value from string (e.g., '1200000 EUR' -> 1200000)"""
        if not value_str or value_str == "N/A":
            return None

        # Remove common currency symbols and text
        numeric_str = re.sub(r'[^\d.,]', '', str(value_str))
        numeric_str = numeric_str.replace(',', '')

        try:
            return float(numeric_str)
        except ValueError:
            return None

    def analyze_pricing(self, tenders: List[Dict], target_estimate: str) -> Dict:
        """Analyze pricing patterns from similar tenders"""
        analysis = {
            "total_tenders": len(tenders),
            "tenders_with_pricing": 0,
            "estimated_values": [],
            "awarded_values": [],
            "bid_ratios": [],  # awarded/estimated ratios
            "pricing_stats": {},
            "currency_distribution": {},
            "target_estimate": target_estimate
        }

        target_value = self._extract_numeric_value(target_estimate)

        for tender in tenders:
            estimated = self._extract_numeric_value(self._unwrap_field(tender.get("estimated-value-lot")))
            awarded = self._extract_numeric_value(self._unwrap_field(tender.get("BT-711-LotResult")))
            currency = self._unwrap_field(tender.get("BT-710-LotResult"))

            if estimated and awarded:
                analysis["estimated_values"].append(estimated)
                analysis["awarded_values"].append(awarded)
                analysis["bid_ratios"].append(awarded / estimated)
                analysis["tenders_with_pricing"] += 1

                # Track currency distribution
                if currency in analysis["currency_distribution"]:
                    analysis["currency_distribution"][currency] += 1
                else:
                    analysis["currency_distribution"][currency] = 1

        # Calculate statistics
        if analysis["estimated_values"]:
            analysis["pricing_stats"] = {
                "avg_estimated": statistics.mean(analysis["estimated_values"]),
                "avg_awarded": statistics.mean(analysis["awarded_values"]),
                "avg_bid_ratio": statistics.mean(analysis["bid_ratios"]),
                "median_bid_ratio": statistics.median(analysis["bid_ratios"]),
                "min_bid_ratio": min(analysis["bid_ratios"]),
                "max_bid_ratio": max(analysis["bid_ratios"]),
                "std_bid_ratio": statistics.stdev(analysis["bid_ratios"]) if len(analysis["bid_ratios"]) > 1 else 0
            }

        return analysis

    def generate_bidding_strategy(self, pricing_analysis: Dict, tender_context: str) -> Dict:
        """Use Gemini to generate bidding strategy based on pricing analysis"""

        stats = pricing_analysis.get("pricing_stats", {})
        if not stats:
            return {"error": "Insufficient pricing data for analysis"}

        prompt = f"""
        Based on this tender pricing analysis, provide a bidding strategy.

        TENDER CONTEXT:
        {tender_context}

        PRICING ANALYSIS:
        - Total similar tenders: {pricing_analysis['total_tenders']}
        - Tenders with pricing: {pricing_analysis['tenders_with_pricing']}
        - Average bid ratio: {stats.get('avg_bid_ratio', 0):.3f}
        - Median bid ratio: {stats.get('median_bid_ratio', 0):.3f}
        - Target estimate: {pricing_analysis['target_estimate']}

        Return ONLY a valid JSON object with this structure:
        {{
            "recommended_bid_percentage": 0.85,
            "risk_level": "Moderate",
            "competitive_factors": ["factor1", "factor2"],
            "pricing_justification": "explanation",
            "alternative_strategies": ["strategy1", "strategy2"],
            "confidence_level": "Medium"
        }}
        """

        try:
            response = self.model.generate_content(prompt)
            strategy_text = response.text.strip()

            print(f"🔍 Strategy raw response: {strategy_text[:200]}...")

            # Clean up the response
            strategy_text = self._clean_json_response_object(strategy_text)

            strategy = json.loads(strategy_text)
            return strategy

        except Exception as e:
            print(f"❌ Error generating strategy: {e}")
            return {"error": f"Error generating strategy: {e}"}

    def _clean_json_response_object(self, response_text: str) -> str:
        """Clean up Gemini response to extract valid JSON object"""
        # Remove any markdown formatting
        response_text = re.sub(r'```json\s*', '', response_text)
        response_text = re.sub(r'```\s*$', '', response_text)

        # Remove any leading/trailing whitespace
        response_text = response_text.strip()

        # Look for JSON object pattern
        json_pattern = r'\{.*?\}'
        match = re.search(json_pattern, response_text, re.DOTALL)

        if match:
            return match.group(0)
        else:
            raise ValueError("No valid JSON object found in response")

    def analyze_tender_from_file(self, file_path: str) -> TenderAnalysis:
        """Complete tender analysis workflow from file"""
        print(f"📁 Loading tender from file: {file_path}")
        tender_data = self.load_tender_from_file(file_path)

        if not tender_data:
            print("❌ Failed to load tender data from file")
            return TenderAnalysis([], [], {}, {"error": "Failed to load tender data"})

        print(f"📋 Loaded tender: {tender_data.get('title', 'Unknown')[:50]}...")

        return self.analyze_tender(
            tender_data.get('title', ''),
            tender_data.get('description', ''),
            tender_data.get('estimated_value', '1000000 EUR')
        )

    def analyze_tender(self, tender_title: str, tender_description: str, estimated_value: str) -> TenderAnalysis:
        """Complete tender analysis workflow"""
        print("🔍 Step 1: Extracting keywords...")
        keywords = self.extract_keywords_from_tender(tender_description, tender_title)
        print(f"📝 Generated keywords: {keywords}")

        print("🔍 Step 2: Searching similar tenders...")
        similar_tenders = self.search_similar_tenders(keywords)
        print(f"📊 Found {len(similar_tenders)} similar tenders")

        print("🔍 Step 3: Analyzing pricing...")
        pricing_analysis = self.analyze_pricing(similar_tenders, estimated_value)

        print("🔍 Step 4: Generating bidding strategy...")
        tender_context = f"Title: {tender_title}\nDescription: {tender_description}\nEstimated Value: {estimated_value}"
        bid_recommendation = self.generate_bidding_strategy(pricing_analysis, tender_context)

        return TenderAnalysis(
            keywords=keywords,
            similar_tenders=similar_tenders,
            pricing_analysis=pricing_analysis,
            bid_recommendation=bid_recommendation
        )

    def print_analysis_report(self, analysis: TenderAnalysis):
        """Print a comprehensive analysis report"""
        print("\n" + "="*80)
        print("TENDER ANALYSIS REPORT")
        print("="*80)

        print(f"\n📋 GENERATED KEYWORDS (Detailed & Specific):")
        for i, keyword in enumerate(analysis.keywords, 1):
            print(f"  {i}. {keyword}")

        print(f"\n📊 SIMILAR TENDERS FOUND: {len(analysis.similar_tenders)}")

        # Show some examples of found tenders
        if analysis.similar_tenders:
            print(f"\n🔍 SAMPLE MATCHING TENDERS:")
            for i, tender in enumerate(analysis.similar_tenders[:3], 1):
                title = self._unwrap_field(tender.get("TI", "No title"))
                country = self._unwrap_field(tender.get("CY", "Unknown"))
                print(f"  {i}. {title[:60]}... ({country})")

        if analysis.pricing_analysis.get("pricing_stats"):
            stats = analysis.pricing_analysis["pricing_stats"]
            print(f"\n💰 PRICING ANALYSIS:")
            print(f"  • Total tenders analyzed: {analysis.pricing_analysis['total_tenders']}")
            print(f"  • Tenders with pricing data: {analysis.pricing_analysis['tenders_with_pricing']}")
            print(f"  • Average bid-to-estimate ratio: {stats['avg_bid_ratio']:.1%}")
            print(f"  • Median bid-to-estimate ratio: {stats['median_bid_ratio']:.1%}")
            print(f"  • Ratio range: {stats['min_bid_ratio']:.1%} - {stats['max_bid_ratio']:.1%}")
            print(f"  • Standard deviation: {stats['std_bid_ratio']:.1%}")

            # Show currency distribution
            if analysis.pricing_analysis.get("currency_distribution"):
                print(f"  • Currency distribution: {analysis.pricing_analysis['currency_distribution']}")

        print(f"\n🎯 BIDDING RECOMMENDATION:")
        if "error" in analysis.bid_recommendation:
            print(f"  ❌ {analysis.bid_recommendation['error']}")
        else:
            rec = analysis.bid_recommendation
            print(f"  • Recommended bid: {rec.get('recommended_bid_percentage', 'N/A'):.1%} of estimated value")
            print(f"  • Risk level: {rec.get('risk_level', 'N/A')}")
            print(f"  • Confidence: {rec.get('confidence_level', 'N/A')}")
            print(f"  • Justification: {rec.get('pricing_justification', 'N/A')}")

            if rec.get('competitive_factors'):
                print(f"  • Key competitive factors:")
                for factor in rec['competitive_factors']:
                    print(f"    - {factor}")

            if rec.get('alternative_strategies'):
                print(f"  • Alternative strategies:")
                for strategy in rec['alternative_strategies']:
                    print(f"    - {strategy}")

        print("\n" + "="*80)


def main():
    """Example usage of the TenderAnalyzer"""
    analyzer = TenderAnalyzer()

    # Option 1: Load from file
    tender_file = "backend/fake_tender.txt"  # Replace with your file path

    if os.path.exists(tender_file):
        print(f"🚀 Starting Tender Analysis from file: {tender_file}")
        analysis = analyzer.analyze_tender_from_file(tender_file)
        analyzer.print_analysis_report(analysis)
    else:
        print(f"⚠️  File {tender_file} not found. Using default example...")

        # Option 2: Use hardcoded example (fallback)
        tender_title = "Software Development Services for Public Administration"
        tender_description = """
        The contracting authority requires comprehensive software development services 
        including web application development, database design, API integration, 
        mobile application development, and ongoing maintenance and support. 
        The project involves modernizing legacy systems and implementing new digital 
        solutions for citizen services.
        """
        estimated_value = "1200000 EUR"

        print("🚀 Starting Tender Analysis...")
        print(f"📋 Tender: {tender_title}")
        print(f"💰 Estimated Value: {estimated_value}")

        # Perform complete analysis
        analysis = analyzer.analyze_tender(tender_title, tender_description, estimated_value)
        analyzer.print_analysis_report(analysis)


if __name__ == "__main__":
    main()