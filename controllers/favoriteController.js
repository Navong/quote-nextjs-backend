const prisma = require('../prisma/client'); // Adjust path to your Prisma client

/**
 * Add a quote to the user's favorites
 */
exports.addFavorite = async (req, res) => {
    const { userId, quoteId, translatedText } = req.body;

    console.log("translatedText", translatedText);


    if (!userId || !quoteId) {
        return res.status(400).json({ error: 'userId and quoteId are required' });
    }

    console.log(`Adding favorite for user ${userId} and quote ${quoteId}`);

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
                translatedContent: translatedText || undefined, // Only set if translatedText is truthy
            },
        });

        res.status(201).json(favorite);
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({ error: 'An error occurred while adding the favorite' });
    }
};
/**
 * Get all favorites for a specific user
 */
exports.getFavoritesForUser = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    try {
        const favorites = await prisma.favorite.findMany({
            where: { userId },
            include: { quote: true }, // Include quote data for display purposes
        });

        res.status(200).json(favorites);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'An error occurred while fetching favorites' });
    }
};

/**
 * Remove a favorite
 */
exports.removeFavorite = async (req, res) => {
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
};

