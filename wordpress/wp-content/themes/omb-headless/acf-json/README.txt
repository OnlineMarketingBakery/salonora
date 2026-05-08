ACF Local JSON (ACF official format: one JSON file per field group)

- Regenerate all files from the repo after editing the bundle:
  npm run acf:extract-local-json
- Do NOT put acf-import-bundle.json in this folder (that file is a JSON *array* for bulk import only).
- Bulk bundle for REST push: ../acf-import-bundle.json (theme root) -> npm run acf:push
