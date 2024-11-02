const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
require('dotenv').config();
const recommendedCache = {};

const prisma = new PrismaClient();
const app = express();

//json
app.use(express.json());

//cors
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Get 100 random quotes
app.get('/api/quotes/random', async (req, res) => {
  try {
    const count = await prisma.quote.count();

    if (count === 0) {
      return res.status(404).json({ message: 'No quotes available' });
    }

    // Generate 100 unique random indices
    const randomIndices = new Set();
    while (randomIndices.size < 100 && randomIndices.size < count) {
      randomIndices.add(Math.floor(Math.random() * count));
    }

    // Fetch quotes at the random indices
    const randomQuotes = await prisma.quote.findMany({
      skip: Array.from(randomIndices)[0], // This ensures we use the indices generated
      take: 100,
      include: { tags: true },
    });

    res.status(200).json(randomQuotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all favorite quotes
app.get('/api/favorites/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        quote: {
          include: {
            tags: true,
          }
        }
      }, // Include quote data for display purposes
    });

    res.status(200).json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'An error occurred while fetching favorites' });
  }
});

// Add a quote to favorites
app.post('/api/favorites', async (req, res) => {
  const { userId, quoteId, translatedContent } = req.body;

  if (!userId || !quoteId) {
    return res.status(400).json({ error: 'userId and quoteId are required' });
  }

  console.log(req.body);

  try {
    // Ensure user exists or create the user
    await prisma.user.upsert({
      where: { id: userId },
      update: {}, // No updates needed if the user exists
      create: {
        id: userId,
        name: 'Anonymous', // Default name, customize as needed
        // email: '', // Placeholder email, can be empty or Clerk fetched later if required
      },
    });

    // Ensure favorite doesn't already exist
    const existingFavorite = await prisma.favorite.findUnique({
      where: { userId_quoteId: { userId, quoteId } },
    });

    if (existingFavorite) {
      return res.status(400).json({ error: 'Favorite already exists' });
    }

    // Add the favorite
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        quoteId,
        translatedContent, // Only set if translatedText is truthy
      },
    });

    res.status(201).json(favorite);
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'An error occurred while adding the favorite' });
  }
});

// Get favorite by userID
app.get('/api/favorite/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        quote: {
          include: {
            tags: true, // This will include the tags relation within each quote
          },
        },
      },
    });

    res.status(200).json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'An error occurred while fetching favorites' });
  }
})

// Remove a quote from favorites
app.delete('/api/favorites/:userId', async (req, res) => {
  const { userId } = req.params;
  const { quoteId } = req.body;

  if (!userId || !quoteId) {
    return res.status(400).json({ error: 'userId and quoteId are required' });
  }

  console.log(`Removing favorite for user ${userId} and quote ${quoteId}`);

  try {
    const deletedFavorite = await prisma.favorite.delete({
      where: { userId_quoteId: { userId, quoteId } },
    });

    res.status(200).json(deletedFavorite);
  } catch (error) {
    console.error('Error removing favorite:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.status(500).json({ error: 'An error occurred while removing the favorite' });
  }
});

// Recommendations Route
app.get('/api/recommendations/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const favoriteQuotes = await prisma.favorite.findMany({
      where: { userId },
      include: { quote: { include: { tags: true } } }, // Ensure tags are included correctly
    });

    // Extract tags from favorite quotes
    const favoriteTags = new Set(
      favoriteQuotes.flatMap((fav) => fav.quote.tags.map(tag => tag.name)) // Assuming you want tag names
    );

    if (favoriteTags.size === 0) {
      return res.status(200).json([]); // No recommendations for now
    }

    // Check if there is already a list of recommended quotes for this user in cache
    const recommendedQuoteIds = recommendedCache[userId] || [];

    // Query quotes matching favorite tags, excluding already recommended and favorite quotes
    const recommendations = await prisma.quote.findMany({
      where: {
        AND: [
          {
            tags: {
              some: {
                name: { in: Array.from(favoriteTags) }
              },
            },
          },
          {
            id: {
              notIn: [...favoriteQuotes.map((fav) => fav.quoteId), ...recommendedQuoteIds],
            },
          },
        ],
      },
      take: 10, // Limit results
      include: { tags: true },
    });

    // Log recommendation tags for debugging
    // recommendations.forEach((rec, index) => {
    //   console.log(`Recommendation ${index + 1} Tags:`, rec.tags ? rec.tags.map(tag => tag.name) : 'No tags available');
    // });

    // Add the newly recommended quotes to the cache for this user
    recommendedCache[userId] = [
      ...recommendedQuoteIds,
      ...recommendations.map(rec => rec.id),
    ];

    res.status(200).json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
