# Your data pool (`dataPool.json`)

Put your own content here (blog posts, team members, reviews, FAQ entries, gallery captions). The generator draws from it
every time it makes a website: **a different selection and order for every prompt and every "Another variation"**, so
a big pool gives sites that rarely look the same. Anything the pool cannot fill is written by the generator as before.

Edit the file, save, and the page reloads with your data. Check the file any time with:

```bash
npm run pool:check
```

## Sections

Every section is a list. All fields except the main ones are optional.

| Section   | Main fields                          | Optional fields                                              |
| --------- | ------------------------------------ | ------------------------------------------------------------ |
| `posts`   | `title`, `body`                      | `tag`, `excerpt`, `author`, `role`, `date`, `readTime`, `slug`, `for` |
| `team`    | `name`, `role`                       | `bio`, `for`                                                 |
| `reviews` | `quote`, `author`                    | `role`, `for`                                                |
| `faq`     | `q`, `a`                             | `for`                                                        |
| `gallery` | `caption` (or just a string)         | `for`                                                        |
| `businesses` | `name`                            | `tagline`, `about`, `services`, `plans`, `email`, `phone`, `address`, `hours`, `for` |

* **`for`**: show the entry only for some businesses. Use a business type (`bold_fitness`, `food_dining`, `healthcare`,
  `real_estate` ... see `THEME_KEYS` in `src/generator/themes.ts`) and/or words that appear in the prompt (`gym`, `bakery`).
  Leave it out and the entry fits every business.
* **`{brand}`** and **`{subject}`** inside any text become the business name and what it does.
* **`posts.body`** is either a list of blocks (`{"type":"p","text":"..."}`, `h2`, `quote`, and `{"type":"list","items":[...]}`)
  or one string written like this: blank line between paragraphs, `## Heading`, `> quote`, lines starting with `- ` for a list.
* **`posts.date`**: `2026-03-12` or any text. Without a date the generator gives the post one.

## Settings

```json
"settings": { "mode": "pool-first" }
```

* `pool-first` (default): your entries first, the generator fills the rest up to the usual number.
* `only`: use only your entries when there is at least one for that section (nothing is invented).

The entries that are in the file now are examples. Replace or delete them.

## Importing data from outside

You do not have to write the JSON by hand. Give the import brain what you already have, in almost any shape, and it works out
what it is, cleans it and adds it to the pool:

| What you have                                             | What the brain recognises                                   |
| --------------------------------------------------------- | ----------------------------------------------------------- |
| A WordPress / CMS export, a list of articles              | blog posts (title, text, excerpt, author, date, category)   |
| A users / staff / members list (CSV, API response ...)    | team (name, job title, short bio; permissions like "admin" are not job titles) |
| Reviews, comments, testimonials (with or without ratings) | reviews (ratings are normalised to 5, low ones are left out) |
| Questions and answers, or "Q: ... A: ..." text            | FAQ                                                         |
| A list of photos with titles, or just short phrases       | gallery captions                                            |
| One object with a name, tagline, services, prices, hours  | a business profile: used whenever a prompt names that business |
| Markdown / text split by `---` or `# headings`, an HTML page | blog posts                                              |

**In the page**: open *Import data*, choose files or paste, press *Analyse*. It shows what it understood for every list (with
a "% sure" and the fields it read), and you can change the guess with the drop-down before pressing *Use*. The entries are
remembered in this browser; *Download dataPool.json* saves them as a file for the project.

**From the terminal** (writes into `src/data/dataPool.json`, the old file is kept as `.bak`):

```bash
npm run pool:import -- export.json users.csv --dry      # only show what it understood
npm run pool:import -- export.json users.csv            # add it to the pool
npm run pool:import -- notes.md --as=posts              # say what the file is
npm run pool:import -- reviews.csv --scope=all --min-rating=4
```

What the cleaning does: HTML and Markdown become plain text, entities are decoded, **emails, phone numbers and links inside texts are
removed**, dates are normalised (`12/03/2026` is read as 12 March), duplicates and placeholder text (lorem ipsum) are dropped,
ratings below 3.5 of 5 are left out, and each entry is labelled with the business type its own words fit (or the topic of the
rest of the import). Small samples to try are in `src/data/examples/`.

### A business profile

When a prompt names a business that is in the pool (`Iron Pulse Gym`), the site uses its own tagline, about text, services, plans
(prices), contact details and opening hours instead of inventing them. Fields: `name`, `tagline`, `about` (list of paragraphs),
`services` (`title`, `text`), `plans` (`name`, `price`, `period`, `perks`), `email`, `phone`, `address`, `hours` (`day`, `time`),
and optional `for`.
