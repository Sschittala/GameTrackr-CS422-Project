document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("search-button");
    const gameSearchInput = document.getElementById("game-search");
    const resultSection = document.getElementById("result");

    const queueSection = document.getElementById("queue");
    const completedSection = document.getElementById("completed-list");
    const queueGamesSection = document.getElementById("queue-games");
    const discoverSection = document.getElementById("discover-section");
    const profileSection = document.getElementById("profile-section");
    const discoverButton = document.getElementById("discover-button");
    const queueButton = document.getElementById("games-button");
    const profileButton = document.getElementById("profile-button");

    const footerButtons = document.querySelectorAll(".footer-button");

    // modal stuff
    const gameDetailModal = document.getElementById("game-detail-modal");
    const closeModalButton = document.getElementById("close-modal");
    const addToQueueButton = document.getElementById("add-to-queue");

    const gameTitle = document.getElementById("game-title");
    const gameCover = document.getElementById("game-cover");
    const gameSummary = document.getElementById("game-summary");
    const gameGenres = document.getElementById("game-genres");
    const gameRating = document.getElementById("game-rating");
    const gamePlatforms = document.getElementById("game-platforms");
    const gameScreenshots = document.getElementById("game-screenshots");
    const gameReleaseDate = document.getElementById("game-release-date");
    const gameModes = document.getElementById("game-modes");
    const gameURL = document.getElementById("game-url");

    // queue modal
    const trackedGameModal = document.getElementById("tracked-game-modal");
    const closeTrackedModalButton = document.getElementById("close-tracked-modal");
    const deleteButton = document.getElementById("delete-button");
    const editNoteButton = document.getElementById("edit-note-button");
    const markAsPlayedButton = document.getElementById("mark-as-played");

    const markAsPlayedQueue = document.getElementById("mark-as-played-queue");

    const trackedGameTitle = document.getElementById("tracked-game-title");
    const trackedGameCover = document.getElementById("tracked-game-cover");
    const trackedGameURL = document.getElementById("tracked-game-url");
    const trackedGamePlatforms = document.getElementById("tracked-game-platforms");

    const trackedGameStatus = document.getElementById("tracked-game-status");
    const trackedGameNote = document.getElementById("tracked-game-note");

    // completed modal
    const completedGameModal = document.getElementById("completed-game-modal");
    const closeCompletedModalButton = document.getElementById("close-completed-modal");

    const completedGameTitle = document.getElementById("completed-game-title");
    const completedGameCover = document.getElementById("completed-game-cover");
    const completedGameURL = document.getElementById("completed-game-url");

    const completedGameStatus = document.getElementById("completed-game-status");
    const completedGameNote = document.getElementById("completed-game-note");

    const deleteProfile = document.getElementById("delete-button-profile");

    const editNoteProfile = document.getElementById("edit-note-button-profile");
    

    // Store selected game for tracking
    let selectedGame = null;
    let trackedGames = [];
    let completedGames = [];


    // we can save data on local storage on client device so that it presists between sessions
    function saveTrackedGames() {
        localStorage.setItem("trackedGames", JSON.stringify(trackedGames));
    }
    function saveCompletedGames() {
        localStorage.setItem("completedGames", JSON.stringify(completedGames));
    }
    function loadTrackedGames() {
        savedGames = localStorage.getItem("trackedGames");
        if (savedGames) {
            trackedGames = JSON.parse(savedGames);
        } else {
            trackedGames = []; // Initialize as empty array if no data is found
        }
    }
    

    function loadCompletedGames() {
        completedGames = localStorage.getItem("completedGames");
        if (completedGames) {
            completedGames = JSON.parse(completedGames);
        } else {
            completedGames = []; // Initialize as empty array if no data is found
        }
    }
    
    loadTrackedGames();
    loadCompletedGames();
    displayQueueGameCards();
        

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
        displayQueueGameCards(); // Update the queue display
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
        displayCompletedGames();
        resetActiveTab();
        profileButton.classList.add("active"); // Mark Profile button as active
    });

    // Search functionality within Discover section
    searchButton.addEventListener("click", async function () {

        console.log("Search button clicked!"); // debug

        let query = gameSearchInput.value.trim();
        
        if (query) {
            resultSection.innerHTML = "<p>Searching...</p>";

            try {
                console.log("trying Chatgpt api"); // debug

                // Step 1: Get game recommendations from ChatGPT considering the user's play history
                const completedTitles = completedGames.map(game => game.name);
                query = `${query} USER'S PLAY HISTORY: ${completedTitles.join(", ")}`;

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


    // Function to display the modal with game details
    function openGameDetailModal(game) {
        selectedGame = game;
        gameTitle.innerHTML = game.name;
        gameCover.src = `https:${game.cover.url}`;
        gameSummary.innerHTML = game.summary;
        gameGenres.innerHTML = game.genres.map(genre => genre.name).join(", ");
        gameRating.innerHTML = game.rating ? game.rating.toFixed(1) : "N/A";
        gamePlatforms.innerHTML = game.platforms.map(platform => platform.name).join(", ");
        gameReleaseDate.innerHTML = game.first_release_date? game.first_release_date : "N/A";
        gameModes.innerHTML = game.game_modes.map(game_modes => game_modes.name).join(", ");
        gameURL.innerHTML = game.url? game.url : "N/A";
        
        // Display screenshots
        gameScreenshots.innerHTML = "";
        game.screenshots.forEach(screenshot => {
            const img = document.createElement("img");
            img.src = `https:${screenshot.url}`;
            img.alt = `${game.name} Screenshot`;
            img.style.width = "100px";
            img.style.margin = "5px";
            gameScreenshots.appendChild(img);
        });

        gameDetailModal.style.display = "flex"; // Show the modal
    }

    // Close the modal when the close button is clicked
    closeModalButton.addEventListener("click", function () {
        gameDetailModal.style.display = "none"; // Hide the modal
    });

    // Add the game to the queue
    addToQueueButton.addEventListener("click", function () {
        if (selectedGame) {
            // Check if the game is already in the completedGames array
            const gameExists = completedGames.some(game => game.name === selectedGame.name);

            if (!gameExists) {
                // Check if the game is already in the trackedGames array
                const gameExists = trackedGames.some(game => game.name === selectedGame.name);

                if (!gameExists) {
                    selectedGame.status = "not started";
                    trackedGames.push(selectedGame); // Add to tracked games
                    console.log("Game added to queue:", selectedGame.name);
                    gameDetailModal.style.display = "none"; // Close modal after adding
                    saveTrackedGames();
                }
                else {
                    console.log("Game already in queue:", selectedGame.name);
                }
            }
            else {
                console.log("Game already completed", selectedGame.name);
            }
        }
    });

    // Add the game to the "complete games" list
    markAsPlayedButton.addEventListener("click", function () {
        if (selectedGame) {

            // Check if the game is already in the completedGames array
            const gameExists = completedGames.some(game => game.name === selectedGame.name);

            if (!gameExists) {
                selectedGame.status = "completed";
                completedGames.push(selectedGame); // Add to tracked games
                console.log("Game added completed:", selectedGame.name);
                gameDetailModal.style.display = "none"; // Close modal after adding

                // Remove the game from the trackedGames array
                const gameIndex = trackedGames.findIndex(game => game.name === selectedGame.name);
                if (gameIndex !== -1) {
                    trackedGames.splice(gameIndex, 1); // Remove the game from trackedGames
                    console.log("Game removed from queue:", selectedGame.name);
                }
                saveTrackedGames();
                saveCompletedGames();
            }
            else {
                console.log("Game already completed", selectedGame.name);
            }
        }
    });

    // Add the game to the "complete games" list
    markAsPlayedQueue.addEventListener("click", function () {
        if (selectedGame) {

            // Check if the game is already in the completedGames array
            const gameExists = completedGames.some(game => game.name === selectedGame.name);

            if (!gameExists) {
                selectedGame.status = "completed";
                completedGames.push(selectedGame); // Add to tracked games
                console.log("Game added completed:", selectedGame.name);
                trackedGameModal.style.display = "none"; // Close modal after adding

                // Remove the game from the trackedGames array
                const gameIndex = trackedGames.findIndex(game => game.name === selectedGame.name);
                if (gameIndex !== -1) {
                    trackedGames.splice(gameIndex, 1); // Remove the game from trackedGames
                    console.log("Game removed from queue:", selectedGame.name);
                }
                saveTrackedGames();
                saveCompletedGames();
                displayQueueGameCards();
            }
            else {
                console.log("Game already completed", selectedGame.name);
            }
        }
    });
    editNoteButton.addEventListener("click", function() {
        if (selectedGame) {

            const note = prompt("Enter a note for this game:");
    
            // Check if the user entered a note
            if (note) {
                // Add the note to the selected game
                selectedGame.note = note;
                console.log("Note added:", note);
    
                // Save updated trackedGames to localStorage
                saveTrackedGames();
                displayQueueGameCards();
                openQueueGameModal(selectedGame);
            }
        } else {
            console.log("No game selected to add a note.");
        }
    });

    editNoteProfile.addEventListener("click", function() {
        if (selectedGame) {

            const note = prompt("Enter a note for this game:");
    
            // Check if the user entered a note
            if (note) {
                // Add the note to the selected game
                selectedGame.note = note;
                console.log("Note added:", note);
    
                // Save updated trackedGames to localStorage
                saveTrackedGames();
                displayCompletedGames();
                openCompletedGameModal(selectedGame);
            }
        } else {
            console.log("No game selected to add a note.");
        }
    });

    function openQueueGameModal(game) {
        selectedGame = game;
        trackedGameTitle.innerHTML = game.name;
        trackedGameCover.src = `https:${game.cover.url}`;
        trackedGamePlatforms.innerHTML = game.platforms.map(platform => platform.name).join(", ");
        trackedGameURL.innerHTML = game.url? game.url:"N/A";

        trackedGameStatus.innerHTML = game.status? game.status : "N/A";
        trackedGameNote.innerHTML = game.note? game.note : "N/A";
        

        trackedGameModal.style.display = "flex"; // Show the modal

    }

    // Close the modal when the close button is clicked
    closeTrackedModalButton.addEventListener("click", function () {
        trackedGameModal.style.display = "none"; // Hide the modal
    });

    deleteButton.addEventListener("click", function(){
        if (selectedGame) {
            // Find the index of the game in the tracked games list
            const gameIndex = trackedGames.findIndex(game => game.id === selectedGame.id);
    
            if (gameIndex !== -1) {
                // Remove the game from the tracked games list
                trackedGames.splice(gameIndex, 1);
                console.log("Game removed from list:", selectedGame.name);
    
                // Update UI, close modal, or perform any additional actions needed
                trackedGameModal.style.display = "none"; // Close modal after deleting
                displayQueueGameCards();
            } else {
                console.log("Game not found in the list.");
            }
            saveTrackedGames();
        }
        if (selectedGame) {
            // Find the index of the game in the completed games list
            const gameIndex = completedGames.findIndex(game => game.id === selectedGame.id);
    
            if (gameIndex !== -1) {
                // Remove the game from the tracked games list
                completedGames.splice(gameIndex, 1);
                console.log("Game removed from list:", completedGames.name);
    
                // Update UI, close modal, or perform any additional actions needed
                completedGameModal.style.display = "none"; // Close modal after deleting
                displayCompletedGames();
            } else {
                console.log("Game not found in the list.");
            }
            saveCompletedGames();
            displayCompletedGames();
        }
    });

    deleteProfile.addEventListener("click", function(){
        if (selectedGame) {
            // Find the index of the game in the tracked games list
            const gameIndex = completedGames.findIndex(game => game.id === selectedGame.id);
    
            if (gameIndex !== -1) {
                // Remove the game from the tracked games list
                completedGames.splice(gameIndex, 1);
                console.log("Game removed from list:", selectedGame.name);
    
                // Update UI, close modal, or perform any additional actions needed
                completedGameModal.style.display = "none"; // Close modal after deleting
                displayCompletedGames();
            } else {
                console.log("Game not found in the list.");
            }
            saveCompletedGames();
        }
        if (selectedGame) {
            // Find the index of the game in the completed games list
            const gameIndex = completedGames.findIndex(game => game.id === selectedGame.id);
    
            if (gameIndex !== -1) {
                // Remove the game from the tracked games list
                completedGames.splice(gameIndex, 1);
                console.log("Game removed from list:", completedGames.name);
    
                // Update UI, close modal, or perform any additional actions needed
                completedGameModal.style.display = "none"; // Close modal after deleting
                displayCompletedGames();
            } else {
                console.log("Game not found in the list.");
            }
            saveCompletedGames();
            displayCompletedGames();
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

            // Add event listener to show detailed modal on card click
            card.addEventListener("click", function () {
                openGameDetailModal(game); // Show game details in the modal
            });
            
            result.appendChild(card);
        });
    }

    // Function to display game cards
    function displayQueueGameCards() {
        queueSection.innerHTML = ""; // Clear previous queue
        trackedGames.forEach(game => {
            const card = document.createElement("div");
            card.classList.add("game-card");
            
            // Add game card HTML
            card.innerHTML = `
                <img src="https:${game.cover ? game.cover.url : ''}" alt="${game.name} Cover">
                <div class="card-details">
                    <h3>${game.name}</h3>
                    <p><strong>Status:</strong> ${game.status ? game.status.slice(0, 100) : 'N/A.'}</p>
                    <p><strong>Notes:</strong> ${game.note ? game.note.slice(0, 100) + '...' : 'No note added.'}</p>
                </div>
            `;

            // Add event listener to show detailed modal on card click
            card.addEventListener("click", function () {
                openQueueGameModal(game); // Show game details in the modal
            });

            queue.appendChild(card);
        });
    }



    function openCompletedGameModal(game) {
        selectedGame = game;
        completedGameTitle.innerHTML = game.name;
        completedGameCover.src = `https:${game.cover.url}`;

        completedGameStatus.innerHTML = game.status? game.status : "N/A";
        completedGameNote.innerHTML = game.note? game.note : "N/A";
        completedGameURL.innerHTML = game.url? game.url:"N/A";

        completedGameModal.style.display = "flex"; // Show the modal

    }


    // Function to display game cards... but for the profile
    function displayCompletedGames() {
        completedSection.innerHTML = ""; // Clear previous queue
        completedGames.forEach(game => {
            const card = document.createElement("div");
            card.classList.add("game-card");
            
            // Add game card HTML
            card.innerHTML = `
                <img src="https:${game.cover ? game.cover.url : ''}" alt="${game.name} Cover">
                <div class="card-details">
                    <h3>${game.name}</h3>
                    <p><strong>Status:</strong> ${game.status ? game.status.slice(0, 100) : 'N/A.'}</p>
                    <p><strong>Notes:</strong> ${game.note ? game.note.slice(0, 100) + '...' : 'No note added.'}</p>
                </div>
            `;

            // Add event listener to show detailed modal on card click
            card.addEventListener("click", function () {
                openCompletedGameModal(game); // Show game details in the modal
            });

            completedSection.appendChild(card);
        });
    }

     // Close the modal when the close button is clicked
     closeCompletedModalButton.addEventListener("click", function () {
        completedGameModal.style.display = "none"; // Hide the modal
    });


});



