# Backend microservice - Tickets API
Stolen from Programming Web Systems HW3. 

## Authors
| Name           | ID        |
| -------------- | --------- |
| Alina Broitman | 321934275 |
| Assaf Alon     | 207376807 |


## Introduction

Base was stolen from HW3, which had a skeleton provided by the wonderful course staff (😇😇😇(Give us 100)😇😇😇)

1. **Build:**

     ```bash
     npm run build
     ```

   This command generates a production-ready build in the `dist` folder.

2. **Run Development Server:**

     ```bash
     npm run dev
     ```

## API Routes

Supported API endpoints:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/ticket/{event_id}[?limit={limit}&skip={skip}] | Gets available tickets for the specified event. |
| GET    | /api/ticket/all/{event_id}[?limit={limit}&skip={skip}] | Gets unfiltered tickets for the specified event. (only for authorized users in BO) |
| PUT    | /api/ticket/{id}[?limit={limit}&skip={skip}] | Updates the amount of tickets available for the specified ticket. |
| POST   | /api/ticket/{event_id} | Add tickets to the specified event. (only for authorized users in BO) |

**THIS API ISN'T FINAL. WE ARE INDECISIVE**