const prisma = require('../prisma');

exports.getRandomQuotes = async (req, res) => {
  try {
    const count = await prisma.quote.count();

    if (count === 0) {
      return res.status(404).json({ message: 'No quotes available' });
    }

    // Generate 100 unique random indices (using one random skip for simplicity)
    const randomIndices = new Set();
    while (randomIndices.size < 100 && randomIndices.size < count) {
      randomIndices.add(Math.floor(Math.random() * count));
    }

    const randomQuotes = await prisma.quote.findMany({
      skip: Array.from(randomIndices)[0],
      take: 100,
      include: { tags: true },
    });

    res.status(200).json(randomQuotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
