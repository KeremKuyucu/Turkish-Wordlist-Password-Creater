import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

interface GeneratePasswordRequest {
  wordCount: number
  wordLengths: number[]
  separator?: string
}

async function getWordsFromFile(length: number): Promise<string[]> {
  try {
    const filePath = path.join(process.cwd(), "public", "word-lists", `${length}-harfli-kelimeler.txt`)
    const fileContent = await fs.readFile(filePath, "utf-8")
    return fileContent.split("\n").filter((word) => word.trim().length > 0)
  } catch (error) {
    console.error(`Error reading file for ${length} letter words:`, error)
    return []
  }
}

function getRandomWord(words: string[]): string {
  return words[Math.floor(Math.random() * words.length)]
}

export async function POST(request: NextRequest) {
  try {
    const body: GeneratePasswordRequest = await request.json()

    const { wordCount = 3, wordLengths = [5, 6, 7], separator = "-" } = body

    // Validation
    if (wordCount < 1 || wordCount > 10) {
      return NextResponse.json({ error: "Kelime sayısı 1-10 arasında olmalıdır" }, { status: 400 })
    }

    if (!Array.isArray(wordLengths) || wordLengths.length === 0) {
      return NextResponse.json({ error: "En az bir kelime uzunluğu belirtmelisiniz" }, { status: 400 })
    }

    const validLengths = wordLengths.filter((length) => length >= 3 && length <= 10)
    if (validLengths.length === 0) {
      return NextResponse.json({ error: "Kelime uzunlukları 3-10 arasında olmalıdır" }, { status: 400 })
    }

    // Load words for each specified length
    const wordsByLength: { [key: number]: string[] } = {}

    for (const length of validLengths) {
      wordsByLength[length] = await getWordsFromFile(length)
      if (wordsByLength[length].length === 0) {
        return NextResponse.json({ error: `${length} harfli kelimeler bulunamadı` }, { status: 404 })
      }
    }

    // Generate password
    const selectedWords: string[] = []

    for (let i = 0; i < wordCount; i++) {
      // Randomly select a word length from available lengths
      const randomLength = validLengths[Math.floor(Math.random() * validLengths.length)]
      const wordsForLength = wordsByLength[randomLength]
      const randomWord = getRandomWord(wordsForLength)
      selectedWords.push(randomWord)
    }

    const password = selectedWords.join(separator)

    // Calculate password strength
    const totalChars = password.length
    const uniqueChars = new Set(password.toLowerCase()).size
    const hasNumbers = /\d/.test(password)
    const hasSpecialChars = /[^a-zA-ZğüşıöçĞÜŞİÖÇ\d\s]/.test(password)

    let strength = "Zayıf"
    if (totalChars >= 20 && uniqueChars >= 10) {
      strength = "Çok Güçlü"
    } else if (totalChars >= 15 && uniqueChars >= 8) {
      strength = "Güçlü"
    } else if (totalChars >= 10 && uniqueChars >= 6) {
      strength = "Orta"
    }

    return NextResponse.json({
      password,
      words: selectedWords,
      wordCount: selectedWords.length,
      totalLength: totalChars,
      strength,
      separator,
      wordLengths: selectedWords.map((word) => word.length),
    })
  } catch (error) {
    console.error("Password generation error:", error)
    return NextResponse.json({ error: "Şifre oluşturulurken bir hata oluştu" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Şifre Oluşturucu API",
    usage: {
      method: "POST",
      endpoint: "/api/generate-password",
      parameters: {
        wordCount: "number (1-10) - Kaç kelime kullanılacak",
        wordLengths: "number[] (3-10) - Hangi uzunluklarda kelimeler kullanılacak",
        separator: 'string (opsiyonel) - Kelimelerin arasındaki ayırıcı (varsayılan: "-")',
      },
      example: {
        wordCount: 3,
        wordLengths: [5, 6, 7],
        separator: "-",
      },
    },
    availableWordLengths: [3, 4, 5, 6, 7, 8, 9, 10],
  })
}
