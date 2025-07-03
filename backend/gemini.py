import google.generativeai as genai

# Replace with your actual API key
genai.configure(api_key="AIzaSyDSHhKZ72dZ8A7PW3z2gRQeQSsEUSOAi3U")

# Use the v1-compatible model name
model = genai.GenerativeModel(model_name="models/gemini-pro")

response = model.generate_content("Hello Gemini, how are you?")
print(response.text)
