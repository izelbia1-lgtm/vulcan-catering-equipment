const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const words = (text: string) => normalize(text).split(' ').filter(Boolean)
const compact = (text: string) => normalize(text).replaceAll(' ', '')
const aliases = [
  { query: /\b(?:washers?|washer extractors?|washing machines?|wash machines?)\b/g, term: 'washer' },
  { query: /\b(?:(?:tumble )?dryers?)\b/g, term: 'dryer' },
  { query: /\b(?:roller irons?|ironing machines?|ironers?)\b/g, term: 'iron' },
]
const canonical = (text: string) => aliases.reduce((result, alias) => result.replace(alias.query, alias.term), normalize(text))
const generic = new Set(['machine', 'machines', 'equipment', 'product', 'products'])

export type SearchEntry<T> = {
  label: string
  kind: 'Product' | 'Category' | 'Brand' | 'Bundle' | 'Page'
  data: T
  keywords?: string[]
  details?: string[]
  models?: string[]
}

function distance(left: string, right: string) {
  const rows = Array.from({ length: left.length + 1 }, (_, i) => [i])
  rows[0] = Array.from({ length: right.length + 1 }, (_, i) => i)
  for (let i = 1; i <= left.length; i++) {
    for (let j = 1; j <= right.length; j++) {
      const cost = Number(left[i - 1] !== right[j - 1])
      rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && left[i - 1] === right[j - 2] && left[i - 2] === right[j - 1]) {
        rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1)
      }
    }
  }
  return rows[left.length][right.length]
}

export function createEquipmentSearch<T>(entries: SearchEntry<T>[]) {
  const index = entries.map(entry => {
    const primary = [entry.label, ...(entry.keywords ?? [])].join(' ')
    const details = [...(entry.models ?? []), ...(entry.details ?? [])].join(' ')
    return {
      entry, label: normalize(entry.label), primary: words(primary),
      related: words(canonical(primary)), details: words(details),
      models: (entry.models ?? []).map(model => ({ model, code: compact(model) })),
    }
  })
  const vocabulary = [...new Set(index.flatMap(row => row.primary).concat(['washer', 'dryer', 'ironing', 'machine']))]
  function rank(query: string) {
    const queryWords = words(query)
    const related = words(canonical(query)).filter(word => !generic.has(word))
    const specific = queryWords.filter(word => !generic.has(word))
    const code = compact(query)
    return index.flatMap(row => {
      const { entry } = row
      const exactModel = row.models.find(item => item.code === code)
      const partialModel = /\d/.test(code) && code.length >= 3 ? row.models.find(item => item.code.startsWith(code)) : undefined
      const bestModel = exactModel ?? partialModel
      const scoreWords = (tokens: string[], terms: string[]) => tokens.map(token =>
        terms.includes(token) ? 12 : token.length >= 2 && terms.some(term => term.startsWith(token)) ? 7 : 0)
      const tokens = specific.length ? specific : queryWords
      const relatedScores = scoreWords(related, row.related)
      const primaryScores = scoreWords(tokens, row.primary)
      const scores = scoreWords(tokens, row.details).map((score, i) => Math.max(primaryScores[i], score * .4))
      const exact = row.label === query
      let score = 0
      if (exactModel) score = 200
      else if (exact) score = 150
      else if (partialModel) score = 110
      else if (primaryScores.length && primaryScores.every(Boolean)) score = 40 + primaryScores.reduce<number>((total, value) => total + value, 0) +
        (row.label.startsWith(query) ? 20 : 0)
      else if (relatedScores.length && relatedScores.every(Boolean)) score = 20 + relatedScores.reduce<number>((total, value) => total + value, 0)
      else if (scores.length && scores.every(Boolean)) score = 10 + scores.reduce((total, value) => total + value, 0)
      return score ? [{ entry, score, model: bestModel?.model }] : []
    }).sort((a, b) => b.score - a.score || a.entry.label.localeCompare(b.entry.label))
  }

  return (value: string) => {
    const query = normalize(value)
    if (!query) return { hits: [], correction: undefined }
    const hits = rank(query)
    if (hits.length || query.length < 4) return { hits, correction: undefined }

    const corrected = words(query).map(word => {
      if (word === 'wachin') return 'washing'
      if (word.length < 4 || /\d/.test(word) || vocabulary.some(term => term.startsWith(word))) return word
      const threshold = word.length >= 7 ? 2 : 1
      const candidates = vocabulary.filter(term => term.length >= 4 && Math.abs(term.length - word.length) <= threshold)
        .map(term => ({ term, edits: distance(word, term) }))
        .filter(candidate => candidate.edits <= threshold)
        .sort((a, b) => a.edits - b.edits)
      if (candidates.length > 1 && candidates[0].edits === candidates[1].edits) {
        const [first, second] = candidates
        return second.term === first.term + 's' ? first.term : first.term === second.term + 's' ? second.term : word
      }
      return candidates[0]?.term ?? word
    }).join(' ')
    const correctedHits = corrected === query ? [] : rank(corrected)
    return { hits: correctedHits, correction: correctedHits.length ? corrected : undefined }
  }
}
