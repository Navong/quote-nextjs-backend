const prisma = require('../prisma');
const recommendedCache = {};

exports.getRecommendations = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const favoriteQuotes = await prisma.favorite.findMany({
      where: { userId },
      include: { quote: { include: { tags: true } } },
    });

    // Extract tag names from favorite quotes
    const favoriteTags = new Set(
      favoriteQuotes.flatMap((fav) => fav.quote.tags.map(tag => tag.name))
    );

    if (favoriteTags.size === 0) {
      return res.status(200).json([]);
    }

    const recommendedQuoteIds = recommendedCache[userId] || [];
    const recommendations = await prisma.quote.findMany({
      where: {
        AND: [
          {
            tags: {
              some: { name: { in: Array.from(favoriteTags) } },
            },
          },
          {
            id: {
              notIn: [
                ...favoriteQuotes.map((fav) => fav.quoteId),
                ...recommendedQuoteIds,
              ],
            },
          },
        ],
      },
      take: 10,
      include: { tags: true },
    });

    // Update the cache for this user
    recommendedCache[userId] = [
      ...recommendedQuoteIds,
      ...recommendations.map(rec => rec.id),
    ];

    res.status(200).json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
};
