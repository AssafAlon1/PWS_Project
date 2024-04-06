# Backend microservice - Events API
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
| Method | Endpoint                                   | Description                                                       |
| ------ | ------------------------------------------ | ----------------------------------------------------------------- |
| GET    | /api/event[?limit={limit}&skip={skip}]     | Gets upcomming events that still have tickets for sale.           |
| GET    | /api/event/all[?limit={limit}&skip={skip}] | Gets unfiltered events. (only for authorized users in BO)         |
| GET    | /api/event/{id}                            | Gets the data of the specifiied even (regular users)              |
| GET    | /api/event/backoffice/{id}                 | Gets the data of the specifiied even (for authorized users in BO) |
| GET    | /api/closest_event                         | Gets the closest upcoming event (NOT exposed to gateway)          |
| POST   | /api/event                                 | Add an event. (only for authorized users in BO)                   |
| PUT    | /api/event/{id}/postpone                   | Postpone an event. (only for authorized users in BO)              |

**THIS API ISN'T FINAL. WE ARE INDECISIVE**