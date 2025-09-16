import { Card, CardContent, CardHeader, CardTitle } from "@ui/card"
import Link from "next/link"
import path from "path"
import { readdir } from "fs/promises"

export const runtime = 'nodejs'

export default async function ListPage() {
  const datasDir = path.join(process.cwd(), 'src', 'datas')
  let files: string[] = []
  try {
    const all = await readdir(datasDir, { withFileTypes: true })
    files = all
      .filter((d) => d.isFile() && d.name.endsWith('.json'))
      .map((d) => d.name)
      .sort()
      .reverse()
  } catch {
    files = []
  }

  return (
    <div className="p-6 space-y-6">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>保存済みプロフィール一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-sm text-muted-foreground">保存されたファイルはありません</div>
          ) : (
            <ul className="space-y-2">
              {files.map((f) => (
                <li key={f}>
                  <Link className="text-blue-600 hover:underline" href={{ pathname: "/detail", query: { file: f } }}>
                    {f}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


