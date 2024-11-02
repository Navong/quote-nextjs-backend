const express = require('express');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const https = require('https');

const prisma = new PrismaClient();
const app = express();

// JSON parsing middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

async function main() {
    try {
        for (let i = 0; i < 50; i++) {
            console.log(`Fetch attempt ${i + 1} of 50`);
            await fetchQuotesWithDelay();
        }

        console.log('All data fetched and stored successfully');
    } catch (error) {
        console.error('Error in main function:', error);
    } finally {
        await prisma.$disconnect();
    }
}

async function fetchQuotesWithDelay() {
    await fetchQuotes();
    // Wait for 5 seconds before the next fetch
    await new Promise(resolve => setTimeout(resolve, 5000));
}

async function fetchQuotes() {
    const agent = new https.Agent({  
        rejectUnauthorized: false
    });

    try {
        const response = await axios.get('https://api.quotable.io/quotes/random?limit=150', { httpsAgent: agent });
        console.log('API Response:', JSON.stringify(response.data, null, 2));

        let quotes;
        if (Array.isArray(response.data)) {
            quotes = response.data;
        } else if (response.data && Array.isArray(response.data.results)) {
            quotes = response.data.results;
        } else {
            throw new Error('Unexpected API response structure');
        }

        if (quotes.length === 0) {
            console.log('No quotes received from the API');
            return;
        }

        await Promise.all(quotes.map(quote =>
            prisma.quote.upsert({
                where: { externalId: quote._id },
                update: {
                    content: quote.content,
                    author: quote.author,
                    tags: quote.tags,
                    authorSlug: quote.authorSlug,
                    length: quote.length,
                    dateModified: new Date()
                },
                create: {
                    externalId: quote._id,
                    content: quote.content,
                    author: quote.author,
                    tags: quote.tags,
                    authorSlug: quote.authorSlug,
                    length: quote.length
                }
            })
        ));

        console.log(`${quotes.length} quotes fetched and stored successfully`);
    } catch (error) {
        console.error('Error in fetchQuotes:', error.message);
        if (error.response) {
            console.error('API response:', error.response.data);
            console.error('Status code:', error.response.status);
        }
    }
}

async function fetchAuthors() {
    const response = await axios.get('https://api.quotable.io/authors');
    const authors = response.data.results;

    await Promise.all(authors.map(author =>
        prisma.author.upsert({
            where: { slug: author.slug },
            update: {
                name: author.name,
                bio: author.bio,
                link: author.link,
                quoteCount: author.quoteCount,
                dateModified: new Date()
            },
            create: {
                name: author.name,
                slug: author.slug,
                bio: author.bio,
                link: author.link,
                quoteCount: author.quoteCount
            }
        })
    ));

    console.log(`${authors.length} authors fetched and stored successfully`);
}

async function fetchTags() {
    const response = await axios.get('https://api.quotable.io/tags');
    const tags = response.data;

    await Promise.all(tags.map(tag =>
        prisma.tag.upsert({
            where: { name: tag.name },
            update: {
                quoteCount: tag.quoteCount,
                dateModified: new Date()
            },
            create: {
                name: tag.name,
                quoteCount: tag.quoteCount
            }
        })
    ));

    console.log(`${tags.length} tags fetched and stored successfully`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    });

app.listen(4400, () => {
    console.log('Server listening on port 4400');
});

