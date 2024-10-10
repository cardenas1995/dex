// Define the number of Pokémon to load into the Pokédex
const pokemonCount = 300; // You can change this number to load a different number of Pokémon.

const pokedex = {}; // Object to store Pokémon data in the format: {id: {name, img, type, desc} }

let selectedPokemon = {}; // Object to store the currently selected Pokémon.

// Function to fetch Pokémon data from the PokeAPI
function getPokemon(num) {
    const url = `https://pokeapi.co/api/v2/pokemon/${num}`; // URL to fetch Pokémon data

    return fetch(url)
        .then(response => response.json())
        .then(pokemon => {
            const pokemonName = pokemon.name;
            const pokemonImg = pokemon.sprites.front_default; // Front image
            const pokemonBackImg = pokemon.sprites.back_default; // Back image
            const pokemonType = pokemon.types.map(type => type.type.name); // Pokémon types
            const pokemonId = pokemon.id;
            const speciesUrl = pokemon.species.url; // URL to fetch species information

            // Fetch species data to get the Pokémon description
            return fetch(speciesUrl)
                .then(response => response.json())
                .then(species => {
                    // Find the English description of the Pokémon
                    const englishDescription = species.flavor_text_entries.find(entry => entry.language.name === "en");
                    const pokemonDescription = englishDescription.flavor_text;

                    // Store fetched data in the pokedex object
                    pokedex[num] = {
                        name: pokemonName,
                        img: pokemonImg,
                        backImg: pokemonBackImg,
                        types: pokemonType,
                        desc: pokemonDescription,
                        id: pokemonId
                    };
                });
        });
}

// Function to execute when the window has loaded
window.onload = function() {
    const promises = []; // Array to hold promises for fetching Pokémon data

    // Loop to fetch data for all Pokémon
    for (let i = 1; i <= pokemonCount; i++) {
        promises.push(getPokemon(i)); // Push each promise into the array
    }

    // Wait for all promises to resolve before rendering Pokémon list
    Promise.all(promises).then(() => {
        for (let i = 1; i <= pokemonCount; i++) {
            const pokemon = document.createElement("div"); // Create a new div for each Pokémon
            pokemon.id = pokedex[i].id; // Set the Pokémon's ID
            pokemon.innerText = `${i}. ${pokedex[i].name.toUpperCase()}`; // Set display name
            pokemon.classList.add("pokemon-name"); // Add class for styling
            pokemon.addEventListener("click", updatePokemon); // Add click event listener
            document.getElementById("pokemon-list").append(pokemon); // Append Pokémon to the list
        }

        // Set up the initial Pokémon display
        const imageElement = document.getElementById("pokemon-img");
        imageElement.addEventListener("mouseover", updateImage);
        imageElement.src = pokedex[1].img; // Set initial image
        document.getElementById("pokemon-description").innerText = pokedex[1].desc; // Set initial description
    });
};

// Function to update the display when a Pokémon is selected
function updatePokemon(e) {
    selectedPokemon = pokedex[e.target.id]; // Get selected Pokémon data

    // Highlight the selected Pokémon
    const previousSelected = document.querySelector('.selected');
    if (previousSelected) {
        previousSelected.classList.remove('selected');
    }
    e.target.classList.add('selected'); 

    // Update the displayed Pokémon image
    document.getElementById("pokemon-img").src = pokedex[e.target.id].img;

    // Clear previous types
    const typesDiv = document.getElementById("pokemon-types");
    while (typesDiv.firstChild) {
        typesDiv.firstChild.remove();
    }

    // Update Pokémon types
    const types = pokedex[e.target.id].types;
    for (let i = 0; i < types.length; i++) {
        const type = document.createElement("span");
        type.innerText = types[i].toUpperCase(); // Display type in uppercase
        type.classList.add("type-box", types[i]); // Add classes for styling
        typesDiv.append(type); // Append type to the types div
    }

    // Update Pokémon description
    document.getElementById("pokemon-description").innerText = pokedex[e.target.id].desc;
}

// Function to update the Pokémon image on mouseover
function updateImage() {
    const backImageElement = document.getElementById("pokemon-img");

    // Change the image to the back image when mouse hovers
    backImageElement.src = Object.keys(selectedPokemon).length === 0
        ? pokedex[1].backImg // Default to the first Pokémon's back image if none selected
        : selectedPokemon.backImg; // Use selected Pokémon's back image

    // Reset to the original image when mouse leaves
    backImageElement.addEventListener("mouseleave", function () {
        backImageElement.src = Object.keys(selectedPokemon).length === 0
            ? pokedex[1].img // Default to the first Pokémon's front image
            : selectedPokemon.img; // Use selected Pokémon's front image
    });
}
