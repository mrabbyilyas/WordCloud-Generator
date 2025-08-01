# Chinese Language Support for WordCloud Generator

This WordCloud generator now supports Chinese Simplified text processing.

## Features Added

1. **Chinese Text Segmentation**: Uses `jieba` library for proper word segmentation
2. **Chinese Stopwords**: Includes common Chinese stopwords removal
3. **Chinese Punctuation**: Handles Chinese-specific punctuation marks using `zhon` library
4. **Font Support**: Automatically detects and uses Chinese fonts in Docker container

## Usage

1. Select "Chinese (Simplified)" from the language dropdown in the frontend
2. Upload a text file containing Chinese text
3. The system will:
   - Segment the Chinese text into words
   - Remove Chinese stopwords and punctuation
   - Generate a word cloud with proper Chinese font rendering

## Technical Details

### Dependencies Added
- `jieba`: Chinese text segmentation
- `zhon`: Chinese punctuation and character handling

### System Fonts
The Docker container includes:
- `fonts-wqy-microhei`
- `fonts-wqy-zenhei`

### API Changes
- Language parameter now accepts: `"english"`, `"indonesian"`, `"chinese"`
- Both `/upload` and `/upload-with-image` endpoints support Chinese

## Sample Chinese Text
A sample file `sample_chinese.txt` is provided for testing purposes.