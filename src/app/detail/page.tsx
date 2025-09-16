import path from "path"
import { readFile } from "fs/promises"
import { Alert, AlertDescription } from "@ui/alert"
import CharacterProfileView from "@/components/character/character-profile-view"
import type { CharacterProfile } from "@/lib/schemas/character"

export const runtime = 'nodejs'

type DetailPageProps = {
  searchParams: Promise<{ file?: string }>
}

export default async function DetailPage({ searchParams }: DetailPageProps) {
  const { file } = await searchParams

  if (!file || !/^[\w\-]+\.json$/.test(file)) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>file パラメータが不正です</AlertDescription>
        </Alert>
      </div>
    )
  }

  const filePath = path.join(process.cwd(), 'src', 'datas', file)

  try {
    const content = await readFile(filePath, 'utf-8')
    const data = JSON.parse(content) as CharacterProfile
    return (
      <div className="p-6 space-y-6">
        <CharacterProfileView profile={data} />
      </div>
    )
  } catch {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>ファイルの読み込みに失敗しました</AlertDescription>
        </Alert>
      </div>
    )
  }
}


