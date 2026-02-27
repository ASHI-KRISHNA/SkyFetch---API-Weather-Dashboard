# SkyFetch---API-Weather-Dashboard




WeatherApp.prototype.getWeather = async function(city) {
    // TODO: Show loading state
    this.showLoading();
    
    // TODO: Disable search button
    this.searchBtn.disabled = true;
    this.searchBtn.textContent = 'Searching...';
    
    // TODO: Build API URL with this.apiUrl and this.apiKey
    
    try {
        // TODO: Make API call with await
        const response = await axios.get(url);
        
        // TODO: Call displayWeather with data
        // this.displayWeather(response.data);
        
    } catch (error) {
        // TODO: Handle errors
        console.error('Error:', error);
        
        // TODO: Show appropriate error message
        // if (error.response && error.response.status === 404) {
        //     this.showError('City not found...');
        // } else {
        //     this.showError('Something went wrong...');
        // }
        
    } finally {
        // TODO: Re-enable search button
        // this.searchBtn.disabled = false;
        // this.searchBtn.textContent = 'Search';
    }
};



`${API_URL}?q=${city}&appid=${API_KEY}&units=metric`