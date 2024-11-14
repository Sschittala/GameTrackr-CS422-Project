require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");  // Import path module to manage file paths

const app = express();
const PORT = process.env.PORT || 5000;
const CHATGPT_API_KEY = process.env.CHATGPT_API_KEY;
const IGDB_API_CLIENT_ID = process.env.IGDB_CLIENT_ID;
const IGDB_API_AUTH_TOKEN = process.env.IGDB_ACCESS_TOKEN;

// Enable CORS for all routes
app.use(cors());  // Use the CORS middleware here

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse incoming request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Utility function to add delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// Endpoint 1: Get game recommendations from ChatGPT API
app.post("/get-game-recommendations", async (req, res) => {
    const { query } = req.body;

    // Define a helper function with retry logic
    async function fetchRecommendations(retryCount = 3) {
        try {
            const response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content:
                                "You are a helpful assistant for a game recommendation app. you will receiev a user's query and return a comma-seperated list of game titles. Make sure your enture response is this comma-seperated list (with no spaces after commas) and nothing else!",
                        },
                        {
                            role: "user",
                            content: query,
                        },
                    ],
                    max_tokens: 50,
                    temperature: 0.5,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${CHATGPT_API_KEY}`,
                    },
                }
            );

            const gameTitles = response.data.choices[0].message.content;
            return gameTitles.split(",");
        } catch (error) {
            if (error.response && error.response.status === 429 && retryCount > 0) {
                console.warn("Rate limit exceeded. Retrying in 2 seconds...");
                await delay(2000); // Wait 2 seconds before retrying
                return fetchRecommendations(retryCount - 1);
            } else {
                console.error("Error with ChatGPT API:", error);
                throw new Error("Failed to fetch game recommendations");
            }
        }
    }

    try {
        const gameTitles = await fetchRecommendations();
        res.json({ gameTitles });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Helper function to format Unix timestamp to a readable date
function formatReleaseDate(unixTimestamp) {
    if (!unixTimestamp) return "Release date not available"; // Handle missing date
    const date = new Date(unixTimestamp * 1000); // Convert to milliseconds
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}


// Endpoint 2: Get game info from IGDB API
app.post("/get-igdb-game-info", async (req, res) => {
    const { gameTitles } = req.body;

    try {
        const queries = gameTitles.map(title =>
            `fields id, name, cover.url, rating, genres.name, summary, first_release_date, game_modes.name, platforms.name, screenshots.url, storyline, url; search "${title.trim()}"; where category = 0; limit 5;`
        );

        const responses = await Promise.all(
            queries.map(query =>
                axios.post(
                    "https://api.igdb.com/v4/games",
                    query,
                    {
                        headers: {
                            "Client-ID": IGDB_API_CLIENT_ID,
                            Authorization: `Bearer ${IGDB_API_AUTH_TOKEN}`,
                        },
                    }
                )
            )
        );

        // Filter the results to include exact matches and format the release date
        const gamesData = responses.map((response, index) => {
            const title = gameTitles[index].toLowerCase();
            const game = response.data.find(game => game.name.toLowerCase() === title) || response.data[0];
            
            // Format the release date for each game
            if (game) {
                game.first_release_date = formatReleaseDate(game.first_release_date);
            }

            return game;
        });

        res.json({ games: gamesData });
    } catch (error) {
        console.error("Error with IGDB API:", error);
        res.status(500).json({ error: "Failed to fetch game information" });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
