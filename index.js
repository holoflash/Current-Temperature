const container = document.querySelector('.container')

const domDisplay = (aSearchResult) => {
    const searchResult = document.createElement('div');
    searchResult.classList.add('searchResult')

    const name = document.createElement('span').textContent = aSearchResult.name + ", ";
    const country = document.createElement('span').textContent = aSearchResult.country + ", ";

    searchResult.append(name, country)
    container.append(searchResult)

    searchResult.addEventListener('click', () => {
        let latitude = aSearchResult.latitude.toFixed(2);
        let longitude = aSearchResult.longitude.toFixed(2);
        getWeather(latitude, longitude)
    })
}

const tempDisplay = (temperature) => {
    const temperatureDisplay = document.createElement('span').textContent = "c" + temperature;
    document.querySelector('.container').append(temperatureDisplay);
}

const search = async (searchTerm) => {
    try {
        const res = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${searchTerm}`
        );
        const data = await res.json();

        for (let key = 0; key < Object.keys(data).length; key++) {
            const searchResult = {
                name: data.results[key].name,
                country: data.results[key].country,
                latitude: data.results[key].latitude,
                longitude: data.results[key].longitude,
            }
            domDisplay(searchResult)
            console.log(searchResult)
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
    search(input.value)
})
