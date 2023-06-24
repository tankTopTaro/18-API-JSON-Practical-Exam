const cryptoContainer = document.querySelector('.crypto-container');
const loadingIndicator = document.querySelector('.loading-indicator');
let dataLoaded = false;

const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1, 
};

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !dataLoaded) {
            fetchData();
            dataLoaded = true;
        }
    });
}, observerOptions);

observer.observe(cryptoContainer)

function fetchData() {
    loadingIndicator.style.display = 'block';

    fetch('https://api.coingecko.com/api/v3/exchange_rates')
        .then(response => {
            if (response.ok) {
            return response.json();
            } else {
            throw new Error('Error: ' + response.status);
            }
        })
        .then(data => {
            loadingIndicator.style.display = 'none';

            const searchInput = document.getElementById('searchInput');

            const handleSearch = event => {
                if (event.key === 'Enter') {
                    const searchTerm = searchInput.value.toLowerCase();

                    cryptoContainer.innerHTML = '';

                    const filteredRates = Object.values(data.rates).filter(rate => {
                        const lowercaseName = rate.name.toLowerCase();
                        const lowercaseUnit = rate.unit.toLowerCase();

                        return lowercaseName.includes(searchTerm) || lowercaseUnit.includes(searchTerm);
                    });

                    if (filteredRates.length > 0) {
                        filteredRates.forEach(rate => {
                            displayData(rate);
                        })
                    } else {
                        showNotification();
                    }

                    event.preventDefault();
                }
            }

            searchInput.addEventListener('keydown', handleSearch);

            for (const key in data.rates) {
                const rate = data.rates[key];

                displayData(rate);
            }

            if (Object.keys(data.rates).length > 0) {
                showNotification();
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function displayData(rate) {
    const coinContainer = document.createElement('div');
    coinContainer.classList.add('coin-container');

    const infoContainer = document.createElement('div');
    infoContainer.classList.add('info-container');

    const imageContainer = document.createElement('div');
    imageContainer.classList.add('image-container');

    const imageElement = document.createElement('img');
    imageElement.src = 'https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=025'
    imageElement.alt = '';

    const rateElement = document.createElement('h3');
    rateElement.textContent = `Rate: ${rate.value}`;

    const nameElement = document.createElement('small');
    nameElement.textContent = `Crypto name: ${rate.name}`;

    const unitElement = document.createElement('small');
    unitElement.textContent = `Crypto unit: ${rate.unit}`;

    imageContainer.appendChild(imageElement);

    infoContainer.appendChild(rateElement);
    infoContainer.appendChild(nameElement);
    infoContainer.appendChild(unitElement);
    
    coinContainer.appendChild(imageContainer);
    coinContainer.appendChild(infoContainer);

    cryptoContainer.appendChild(coinContainer);
}

function showNotification() {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = 'No more records to show.';
    cryptoContainer.appendChild(notification);
}