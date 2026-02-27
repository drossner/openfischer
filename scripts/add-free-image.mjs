#!/usr/bin/env node
// Usage: node scripts/add-free-image.mjs <commons-url> <ref>
// Example: node scripts/add-free-image.mjs https://commons.wikimedia.org/wiki/File:Foo.jpg B1.3

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import { extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CREDITS_FILE = join(__dirname, 'images/image-credits.json')
const IMAGES_DIR = join(__dirname, 'images')

const [, , commonsUrl, ref] = process.argv

if (!commonsUrl || !ref) {
  console.error('Usage: node scripts/add-free-image.mjs <commons-url> <ref>')
  process.exit(1)
}

// Extract filename from URL, e.g. "File:Foo.jpg" -> "Foo.jpg"
const urlMatch = commonsUrl.match(/\/File:(.+)$/)
if (!urlMatch) {
  console.error('Could not parse Commons file name from URL')
  process.exit(1)
}
const commonsFilename = decodeURIComponent(urlMatch[1])
const ext = extname(commonsFilename).toLowerCase()

// --- 1. Fetch metadata via Wikimedia API ---
console.log('Fetching metadata...')
const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(commonsFilename)}&prop=imageinfo&iiprop=extmetadata|url&format=json&origin=*`
const apiRes = await fetch(apiUrl)
const apiJson = await apiRes.json()

const pages = apiJson.query.pages
const page = Object.values(pages)[0]
const info = page.imageinfo[0]
const meta = info.extmetadata
const imageUrl = info.url

const get = (key) => meta[key]?.value ?? null
// Strip HTML tags from author field
const stripHtml = (str) => str ? str.replace(/<[^>]+>/g, '').trim() : null

// Extract author URL from the raw HTML in Artist field
const artistHtml = meta.Artist?.value ?? ''
const authorUrlMatch = artistHtml.match(/href="([^"]+)"/)
const authorUrl = authorUrlMatch
  ? (authorUrlMatch[1].startsWith('http') ? authorUrlMatch[1] : 'https://commons.wikimedia.org' + (authorUrlMatch[1].startsWith('/') ? '' : '/') + authorUrlMatch[1].replace(/^\/\/[^/]+/, ''))
  : null

const entry = {
  file: `${ref}_free${ext}`,
  source_url: commonsUrl,
  title: get('ObjectName') ?? commonsFilename.replace(/\.[^.]+$/, ''),
  description: stripHtml(get('ImageDescription')),
  author: stripHtml(artistHtml),
  author_url: authorUrl,
  license: get('LicenseShortName'),
  license_url: get('LicenseUrl'),
  platform: 'Wikimedia Commons',
  date: get('DateTimeOriginal') ?? get('DateTime') ?? null,
}

// Clean up date to YYYY-MM-DD if possible
if (entry.date) {
  const dateMatch = entry.date.match(/(\d{4})[:\-](\d{2})[:\-](\d{2})/)
  if (dateMatch) entry.date = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`
}

console.log('Metadata:', entry)

// --- 2. Download image ---
const outPath = join(IMAGES_DIR, entry.file)
console.log(`Downloading image to ${outPath}...`)
const imgRes = await fetch(imageUrl)
if (!imgRes.ok) throw new Error(`Failed to download image: ${imgRes.status}`)
mkdirSync(IMAGES_DIR, { recursive: true })
await pipeline(imgRes.body, createWriteStream(outPath))
console.log('Image saved.')

// --- 3. Update credits JSON ---
const credits = JSON.parse(readFileSync(CREDITS_FILE, 'utf8'))
credits[ref] = entry
writeFileSync(CREDITS_FILE, JSON.stringify(credits, null, 2) + '\n')
console.log(`Credits updated for ${ref}.`)
