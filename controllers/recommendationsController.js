const prisma = require('../prisma/client');
const recommendedCache = {}; // Temporary in-memory cache, keyed by userId

/**
 * Get all favorites for a specific user with Recommendations logic
 */
exports.getRecommendations = async (req, res) => {
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
        recommendations.forEach((rec, index) => {
            console.log(`Recommendation ${index + 1} Tags:`, rec.tags ? rec.tags.map(tag => tag.name) : 'No tags available');
        });

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
};