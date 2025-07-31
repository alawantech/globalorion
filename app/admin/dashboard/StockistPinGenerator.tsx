"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { db } from "@/lib/firebase"
import { collection, addDoc, Timestamp } from "firebase/firestore"

const PACKAGE_OPTIONS = [
  { label: "₦5M Package", value: "5M" },
  { label: "₦10M Package", value: "10M" },
  { label: "₦15M Package", value: "15M" },
  { label: "₦20M Package", value: "20M" },
]

function generateRandomPin(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let pin = ""
  for (let i = 0; i < length; i++) {
    pin += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pin
}

export default function StockistPinGenerator() {
  const [packageType, setPackageType] = useState(PACKAGE_OPTIONS[0].value)
  const [quantity, setQuantity] = useState(1)
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleGenerate = async () => {
    setGenerating(true)
    setMessage(null)
    try {
      let created = 0
      for (let i = 0; i < quantity; i++) {
        await addDoc(collection(db, "stockistPins"), {
          pin: generateRandomPin(10),
          packageType,
          status: "unused",
          createdAt: Timestamp.now(),
          usedAt: null,
          usedBy: null,
        })
        created++
      }
      setMessage(`Generated ${created} pin(s) for ${PACKAGE_OPTIONS.find(p => p.value === packageType)?.label}`)
    } catch (err: any) {
      setMessage("Failed to generate pins")
    }
    setGenerating(false)
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Generate Stockist PINs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {PACKAGE_OPTIONS.map(opt => (
            <Button
              key={opt.value}
              variant={packageType === opt.value ? "default" : "outline"}
              className="w-full"
              onClick={() => setPackageType(opt.value)}
              disabled={generating}
            >
              {opt.label}
            </Button>
          ))}
        </div>
        <div className="flex items-end gap-4 mb-4">
          <div>
            <Label htmlFor="stockist-pin-qty">Quantity</Label>
            <Input
              id="stockist-pin-qty"
              type="number"
              min={1}
              max={100}
              value={quantity}
              onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
              disabled={generating}
              className="w-24"
            />
          </div>
          <Button onClick={handleGenerate} disabled={generating || quantity < 1}>
            {generating ? "Generating..." : "Generate PINs"}
          </Button>
        </div>
        {message && (
          <div className="mt-2 text-sm text-green-700">{message}</div>
        )}
      </CardContent>
    </Card>
  )
}
