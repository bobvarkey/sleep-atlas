# Sleep Medicine Library — app dataset

Content extracted from five sleep-medicine PDFs, structured for an app: one markdown
file per chapter/case, figure images, and machine-readable indexes.

**660 MB · 5 books · 133 chapters/cases · 597,625 words · 1,202 figures · 731 page renders**

## What is where

```
sleep-medicine-app/
├── README.md              this file
├── index.md               human-readable table of contents for every book
├── catalog.json           machine-readable book/chapter index (start here in code)
└── books/
    └── <slug>/
        ├── book.md        book metadata + chapter list with links
        ├── figures.md     every figure: PDF page, file, caption
        ├── content.jsonl  paragraph-level records for search / ingestion
        ├── chapters/
        │   ├── 00-front-matter.md
        │   ├── 01-<title>.md
        │   └── ...
        ├── images/        native figures (p<page>-<n>.jpg|png)
        └── pages/         composed page renders (page-<page>.jpg)
```

Book folders:

| Slug | Book | Organised by | Files | Words | Figures | Page renders |
|---|---|---|---:|---:|---:|---:|
| `atlas-clinical-sleep-medicine` | Atlas of Clinical Sleep Medicine, 2nd ed. (Avidan) | chapters 1–21 | 21 | 193,878 | 726 | 374 |
| `atlas-sleep-medicine` | Atlas of Sleep Medicine (Krahn, Silber, Morgenthaler) | chapters 1–10 | 11 | 72,652 | 220 | 113 |
| `krygers-sleep-medicine-review` | Kryger's Sleep Medicine Review, 2nd ed. | sections 1–9 + appendices | 16 | 175,083 | 183 | 156 |
| `making-sense-of-sleep-medicine` | Making Sense of Sleep Medicine (Datta, Shrivastava) | chapters 1–27 in 5 parts | 28 | 81,034 | 31 | 26 |
| `oxford-case-histories-sleep-medicine` | Oxford Case Histories in Sleep Medicine (Makker et al.) | 55 cases in 4 sections | 57 | 74,978 | 42 | 62 |

## Chapter files

Each chapter file starts with YAML frontmatter, then the chapter body. Images are
linked relative to the chapter file (`../images/...`, `../pages/...`).

```markdown
---
book: "Atlas of Clinical Sleep Medicine"
book_slug: atlas-clinical-sleep-medicine
kind: chapter            # chapter | appendix | front-matter
chapter: 13              # null for front matter / appendices
title: "13 Sleep Breathing Disorders"
part: null               # section/part label when the book has one
pdf_pages: [272, 333]    # 1-based pages in the source PDF
printed_pages: [255, 316]
words: 21954
images: 163
---
# 13 Sleep Breathing Disorders

<!-- pdf-page: 272 -->
...body text...
![Composite page 272 — labels and figure together](../pages/page-272.jpg)
![Figure from PDF page 272](../images/p272-1.jpg)
```

Body conventions:

- `<!-- pdf-page: N -->` marks every source page — use these for citations and for
  mapping app scroll position back to the PDF.
- `#`/`##`/`###`/`####` are reconstructed from the PDF's typography (chapter title,
  section heads, sub-heads). Not every level is meaningful in every book.
- Figures appear as markdown images at the end of the page they occur on.
- Tables are kept as running text plus a composed page image, not as structured rows
  (see fidelity notes).

## catalog.json

```json
{
  "generated": "2026-11-17",
  "totals": { "books": 5, "chapters": 133, "words": 597625 },
  "books": [{
    "slug": "atlas-sleep-medicine",
    "title": "Atlas of Sleep Medicine",
    "book_md": "book.md",
    "figures_md": "figures.md",
    "content_jsonl": "content.jsonl",
    "chapter_count": 11,
    "word_count": 72652,
    "images": 220,
    "rendered_pages": 113,
    "chapters": [{
      "number": 6,
      "title": "Chapter 6 Sleep-Related Breathing Disorders",
      "part": null,
      "kind": "chapter",
      "file": "chapters/06-chapter-6-sleep-related-breathing-disorders.md",
      "pdf_pages": [68, 100],
      "printed_pages": [55, 87],
      "words": 14941,
      "images": 44
    }]
  }]
}
```

All `file` paths in `catalog.json` are relative to `books/<slug>/`.

## content.jsonl

One JSON object per line, ~45k records, for full-text search or importing into a
database. Types: `heading`, `paragraph`, `image`.

```json
{"book":"atlas-sleep-medicine","chapter":"Chapter 6 Sleep-Related Breathing Disorders","chapter_number":6,"pdf_page":68,"printed_page":55,"type":"paragraph","text":"The respiratory system is complex..."}
{"book":"atlas-sleep-medicine","chapter":"Chapter 6 Sleep-Related Breathing Disorders","chapter_number":6,"pdf_page":69,"printed_page":56,"type":"image","file":"images/p069-1.jpg"}
```

## Images

- `images/` — figures extracted from the PDF's embedded raster objects, deduplicated.
  Named `p<PDF page>-<index>.jpg|png`.
- `pages/` — a composed JPEG of the whole page, rendered for pages that carry figures,
  tables, or vector diagrams. **Use these when labels/arrows matter:** labels in these
  books are often vector text on top of a raster photo, so they exist only in the page
  render, not in the extracted figure.
- Images larger than 1800 px were downscaled for app packaging (JPEG q86). The source
  PDFs retain the originals.

## Per-book notes

- **Avidan, Atlas of Clinical Sleep Medicine (2nd ed.)** — The PDF contains a 62-page
  duplicated block: PDF pp. 334–395 repeat pp. 272–333 (printed pp. 255–316). Duplicates
  were removed. **Chapter 14 is missing from this source file** (bookmarks jump 13 → 15;
  the printed pages for chapter 14 do not appear anywhere in the PDF). The 21 files are
  front matter + chapters 1–13 and 15–21.
- **Kryger's Sleep Medicine Review** — Split by the book's nine sections plus six
  appendices. Each section interleaves questions, answers, summary, and references;
  the exam-style Q&A structure is preserved in reading order.
- **Making Sense of Sleep Medicine** — Split into its 27 chapters, grouped under the
  book's five parts (`part` frontmatter field). The source PDF emits harmless MuPDF
  annotation warnings; extraction was unaffected.
- **Oxford Case Histories in Sleep Medicine** — Split into the 55 individual cases
  (plus front matter and the closing "lists of cases" appendix). Each case frontmatter
  carries its section, e.g. `Section 1 Snoring and sleep-disordered breathing`.
- **Atlas of Sleep Medicine (Krahn)** — Chapters 1–10, plus front matter. Index/back
  cover excluded.

## Fidelity notes

- Text comes from the PDFs' text layer (no OCR was needed); extraction is column-aware
  and dehyphenates wrapped words.
- Running heads, page numbers, and copyright lines were stripped from body text; page
  identity is retained in the `pdf-page` comments.
- `printed_pages` is read from running heads and can occasionally be noisy (e.g. an
  early page number picked up from a front-matter page). `pdf_pages` is exact.
- Headings are inferred from font size/weight; occasional bold list labels or table
  cell labels can be promoted to headings.
- Tables are **not** converted to structured rows. Table content remains searchable as
  text, and any page with a table caption gets a `pages/page-NNN.jpg` render at 150 dpi
  so the printed table is available visually.
- Some pages are blank or section dividers in the source; they produce little or no
  text.

## Regenerating

The extractor lives outside this folder in `~/sleep-app-tools/`:

```bash
cd ~/sleep-app-tools
./venv/bin/python -I extract.py            # all books (expect several minutes)
./venv/bin/python -I build_index.py        # rebuild catalog.json + index.md
./venv/bin/python -I optimize_images.py    # optional downscale pass
```

Requires PyMuPDF and Pillow in `sleep-app-tools/venv`.

## Rights

The PDFs are locally held copies. This dataset is a format conversion for personal
app development; do not redistribute the extracted text or images.
