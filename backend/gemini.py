import google.generativeai as genai
import os
from dotenv import load_dotenv
import PyPDF2
import io

# Load environment variables from .env file
load_dotenv()


# Get API key from environment variable
api_key = os.getenv('GEMINI_API_KEY')

if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable not set")

# Configure the API
genai.configure(api_key=api_key)

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += page.extract_text() + "\n"
            return text
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return None

def upload_pdf_to_gemini(pdf_path):
    """Upload PDF file directly to Gemini (for supported file types)"""
    try:
        # Upload the file to Gemini
        uploaded_file = genai.upload_file(pdf_path)
        print(f"Uploaded file: {uploaded_file.name}")
        return uploaded_file
    except Exception as e:
        print(f"Error uploading PDF to Gemini: {e}")
        return None

def chat_with_pdf(pdf_path, question="Please summarize this document"):
    """Chat with PDF using Gemini AI"""

    # Try to upload PDF directly first (Gemini supports PDF uploads)
    uploaded_file = upload_pdf_to_gemini(pdf_path)

    if uploaded_file:
        # Use the uploaded file directly
        model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        try:
            response = model.generate_content([uploaded_file, question])
            return response.text
        except Exception as e:
            print(f"Error with uploaded file: {e}")
            # Fall back to text extraction
            pass

    # Fallback: Extract text and use it
    print("Falling back to text extraction...")
    pdf_text = extract_text_from_pdf(pdf_path)

    if not pdf_text:
        return "Could not extract text from PDF"

    # Truncate text if too long (Gemini has token limits)
    max_chars = 30000  # Adjust based on your needs
    if len(pdf_text) > max_chars:
        pdf_text = pdf_text[:max_chars] + "...\n[Text truncated due to length]"

    # Create prompt with PDF content
    prompt = f"""
    Here is the content of a PDF document:

    {pdf_text}

    Question: {question}
    """

    model = genai.GenerativeModel(model_name="gemini-1.5-flash")

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating response: {e}"

# Main execution
if __name__ == "__main__":
    # Get PDF path from user
    pdf_path = input("Enter the path to your PDF file: ").strip()

    if not os.path.exists(pdf_path):
        print("PDF file not found!")
        exit(1)

    # Get question from user
    question = input("What would you like to ask about the PDF? (Press Enter for summary): ").strip()
    if not question:
        question = "Please provide a detailed summary of this document"

    print("\nProcessing PDF...")
    response = chat_with_pdf(pdf_path, question)

    print("\n" + "="*50)
    print("AI Response:")
    print("="*50)
    print(response)