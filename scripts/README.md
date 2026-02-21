# PDF Catalog Parser & Image Extractor

**Fully automated solution** to extract questions and images from the official Bayern fishing exam PDF catalog.

Works completely from scratch - no existing catalog needed!

## Quick Start

```bash
# 1. Install dependencies
npm install pdf.js-extract
sudo apt install poppler-utils  # or: brew install poppler (macOS)

# 2. Place PDF in scripts directory
cp /path/to/Fragenkatalog_2025-2026_Stand-2025-12-10.pdf scripts/

# 3. Run extraction pipeline
cd scripts
node examine-pdf-v2.cjs    # Extract PDF structure
node parse-catalog.cjs      # Parse questions (automated ✓)
node extract-images.cjs     # Extract and match images (partially automated)

# 4. ⚠️ VERIFY STEP: Check and fix image mappings
# Some pages (144, 147) have incorrect automated matching
# Open PDF and images/ folder side-by-side
# Verify each image matches its filename (B1.1.jpg, B2.1.jpg, etc.)
# Manually fix incorrect mappings
# See "Image Extraction" section below for known incorrect pages

# 5. Copy results to app
cp questions-new.json ../content/catalog.json
cp images/*.jpg ../public/img/  # After verification!
```

## What It Does

This system works **completely independently** from scratch:

1. **Extracts PDF structure** → `pdf-structured.json`
   - Text content with X/Y positioning
   - Page-by-page breakdown

2. **Parses all questions** → `questions-new.json`
   - Regular questions (1.xxx, 2.xxx, 3.xxx, 4.xxx, 5.xxx)
   - B-questions with images (B1.x, B2.x, B3.x, B4.x)
   - Handles fragmented question IDs in PDF

3. **Extracts and matches images** → `images/*.jpg`
   - Automatically extracts all images from PDF
   - Matches images to B-questions by page
   - Names files with question IDs (B2.1.jpg, B3.5.jpg, etc.)

## Files

### Input
- **Fragenkatalog_2025-2026_Stand-2025-12-10.pdf** - Official PDF catalog (place here)

### Scripts
- **examine-pdf-v2.cjs** - Extracts PDF structure with positioning data
- **parse-catalog.cjs** - Main parser, handles fragmented IDs
- **extract-images.cjs** - Image extraction and matching

### Output (gitignored)
- **pdf-extracted.txt** - Raw text for inspection
- **pdf-structured.json** - Structured data with X/Y positions
- **questions-new.json** - Final catalog JSON
- **extracted-images/** - Raw extracted images (temporary)
- **images/** - Final renamed images ready to copy


## How The Parser Works

### Column Detection (X-position based)

The parser uses X-coordinates to identify which column text belongs to:

**Regular questions:**
```
ID        Correct  Question     Answer A    Answer B    Answer C
x ≈ 35    x ≈ 120  x ≈ 153     x ≈ 317     x ≈ 482     x ≈ 646
```

**B-questions (different layout):**
```
ID        Correct  Question     Answer A    Answer B    Answer C
x ≈ 35    x ≈ 120  x ≈ 307     x ≈ 432     x ≈ 558     x ≈ 683
```

### Fragmented ID Handling

The PDF sometimes splits B-question IDs across multiple text items:
- `B2.7` → "B", "2.", "7" (3 separate items)
- `B2.8` → "B", "2.8" (2 items)
- `B2.11` → "B", "2.1", "1" (3 items)

The parser automatically reconstructs these IDs.

## Image Extraction

**⚠️ IMPORTANT: Automated matching works for SOME pages, but requires manual verification!**

The `pdfimages` tool extracts images in PDF object order, **not visual/reading order**. The automated script attempts sequential matching, which works for some pages but not all.

### Recommended Process

1. **Run automated extraction:**
   ```bash
   cd scripts
   node extract-images.cjs
   ```
   This will:
   - Extract all 54 images from PDF
   - Attempt to match them to B-question IDs
   - Save renamed images to `images/` directory

2. **Verify and fix incorrect mappings:**

   **Known incorrect pages (MUST fix manually):**
   - **Page 144** (B2.7-B2.12): Image order should be [3,4,5,0,1,2]
     - Script mapped: img-006→B2.7, img-007→B2.8, img-008→B2.9, img-009→B2.10, img-010→B2.11, img-011→B2.12
     - Correct: img-009→B2.7, img-010→B2.8, img-011→B2.9, img-006→B2.10, img-007→B2.11, img-008→B2.12

   - **Page 147** (B1.1-B1.6): Image order should be [1,2,3,4,0,5]
     - Script mapped: img-024→B1.1, img-025→B1.2, img-026→B1.3, img-027→B1.4, img-028→B1.5, img-029→B1.6
     - Correct: img-025→B1.1, img-026→B1.2, img-027→B1.3, img-028→B1.4, img-024→B1.5, img-029→B1.6

   **Known correct pages:**
   - **Page 143** (B2.1-B2.6): Sequential order ✓

   **Unknown pages (verify manually):**
   - Pages 145, 146, 148, 149, 150, 151, 152

3. **Manual verification:**
   - Open PDF and `images/` folder side-by-side
   - Check each image matches its B-question ID
   - For incorrect matches, rename files in `images/` directory

### Why Manual Verification?

`pdfimages` extracts images in the order they appear in the PDF's internal object structure, which doesn't correspond to visual layout. Different pages have different orderings. The only reliable method is visual verification.

### Helper Tool

Use `match-images-helper.html` for easier manual matching:
1. Open the HTML file in your browser
2. Images will display (if they exist in `extracted-images/`)
3. Enter the correct question ID for each image
4. Click "Generate Rename Commands" to get bash script
5. Run the generated commands to create correctly named images

### After Matching

Once all 54 images are correctly named in `images/`:
```bash
cp images/*.jpg ../public/img/
```

## Summary

**What's automated:**
- ✅ Question extraction (parse-catalog.cjs) - finds all 54 B-questions
- ✅ Image extraction from PDF (pdfimages) - extracts all 54 images

**What requires manual work:**
- ⚠️ Image-to-question matching - must be done visually
  - Extract images: `pdfimages -all -p PDF extracted-images/img`
  - Open PDF and compare with extracted-images/
  - Rename images to match question IDs: B1.1.jpg, B2.1.jpg, etc.

## Catalog Structure

Each question in `questions-new.json`:

```json
{
  "id": "B2.1",
  "slug": "B2.1",
  "question": "Welche Fischart ist hier abgebildet?",
  "category": "Fischkunde",
  "correctAnswer": 0,
  "answers": [
    "Gründling",
    "Schlammpeitzger",
    "Barbe"
  ],
  "picture": true
}
```

**Key fields:**
- `id` - Question identifier (1.001, B2.1, etc.)
- `slug` - Same as ID
- `question` - Question text
- `category` - One of 5 categories
- `correctAnswer` - Index: 0=A, 1=B, 2=C
- `answers` - Array of 3 answer options
- `picture` - `true` only for B-prefixed questions

## Categories

1. **Fischkunde** (1.xxx) - Fish biology/species
2. **Gewässerkunde** (2.xxx) - Water ecology
3. **Schutz und Pflege** (3.xxx) - Conservation
4. **Fanggeräte** (4.xxx) - Fishing gear
5. **Rechtsvorschriften** (5.xxx) - Legal regulations

**B-question categories:**
- **B1.x** → Gewässerkunde (water ecology images)
- **B2.x** → Fischkunde (fish species images)
- **B3.x** → Fanggeräte (fishing gear images)
- **B4.x** → Fanggeräte (fishing gear images)

## Troubleshooting

**Parser doesn't find all B-questions:**
- Expected behavior due to PDF text fragmentation
- B3 and B4 questions are extracted reliably
- Missing questions can be added manually (see below)

**pdfimages not found:**
```bash
# Ubuntu/Debian
sudo apt install poppler-utils

# macOS
brew install poppler
```

**Images not matching correctly:**
- Review `images/` directory manually
- Check page numbers in PDF vs extracted images
- Some manual verification recommended

**PDF structure changed in future versions:**
- Run `examine-pdf-v2.cjs` first to inspect structure
- Check X-position values in `pdf-structured.json`
- Update `getColumn()` function in `parse-catalog.cjs` if needed

## Manual Additions (Optional)

If some B-questions are missing from automated parsing:

1. Open PDF and find missing question (e.g., B2.13)
2. Add to `questions-new.json`:

```json
{
  "id": "B2.13",
  "slug": "B2.13",
  "question": "Question text from PDF",
  "category": "Fischkunde",
  "correctAnswer": 0,
  "answers": ["Answer A", "Answer B", "Answer C"],
  "picture": true
}
```

3. For the image:
   - Open PDF to that page
   - Screenshot the image
   - Save as `images/B2.13.jpg`

## Future Updates

When a new PDF is released:

1. Place new PDF in `scripts/` directory
2. Run the 3-step pipeline:
   ```bash
   node examine-pdf-v2.cjs
   node parse-catalog.cjs
   node extract-images.cjs
   ```
3. Review `questions-new.json` and `images/`
4. Copy to production when ready

The system works from scratch - no dependencies on previous catalogs!

## Implementation Notes

### Why Column-Based Parsing?

The PDF is a table, but the text is not semantically structured. We use X-coordinates to determine which column each text fragment belongs to, then reconstruct complete questions from fragments.

### Why Two Different Column Layouts?

B-questions have images, so the layout is different:
- Regular: ID | Correct | Question | A | B | C
- B-questions: ID | Correct | Question (shifted right) | A | B | C

The parser detects B-questions by the ID prefix and switches column boundaries accordingly.

### Image Matching Strategy

Images are matched to questions by:
1. Page number (from `pdfimages -p` flag)
2. Image order on page (if multiple images)
3. B-question IDs found on that page

This works reliably when one image per B-question, which is the standard format.
