# Quotes API

This project is a simple API built using Express.js and Prisma to manage quotes and favorites. The API allows users to fetch random quotes, view their favorite quotes, and manage them.

## Features

- Fetch 100 random quotes.
- Manage favorite quotes for users.
  - View all favorite quotes.
  - Add quotes to favorites.
  - Remove quotes from favorites.

## Technologies Used

- **Node.js** - Backend runtime
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Docker** - Containerization
- **GitHub Actions** - CI/CD automation
- **Raspberry Pi** - Deployment environment

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/Navong/quote-nextjs-backend.git
   ```

2. Install dependencies:
   ```sh
   cd quote-nextjs-backend
   npm install
   ```

3. Create a `.env` file with the following content:
   ```env
   DATABASE_URL=your_database_url_here
   PORT=4000
   ```

4. Start the server:
   ```sh
   npm start
   ```

## API Endpoints

### Get 100 Random Quotes
```
GET /api/quotes/random
```

### Get All Favorite Quotes for a User
```
GET /api/favorites/:userId
```

### Add a Quote to Favorites
```
POST /api/favorites
```
**Body:**
```json
{
  "userId": "123",
  "quoteId": 1,
  "translatedText": "Optional translated quote"
}
```

### Remove a Quote from Favorites
```
DELETE /api/favorites/:userId
```
**Body:**
```json
{
  "quoteId": 1
}
```

## CI/CD Pipeline

This project uses GitHub Actions to automate the deployment process to a Raspberry Pi server.

### Workflow Overview

1. **Trigger:** On push to the `main` branch.
2. **Build and Push Docker Image:**
    - Logs into Docker Hub.
    - Builds and pushes the Docker image.
3. **Deploy to Raspberry Pi:**
    - Clones the repository if not already present.
    - Pulls the latest Docker image.
    - Runs the container using `docker-compose`.

### GitHub Actions Workflow

The CI/CD workflow configuration can be found in the repository at:

```
.github/workflows/main.yml
```

## License

This project is licensed under the MIT License.

