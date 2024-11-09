let currentPage = 1;
const itemsPerPage = 8;
let currentResults = [];

function search() {
    const nameTerm = document.getElementById('nameInput').value.toLowerCase();
    const criteria = {
        nationality: document.getElementById('nationInput').value.toLowerCase(),
        club: document.getElementById('clubInput').value.toLowerCase(),
        position: document.getElementById('positionInput').value.toLowerCase(),
        foot: document.getElementById('footInput').value.toLowerCase(),
        rating: document.getElementById('ratingInput').value.toLowerCase(),
    };

    fetch('https://trungta-hust-dls24.vercel.app/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nameTerm, criteria })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Dữ liệu trả về:', data);
            currentResults = data;
            currentPage = 1;
            displayResults(currentResults, currentPage);
            updatePaginationButtons(currentResults.length);
        })
        .catch(error => {
            console.error('Có lỗi xảy ra:', error);
        });
}

function displayResults(results, page) {
    const resultsDiv = document.getElementById('results');
    const playerDetailsDiv = document.querySelector('.column:nth-child(2)');
    resultsDiv.innerHTML = '';
    playerDetailsDiv.innerHTML = '';

    if (!Array.isArray(results)) {
        resultsDiv.innerHTML = '<p>Đã xảy ra lỗi với dữ liệu trả về từ server.</p>';
        console.error('Dữ liệu trả về không phải là mảng:', results);
        return;
    }

    if (results.length === 0) {
        resultsDiv.innerHTML = '<p>Not found.</p>';
        return;
    }

    if (results.length === 1) {
        displayPlayerDetails(results[0], playerDetailsDiv);
    } else {
        displayPlayerList(results, page, resultsDiv);
    }

    if (results.length > 1) {
        displayPlayerDetails(results[0], playerDetailsDiv);
    }
}

function displayPlayerDetails(player, container) {
    const headerBackgroundColor = getHeaderBackgroundColor(player.rating || 0);
    const isGK = player.position.toLowerCase() === 'gk';

    let playerDetails = `
    <div class="player-frame">
        <div id="playerHeader" class="player-header" style="background-color: ${headerBackgroundColor};">
            <h2 id="playerName">${player.first_name || ''} ${player.last_name || ''}</h2>
        </div>
        <div class="header-info-container">
            <p>Price: <span id="playerPrice">${player.price || ''}</span></p>
            <p>Nationality: <span id="playerNationality">${player.nationality || ''}</span></p>
            <p>Club: <span id="playerClub">${player.club || ''}</span></p>
            <p>Position: <span id="playerPosition">${player.position || ''}</span></p>
            <p>Leg: <span id="playerFoot">${player.foot || ''}</span></p>
            <p>Rating: <span id="playerRating">${player.rating || ''}</span></p>
            <p>Height: <span id="playerHeight">${player.height || ''}</span></p>
        </div>
        <div class="info-container">
            <div id="speedInfo" class="info-item" style="background-color: ${getBackgroundColor(player.speed)};">
                SPE: <span id="playerSpeed">${player.speed || ''}</span>
            </div>
            <div id="accInfo" class="info-item" style="background-color: ${getBackgroundColor(player.acceleration)};">
                ACC: <span id="playerAcceleration">${player.acceleration || ''}</span>
            </div>
            ${isGK ? `
            <div id="gkrInfo" class="info-item" style="background-color: ${getBackgroundColor(player.stamina)};">
                GKR: <span id="playerReaction">${player.stamina || ''}</span>
            </div>
            ` : `
            <div id="staInfo" class="info-item" style="background-color: ${getBackgroundColor(player.stamina)};">
                STA: <span id="playerStamina">${player.stamina || ''}</span>
            </div>
            `}
            <div id="strInfo" class="info-item" style="background-color: ${getBackgroundColor(player.strength)};">
                STR: <span id="playerStrength">${player.strength || ''}</span>
            </div>
            <div id="conInfo" class="info-item" style="background-color: ${getBackgroundColor(player.control)};">
                CON: <span id="playerControl">${player.control || ''}</span>
            </div>
            <div id="pasInfo" class="info-item" style="background-color: ${getBackgroundColor(player.passing)};">
                PAS: <span id="playerPassing">${player.passing || ''}</span>
            </div>
            ${isGK ? `
            <div id="gkhInfo" class="info-item" style="background-color: ${getBackgroundColor(player.shooting)};">
                GKH: <span id="playerHandling">${player.shooting || ''}</span>
            </div>
            ` : `
            <div id="shoInfo" class="info-item" style="background-color: ${getBackgroundColor(player.shooting)};">
                SHO: <span id="playerShooting">${player.shooting || ''}</span>
            </div>
            `}
            <div id="tacInfo" class="info-item" style="background-color: ${getBackgroundColor(player.tackling)};">
                TAC: <span id="playerTackling">${player.tackling || ''}</span>
            </div>
        </div>
    </div>
    `;

    container.innerHTML = playerDetails;
}

function displayPlayerList(results, page, container) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedResults = results.slice(start, end);

    paginatedResults.forEach(player => {
        const playerRow = document.createElement('div');
        playerRow.classList.add('player-row');

        if (player.rating >= 80) {
            playerRow.classList.add('high-rating');
        } else if (player.rating >= 70) {
            playerRow.classList.add('medium-rating');
        } else {
            playerRow.classList.add('low-rating');
        }

        let positionClass = '';

        switch (player.position.toLowerCase()) {
            case 'cf':
            case 'ss':
            case 'lw':
            case 'rw':
                positionClass = 'forward';
                break;
            case 'cm':
            case 'am':
            case 'dm':
            case 'lm':
            case 'rm':
            case 'lwb':
            case 'rwb':
                positionClass = 'midfielder';
                break;
            case 'lb':
            case 'cb':
            case 'rb':
                positionClass = 'defender';
                break;
            case 'gk':
                positionClass = 'goalkeeper';
                break;
        }

        playerRow.innerHTML = `
        <span class="player-info name">${player.first_name || ''} ${player.last_name || ''}</span>
        <span class="player-info position ${positionClass}">${player.position || ''}</span>
        <span class="player-info rating">${player.rating || ''}</span>
        `;

        // Thêm sự kiện click cho mỗi hàng
        playerRow.addEventListener('click', () => {
            const playerDetailsDiv = document.querySelector('.column:nth-child(2)');
            displayPlayerDetails(player, playerDetailsDiv);

            // Loại bỏ class 'selected' từ tất cả các hàng
            document.querySelectorAll('.player-row').forEach(row => row.classList.remove('selected'));
            // Thêm class 'selected' cho hàng được chọn
            playerRow.classList.add('selected');
        });

        container.appendChild(playerRow);
    });
}

function getBackgroundColor(value) {
    if (value < 60) return '#ff4d4d';
    if (value >= 60 && value < 70) return '#ffcc99';
    if (value >= 70 && value < 80) return '#ffff99';
    if (value >= 80 && value < 90) return '#66ff66';
    if (value >= 90) return '#99ccff';
    return '#f9f9f9';
}

function getHeaderBackgroundColor(rating) {
    if (rating >= 80) return '#ffff99';
    if (rating >= 70) return '#99ccff';
    return '#ffffff';
}

function updatePaginationButtons(totalItems) {
    const backButton = document.getElementById('backButton');
    const nextButton = document.getElementById('nextButton');

    backButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage * itemsPerPage >= totalItems;

    backButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            displayResults(currentResults, currentPage);
            updatePaginationButtons(currentResults.length);
        }
    };

    nextButton.onclick = () => {
        if (currentPage * itemsPerPage < totalItems) {
            currentPage++;
            displayResults(currentResults, currentPage);
            updatePaginationButtons(currentResults.length);
        }
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const defaultPlayer = {
        first_name: '',
        last_name: '',
        price: '',
        nationality: '',
        club: '',
        position: '',
        foot: '',
        rating: '',
        height: '',
        speed: '',
        acceleration: '',
        stamina: '',
        strength: '',
        control: '',
        passing: '',
        shooting: '',
        tackling: ''
    };
    const playerDetailsDiv = document.querySelector('.column:nth-child(2)');
    displayPlayerDetails(defaultPlayer, playerDetailsDiv);
});

const clubs = [
    "Aberdeen", "AC Milan", "Ajax", "Alaves", "Alkmaar", "Almeria", "Arouca", "Arsenal",
    "Aston Villa", "Atalanta", "Athletic Bilbao", "Atletico Madrid", "Barcelona", "Barcelos",
    "Benfica", "Birmingham", "Blackburn", "Boavista", "Bologna", "Bournemouth", "Braga",
    "Brentford", "Brest", "Brighton", "Bristol", "Burnley", "Cadiz", "Cagliari", "Cardiff",
    "Casa P", "Celta Vigo", "Celtic", "Chaves", "Chelsea", "Clermont-Ferrand", "Coventry",
    "Crystal Palace", "Dundee", "Empoli", "Estoril", "Everton", "Famalicao", "Farense",
    "Feyenoord", "Fiorentina", "Frosinone", "Fulham", "Genoa", "Getafe", "Girona", "Granada",
    "Guimaraes", "Hearts", "Heerenveen", "Hibernian", "Huddersfield", "Hull", "Inter Milan",
    "Ipswich", "Juventus", "Kilmarnock", "Las Palmas", "Lazio", "Le Havre", "Lecce", "Leeds",
    "Leicester", "Lens", "Lille", "Liverpool", "Livingston", "Lorient", "Luton", "Lyon",
    "Mallorca", "Man City", "Man United", "Marseille", "Metz", "Middlesbrough", "Millwall",
    "Monaco", "Montpellier", "Monza", "Motherwell", "Nantes", "Napoli", "Newcastle", "Nice",
    "Nijmegen", "Norwich", "Nottingham", "Osasuna", "Paris SG", "Plymouth", "Portimao",
    "Porto", "Preston", "PSV", "Queens Park R", "Rangers", "Rayo Vallecano", "Real Betis",
    "Real Madrid", "Real Sociedad", "Reims", "Rennes", "Roma", "Ross C", "Rotherham",
    "Rotterdam", "S Johnstone", "S Lisbon", "S Mirren", "Salernitana", "Sassuolo", "Sevilla",
    "Sheffield United", "Sheffield W", "Sittard", "Southampton", "Stoke", "Strasbourg",
    "Sunderland", "Swansea", "Torino", "Tottenham", "Toulouse", "Twente", "Udinese", "Utrecht",
    "V Arnhem", "Valencia", "Verona", "Villareal", "Vizela", "Waalwijk", "Watford",
    "West Bromwich", "West Ham", "Wolves"
];

const nations = [
    "Albania", "Algeria", "Angola", "Antigua & Barbuda", "Argentina", "Armenia", "Australia", "Austria",
    "Belarus", "Belgium", "Benin", "Bermuda", "Bosnia & Herzegovina", "Brazil", "Bulgaria", "Burkina Faso",
    "Burundi", "Cameroon", "Canada", "Cape Verde", "Central African Rep.", "Chile", "Colombia", "Comoros",
    "Congo", "Costa Rica", "Croatia", "Cuba", "Curacao", "Cyprus", "Czech Republic", "Denmark",
    "Dominican Republic", "DR Congo", "Ecuador", "Egypt", "England", "Equatorial Guinea", "Estonia",
    "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada",
    "Guadeloupe", "Guinea", "Guinea-Bissau", "Haiti", "Honduras", "Hungary", "Iceland", "Irag", "Iran",
    "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kosovo", "Liberia",
    "Libya", "Lithuania", "Luxembourg", "Mali", "Malta", "Mexico", "Montenegro", "Morocco", "Mozambique",
    "Netherlands", "New Zealand", "Nigeria", "North Macedonia", "North. Ireland", "Norway", "Panama",
    "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Romania", "Russia", "Saint Kitts and Nevis",
    "Scotland", "Senegal", "Serbia", "Sierra Leone", "Slovakia", "Slovenia", "South Africa", "South Korea",
    "Spain", "St. Kitts & Nevis", "St. Lucia", "Suriname", "Sweden", "Switzerland", "Syria", "Togo",
    "Trinidad & Tobago", "Tunisia", "Turkey", "Ukraine", "Uruguay", "USA", "Uzbekistan", "Venezuela",
    "Wales", "Zambia", "Zimbabwe"
];

const clubInput = document.getElementById('clubInput');
const clubList = document.getElementById('clubList');
const nationInput = document.getElementById('nationInput');
const nationList = document.getElementById('nationList');

function setupAutocomplete(input, list, dataArray) {
    input.addEventListener('input', function () {
        const value = this.value.toLowerCase();
        list.innerHTML = '';
        list.style.display = 'none';
        if (value.length > 0) {
            const filteredItems = dataArray.filter(item =>
                item.toLowerCase().includes(value)
            );
            if (filteredItems.length > 0) {
                filteredItems.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    li.addEventListener('click', function () {
                        input.value = this.textContent;
                        list.style.display = 'none';
                    });
                    list.appendChild(li);
                });
                list.style.display = 'block';
            }
        }
    });
}

setupAutocomplete(clubInput, clubList, clubs);
setupAutocomplete(nationInput, nationList, nations);

document.addEventListener('click', function (e) {
    if (e.target !== clubInput && e.target !== clubList) {
        clubList.style.display = 'none';
    }
    if (e.target !== nationInput && e.target !== nationList) {
        nationList.style.display = 'none';
    }
});