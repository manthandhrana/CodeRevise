// Merges src/data/_parts/<track>/*.json into src/data/<track>.json
//  - _meta.json  : track meta (id, title, tagline, description, color)
//  - NN-*.json   : one SECTION object each (sorted by file name)
// For the "practice" track every part file is an ARRAY of questions -> practice.json { questions: [...] }
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const partsRoot = path.join(root, 'src', 'data', '_parts')
const outDir = path.join(root, 'src', 'data')
const only = process.argv[2]

let failed = false
for (const track of fs.readdirSync(partsRoot)) {
  if (only && only !== track) continue
  const dir = path.join(partsRoot, track)
  if (!fs.statSync(dir).isDirectory()) continue
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && f !== '_meta.json').sort()
  try {
    const parse = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
    let out
    if (track === 'practice') {
      out = { questions: files.flatMap((f) => parse(f)) }
      console.log(`practice: ${out.questions.length} questions`)
    } else {
      const meta = parse('_meta.json')
      out = { ...meta, sections: files.map(parse) }
      const topics = out.sections.reduce((n, s) => n + s.topics.length, 0)
      console.log(`${track}: ${out.sections.length} sections, ${topics} topics`)
    }
    fs.writeFileSync(path.join(outDir, `${track}.json`), JSON.stringify(out, null, 1))
  } catch (e) {
    failed = true
    console.error(`FAILED ${track}:`, e.message)
  }
}
process.exit(failed ? 1 : 0)
