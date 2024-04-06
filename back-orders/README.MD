# Backend microservice - Orders

## Authors
| Name           | ID        |
| -------------- | --------- |
| Alina Broitman | 321934275 |
| Assaf Alon     | 207376807 |


## Introduction
Original creation for orders microservice (Doesn't have a DB, so we at least gave him this...)

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
| Method | Endpoint    | Description                                        |
| ------ | ----------- | -------------------------------------------------- |
| POST   | /api/buy    | Buy tickets. (send request to payment provider)    |
| POST   | /api/refund | Refund tickets. (send request to payment provider) |

**THIS API ISN'T FINAL. WE ARE INDECISIVE**
