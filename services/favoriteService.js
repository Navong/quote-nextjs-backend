const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getFavoritesByUser = async (userId) => {
    return prisma.favorite.findMany({
        where: { userId },
        include: { quote: true },
    });
};

const addFavorite = async (favoriteData) => {
    return prisma.favorite.create({
        data: {
            userId: favoriteData.userId,
            quoteId: favoriteData.quoteId,
        },
    });
};

const getTopFavorites = async () => {
    const topFavorites = await prisma.favorite.groupBy({
        by: ['quoteId'],
        _count: {
            quoteId: true,
        },
        orderBy: {
            _count: {
                quoteId: 'desc',
            },
        },
        take: 5,
    });

    const quoteIds = topFavorites.map((item) => item.quoteId);

    // Fetch the quote details for these quote IDs
    const quotes = await prisma.quote.findMany({
        where: {
            id: { in: quoteIds },
        },
    });

    return topFavorites.map((item) => ({
        quote: quotes.find((quote) => quote.id === item.quoteId),
        count: item._count.quoteId,
    }));
};

module.exports = { getFavoritesByUser, addFavorite, getTopFavorites };

