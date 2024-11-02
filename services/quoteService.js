const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getRandomQuote = async () => {
    const count = await prisma.quote.count();
    const randomSet = new Set();
    let quote;

    while (!quote && randomSet.size < count) {
        const random = Math.floor(Math.random() * count);
        if (!randomSet.has(random)) {
            randomSet.add(random);
            quote = await prisma.quote.findFirst({ skip: random, include: { tags: true } });
        }
    }

    return quote || null;
};

const getAllQuotes = async () => {
    return prisma.quote.findMany();
};

module.exports = { getRandomQuote, getAllQuotes };
