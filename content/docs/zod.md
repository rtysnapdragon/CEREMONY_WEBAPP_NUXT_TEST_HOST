# Zod Validation Guide (Nuxt UI + RForm + RInput)

## 1. What is Zod?

Zod is a **schema validation library** used to:

- Validate form inputs
- Ensure correct data types
- Show user-friendly error messages
- Protect API requests from invalid data

Example:

```ts
z.string()
z.email()
z.number()  