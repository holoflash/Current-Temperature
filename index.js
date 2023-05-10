//Home page
const inputAndSearch = document.createElement('div');
const input = document.createElement('input');
const searchBtn = document.createElement('button');
const loading = document.createElement('img')
loading.classList.add('loading')
loading.src = 'icon.svg'
loading.alt = 'loading'
document.body.classList.add('gradient')
inputAndSearch.classList.add('inputAndSearch')
input.placeholder = 'City'
searchBtn.textContent = 'Search'
inputAndSearch.append(input, searchBtn);
document.body.append(inputAndSearch);

const domDisplay = (aSearchResult, temperature, flag, localTime) => {
    //Generate and display the search results
    const searchResult = document.createElement('div');
    searchResult.classList.add('searchResult')
    const city = document.createElement('span').textContent = aSearchResult.city;
    searchResult.append(city)

    if (aSearchResult.state) {
        const state = document.createElement('span').textContent = ", " + aSearchResult.state;
        searchResult.append(state)
    }
    if (aSearchResult.country) {
        const country = document.createElement('span').textContent = ", " + aSearchResult.country;
        searchResult.append(country)
    }
    if (flag) {
        const flagIcon = document.createElement('img');
        flagIcon.src = flag;
        flagIcon.alt = aSearchResult.country;
        if (flagIcon.alt === "undefined") {
            flagIcon.src = 'icon.svg'
        }
        searchResult.append(flagIcon)
    }
    document.body.append(searchResult)

    searchResult.addEventListener('click', (event) => {
        let fullName = event.target.textContent;
        handleCityClick(fullName, aSearchResult, temperature, localTime);
    });
}

const handleCityClick = (fullName, aSearchResult, temperature, localTime) => {
    //Hide all search results
    document.querySelectorAll('.searchResult').forEach(result => result.remove());

    //Store selected city in localStorage
    const myCity = { aSearchResult };
    localStorage.setItem("myCity", JSON.stringify(myCity));

    //Set background gradient colors based on temp and time. Cold = blue, warm = red, night = dark-blue, day = orange
    let red = (temperature + 40) / 80 * 255;
    let blue = (80 - temperature) / 80 * 255;
    let [hours] = localTime.split(':').map(Number);
    let timeColor;
    if (hours >= 6 && hours < 18) {
        timeColor = 'orange';
    } else {
        timeColor = 'rgb(0,0,50)';
    }

    const root = document.documentElement.style;
    root.setProperty("--red", red);
    root.setProperty("--blue", blue);
    root.setProperty("--color", timeColor);
    const gradient = document.querySelector('.gradient');
    gradient.classList.toggle('active');

    //Display full city name, temp, time of temp fetch and option to change city
    inputAndSearch.remove();
    const temperatureDisplay = document.createElement('div');
    const tempLabel = document.createElement('div');
    const timeDisplay = document.createElement('div');
    const changeCity = document.createElement('button')
    timeDisplay.classList.add('timeDisplay')
    tempLabel.classList.add('tempLabel')
    temperatureDisplay.classList.add('temperatureDisplay');
    changeCity.classList.add('changeCity')
    changeCity.textContent = "Change city"
    timeDisplay.textContent = "Temperature fetched: " + localTime
    tempLabel.textContent = fullName;

    //Celsius/fahrenheit operations and toggle
    if (temperatureUnit === "°F") {
        temperature = ((temperature * 9 / 5) + 32).toFixed(1);
    }
    temperatureDisplay.textContent = temperature + temperatureUnit;
    temperatureDisplay.addEventListener('click', () => {
        if (temperatureDisplay.textContent.endsWith("°C")) {
            temperature = ((temperature * 9 / 5) + 32).toFixed(1);
            temperatureDisplay.textContent = temperature + "°F";
            localStorage.setItem("temperatureUnit", "°F");
        } else {
            temperature = ((temperature - 32) * 5 / 9).toFixed(1);
            temperatureDisplay.textContent = temperature + "°C";
            localStorage.setItem("temperatureUnit", "°C");
        }
    });
    changeCity.addEventListener('click', () => {
        localStorage.clear();
        location.reload();
    })
    document.title = "Current Temperature in: " + fullName;
    document.body.append(changeCity, tempLabel, temperatureDisplay, timeDisplay)
    document.body.style.justifyContent = "space-around";
}

//Start of data gathering
const search = async (searchTerm) => {
    document.body.appendChild(loading);
    try {
        const res = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${searchTerm}`
        );
        const data = await res.json();
        for (let key = 0; key < Object.keys(data.results).length; key++) {
            document.body.classList.add('disabled');
            const searchResult = {
                city: data.results[key].name,
                country: data.results[key].country,
                state: data.results[key].admin1,
                latitude: data.results[key].latitude,
                longitude: data.results[key].longitude,
                country_code: data.results[key].country_code,
                timezone: data.results[key].timezone
            }
            const temperature = await getTemperature(searchResult.latitude, searchResult.longitude);
            const flag = getFlag(searchResult.country_code)
            const localTime = getLocalTime(searchResult.timezone);
            domDisplay(searchResult, temperature, flag, localTime)
            document.body.classList.remove('disabled');
        }
    }
    catch (error) {
        input.value = ''
        input.placeholder = 'City not found'
    }
    loading.remove();
};

const getTemperature = async (lat, long) => {
    try {
        const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current_weather=true&`
        );
        const data = await res.json();
        return data.current_weather.temperature
    }
    catch (error) {
        return 'temperature unavailable'
    }
}

const getFlag = (country_code) => {
    if (country_code === undefined) {
        return 'icon.svg'
    }
    return `https://flagsapi.com/${country_code}/flat/48.png`
}

const getLocalTime = (timeZone) => {
    let date = new Date();
    let options = { timeZone: timeZone, hour12: false, hour: "numeric", minute: "numeric", second: "numeric" };
    return date.toLocaleString("en-US", options);
}

//If a city is stored in localStorage - get the current temperature and localTime and display it along with stored temp unit
const getLocalStorage = async () => {
    document.body.appendChild(loading);
    const savedCity = myCity.aSearchResult;
    const temperature = await getTemperature(savedCity.latitude, savedCity.longitude);
    const flag = getFlag(savedCity.country_code);
    const localTime = getLocalTime(savedCity.timezone);
    const fullName = `${savedCity.city}${savedCity.state ? ', ' + savedCity.state : ''}${savedCity.country ? ', ' + savedCity.country : ''}`;
    domDisplay(savedCity, temperature, flag, localTime);
    handleCityClick(fullName, savedCity, temperature, localTime);
    loading.remove();
}

let myCity = JSON.parse(localStorage.getItem("myCity")) || {};
let temperatureUnit = localStorage.getItem("temperatureUnit") || '°C';
if (Object.keys(myCity).length > 0) {
    getLocalStorage()
}

input.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
})

searchBtn.addEventListener('click', () => {
    document.querySelectorAll('.searchResult').forEach(result => result.remove());
    let cleanSearch = input.value.replace(/[^a-zåäöA-Z\s]/g, "");
    search(cleanSearch)
})
