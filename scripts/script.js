document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("search-button");
    const gameSearchInput = document.getElementById("game-search");
    const resultSection = document.getElementById("result");
    const defaultGamesSection = document.getElementById("default-games");
    const discoverSection = document.getElementById("discover-section");
    const profileSection = document.getElementById("profile-section");
    const discoverButton = document.getElementById("discover-button");
    const queueButton = document.getElementById("games-button");
    const profileButton = document.getElementById("profile-button");

    const footerButtons = document.querySelectorAll(".footer-button");

    // stuff for game lists
    const modal = document.getElementById("game-modal");
    const closeModal = document.getElementById("close-modal");
    const modalGameTitle = document.getElementById("modal-game-title");
    const modalGameCover = document.getElementById("modal-game-cover");
    const modalGameRating = document.getElementById("modal-game-rating");
    const modalGameSummary = document.getElementById("modal-game-summary");
    const trackGameButton = document.getElementById("track-game-button");


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
        defaultGamesSection.style.display = "block";
        discoverSection.style.display = "none";
        profileSection.style.display = "none";

        resetActiveTab();
        queueButton.classList.add("active"); // Mark Games button as active
    });

    // Show discover section and set "Discover" as the active tab
    discoverButton.addEventListener("click", function () {
        defaultGamesSection.style.display = "none";
        discoverSection.style.display = "block";
        profileSection.style.display = "none";
        gameSearchInput.focus();

        resetActiveTab();
        discoverButton.classList.add("active"); // Mark Discover button as active
    });

    // Show profile section and set "Profile" as the active tab
    profileButton.addEventListener("click", function () {
        defaultGamesSection.style.display = "none";
        discoverSection.style.display = "none";
        profileSection.style.display = "block";

        resetActiveTab();
        profileButton.classList.add("active"); // Mark Profile button as active
    });

    // Search functionality within Discover section
    searchButton.addEventListener("click", async function () {
        const query = gameSearchInput.value.trim();
        
        if (query) {
            resultSection.innerHTML = "<p>Searching...</p>";

            try {
                // Step 1: Get game recommendations from ChatGPT API
                const chatGPTResponse = await fetch("/get-game-recommendations", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ query }),
                });
                const chatGPTData = await chatGPTResponse.json();
                const gameTitles = chatGPTData.gameTitles;

                // Step 2: Get game info from IGDB API
                const igdbResponse = await fetch("/get-igdb-game-info", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ gameTitles }),
                });
                const igdbData = await igdbResponse.json();

                // Step 3: Display game info as cards
                displayGameCards(igdbData.games);
            } catch (error) {
                console.error("Error fetching game data:", error);
                resultSection.innerHTML = "<p>Error fetching game data.</p>";
            }
        } else {
            alert("Please enter a game name or query.");
        }
    });

    // Display game cards in the result section
    function displayGameCards(games) {
        resultSection.innerHTML = ""; // Clear previous results
        games.forEach(game => {
            const card = document.createElement("div");
            card.classList.add("game-card");
            card.innerHTML = `
                <img src="${game.cover ? game.cover.url : ''}" alt="${game.name} Cover">
                <h3>${game.name}</h3>
                <p><strong>Rating:</strong> ${game.rating ? game.rating.toFixed(1) : 'N/A'}</p>
                <p>${game.summary ? game.summary.slice(0, 100) + '...' : 'No description available.'}</p>
            `;
            card.addEventListener("click", () => openModal(game));
            resultSection.appendChild(card);
        });
    }

    // Open modal with full game details
    function openModal(game) {
        modalGameTitle.textContent = game.name;
        modalGameCover.src = game.cover ? game.cover.url : '';
        modalGameRating.textContent = game.rating ? game.rating.toFixed(1) : 'N/A';
        modalGameSummary.textContent = game.summary || 'No description available.';
        modal.style.display = "block";

        // Set up track button action
        trackGameButton.onclick = () => trackGame(game);
    }

    // Close modal
    closeModal.onclick = () => (modal.style.display = "none");
    window.onclick = event => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    // Track a game by adding it to the tracked list
    function trackGame(game) {
        if (!trackedGames.some(tracked => tracked.id === game.id)) {
            trackedGames.push(game);
            alert(`${game.name} has been added to your tracked list!`);
        } else {
            alert(`${game.name} is already in your tracked list.`);
        }
    }

    const exampleGames = [
        {
            "id": 1942,
            "cover": { "url": "//images.igdb.com/igdb/image/upload/t_thumb/co1wyy.jpg" },
            "name": "The Witcher 3: Wild Hunt",
            "rating": 93.96,
            "summary": "RPG and sequel to The Witcher 2, following Geralt of Rivia."
        },
        {
            "id": 472,
            "cover": { "url": "//images.igdb.com/igdb/image/upload/t_thumb/co1tnw.jpg" },
            "name": "The Elder Scrolls V: Skyrim",
            "rating": 87.52,
            "summary": "Skyrim reimagines and revolutionizes the open-world fantasy epic."
        },
        {
            "id": 134226,
            "cover": { "url": "//images.igdb.com/igdb/image/upload/t_thumb/co2kwq.jpg" },
            "name": "Final Fantasy VII Remake: Deluxe Edition",
            "summary": "A spectacular re-imagining of FINAL FANTASY VII."
        },
    ];
    displayGameCards(exampleGames); // Display example games for testing
});
