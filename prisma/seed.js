const express = require('express');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const https = require('https');

const prisma = new PrismaClient();
const app = express();

// Middleware setup
app.use(express.json());

// CORS setup
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

async function main(cleanDb = false) {
    try {
        if (cleanDb) {
            await cleanDatabase();
        } else {
            await fetchQuotesInBatches(50);
        }
    } catch (error) {
        console.error('Error in main function:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Function to clean the database
async function cleanDatabase() {
    await prisma.favorite.deleteMany();
    await prisma.quote.deleteMany();
    console.log('Database cleaned');
}

// Function to fetch quotes in batches
async function fetchQuotesInBatches(batchCount) {
    for (let i = 0; i < batchCount; i++) {
        console.log(`Fetching batch ${i + 1} of ${batchCount}`);
        await fetchQuotes();
        await delay(1000); // Wait for 1 second between batches
    }
    console.log('Data fetching completed');
}

// Function to introduce a delay
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to fetch quotes from the API and handle tags
async function fetchQuotes() {
    const agent = new https.Agent({ rejectUnauthorized: false });

    try {
        const response = await axios.get('https://api.quotable.io/quotes/random?limit=150', { httpsAgent: agent });
        const quotes = Array.isArray(response.data) ? response.data : response.data.results || [];

        if (!quotes.length) {
            console.log('No quotes received from API');
            return;
        }

        for (const quote of quotes) {
            // Process and connect tags dynamically
            const tagConnections = await Promise.all(
                quote.tags.map(async (name) =>
                    prisma.tag.upsert({
                        where: { name },
                        create: { name },
                        update: {},
                    })
                )
            );

            // Store or update the quote
            await prisma.quote.upsert({
                where: { externalId: quote._id },
                update: {
                    content: quote.content,
                    author: quote.author,
                    tags: {
                        connect: tagConnections.map((tag) => ({ id: tag.id })),
                    },
                    authorSlug: quote.authorSlug,
                    length: quote.length,
                    dateModified: new Date(),
                },
                create: {
                    externalId: quote._id,
                    content: quote.content,
                    author: quote.author,
                    tags: {
                        connect: tagConnections.map((tag) => ({ id: tag.id })),
                    },
                    authorSlug: quote.authorSlug,
                    length: quote.length,
                },
            });
        }

        console.log(`${quotes.length} quotes fetched and stored successfully`);
    } catch (error) {
        console.error('Error in fetchQuotes:', error.message);
    }
}

// Main function call
main(false).catch((error) => {
    console.error(error);
    process.exit(1);
});

// Start the server
app.listen(4400, () => {
    console.log('Server running on port 4400');
});
