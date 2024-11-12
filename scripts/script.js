document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("search-button");
    const gameSearchInput = document.getElementById("game-search");
    const resultSection = document.getElementById("result");
    const defaultGamesSection = document.getElementById("default-games");
    const discoverSection = document.getElementById("discover-section");
    const profileSection = document.getElementById("profile-section");
    const discoverButton = document.getElementById("discover-button");
    const gamesButton = document.getElementById("games-button");
    const profileButton = document.getElementById("profile-button");
 
 
    // Initial display setup: show default games, hide other sections
    defaultGamesSection.style.display = "block";
    discoverSection.style.display = "none";
    profileSection.style.display = "none";
 
 
    // Show discover section when "Discover" is clicked
    discoverButton.addEventListener("click", function () {
        defaultGamesSection.style.display = "none";
        discoverSection.style.display = "block";
        profileSection.style.display = "none";
        gameSearchInput.focus();
    });
 
 
    // Show default games when "Games" is clicked
    gamesButton.addEventListener("click", function () {
        defaultGamesSection.style.display = "block";
        discoverSection.style.display = "none";
        profileSection.style.display = "none";
    });
 
 
    // Show profile section when "Profile" is clicked
    profileButton.addEventListener("click", function () {
        defaultGamesSection.style.display = "none";
        discoverSection.style.display = "none";
        profileSection.style.display = "block";
    });
 
 
    // Search button functionality
    searchButton.addEventListener("click", function () {
        const query = gameSearchInput.value.trim();
 
 
        if (query) {
            // Show search results
            resultSection.style.display = "block";
            resultSection.innerHTML = `<h2>Results for "${query}"</h2><p>Example game details here...</p>`;
        } else {
            alert("Please enter a game name to search.");
        }
    });
 });
 