# Error Codes

Error codes follow the format `major.minor.patch`:

- **major** — microservice identifier. Always `1` for `simple-note-core-ms`.
- **minor** — error type category (see table below).
- **patch** — unique identifier within that category.

## Minor categories

| Minor | Error type              |
|-------|-------------------------|
| 1     | UnknownError            |
| 2     | BadRequestError         |
| 3     | UnauthorizedError       |
| 4     | NotFoundError           |
| 5     | ForbiddenError          |
| 6     | ServiceUnavailableError |

---

## Error registry

| Code  | HTTP | Type                    | Message                                   | Location                        |
|-------|------|-------------------------|-------------------------------------------|---------------------------------|
| 1.1.1 | 500  | UnknownError            | Unknown error                             | BaseController.getErrorWrapper  |
| 1.2.1 | 400  | BadRequestError         | Request body must be valid JSON           | SimpleNoteController.parseBody  |
| 1.2.2 | 400  | BadRequestError         | Zod validation message (createNote)       | SimpleNoteController.createNote |
| 1.2.3 | 400  | BadRequestError         | noteId path parameter is required         | SimpleNoteController.updateNote |
| 1.2.4 | 400  | BadRequestError         | Zod validation message (updateNote)       | SimpleNoteController.updateNote |
| 1.2.5 | 400  | BadRequestError         | noteId path parameter is required         | SimpleNoteController.deleteNote |
| 1.4.1 | 404  | NotFoundError           | Note not found                            | NoteService.updateNote          |
| 1.4.2 | 404  | NotFoundError           | Note not found                            | NoteService.deleteNote          |
