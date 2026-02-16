# Swagger / OpenAPI Usage

The OpenAPI specification for this project is:

- `docs/openapi.yaml`

## View in Swagger Editor

1. Open https://editor.swagger.io/
2. Copy and paste `docs/openapi.yaml`
3. Validate endpoints, schemas, examples, and responses.

## View Locally (Swagger UI)

If you want a local Swagger UI quickly:

```bash
npx swagger-ui-watcher docs/openapi.yaml --port 8081
```

Then open `http://localhost:8081`.
