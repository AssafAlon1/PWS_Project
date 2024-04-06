# Backend microservice - User Actions

## Authors
| Name           | ID        |
| -------------- | --------- |
| Alina Broitman | 321934275 |
| Assaf Alon     | 207376807 |


## Introduction
Original creation for user action microservice

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
| Method | Endpoint                                      | Description                                        |
| ------ | --------------------------------------------- | -------------------------------------------------- |
| GET    | /api/closest_event                            | Gets the user's upcoming event.                    |
| GET    | /api/user_actions[?limit={limit}&skip={skip}] | Gets all user's actions with specified pagination. |
| PUT    | /api/user_actions                             | Adds a refund to an existing buy action.           |

**THIS API ISN'T FINAL. WE ARE INDECISIVE**
