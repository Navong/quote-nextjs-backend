### 1. **Test Adding a Favorite (POST `/favorites/:userId`)**

**Request:**
- Method: `POST`
- URL: `http://localhost:3000/favorites/{userId}`
- Body (JSON):
```json
{
  "quoteId": "12345"
}
```
Replace `{userId}` with the actual `userId` you want to test.

**Expected Response:**
- Status Code: `201 Created`
- Body:
```json
{
  "id": 1, // or the actual favorite id
  "userId": "userId",
  "quoteId": "quoteId",
  // any other fields you included in the response
}
```

If the favorite already exists, you should get an error message:
```json
{
  "error": "Favorite already exists"
}
```

### 2. **Test Getting All Favorites for a User (GET `/favorites/:userId`)**

**Request:**
- Method: `GET`
- URL: `http://localhost:3000/favorites/{userId}`

Replace `{userId}` with the actual `userId` whose favorites you want to retrieve.

**Expected Response:**
- Status Code: `200 OK`
- Body:
```json
[
  {
    "id": 1,
    "userId": "userId",
    "quoteId": "12345",
    "quote": {
      "id": "12345",
      "text": "This is the quote text",
      // other quote details if included
    }
  },
  // More favorites if applicable
]
```

If the user has no favorites:
```json
[]
```

### 3. **Test Removing a Favorite (DELETE `/favorites/:userId`)**

**Request:**
- Method: `DELETE`
- URL: `http://localhost:3000/favorites/{userId}`
- Body (JSON):
```json
{
  "quoteId": "12345"
}
```

Replace `{userId}` with the actual `userId` and `quoteId` with the quote you want to remove.

**Expected Response:**
- Status Code: `200 OK`
- Body:
```json
{
  "id": 1,
  "userId": "userId",
  "quoteId": "12345"
}
```

If the favorite is not found:
```json
{
  "error": "Favorite not found"
}
```
