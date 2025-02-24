const prisma = require('../prisma');

exports.getFavorites = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        quote: {
          include: { tags: true },
        },
      },
    });

    res.status(200).json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'An error occurred while fetching favorites' });
  }
};

exports.addFavorite = async (req, res) => {
  const { userId, quoteId, translatedContent } = req.body;

  if (!userId || !quoteId) {
    return res.status(400).json({ error: 'userId and quoteId are required' });
  }

  try {
    // Ensure user exists or create the user
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, name: 'Anonymous' },
    });

    // Ensure favorite doesn't already exist
    const existingFavorite = await prisma.favorite.findUnique({
      where: { userId_quoteId: { userId, quoteId } },
    });

    if (existingFavorite) {
      return res.status(400).json({ error: 'Favorite already exists' });
    }

    const favorite = await prisma.favorite.create({
      data: { userId, quoteId, translatedContent },
    });

    res.status(201).json(favorite);
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'An error occurred while adding the favorite' });
  }
};

exports.deleteFavorite = async (req, res) => {
  const { userId } = req.params;
  const { quoteId } = req.body;

  if (!userId || !quoteId) {
    return res.status(400).json({ error: 'userId and quoteId are required' });
  }

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
