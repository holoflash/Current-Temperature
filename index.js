const container = document.querySelector('.container')

const domDisplay = (aSearchResult) => {
    const searchResult = document.createElement('div');
    searchResult.classList.add('searchResult')

    const city = document.createElement('span').textContent = aSearchResult.city + ", ";
    searchResult.append(city)

    if (aSearchResult.state) {
        const state = document.createElement('span').textContent = aSearchResult.state + ", ";
        searchResult.append(state)
    }

    const country = document.createElement('span').textContent = aSearchResult.country + ", ";
    searchResult.append(country)

    container.append(searchResult)

    searchResult.addEventListener('click', () => {
        let latitude = aSearchResult.latitude.toFixed(2);
        let longitude = aSearchResult.longitude.toFixed(2);
        getWeather(latitude, longitude)
    })
}

const tempDisplay = (temperature) => {
    const temperatureDisplay = document.createElement('div').textContent = "c" + temperature;
    document.querySelector('.container').append(temperatureDisplay);
}

const search = async (searchTerm) => {
    console.log(searchTerm)
    try {
        const res = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${searchTerm}`
        );
        const data = await res.json();

        for (let key = 0; key < Object.keys(data).length; key++) {
            const searchResult = {
                city: data.results[key].name,
                country: data.results[key].country,
                state: data.results[key].admin1,
                latitude: data.results[key].latitude,
                longitude: data.results[key].longitude,
                message: data.results,
            }
            domDisplay(searchResult)
        }
    }
    catch (error) {
        console.log(error)
    }
};


const getWeather = async (lat, long) => {
    try {
        const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current_weather=true&`
        );
        const data = await res.json();
        tempDisplay(data.current_weather.temperature)
    }
    catch (error) {
        console.log(error)
    }
}


const input = document.createElement('input')
document.body.append(input);

const searchBtn = document.createElement('button')
document.body.append(searchBtn)

searchBtn.textContent = 'search'

searchBtn.addEventListener('click', () => {
    let cleanSearch = input.value.replace(/[^a-zA-Z\s]/g, "");
    search(cleanSearch)

})
