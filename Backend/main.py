import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from wordcloud import WordCloud
import matplotlib.pyplot as plt

from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def index():
    return {
        "message": "WordCloud API is running", 
        "endpoints": {
            "/upload": "POST - Upload a text file to generate wordcloud",
            "parameters": {
                "file": "Text file to process",
                "language": "'english' or 'indonesian' (default: english)"
            }
        }
    }

nltk.download('stopwords')
nltk.download('punkt')
nltk.download('punkt_tab')

def remove_stopwords_english(text):
    stop_words = set(stopwords.words('english'))
    word_tokens = word_tokenize(text)
    filtered_text = [word for word in word_tokens if word.lower() not in stop_words]
    return ' '.join(filtered_text)

def remove_stopwords_indonesian(text):
    factory = StopWordRemoverFactory()
    stopword_remover = factory.create_stop_word_remover()
    return stopword_remover.remove(text)

def stem_indonesian(text):
    factory = StemmerFactory()
    stemmer = factory.create_stemmer()
    return stemmer.stem(text)

def remove_duplicates(text):
    words = text.split()
    unique_words = []
    for word in words:
        if word not in unique_words:
            unique_words.append(word)
    return ' '.join(unique_words)

def remove_punctuation(text):
    punctuation = '''!()-[]{};:'"\\,<>./?@#$%^&*_~'''
    for char in text:
        if char in punctuation:
            text = text.replace(char, "")
    return text

def remove_whitespace(text):
    return " ".join(text.split())

def remove_numbers(text):
    return ''.join([i for i in text if not i.isdigit()])

def remove_special_characters(text):
    return ''.join([i for i in text if i.isalnum() or i.isspace()])

@app.post("/upload")
async def upload_file(request: Request, file: UploadFile = File(...), language: str = Form(default="english")):
    if file.content_type != "text/plain":
        raise HTTPException(status_code=400, detail="Invalid file type. Only text files are allowed.")
    
    if language not in ["english", "indonesian"]:
        raise HTTPException(status_code=400, detail="Language must be either 'english' or 'indonesian'")

    text = await file.read()
    text = text.decode("utf-8")

    # Apply language-specific text processing
    if language == "english":
        cleaned_text = remove_stopwords_english(text)
    else:  # indonesian
        cleaned_text = remove_stopwords_indonesian(text)
        cleaned_text = stem_indonesian(cleaned_text)
    
    # Common cleaning steps for both languages
    # cleaned_text = remove_duplicates(cleaned_text)
    cleaned_text = remove_punctuation(cleaned_text)
    cleaned_text = remove_whitespace(cleaned_text)
    cleaned_text = remove_numbers(cleaned_text)
    cleaned_text = remove_special_characters(cleaned_text)

    # Calculate word frequencies
    words = cleaned_text.lower().split()
    word_frequencies = {}
    for word in words:
        if word:
            word_frequencies[word] = word_frequencies.get(word, 0) + 1
    
    # Sort words by frequency (descending)
    sorted_word_frequencies = dict(sorted(word_frequencies.items(), key=lambda x: x[1], reverse=True))

    wordcloud = WordCloud(width=800, height=400, background_color='white').generate(cleaned_text)
    plt.figure(figsize=(10, 5))
    plt.imshow(wordcloud, interpolation='bilinear')
    plt.axis('off')
    plt.savefig('static/wordcloud.png')
    plt.close()

    return {
        "language": language,
        "cleaned_text": cleaned_text,
        "word_frequencies": sorted_word_frequencies,
        "total_words": len(words),
        "unique_words": len(word_frequencies),
        "wordcloud_url": f"{request.base_url}static/wordcloud.png",
        "message": f"Wordcloud generated successfully for {language} text"
    }

@app.get("/wordcloud")
def get_wordcloud(request: Request):
    return {"wordcloud_url": f"{request.base_url}static/wordcloud.png"}

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=9000,
        timeout_keep_alive=600,
    )