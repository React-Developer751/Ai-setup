// The embedding models that can be used, and the one in use. Each lives in public/models/<name>/ and has its own
// example vectors in public/models/vectors/<key>/ (built by `npm run build:embeddings -- --model=<key>`).
export type EmbeddingModel = {
  name: string
  /** some models want a short prefix in front of the text they embed */
  prefix: string
  /** size of the file the page downloads once */
  megabytes: number
  note: string
}

export const EMBEDDING_MODELS: Record<string, EmbeddingModel> = {
  'all-MiniLM-L6-v2': { name: 'Xenova/all-MiniLM-L6-v2', prefix: '', megabytes: 23, note: 'English, small and fast' },
  'multilingual-e5-small': { name: 'Xenova/multilingual-e5-small', prefix: 'query: ', megabytes: 118, note: '100 languages incl. Hindi' },
}

/** the model used when nothing else is chosen: the multilingual one understood Hinglish and Hindi much better in `npm run eval` */
export const ACTIVE_MODEL = 'multilingual-e5-small'
