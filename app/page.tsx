"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Copy, RefreshCw, Key, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PasswordResponse {
  password: string
  words: string[]
  wordCount: number
  totalLength: number
  strength: string
  separator: string
  wordLengths: number[]
}

export default function PasswordGenerator() {
  const [wordCount, setWordCount] = useState(3)
  const [separator, setSeparator] = useState("-")
  const [selectedLengths, setSelectedLengths] = useState<number[]>([5, 6, 7])
  const [generatedPassword, setGeneratedPassword] = useState<PasswordResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const availableLengths = [3, 4, 5, 6, 7, 8, 9, 10]

  const handleLengthChange = (length: number, checked: boolean) => {
    if (checked) {
      setSelectedLengths([...selectedLengths, length])
    } else {
      setSelectedLengths(selectedLengths.filter((l) => l !== length))
    }
  }

  const generatePassword = async () => {
    if (selectedLengths.length === 0) {
      toast({
        title: "Hata",
        description: "En az bir kelime uzunluğu seçmelisiniz",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/generate-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wordCount,
          wordLengths: selectedLengths,
          separator,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Şifre oluşturulamadı")
      }

      const result: PasswordResponse = await response.json()
      setGeneratedPassword(result)

      toast({
        title: "Başarılı",
        description: "Şifre başarıyla oluşturuldu!",
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (generatedPassword) {
      try {
        await navigator.clipboard.writeText(generatedPassword.password)
        toast({
          title: "Kopyalandı",
          description: "Şifre panoya kopyalandı",
        })
      } catch (error) {
        toast({
          title: "Hata",
          description: "Kopyalama başarısız",
          variant: "destructive",
        })
      }
    }
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "Çok Güçlü":
        return "bg-green-500"
      case "Güçlü":
        return "bg-blue-500"
      case "Orta":
        return "bg-yellow-500"
      default:
        return "bg-red-500"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Key className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Güvenli Şifre Oluşturucu</h1>
          </div>
          <p className="text-gray-600">Türkçe kelimelerden oluşan güvenli şifreler oluşturun</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Şifre Ayarları
              </CardTitle>
              <CardDescription>Şifrenizin özelliklerini belirleyin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="wordCount">Kelime Sayısı (1-10)</Label>
                <Input
                  id="wordCount"
                  type="number"
                  min="1"
                  max="10"
                  value={wordCount}
                  onChange={(e) => setWordCount(Number.parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="separator">Ayırıcı Karakter</Label>
                <Input
                  id="separator"
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  placeholder="-"
                />
              </div>

              <div className="space-y-3">
                <Label>Kelime Uzunlukları</Label>
                <div className="grid grid-cols-4 gap-2">
                  {availableLengths.map((length) => (
                    <div key={length} className="flex items-center space-x-2">
                      <Checkbox
                        id={`length-${length}`}
                        checked={selectedLengths.includes(length)}
                        onCheckedChange={(checked) => handleLengthChange(length, checked as boolean)}
                      />
                      <Label htmlFor={`length-${length}`} className="text-sm font-normal">
                        {length} harf
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={generatePassword} disabled={isLoading} className="w-full" size="lg">
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Şifre Oluştur
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Result Card */}
          <Card>
            <CardHeader>
              <CardTitle>Oluşturulan Şifre</CardTitle>
              <CardDescription>Güvenli şifreniz hazır</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedPassword ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Şifre</Label>
                      <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4 mr-1" />
                        Kopyala
                      </Button>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm break-all">
                      {generatedPassword.password}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-600">Uzunluk</Label>
                      <p className="font-semibold">{generatedPassword.totalLength} karakter</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-600">Güçlülük</Label>
                      <Badge className={getStrengthColor(generatedPassword.strength)}>
                        {generatedPassword.strength}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Kullanılan Kelimeler</Label>
                    <div className="flex flex-wrap gap-2">
                      {generatedPassword.words.map((word, index) => (
                        <Badge key={index} variant="secondary">
                          {word} ({generatedPassword.wordLengths[index]} harf)
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Key className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Şifre oluşturmak için ayarları yapın ve butona tıklayın</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* API Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>API Kullanımı</CardTitle>
            <CardDescription>Bu servisi programatik olarak nasıl kullanabilirsiniz</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="font-semibold">Endpoint:</Label>
                <code className="block mt-1 p-2 bg-gray-100 rounded text-sm">POST /api/generate-password</code>
              </div>

              <div>
                <Label className="font-semibold">Örnek İstek:</Label>
                <pre className="mt-1 p-3 bg-gray-100 rounded text-sm overflow-x-auto">
                  {`{
  "wordCount": 3,
  "wordLengths": [5, 6, 7],
  "separator": "-"
}`}
                </pre>
              </div>

              <div>
                <Label className="font-semibold">Örnek Yanıt:</Label>
                <pre className="mt-1 p-3 bg-gray-100 rounded text-sm overflow-x-auto">
                  {`{
  "password": "elma-bilgisayar-merhaba",
  "words": ["elma", "bilgisayar", "merhaba"],
  "wordCount": 3,
  "totalLength": 23,
  "strength": "Güçlü",
  "separator": "-",
  "wordLengths": [4, 10, 7]
}`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
