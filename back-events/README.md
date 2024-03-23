# Stolen from PWS_HW3
Stolen from Programming Web Systems HW3. 

| Name           | ID        |
| -------------- | --------- |
| Alina Broitman | 321934275 |
| Assaf Alon     | 207376807 |

# Backend microservice - Authentication, Authorization, API Gateway

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
| GET    | /api/event[?limit={limit}&skip={skip}] | Gets upcomming events that still have tickets for sale. |
| GET    | /api/event/all[?limit={limit}&skip={skip}] | Gets unfiltered events. (only for authorized users in BO) |
| POST   | /api/event/{id} | Get the data of the specifiied even |
| POST   | /api/event | Add an event. (only for authorized users in BO) |

**THIS API ISN'T FINAL. WE ARE INDECISIVE**