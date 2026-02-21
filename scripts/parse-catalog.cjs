#!/usr/bin/env node

/**
 * Complete PDF catalog parser with robust fragmented ID handling
 */

const fs = require('fs')

console.log('Parsing PDF catalog (complete version)...\n')

const pdfData = JSON.parse(fs.readFileSync('./pdf-structured.json', 'utf-8'))

const categoryMap = {
  '1': 'Fischkunde',
  '2': 'Gewässerkunde',
  '3': 'Schutz und Pflege',
  '4': 'Fanggeräte',
  '5': 'Rechtsvorschriften'
}

const answerMap = { 'A': 0, 'B': 1, 'C': 2 }

function getColumn(x, isImageQuestion) {
  if (x < 80) return 'id'
  if (x < 140) return 'correct'
  if (isImageQuestion) {
    if (x < 400) return 'question'
    if (x < 540) return 'answerA'
    if (x < 665) return 'answerB'
    return 'answerC'
  } else {
    if (x < 280) return 'question'
    if (x < 450) return 'answerA'
    if (x < 600) return 'answerB'
    return 'answerC'
  }
}

const questions = []

pdfData.pages.forEach((page, pageIndex) => {
  const items = page.content

  let questionData = {
    id: '',
    correct: '',
    question: [],
    answerA: [],
    answerB: [],
    answerC: [],
    isImageQuestion: false
  }

  let skipNext = 0

  for (let i = 0; i < items.length; i++) {
    if (skipNext > 0) {
      skipNext--
      continue
    }

    const item = items[i]
    const text = item.str.trim()
    if (!text) continue

    const column = getColumn(item.x, questionData.isImageQuestion)

    if (column === 'id') {
      let reconstructedId = null
      let consumed = 0

      // Try to match complete ID first (like "B3.1", "1.001")
      if (/^(B?\d+\.\d+)$/.test(text)) {
        reconstructedId = text
        consumed = 0
      }
      // Try fragmented B-question patterns
      else if (text === 'B' && i + 1 < items.length) {
        const next1 = items[i + 1].str.trim()
        const next1X = items[i + 1].x

        // Must be in ID column
        if (next1X >= 80) {
          continue
        }

        // Check for 3-item patterns first (they take precedence)
        if (i + 2 < items.length) {
          const next2 = items[i + 2].str.trim()
          const next2X = items[i + 2].x

          if (next2X < 80) {
            // Pattern 2a: "B" + "X." + "Y" (e.g., "B", "2.", "7" = "B2.7")
            if (/^\d+\.$/.test(next1) && /^\d+$/.test(next2)) {
              reconstructedId = text + next1 + next2
              consumed = 2
            }
            // Pattern 2b: "B" + "X.Y" + "Z" (e.g., "B", "2.1", "1" = "B2.11")
            else if (/^\d+\.\d+$/.test(next1) && /^\d+$/.test(next2)) {
              reconstructedId = text + next1 + next2
              consumed = 2
            }
            // Pattern 2c: "B" + "X" + ".Y" (e.g., "B", "1", ".1" = "B1.1" or "B", "2", ".13" = "B2.13")
            else if (/^\d+$/.test(next1) && /^\.\d+$/.test(next2)) {
              reconstructedId = text + next1 + next2
              consumed = 2
            }
          }
        }

        // Pattern 1: "B" + "X.Y" (2 items, e.g., "B", "2.8" = "B2.8")
        // Only match if we didn't find a 3-item pattern
        if (!reconstructedId && /^\d+\.\d+$/.test(next1)) {
          reconstructedId = text + next1
          consumed = 1
        }
      }

      if (reconstructedId) {
        // Save previous question
        if (questionData.id) {
          saveQuestion(questionData, questions, categoryMap, answerMap)
        }

        // Start new question
        questionData = {
          id: reconstructedId,
          correct: '',
          question: [],
          answerA: [],
          answerB: [],
          answerC: [],
          isImageQuestion: reconstructedId.startsWith('B')
        }

        skipNext = consumed
      }
    }
    else if (questionData.id) {
      // Collect data for current question
      switch (column) {
        case 'correct':
          if (/^[ABC]$/.test(text)) {
            questionData.correct = text
          }
          break
        case 'question':
          questionData.question.push(text)
          break
        case 'answerA':
          questionData.answerA.push(text)
          break
        case 'answerB':
          questionData.answerB.push(text)
          break
        case 'answerC':
          questionData.answerC.push(text)
          break
      }
    }
  }

  // Save last question on page
  if (questionData.id) {
    saveQuestion(questionData, questions, categoryMap, answerMap)
  }
})

function saveQuestion(questionData, questions, categoryMap, answerMap) {
  const isImageQuestion = questionData.id.startsWith('B')
  let category

  if (isImageQuestion) {
    const bPrefix = questionData.id.substring(0, 2)
    if (bPrefix === 'B1') category = 'Gewässerkunde'
    else if (bPrefix === 'B2') category = 'Fischkunde'
    else if (bPrefix === 'B3' || bPrefix === 'B4') category = 'Fanggeräte'
    else category = 'Unknown'
  } else {
    const categoryPrefix = questionData.id.split('.')[0]
    category = categoryMap[categoryPrefix] || 'Unknown'
  }

  const questionText = questionData.question.join(' ').replace(/\s+/g, ' ').trim()
  const answerA = questionData.answerA.join(' ').replace(/\s+/g, ' ').trim()
  const answerB = questionData.answerB.join(' ').replace(/\s+/g, ' ').trim()
  const answerC = questionData.answerC.join(' ').replace(/\s+/g, ' ').trim()

  if (questionText && answerA && answerB && answerC && questionData.correct) {
    // Check for duplicate IDs before adding
    const existingQuestion = questions.find(q => q.id === questionData.id)
    if (existingQuestion) {
      console.log(`  Warning: Duplicate question ID ${questionData.id} found, skipping...`)
      return
    }

    questions.push({
      id: questionData.id,
      slug: questionData.id,
      question: questionText,
      category: category,
      correctAnswer: answerMap[questionData.correct],
      answers: [answerA, answerB, answerC],
      picture: isImageQuestion
    })
  }
}

// Sort by ID
questions.sort((a, b) => {
  const aIsB = a.id.startsWith('B')
  const bIsB = b.id.startsWith('B')

  if (aIsB && bIsB) {
    return a.id.localeCompare(b.id, undefined, { numeric: true })
  } else if (aIsB) {
    return 1
  } else if (bIsB) {
    return -1
  } else {
    const [aCat, aNum] = a.id.split('.').map(Number)
    const [bCat, bNum] = b.id.split('.').map(Number)
    return aCat !== bCat ? aCat - bCat : aNum - bNum
  }
})

console.log(`✓ Parsed ${questions.length} questions`)

const categoryCounts = {}
questions.forEach(q => {
  categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1
})

console.log('\nQuestions per category:')
Object.entries(categoryCounts).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count}`)
})

const imageQuestions = questions.filter(q => q.picture)
console.log(`\nQuestions with images: ${imageQuestions.length}`)

const bCounts = {}
imageQuestions.forEach(q => {
  const prefix = q.id.substring(0, 2)
  bCounts[prefix] = (bCounts[prefix] || 0) + 1
})
console.log('B-question breakdown:')
Object.keys(bCounts).sort().forEach(prefix => {
  console.log(`  ${prefix}: ${bCounts[prefix]} questions`)
})

console.log('\nB-question IDs found:')
Object.keys(bCounts).sort().forEach(prefix => {
  const ids = imageQuestions.filter(q => q.id.startsWith(prefix)).map(q => q.id).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  console.log(`  ${prefix}: ${ids.join(', ')}`)
})

fs.writeFileSync('./questions-new.json', JSON.stringify(questions, null, 2))
console.log('\n✓ Saved to questions-new.json')

console.log('\n✅ Parsing complete! Ready for image extraction.')
