const domDisplay = (aSearchResult, temperature, flag, localTime) => {
    const searchResult = document.createElement('div');
    searchResult.classList.add('searchResult')

    const city = document.createElement('span').textContent = aSearchResult.city + ", ";
    searchResult.append(city)

    if (aSearchResult.state) {
        const state = document.createElement('span').textContent = aSearchResult.state + ", ";
        searchResult.append(state)
    }

    const country = document.createElement('span').textContent = aSearchResult.country + " ";
    searchResult.append(country)

    const flagIcon = document.createElement('img');
    flagIcon.crossOrigin = 'anonymous'
    flagIcon.style.height = '15px'
    flagIcon.src = flag;
    searchResult.append(flagIcon)

    input.classList.add('hidden')
    searchBtn.classList.add('hidden')
    inputAndSearch.append(searchResult)


    searchResult.addEventListener('click', (event) => {
        const myCity = { aSearchResult };
        localStorage.setItem("myCity", JSON.stringify(myCity));
        let red = (temperature + 40) / 80 * 255;
        let blue = (80 - temperature) / 80 * 255;
        const root = document.documentElement.style;
        root.setProperty("--red", red);
        root.setProperty("--blue", blue);
        root.setProperty("--color", 'orange');
        const gradient = document.querySelector('.gradient');
        gradient.classList.toggle('active');

        inputAndSearch.remove();

        const temperatureDisplay = document.createElement('div');
        const tempLabel = document.createElement('div');
        const timeDisplay = document.createElement('div');

        timeDisplay.classList.add('timeDisplay')
        tempLabel.classList.add('tempLabel')
        temperatureDisplay.classList.add('temperatureDisplay');

        timeDisplay.textContent = localTime
        tempLabel.textContent = event.target.textContent;
        temperatureDisplay.textContent = temperature + "°C";

        document.body.append(timeDisplay, tempLabel, temperatureDisplay)

    });
}

document.body.classList.add('gradient')
const inputAndSearch = document.createElement('div');
const input = document.createElement('input');
const searchBtn = document.createElement('button');

inputAndSearch.append(input, searchBtn);
document.body.append(inputAndSearch);

inputAndSearch.classList.add('inputAndSearch')

input.placeholder = 'Search for city'

searchBtn.textContent = 'search'
searchBtn.addEventListener('click', () => {
    let cleanSearch = input.value.replace(/[^a-zåäöA-Z\s]/g, "");
    search(cleanSearch)
})


const search = async (searchTerm) => {
    try {
        const res = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${searchTerm}`
        );
        const data = await res.json();
        for (let key = 0; key < Object.keys(data.results).length; key++) {
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
            const flag = await getFlag(searchResult.country_code);
            const localTime = getLocalTime(searchResult.timezone);
            domDisplay(searchResult, temperature, flag, localTime)
        }
    }
    catch (error) {
        input.value = ''
        input.placeholder = 'city not found'
        console.log(error)
    }
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
        console.log(error)
    }
}

const getFlag = async (country_code) => {
    try {
        const res = await fetch(
            `https://countryflagsapi.com/svg/${country_code}`
        );
        return res.url
    }
    catch (error) {
        console.log(error)
    }
}

const getLocalTime = (timeZone) => {
    let date = new Date();
    let options = { timeZone: timeZone, hour12: false, hour: "numeric", minute: "numeric", second: "numeric" };
    return date.toLocaleString("en-US", options);
}


const getLocalStorage = async () => {
    const temperature = await getTemperature(myCity.aSearchResult.latitude, myCity.aSearchResult.longitude);
    const flag = await getFlag(myCity.aSearchResult.country_code);
    const localTime = getLocalTime(myCity.aSearchResult.timezone);
    domDisplay(myCity.aSearchResult, temperature, flag, localTime)
}

let myCity = JSON.parse(localStorage.getItem("myCity")) || {};

if (Object.keys(myCity).length > 0) {
    getLocalStorage()
}

document.body.addEventListener('dblclick', () => {
    localStorage.clear();
    location.reload();
})
