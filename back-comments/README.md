# Backend microservice - Comments

## Authors
| Name           | ID        |
| -------------- | --------- |
| Alina Broitman | 321934275 |
| Assaf Alon     | 207376807 |


## Introduction
Shamelessly stolen from Workshop2, which had a skeleton provided by the wonderful course staff (😇😇😇(Give us 100)😇😇😇)

1. **Build:**

     ```bash
     npm run build
     ```

   This command generates a production-ready build in the `dist` folder.

2. **Run Development Server:**

     ```bash
     npm run dev
  

## API Routes

Your API should support the following endpoints:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/comment/{id} | Returns a comment with a certain id. *(deprecated)* |
| GET    | /api/comment/{event_id}?skip={skip}&limit={limit} | Returns multiple comments with pagination enforced for a specific event. |
| POST   | /api/comment | Creates a new comment. |

**THIS API ISN'T FINAL. WE ARE INDECISIVE**
