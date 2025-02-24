const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger.json');

dotenv.config();
const app = express();

// Middleware for JSON and CORS
app.use(express.json());
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Mount routes
const quotesRoutes = require('./routes/quotes');
const favoritesRoutes = require('./routes/favorites');
const recommendationsRoutes = require('./routes/recommendations');

app.use('/api/quotes', quotesRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/recommendations', recommendationsRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
