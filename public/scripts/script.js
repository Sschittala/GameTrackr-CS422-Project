document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("search-button");
    const gameSearchInput = document.getElementById("game-search");
    const resultSection = document.getElementById("result");

    const queueSection = document.getElementById("queue");

    const queueGamesSection = document.getElementById("queue-games");
    const discoverSection = document.getElementById("discover-section");
    const profileSection = document.getElementById("profile-section");
    const discoverButton = document.getElementById("discover-button");
    const queueButton = document.getElementById("games-button");
    const profileButton = document.getElementById("profile-button");

    const footerButtons = document.querySelectorAll(".footer-button");


    // Track list to store tracked games
    const trackedGames = [];

     // Define the base URL of the server
     const SERVER_URL = "http://localhost:5000"; // server running on client machine

    // Function to reset active tab by removing the "active" class from all buttons
    function resetActiveTab() {
        footerButtons.forEach(button => button.classList.remove("active"));
    }

    // Show games in queue and set "Queue" as the active tab
    queueButton.addEventListener("click", function () {
        queueGamesSection.style.display = "block";
        discoverSection.style.display = "none";
        profileSection.style.display = "none";

        resetActiveTab();
        queueButton.classList.add("active"); // Mark Games button as active
    });

    // Show discover section and set "Discover" as the active tab
    discoverButton.addEventListener("click", function () {
        queueGamesSection.style.display = "none";
        discoverSection.style.display = "block";
        profileSection.style.display = "none";
        gameSearchInput.focus();

        resetActiveTab();
        discoverButton.classList.add("active"); // Mark Discover button as active
    });

    // Show profile section and set "Profile" as the active tab
    profileButton.addEventListener("click", function () {
        queueGamesSection.style.display = "none";
        discoverSection.style.display = "none";
        profileSection.style.display = "block";

        resetActiveTab();
        profileButton.classList.add("active"); // Mark Profile button as active
    });

    // Search functionality within Discover section
    searchButton.addEventListener("click", async function () {

        console.log("Search button clicked!"); // debug

        const query = gameSearchInput.value.trim();
        
        if (query) {
            resultSection.innerHTML = "<p>Searching...</p>";

            try {
                console.log("trying Chatgpt api"); // debug
                // Step 1: Get game recommendations from ChatGPT API
                const chatGPTResponse = await fetch(`${SERVER_URL}/get-game-recommendations`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ query }),
                });
                const chatGPTData = await chatGPTResponse.json();
                const gameTitles = chatGPTData.gameTitles;
                
                // Step 2: Get game info from IGDB API
                console.log("trying igdb api"); // debug
                const igdbResponse = await fetch(`${SERVER_URL}/get-igdb-game-info`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ gameTitles }),
                });
                const igdbData = await igdbResponse.json();
                console.log("displaying found games"); // debug
                // Step 3: Display game info as cards
                displaySearchedGameCards(igdbData.games);
            } catch (error) {
                console.error("Error fetching game data:", error);
                resultSection.innerHTML = "<p>Error fetching game data.</p>";
            }
        } else {
            alert("Please enter a game name or query.");
        }
    });

    // Function to display game cards
    function displaySearchedGameCards(games) {
        resultSection.innerHTML = ""; // Clear previous results
        games.forEach(game => {
            const card = document.createElement("div");
            card.classList.add("game-card");
            
            // Add game card HTML
            card.innerHTML = `
                <img src="https:${game.cover ? game.cover.url : ''}" alt="${game.name} Cover">
                <div class="card-details">
                    <h3>${game.name}</h3>
                    <p><strong>Rating:</strong> ${game.rating ? game.rating.toFixed(1) : 'N/A'}</p>
                    <p><strong>Genres:</strong> ${game.genres ? game.genres.map(genre => genre.name).join(', ') : 'N/A'}</p>
                    <p>${game.summary ? game.summary.slice(0, 100) + '...' : 'No description available.'}</p>
                </div>
            `;
            
            result.appendChild(card);
        });
    }

    // Function to display game cards
    function displayQueueGameCards(games) {
        resultSection.innerHTML = ""; // Clear previous results
        games.forEach(game => {
            const card = document.createElement("div");
            card.classList.add("game-card");
            
            // Add game card HTML
            card.innerHTML = `
                <img src="https:${game.cover ? game.cover.url : ''}" alt="${game.name} Cover">
                <div class="card-details">
                    <h3>${game.name}</h3>
                    <p><strong>Notes:</strong> ${game.note ? game.note.slice(0, 100) + '...' : 'No note added.'}</p>
                </div>
            `;
            
            queue.appendChild(card);
        });
    }

    const sampleGames = [
        {
            id: 1,
            cover: {
                url: "//images.igdb.com/igdb/image/upload/t_thumb/co1wyy.jpg"
            },
            first_release_date: "May 18, 2015",
            name: "The Witcher 3: Wild Hunt",
            rating: 9.3,
            summary: "A story-driven open world RPG set in a visually stunning fantasy universe full of meaningful choices and impactful consequences.",
            storyline: "Geralt of Rivia, a monster hunter for hire, embarks on a quest to find his adopted daughter.",
            genres: [
                { id: 12, name: "Role-playing (RPG)" },
                { id: 31, name: "Adventure" }
            ],
            platforms: [
                { id: 6, name: "PC (Microsoft Windows)" },
                { id: 48, name: "PlayStation 4" },
                { id: 49, name: "Xbox One" }
            ]
        },
        {
            id: 2,
            cover: {
                url: "//images.igdb.com/igdb/image/upload/t_thumb/co3nnt.jpg"
            },
            first_release_date: "September 20, 2019",
            name: "The Legend of Zelda: Link's Awakening",
            rating: 8.5,
            summary: "A remake of the classic action-adventure game set on the mysterious Koholint Island.",
            storyline: "Link finds himself stranded on an island and must gather magical instruments to awaken the Wind Fish.",
            genres: [
                { id: 31, name: "Adventure" },
                { id: 8, name: "Platform" }
            ],
            platforms: [
                { id: 130, name: "Nintendo Switch" }
            ]
        },
        {
            id: 3,
            cover: {
                url: "//images.igdb.com/igdb/image/upload/t_thumb/co3wls.jpg"
            },
            first_release_date: "March 20, 2020",
            name: "Animal Crossing: New Horizons",
            rating: 8.9,
            summary: "A relaxing game where you develop a deserted island into a thriving community of anthropomorphic animals.",
            storyline: "You arrive on a deserted island and build a new life, shaping your island with endless creativity.",
            genres: [
                { id: 13, name: "Simulator" },
                { id: 31, name: "Adventure" }
            ],
            platforms: [
                { id: 130, name: "Nintendo Switch" }
            ]
        },
        {
            id: 4,
            cover: {
                url: "//images.igdb.com/igdb/image/upload/t_thumb/co7497.jpg"
            },
            first_release_date: "December 10, 2020",
            name: "Cyberpunk 2077",
            rating: 7.5,
            summary: "An open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour, and body modification.",
            storyline: "In a dystopian world, you play as V, a mercenary on the rise in Night City, who is haunted by a digital ghost.",
            genres: [
                { id: 5, name: "Shooter" },
                { id: 31, name: "Adventure" }
            ],
            platforms: [
                { id: 6, name: "PC (Microsoft Windows)" },
                { id: 48, name: "PlayStation 4" },
                { id: 49, name: "Xbox One" },
                { id: 167, name: "PlayStation 5" }
            ]
        },
        {
            id: 5,
            cover: {
                url: "//images.igdb.com/igdb/image/upload/t_thumb/co2gn3.jpg"
            },
            first_release_date: "February 9, 2023",
            name: "Hogwarts Legacy",
            rating: 8.2,
            summary: "An immersive, open-world action RPG set in the world of Harry Potter.",
            storyline: "As a student at Hogwarts in the 1800s, uncover hidden secrets and embark on a journey through familiar magical locations.",
            genres: [
                { id: 12, name: "Role-playing (RPG)" },
                { id: 31, name: "Adventure" }
            ],
            platforms: [
                { id: 6, name: "PC (Microsoft Windows)" },
                { id: 48, name: "PlayStation 4" },
                { id: 49, name: "Xbox One" },
                { id: 167, name: "PlayStation 5" },
                { id: 169, name: "Xbox Series X|S" }
            ]
        }
    ];
    
    displaySearchedGameCards(sampleGames); // Display example games for testing
    displayQueueGameCards(sampleGames)
});



