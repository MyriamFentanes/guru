## Adding a new asana

1. Copy `_template/` to a new folder named after the asana's slug (lowercase, hyphenated — must match the `slug` field), e.g. `content/asanas/warrior-two/`.
2. Add the image as `image.jpeg` (or update the `image` field to match whatever filename you use) inside that folder.
3. Fill in `meta.json`. Field reference and validation rules live in [`asana.schema.json`](./asana.schema.json) — most editors (VS Code included) will pick up the `$schema` reference in the template and give you inline validation and autocomplete.
4. Leave `verified: false` until a teacher has reviewed the entry, then flip it to `true`.

Folders starting with `_` (like `_template`) are not real asanas and must be skipped by any code that lists/indexes this directory.
