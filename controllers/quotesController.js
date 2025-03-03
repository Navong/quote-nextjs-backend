const prisma = require('../prisma');

exports.getRandomQuotes = async (req, res) => {
  try {
    const randomQuotes = await prisma.quote.findMany({
      take: 100,
      orderBy: { id: 'desc' }, // Replace with RANDOM() if supported
      include: { tags: true },
    });

    res.status(200).json(randomQuotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
