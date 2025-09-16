import React from "react"
import { Badge } from "@ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/table"
import { Progress } from "@ui/progress"
import { Separator } from "@ui/separator"
import { ScrollArea } from "@ui/scroll-area"
import type { CharacterProfile } from "@/lib/schemas/character"

type CharacterProfileViewProps = {
  profile: CharacterProfile
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function List({ items }: { items: string[] }) {
  if (!items?.length) return null
  return (
    <ul className="list-disc pl-6 space-y-1">
      {items.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  )
}

export function CharacterProfileView({ profile }: CharacterProfileViewProps) {
  const { meta, identity, description, appearance, personality, background, capabilities, relationships, story, voice, setting } = profile

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{identity.name}</CardTitle>
              <CardDescription>
                {identity.role_or_occupation} ・ {identity.species_or_race} ・ {identity.age}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {meta.tags?.slice(0, 8).map((tag, idx) => (
                <Badge key={`${tag}-${idx}`} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">別名</div>
              <div className="flex flex-wrap gap-2">
                {identity.aliases?.length ? identity.aliases.map((a, i) => <Badge key={`${a}-${i}`}>{a}</Badge>) : <span className="text-muted-foreground text-sm">(なし)</span>}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">メタ情報</div>
              <div className="text-sm grid grid-cols-2 gap-y-1">
                <span className="text-muted-foreground">ID</span>
                <span className="truncate">{meta.id}</span>
                <span className="text-muted-foreground">言語</span>
                <span>{meta.language}</span>
                <span className="text-muted-foreground">バージョン</span>
                <span>{meta.version}</span>
                <span className="text-muted-foreground">更新日時</span>
                <span>{meta.updated_at}</span>
                <span className="text-muted-foreground">作成者</span>
                <span>{meta.created_by}</span>
                <span className="text-muted-foreground">ライセンス</span>
                <span>{meta.license}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Section title="概要" description="キャラクターの要約">
        <p className="leading-relaxed whitespace-pre-wrap">{description}</p>
      </Section>

      <Accordion type="multiple" className="grid gap-4">
        <AccordionItem value="appearance">
          <AccordionTrigger>外見</AccordionTrigger>
          <AccordionContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid grid-cols-[120px_1fr] gap-y-1 text-sm">
                <span className="text-muted-foreground">身長</span>
                <span>{appearance.height}</span>
                <span className="text-muted-foreground">体型</span>
                <span>{appearance.build}</span>
                <span className="text-muted-foreground">服装</span>
                <span>{appearance.clothing_style}</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">特徴</div>
                  <List items={appearance.distinct_features} />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">カラーパレット</div>
                  <div className="flex flex-wrap gap-2">
                    {appearance.color_palette?.map((c, i) => (
                      <Badge key={`${c}-${i}`} variant="outline">{c}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="personality">
          <AccordionTrigger>性格</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{personality.summary}</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">長所</div>
                  <List items={personality.traits_positive} />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">短所</div>
                  <List items={personality.traits_negative} />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">価値観</div>
                  <List items={personality.values} />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">癖</div>
                  <List items={personality.quirks} />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">動機</div>
                  <List items={personality.motivations} />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">恐れ</div>
                  <List items={personality.fears} />
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-y-1 text-sm">
                  <span className="text-muted-foreground">気質</span>
                  <span>{personality.temperament}</span>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="background">
          <AccordionTrigger>背景</AccordionTrigger>
          <AccordionContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid grid-cols-[120px_1fr] gap-y-1 text-sm">
                <span className="text-muted-foreground">出生地</span>
                <span>{background.birthplace}</span>
                <span className="text-muted-foreground">学歴</span>
                <span>{background.education}</span>
                <span className="text-muted-foreground">文化</span>
                <span>{background.culture}</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">家族</div>
                  <List items={background.family} />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">形成的出来事</div>
                  <List items={background.formative_events} />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="capabilities">
          <AccordionTrigger>能力・装備</AccordionTrigger>
          <AccordionContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">スキル</div>
                <List items={capabilities.skills} />
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">魔法・能力</div>
                <List items={capabilities.powers_or_magic} />
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">装備</div>
                <List items={capabilities.equipment} />
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">弱点</div>
                <List items={capabilities.weaknesses} />
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-muted-foreground mb-1">制約・コスト</div>
                <List items={capabilities.constraints_or_costs} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="relationships">
          <AccordionTrigger>関係性</AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="w-full max-w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>相手</TableHead>
                    <TableHead>種類</TableHead>
                    <TableHead>状態</TableHead>
                    <TableHead>信頼</TableHead>
                    <TableHead>愛情</TableHead>
                    <TableHead>緊張</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relationships?.length ? (
                    relationships.map((rel, idx) => (
                      <TableRow key={`${rel.name_or_id}-${idx}`}>
                        <TableCell>{rel.name_or_id}</TableCell>
                        <TableCell>{rel.type}</TableCell>
                        <TableCell>{rel.status}</TableCell>
                        <TableCell className="min-w-40">
                          <div className="flex items-center gap-2">
                            <Progress value={Math.round(rel.metrics.trust * 100)} />
                            <span className="text-xs text-muted-foreground w-10 text-right">{Math.round(rel.metrics.trust * 100)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-40">
                          <div className="flex items-center gap-2">
                            <Progress value={Math.round(rel.metrics.affection * 100)} />
                            <span className="text-xs text-muted-foreground w-10 text-right">{Math.round(rel.metrics.affection * 100)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-40">
                          <div className="flex items-center gap-2">
                            <Progress value={Math.round(rel.metrics.tension * 100)} />
                            <span className="text-xs text-muted-foreground w-10 text-right">{Math.round(rel.metrics.tension * 100)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground">関係データはありません</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="story">
          <AccordionTrigger>ストーリー</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">短期目標</div>
                  <List items={story.goals.short_term} />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">長期目標</div>
                  <List items={story.goals.long_term} />
                </div>
                <div className="md:col-span-2 grid grid-cols-[120px_1fr] gap-y-1 text-sm">
                  <span className="text-muted-foreground">賭け・ステークス</span>
                  <span>{story.stakes}</span>
                  <span className="text-muted-foreground">障害</span>
                  <span>
                    <List items={story.obstacles} />
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">物語アーク</div>
                  <div className="grid grid-cols-[120px_1fr] gap-y-1 text-sm">
                    <span className="text-muted-foreground">導入</span>
                    <span>{story.arc.setup}</span>
                    <span className="text-muted-foreground">欠点の露呈</span>
                    <span>{story.arc.flaws_exposed}</span>
                    <span className="text-muted-foreground">転換点</span>
                    <span>{story.arc.turning_points.join(" / ")}</span>
                    <span className="text-muted-foreground">成長</span>
                    <span>{story.arc.growth}</span>
                    <span className="text-muted-foreground">解決</span>
                    <span>{story.arc.resolution}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">タイムライン</div>
                  <ScrollArea className="w-full max-w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>日付</TableHead>
                          <TableHead>年齢</TableHead>
                          <TableHead>出来事</TableHead>
                          <TableHead>概要</TableHead>
                          <TableHead>影響</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {story.timeline?.length ? (
                          story.timeline.map((t, i) => (
                            <TableRow key={`${t.date}-${i}`}>
                              <TableCell>{t.date}</TableCell>
                              <TableCell>{t.age}</TableCell>
                              <TableCell>{t.title}</TableCell>
                              <TableCell className="max-w-[24rem] whitespace-pre-wrap">{t.summary}</TableCell>
                              <TableCell className="max-w-[16rem] whitespace-pre-wrap">{t.impact}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-muted-foreground">タイムラインはありません</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="voice">
          <AccordionTrigger>口調・ボイス</AccordionTrigger>
          <AccordionContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid grid-cols-[120px_1fr] gap-y-1 text-sm">
                <span className="text-muted-foreground">語彙</span>
                <span>{voice.diction}</span>
                <span className="text-muted-foreground">トーン</span>
                <span>{voice.tone}</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">口癖</div>
                  <div className="flex flex-wrap gap-2">
                    {voice.catchphrases?.map((c, i) => (
                      <Badge key={`${c}-${i}`} variant="outline">{c}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">セリフ例</div>
                  <List items={voice.dialogue_examples} />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="setting">
          <AccordionTrigger>世界観・舞台</AccordionTrigger>
          <AccordionContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid grid-cols-[120px_1fr] gap-y-1 text-sm">
                <span className="text-muted-foreground">世界</span>
                <span>{setting.world}</span>
                <span className="text-muted-foreground">時代</span>
                <span>{setting.era}</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">場所</div>
                  <div className="flex flex-wrap gap-2">
                    {setting.locations?.map((loc, i) => (
                      <Badge key={`${loc}-${i}`} variant="secondary">{loc}</Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-y-1 text-sm">
                  <span className="text-muted-foreground">技術/魔法ルール</span>
                  <span>{setting.tech_level_or_magic_rules}</span>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default CharacterProfileView


