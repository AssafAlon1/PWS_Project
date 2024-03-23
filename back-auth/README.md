# Backend microservice - Authentication, Authorization, API Gateway

# Authors
| Name           | ID        |
| -------------- | --------- |
| Alina Broitman | 321934275 |
| Assaf Alon     | 207376807 |

## Introduction
Shamelessly stolen from Workshop3, which had a skeleton provided by the wonderful course staff (😇😇😇(Give us 100)😇😇😇)

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
| POST    | /api/login | Login with username and password |
| POST    | /api/logout | Logout |
| POST    | /api/signup | Sign up a new user with username and password |
| GET     | /api/username | Gets the username of the current user |
