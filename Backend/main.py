import os
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from wordcloud import WordCloud
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import io
import base64
from PIL import Image
import jieba
import zhon.hanzi

from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

# Set NLTK data path to the directory where data was downloaded during build
nltk.data.path.append('/app/nltk_data')

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create static directory with proper permissions
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def index():
    return {
        "message": "WordCloud API is running", 
        "endpoints": {
            "/upload": "POST - Upload a text file to generate wordcloud",
            "/upload-with-image": "POST - Upload text and get image directly",
            "parameters": {
                "file": "Text file to process",
                "language": "'english', 'indonesian', 'chinese_simplified', or 'chinese_traditional' (default: english)"
            }
        },
        "nltk_data_path": nltk.data.path
    }

# Remove runtime NLTK downloads - data is already downloaded during Docker build

def remove_stopwords_english(text):
    try:
        stop_words = set(stopwords.words('english'))
        word_tokens = word_tokenize(text)
        filtered_text = [word for word in word_tokens if word.lower() not in stop_words]
        return ' '.join(filtered_text)
    except Exception as e:
        # Fallback if NLTK data is not available
        print(f"NLTK error: {e}. Using basic processing.")
        return text

def remove_stopwords_indonesian(text):
    try:
        factory = StopWordRemoverFactory()
        stopword_remover = factory.create_stop_word_remover()
        return stopword_remover.remove(text)
    except Exception as e:
        print(f"Sastrawi error: {e}. Using basic processing.")
        return text

def stem_indonesian(text):
    try:
        factory = StemmerFactory()
        stemmer = factory.create_stemmer()
        return stemmer.stem(text)
    except Exception as e:
        print(f"Stemmer error: {e}. Skipping stemming.")
        return text

# Chinese stopwords list (common Chinese stopwords)
CHINESE_STOPWORDS = {
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', 
    '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', 
    '这', '那', '她', '他', '它', '我们', '你们', '他们', '她们', '它们', '这个', '那个',
    '些', '么', '什么', '怎么', '怎样', '如何', '为什么', '哪', '哪里', '哪儿', '谁',
    '因为', '所以', '但是', '然而', '可是', '如果', '虽然', '即使', '无论', '不管',
    '而且', '并且', '或者', '还是', '不是', '不要', '不会', '不能', '没有', '这样',
    '那样', '这里', '那里', '现在', '以前', '以后', '最', '很', '太', '非常', '十分',
    '就是', '只是', '仅仅', '已经', '曾经', '正在', '将要', '可以', '能够', '应该'
}

# Chinese Traditional stopwords list (common Chinese Traditional stopwords)
CHINESE_TRADITIONAL_STOPWORDS = {
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一個', '上',
    '也', '很', '到', '說', '要', '去', '你', '會', '著', '沒有', '看', '好', '自己',
    '這', '那', '她', '他', '它', '我們', '你們', '他們', '她們', '它們', '這個', '那個',
    '些', '麼', '什麼', '怎麼', '怎樣', '如何', '為什麼', '哪', '哪裡', '哪兒', '誰',
    '因為', '所以', '但是', '然而', '可是', '如果', '雖然', '即使', '無論', '不管',
    '而且', '並且', '或者', '還是', '不是', '不要', '不會', '不能', '沒有', '這樣',
    '那樣', '這裡', '那裡', '現在', '以前', '以後', '最', '很', '太', '非常', '十分',
    '就是', '只是', '僅僅', '已經', '曾經', '正在', '將要', '可以', '能夠', '應該',
    '於', '對', '對於', '從', '為', '與', '給', '讓', '被', '把', '將', '過', '當',
    '進行', '這些', '那些', '時', '時候', '裡', '後', '前', '兩', '幾', '第', '每',
    '種', '樣', '會', '還', '再', '只', '真', '問', '請', '用', '比', '等', '及'
}

def segment_chinese(text):
    """Segment Chinese text into words using jieba"""
    try:
        return ' '.join(jieba.cut(text))
    except Exception as e:
        print(f"Jieba error: {e}. Using character-based segmentation.")
        return ' '.join(text)

def remove_stopwords_chinese(text):
    """Remove Chinese stopwords from segmented text"""
    try:
        words = text.split()
        filtered_words = [word for word in words if word not in CHINESE_STOPWORDS and len(word.strip()) > 0]
        return ' '.join(filtered_words)
    except Exception as e:
        print(f"Chinese stopword removal error: {e}. Using original text.")
        return text

def remove_stopwords_chinese_traditional(text):
    """Remove Chinese Traditional stopwords from segmented text"""
    try:
        words = text.split()
        filtered_words = [word for word in words if word not in CHINESE_TRADITIONAL_STOPWORDS and len(word.strip()) > 0]
        return ' '.join(filtered_words)
    except Exception as e:
        print(f"Chinese Traditional stopword removal error: {e}. Using original text.")
        return text

def remove_chinese_punctuation(text):
    """Remove Chinese punctuation marks"""
    try:
        # Chinese punctuation from zhon.hanzi
        chinese_punctuation = zhon.hanzi.punctuation
        for char in chinese_punctuation:
            text = text.replace(char, " ")
        return text
    except Exception as e:
        print(f"Chinese punctuation removal error: {e}. Using basic processing.")
        return text

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

def remove_special_characters(text, language="english"):
    if language in ["chinese_simplified", "chinese_traditional"]:
        # For Chinese (both Simplified and Traditional), keep Chinese characters, alphanumeric, and spaces
        return ''.join([i for i in text if i.isalnum() or i.isspace() or '\u4e00' <= i <= '\u9fff'])
    else:
        return ''.join([i for i in text if i.isalnum() or i.isspace()])

def generate_wordcloud_image(text, language="english"):
    """Generate wordcloud and return as base64 string and save to file"""
    try:
        # Set font path for Chinese if needed
        font_path = None
        if language in ["chinese_simplified", "chinese_traditional"]:
            # Try to find Chinese font (works for both Simplified and Traditional)
            chinese_fonts = [
                "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc",
                "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
                "/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf"
            ]
            for font in chinese_fonts:
                if os.path.exists(font):
                    font_path = font
                    break
        
        # Generate wordcloud
        wordcloud_params = {
            'width': 800,
            'height': 400,
            'background_color': 'white',
            'max_words': 100,
            'relative_scaling': 0.5,
            'colormap': 'viridis'
        }
        
        if font_path:
            wordcloud_params['font_path'] = font_path
            
        wordcloud = WordCloud(**wordcloud_params).generate(text)
        
        # Method 1: Save to static directory (with error handling)
        try:
            plt.figure(figsize=(10, 5))
            plt.imshow(wordcloud, interpolation='bilinear')
            plt.axis('off')
            plt.tight_layout(pad=0)
            
            # Try to save to static directory
            static_path = 'static/wordcloud.png'
            plt.savefig(static_path, bbox_inches='tight', dpi=150, facecolor='white')
            plt.close()
            static_saved = True
        except Exception as e:
            print(f"Could not save to static directory: {e}")
            plt.close()
            static_saved = False
        
        # Method 2: Create base64 image (always works)
        plt.figure(figsize=(10, 5))
        plt.imshow(wordcloud, interpolation='bilinear')
        plt.axis('off')
        plt.tight_layout(pad=0)
        
        # Save to memory buffer
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight', dpi=150, facecolor='white')
        buffer.seek(0)
        plt.close()
        
        # Convert to base64
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        buffer.close()
        
        return image_base64, static_saved
        
    except Exception as e:
        raise Exception(f"Error generating wordcloud: {str(e)}")

@app.post("/upload")
async def upload_file(request: Request, file: UploadFile = File(...), language: str = Form(default="english")):
    if file.content_type != "text/plain":
        raise HTTPException(status_code=400, detail="Invalid file type. Only text files are allowed.")
    
    if language not in ["english", "indonesian", "chinese_simplified", "chinese_traditional"]:
        raise HTTPException(status_code=400, detail="Language must be either 'english', 'indonesian', 'chinese_simplified', or 'chinese_traditional'")

    try:
        text = await file.read()
        text = text.decode("utf-8")

        # Apply language-specific text processing
        if language == "english":
            cleaned_text = remove_stopwords_english(text)
        elif language == "indonesian":
            cleaned_text = remove_stopwords_indonesian(text)
            cleaned_text = stem_indonesian(cleaned_text)
        elif language == "chinese_simplified":
            # For Chinese Simplified, first segment the text
            cleaned_text = segment_chinese(text)
            # Remove Chinese punctuation
            cleaned_text = remove_chinese_punctuation(cleaned_text)
            # Remove stopwords
            cleaned_text = remove_stopwords_chinese(cleaned_text)
        else:  # chinese_traditional
            # For Chinese Traditional, first segment the text
            cleaned_text = segment_chinese(text)
            # Remove Chinese punctuation
            cleaned_text = remove_chinese_punctuation(cleaned_text)
            # Remove Traditional Chinese stopwords
            cleaned_text = remove_stopwords_chinese_traditional(cleaned_text)
        
        # Common cleaning steps for all languages
        if language not in ["chinese_simplified", "chinese_traditional"]:
            cleaned_text = remove_punctuation(cleaned_text)
        cleaned_text = remove_whitespace(cleaned_text)
        cleaned_text = remove_numbers(cleaned_text)
        cleaned_text = remove_special_characters(cleaned_text, language)

        # Validate cleaned text
        if not cleaned_text.strip():
            raise HTTPException(status_code=400, detail="No valid text found after processing")

        # Calculate word frequencies
        words = cleaned_text.lower().split()
        word_frequencies = {}
        for word in words:
            if word:
                word_frequencies[word] = word_frequencies.get(word, 0) + 1
        
        # Sort words by frequency (descending)
        sorted_word_frequencies = dict(sorted(word_frequencies.items(), key=lambda x: x[1], reverse=True))

        # Generate wordcloud
        image_base64, static_saved = generate_wordcloud_image(cleaned_text, language)
        
        response = {
            "language": language,
            "cleaned_text": cleaned_text[:500] + "..." if len(cleaned_text) > 500 else cleaned_text,
            "word_frequencies": dict(list(sorted_word_frequencies.items())[:20]),
            "total_words": len(words),
            "unique_words": len(word_frequencies),
            "wordcloud_base64": f"data:image/png;base64,{image_base64}",
            "message": f"Wordcloud generated successfully for {language} text"
        }
        
        # Add static URL if file was saved successfully
        if static_saved:
            response["wordcloud_url"] = f"{request.base_url}static/wordcloud.png"
        
        return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.post("/upload-with-image")
async def upload_file_with_image(file: UploadFile = File(...), language: str = Form(default="english")):
    """Alternative endpoint that returns image directly"""
    if file.content_type != "text/plain":
        raise HTTPException(status_code=400, detail="Invalid file type. Only text files are allowed.")
    
    if language not in ["english", "indonesian", "chinese_simplified", "chinese_traditional"]:
        raise HTTPException(status_code=400, detail="Language must be either 'english', 'indonesian', 'chinese_simplified', or 'chinese_traditional'")

    try:
        text = await file.read()
        text = text.decode("utf-8")

        # Process text (same as above)
        if language == "english":
            cleaned_text = remove_stopwords_english(text)
        elif language == "indonesian":
            cleaned_text = remove_stopwords_indonesian(text)
            cleaned_text = stem_indonesian(cleaned_text)
        elif language == "chinese_simplified":
            # For Chinese Simplified, first segment the text
            cleaned_text = segment_chinese(text)
            # Remove Chinese punctuation
            cleaned_text = remove_chinese_punctuation(cleaned_text)
            # Remove stopwords
            cleaned_text = remove_stopwords_chinese(cleaned_text)
        else:  # chinese_traditional
            # For Chinese Traditional, first segment the text
            cleaned_text = segment_chinese(text)
            # Remove Chinese punctuation
            cleaned_text = remove_chinese_punctuation(cleaned_text)
            # Remove Traditional Chinese stopwords
            cleaned_text = remove_stopwords_chinese_traditional(cleaned_text)
        
        # Common cleaning steps for all languages
        if language not in ["chinese_simplified", "chinese_traditional"]:
            cleaned_text = remove_punctuation(cleaned_text)
        cleaned_text = remove_whitespace(cleaned_text)
        cleaned_text = remove_numbers(cleaned_text)
        cleaned_text = remove_special_characters(cleaned_text, language)

        if not cleaned_text.strip():
            raise HTTPException(status_code=400, detail="No valid text found after processing")

        # Set font path for Chinese if needed
        font_path = None
        if language in ["chinese_simplified", "chinese_traditional"]:
            # Try to find Chinese font (works for both Simplified and Traditional)
            chinese_fonts = [
                "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc",
                "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
                "/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf"
            ]
            for font in chinese_fonts:
                if os.path.exists(font):
                    font_path = font
                    break
        
        # Generate wordcloud
        wordcloud_params = {
            'width': 800,
            'height': 400,
            'background_color': 'white',
            'max_words': 100,
            'relative_scaling': 0.5,
            'colormap': 'viridis'
        }
        
        if font_path:
            wordcloud_params['font_path'] = font_path
            
        wordcloud = WordCloud(**wordcloud_params).generate(cleaned_text)
        
        # Create image in memory
        plt.figure(figsize=(10, 5))
        plt.imshow(wordcloud, interpolation='bilinear')
        plt.axis('off')
        plt.tight_layout(pad=0)
        
        # Save to buffer
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight', dpi=150, facecolor='white')
        buffer.seek(0)
        plt.close()
        
        return StreamingResponse(
            io.BytesIO(buffer.getvalue()),
            media_type="image/png",
            headers={"Content-Disposition": "attachment; filename=wordcloud.png"}
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/wordcloud")
def get_wordcloud(request: Request):
    static_path = 'static/wordcloud.png'
    if os.path.exists(static_path):
        return {"wordcloud_url": f"{request.base_url}static/wordcloud.png"}
    else:
        return {"error": "No wordcloud available. Please upload a file first."}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "nltk_data_path": nltk.data.path,
        "static_dir_exists": os.path.exists("static"),
        "static_writable": os.access("static", os.W_OK) if os.path.exists("static") else False
    }

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=7860,
        timeout_keep_alive=600,
    )