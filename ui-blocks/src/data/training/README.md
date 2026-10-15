# Teaching the generator (training data and models)

The generator understands a prompt ("tooth doctor in Indore") and a piece of imported text ("Best gym in the area, loved it") in three ways
that work together:

| Source | What it knows | Needs |
| --- | --- | --- |
| **rules** (`themeClassifier.ts`, `kits/`) | exact keywords of each business type | nothing |
| **learned model** (`ml/sparseModel.ts`, `src/data/models/*.json`) | many phrasings, spelling variants, romanised Hindi, learned from the examples in this folder | nothing (it is part of the app) |
| **meaning** (`ml/embeddings.ts`, optional "Smart understanding") | what the words *mean*: "tooth doctor" ~ "dentist" without sharing a word | a model file: `npm run models:download` (23 or 118 MB) |

Every source gives a probability for each business type; `ml/ensemble.ts` averages them with weights chosen by `npm run eval` (on the
training data, never the test data). If nobody is sure enough, the page falls back to a neutral "general business" instead of a confident
wrong answer.

## The data (this folder)

| File | What it is |
| --- | --- |
| `LABELS.md` | the 20 business types and exactly what each covers |
| `themes.train.jsonl`, `hinglish.train.jsonl` | what people type to describe a website → business type (English, Hinglish, Hindi) |
| `themes.test.jsonl`, `hinglish.test.jsonl` | a separate, harder set used only to measure accuracy |
| `kinds.train.jsonl`, `kinds.test.jsonl` | a piece of text → what it is: `post`, `review`, `faq`, `team`, `gallery`, `business` (for the importer) |
| `raw/` | the files the examples were written in, before they were merged |

One line = one example: `{"text": "mera salon hai Surat me, website chahiye", "label": "beauty_wellness"}`.

## Teach it something new

1. **Add examples** to the `*.train.jsonl` files (20 to 100 lines for a business type it gets wrong is plenty; vary the wording).
   For a **new business type**: add a kit in `src/generator/kits/` (copy, words, colours), add the label to `LABELS.md`, and add 100+ examples.
2. `npm run train` — trains both models (about 2 minutes) and shows the accuracy on the test files.
3. `npm run build:embeddings -- --model=multilingual-e5-small` (and `--model=all-MiniLM-L6-v2`) — only if you use Smart understanding: it
   re-reads the examples with the embedding model.
4. `npm run eval -- --model=multilingual-e5-small --write` (also `--model=all-MiniLM-L6-v2`, and `--model=none` for no embedding model) —
   measures every source and the blend, and writes the best weights to `src/data/models/ensemble.json`. Add `--errors` to list the prompts
   it gets wrong.
5. `npm run eval:kinds` — the same for the text kinds.

Keep the test files honest: never copy a training line into them. They are how you know whether something really got better.

## Teach it while you use it

In the page, under the prompt: **Understood as …** shows the business type, how sure it is and which sources decided. If it is wrong,
choose the right one in *Not right?* — it learns it at once (and for that exact text it never gets it wrong again). *Download corrections*
gives a `corrections.jsonl`; train with it so the lesson becomes part of the model for everyone:

```bash
npm run train -- --feedback=corrections.jsonl
```

👍 / 👎 on a site is saved too (*Download ratings*): a record of which layouts you liked, for later.

## Smart understanding (the embedding model)

Tick *Smart understanding* in the page. The first time it downloads the model file from the app's own server (nothing leaves your
computer): **23 MB** English-only or **118 MB** multilingual (recommended: it understands Hindi and Hinglish much better). It is also used by the
importer, to recognise what an imported text is, and from the terminal with `npm run pool:import -- file.json --smart`.

Get the model files once (they are not kept in git):

```bash
npm run models:download -- --all      # or --model=all-MiniLM-L6-v2
npm run build:embeddings -- --model=multilingual-e5-small
```

## How good is it? (`npm run eval`, 660 unseen, deliberately hard prompts)

See `src/data/models/eval-report.json` for the latest numbers. The test prompts include one-word prompts ("rewind"), borderline businesses
and Hinglish, so these numbers are lower than what ordinary prompts get.
