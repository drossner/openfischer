#!/usr/bin/env node

const fs = require('fs')
const PDFExtract = require('pdf.js-extract').PDFExtract

const pdfPath = './Fragenkatalog_2025-2026_Stand-2025-12-10.pdf'
const pdfExtract = new PDFExtract()

console.log('Extracting text from PDF...\n')

pdfExtract.extract(pdfPath, {})
  .then(data => {
    console.log(`Total pages: ${data.pages.length}`)
    console.log(`PDF metadata:`, data.meta)

    // Extract text from all pages
    let fullText = ''
    data.pages.forEach((page, index) => {
      const pageText = page.content
        .map(item => item.str)
        .join(' ')
      fullText += `\n\n--- PAGE ${index + 1} ---\n\n${pageText}`
    })

    console.log(`\nTotal text length: ${fullText.length} characters`)

    // Show first 3000 characters as sample
    console.log('\n=== Text Sample (first 3000 chars) ===')
    console.log(fullText.substring(0, 3000))

    // Save full extraction
    fs.writeFileSync('./pdf-extracted.txt', fullText)
    console.log('\n✓ Full extraction saved to pdf-extracted.txt')
    console.log(`  Total characters: ${fullText.length}`)

    // Try to identify question patterns
    const questionIdPattern = /\d+\.\d+/g
    const matches = fullText.match(questionIdPattern) || []
    console.log(`\n✓ Found ${matches.length} potential question IDs`)
    console.log(`  First 30: ${matches.slice(0, 30).join(', ')}`)

    // Also save the structured JSON for later parsing
    fs.writeFileSync('./pdf-structured.json', JSON.stringify(data, null, 2))
    console.log('\n✓ Structured data saved to pdf-structured.json')

  })
  .catch(err => {
    console.error('Error extracting PDF:', err)
    process.exit(1)
  })
