#!/usr/bin/env node

/**
 * Extract images from PDF and match them to B-questions
 *
 * This script:
 * 1. Uses pdfimages to extract all images from the PDF
 * 2. Matches images to B-question IDs based on page numbers
 * 3. Renames images to match question IDs (e.g., B2.1.jpg)
 *
 * Prerequisites: poppler-utils must be installed
 *   - Ubuntu/Debian: sudo apt install poppler-utils
 *   - macOS: brew install poppler
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const PDF_FILE = './Fragenkatalog_2025-2026_Stand-2025-12-10.pdf'
const OUTPUT_DIR = './extracted-images'
const FINAL_DIR = './images'  // Images ready to copy to public/img

console.log('=== PDF Image Extraction ===\n')

// Check if pdfimages is available
try {
  execSync('which pdfimages', { stdio: 'ignore' })
} catch (error) {
  console.error('ERROR: pdfimages not found!')
  console.error('Install poppler-utils:')
  console.error('  Ubuntu/Debian: sudo apt install poppler-utils')
  console.error('  macOS: brew install poppler')
  process.exit(1)
}

// Check if PDF exists
if (!fs.existsSync(PDF_FILE)) {
  console.error(`ERROR: PDF not found: ${PDF_FILE}`)
  process.exit(1)
}

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

console.log('Step 1: Extracting images from PDF...')
console.log(`  PDF: ${PDF_FILE}`)
console.log(`  Output: ${OUTPUT_DIR}/\n`)

// Extract images with page numbers
try {
  execSync(`pdfimages -all -p "${PDF_FILE}" "${OUTPUT_DIR}/img"`, { stdio: 'inherit' })
} catch (error) {
  console.error('ERROR: pdfimages failed')
  process.exit(1)
}

console.log('\nStep 2: Analyzing extracted images...')

// List all extracted images
const files = fs.readdirSync(OUTPUT_DIR)
const imageFiles = files.filter(f => /\.(png|jpg|jpeg|ppm)$/i.test(f))

console.log(`  Found ${imageFiles.length} images`)

// Parse image filenames to get page numbers
// pdfimages format: img-PAGENO-IMGNO.ext
const imageData = imageFiles.map(filename => {
  const match = filename.match(/img-(\d+)-(\d+)\.(\w+)/)
  if (match) {
    return {
      filename,
      pageNumber: parseInt(match[1]),
      imageNumber: parseInt(match[2]),
      extension: match[3],
      fullPath: path.join(OUTPUT_DIR, filename)
    }
  }
  return null
}).filter(x => x)

console.log(`  Parsed ${imageData.length} image metadata entries`)

// Load questions to get B-question page mappings
console.log('\nStep 3: Loading question data...')

const pdfData = JSON.parse(fs.readFileSync('./pdf-structured.json', 'utf-8'))

// Find which pages have which B-questions
const bQuestionPages = {}

pdfData.pages.forEach((page, pageIndex) => {
  const items = page.content

  // Look for B-question IDs on this page
  const bIds = new Set()

  for (let i = 0; i < items.length; i++) {
    const text = items[i].str.trim()

    // Match complete B-question IDs
    if (/^B\d+\.\d+$/.test(text)) {
      bIds.add(text)
    }
    // Match fragmented B-question patterns (same as parser)
    else if (text === 'B' && i + 1 < items.length) {
      const next1 = items[i + 1].str.trim()
      const next1X = items[i + 1].x
      let reconstructedId = null

      // Must be in ID column (x < 80)
      if (next1X < 80) {
        // Check for 3-item patterns first
        if (i + 2 < items.length) {
          const next2 = items[i + 2].str.trim()
          const next2X = items[i + 2].x

          if (next2X < 80) {
            // "B" + "X." + "Y" (e.g., "B", "2.", "7" = "B2.7")
            if (/^\d+\.$/.test(next1) && /^\d+$/.test(next2)) {
              reconstructedId = text + next1 + next2
            }
            // "B" + "X.Y" + "Z" (e.g., "B", "2.1", "1" = "B2.11")
            else if (/^\d+\.\d+$/.test(next1) && /^\d+$/.test(next2)) {
              reconstructedId = text + next1 + next2
            }
            // "B" + "X" + ".Y" (e.g., "B", "1", ".1" = "B1.1")
            else if (/^\d+$/.test(next1) && /^\.\d+$/.test(next2)) {
              reconstructedId = text + next1 + next2
            }
          }
        }

        // "B" + "X.Y" (2 items, e.g., "B", "2.8" = "B2.8")
        if (!reconstructedId && /^\d+\.\d+$/.test(next1)) {
          reconstructedId = text + next1
        }

        if (reconstructedId) {
          bIds.add(reconstructedId)
        }
      }
    }
  }

  bIds.forEach(id => {
    if (!bQuestionPages[id]) {
      bQuestionPages[id] = pageIndex + 1  // PDF pages are 1-indexed
    }
  })
})

console.log(`  Found ${Object.keys(bQuestionPages).length} B-questions with page numbers`)

// Create mapping: page -> B-question IDs (sorted by ID)
const pageToBQuestions = {}
Object.entries(bQuestionPages).forEach(([id, page]) => {
  if (!pageToBQuestions[page]) {
    pageToBQuestions[page] = []
  }
  pageToBQuestions[page].push(id)
})

// Sort questions on each page by ID
Object.keys(pageToBQuestions).forEach(page => {
  pageToBQuestions[page].sort((a, b) => {
    return a.localeCompare(b, undefined, { numeric: true })
  })
})

console.log('\nStep 4: Matching images to questions...')

// Group images by page
const imagesByPage = {}
imageData.forEach(img => {
  if (!imagesByPage[img.pageNumber]) {
    imagesByPage[img.pageNumber] = []
  }
  imagesByPage[img.pageNumber].push(img)
})

// Sort images on each page by image number
Object.keys(imagesByPage).forEach(page => {
  imagesByPage[page].sort((a, b) => a.imageNumber - b.imageNumber)
})

// Match images to B-questions (1:1 in order on each page)
const matches = []
const matchedQuestions = new Set()

Object.keys(imagesByPage).forEach(pageNum => {
  const imagesOnPage = imagesByPage[pageNum]
  const questionsOnPage = pageToBQuestions[pageNum] || []

  if (questionsOnPage.length === 0) {
    return  // No B-questions on this page
  }

  // Match images to questions 1:1 in order
  imagesOnPage.forEach((img, index) => {
    if (index < questionsOnPage.length) {
      const questionId = questionsOnPage[index]

      // Skip if we already matched this question (avoid duplicates)
      if (!matchedQuestions.has(questionId)) {
        matches.push({
          ...img,
          questionId
        })
        matchedQuestions.add(questionId)
        console.log(`  Page ${img.pageNumber}: ${img.filename} -> ${questionId}`)
      }
    }
  })
})

console.log(`\n  Matched ${matches.length} images to B-questions`)
console.log(`  Unique questions matched: ${matchedQuestions.size}`)

// Copy and rename images to final directory
console.log('\nStep 5: Copying images to final directory...')

if (!fs.existsSync(FINAL_DIR)) {
  fs.mkdirSync(FINAL_DIR, { recursive: true })
}

matches.forEach(match => {
  const newFilename = `${match.questionId}.jpg`
  const destPath = path.join(FINAL_DIR, newFilename)

  fs.copyFileSync(match.fullPath, destPath)
  console.log(`  ✓ ${newFilename}`)
})

console.log(`\n✅ Done! Images saved to ${FINAL_DIR}/`)
console.log(`\nTo use in app, copy to public directory:`)
console.log(`  cp ${FINAL_DIR}/*.jpg ../public/img/`)

// Summary
console.log('\n=== Summary ===')
console.log(`Total images extracted: ${imageData.length}`)
console.log(`Images matched to B-questions: ${matches.length}`)
console.log(`B-questions found in PDF: ${Object.keys(bQuestionPages).length}`)

const unmatchedQuestions = Object.keys(bQuestionPages).filter(id =>
  !matches.some(m => m.questionId === id)
)

if (unmatchedQuestions.length > 0) {
  console.log(`\n⚠️  B-questions without matched images: ${unmatchedQuestions.length}`)
  console.log(`  ${unmatchedQuestions.join(', ')}`)
  console.log('\nThese may need manual extraction or verification.')
}
