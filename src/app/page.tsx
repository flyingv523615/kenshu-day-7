"use client"

import { useState } from "react"
import { Label } from "@ui/label"
import { Input } from "@ui/input"
import { Button } from "@ui/button"

export default function Home() {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setResult(null)
    const trimmed = name.trim()
    if (!trimmed) return
    setLoading(true)
    try {
      const res = await fetch("/api/character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data?.error ?? "エラーが発生しました")
      } else {
        setResult(data.name)
      }
    } catch {
      setError("ネットワークエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="text-lg font-medium">こんにちは</div>
      <form onSubmit={onSubmit} className="grid gap-3 max-w-md">
        <div className="grid gap-2">
          <Label htmlFor="character">漫画キャラクター名</Label>
          <Input
            id="character"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：ルフィ、ナルト、ドラえもん"
            disabled={loading}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={loading || name.trim().length === 0}>
            {loading ? "送信中..." : "送信"}
          </Button>
        </div>
        {result && (
          <div className="text-sm text-muted-foreground">
            送信した名前: {result}
          </div>
        )}
        {error && (
          <div className="text-sm text-destructive">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
