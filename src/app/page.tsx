"use client"

import { useState } from "react"
import { Label } from "@ui/label"
import { Input } from "@ui/input"
import { Button } from "@ui/button"
import { Alert, AlertDescription } from "@ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card"
import CharacterProfileView from "@/components/character/character-profile-view"
import type { CharacterProfile, CharacterNameInput } from "@/lib/schemas/character"

export default function Home() {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<CharacterProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setProfile(null)
    const trimmed = name.trim()
    if (!trimmed) return
    setLoading(true)
    try {
      const res = await fetch("/api/character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed } satisfies CharacterNameInput),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? "エラーが発生しました")
        return
      }
      setProfile(data as CharacterProfile)
    } catch {
      setError("ネットワークエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>キャラクタープロフィール生成</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-3">
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
                {loading ? "生成中..." : "生成"}
              </Button>
              <Button type="button" variant="secondary" disabled={loading} onClick={() => { setName(""); setProfile(null); setError(null); }}>クリア</Button>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>

      {profile && (
        <div className="space-y-4">
          <CharacterProfileView profile={profile} />
        </div>
      )}
    </div>
  );
}
