let searchButton = document.getElementById("search-button");
let clearButton = document.getElementById("clear-button");
let historyList;

// Takes in a date from data.list and converts its format to mm/dd/yyyy.
function formatDate(date)
{
    let nthDtArray = date.split(" ");
    let nthDate = nthDtArray[0];
    nthDtArray = nthDate.split("-");
    nthDate = nthDtArray[1] + "/" + nthDtArray[2] + "/" + nthDtArray[0];
    return nthDate;
}

// Return today's day.
function getCurrentDate()
{
    const dayjsObj = dayjs();
    return dayjsObj.format("MM/DD/YYYY");
}

// Grabs user history from local storage of cities searched for.
function getHistory()
{
    if (localStorage.getItem("localHistory") !== null) {
        historyList = JSON.parse(localStorage.getItem("localHistory"));

        // Create buttons for cities in history.
        if (historyList.length > 0) {
            let buttonList = [];
            for (let i = 0; i < historyList.length; i++)
            {
                // Create the button and add it to buttonList.
                buttonList[i] = document.createElement("button");              
                buttonList[i].setAttribute("id", "button-" + i);
                buttonList[i].setAttribute("class", "btn");

                // Give it a label and append it to its parent.
                buttonList[i].innerHTML = historyList[i];
                document.getElementById("history-" + i).append(buttonList[i]);

                let city = buttonList[i].innerHTML;

                //Create an event listener to make the button functional.
                buttonList[i].addEventListener("click", function(event) {
                    event.preventDefault();
                    document.getElementById("forecast-body").style.visibility = "visible";
                    getTodaysForecast(city);
                });
            }
        }
    }

    else {
        historyList = [];
    }
}

// Clears user history and local storage when called.
function clearHistory()
{
    localStorage.clear();
    historyList = [];
}

function getTodaysForecast(cityName)
{
    // CREATES TODAY'S FORECAST
    fetch("https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=024d76245652e89c24c3b8e04365f5e7")
    .then(response => response.json())
    .then(data => {  
        // Header containing city name, today's date, and weather icon. 
        let cityHeader = document.getElementById("city-header");
        cityHeader.innerHTML = data.name + " (" + getCurrentDate() + ")";
        cityName = data.name;

        // Weather Icon
        let icon0 = document.getElementById("icon-0");
        icon0.src = "https://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png";
        icon0.alt = data.weather[0].main + " (" + data.weather[0].description + ")";

        // Temperature
        const nodeTemp0 = document.createElement("p");
        nodeTemp0.setAttribute("id", "temp-content-0");
        document.getElementById("temp-0").appendChild(nodeTemp0);
        document.getElementById("temp-content-0").innerHTML = "Temperature: " + Number(1.8 * (data.main.temp - 273) + 32).toFixed(1) + "° F";

        // Wind Speed
        const nodeWind0 = document.createElement("p");
        nodeWind0.setAttribute("id", "wind-content-0");
        document.getElementById("wind-0").appendChild(nodeWind0);
        document.getElementById("wind-content-0").innerHTML = "Wind: " + Number(data.wind.speed * 2.237).toFixed(1) + " MPH";
        
        // Humidity
        const nodeHum0 = document.createElement("p");
        nodeHum0.setAttribute("id", "hum-content-0");
        document.getElementById("hum-0").appendChild(nodeHum0);
        document.getElementById("hum-content-0").innerHTML = "Humidity: " + Number(data.main.humidity).toFixed(1) + "%";

        get5DayForecast(cityName);
    })

    // If the fetch failed, return alert to user to check their internet connection.
    .catch(err => alert("Unable To Retrieve Weather: Check that city spelling is correct."))
}

function get5DayForecast(cityName)
{
    // CREATES 5 DAY FORECAST
    fetch("https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&appid=024d76245652e89c24c3b8e04365f5e7")
    .then(response => response.json())
    .then(data => { 
        cityName = data.name;
        let dayCount = 0;
        let dtArray = data.list[0].dt_txt.split(" ");
        let currentDate = dtArray[0];
        for(let i = 0; i < data.list.length && dayCount < 5; i++)
        {
            if (data.list[i].dt_txt.includes("12:00:00")) {              
                dayCount++;

                // Weather Date and Icon
                let nthDate = formatDate(data.list[i].dt_txt);
                let dateHeader = document.getElementById("date-header-" + dayCount);
                dateHeader.innerHTML = nthDate;
                let icon = document.getElementById("icon-" + dayCount);
                icon.src = "https://openweathermap.org/img/wn/" + data.list[i].weather[0].icon + "@2x.png";
                icon.alt = data.list[i].weather[0].main + " (" + data.list[i].weather[0].description + ")";

                // Temperature
                let nodeTemp = document.createElement("p");
                nodeTemp.setAttribute("id", "temp-content-" + dayCount);
                document.getElementById("temp-" + dayCount).appendChild(nodeTemp);
                document.getElementById("temp-content-" + dayCount).innerHTML = "Temp: " + Number(1.8 * (data.list[i].main.temp - 273) + 32).toFixed(1) + "° F";

                // Wind Speed
                let nodeWind = document.createElement("p");
                nodeWind.setAttribute("id", "wind-content-" + dayCount);
                document.getElementById("wind-" + dayCount).appendChild(nodeWind);
                document.getElementById("wind-content-" + dayCount).innerHTML = "Wind: " + Number(data.list[i].wind.speed * 2.237).toFixed(1) + " MPH";

                // Humidity
                let nodeHum = document.createElement("p");
                nodeHum.setAttribute("id", "hum-content-" + dayCount);
                document.getElementById("hum-" + dayCount).appendChild(nodeHum);
                document.getElementById("hum-content-" + dayCount).innerHTML = "Hum: " + Number(data.list[i].main.humidity).toFixed(1) + "%";
            }           
        }

        // ADD CITY TO HISTORY
        cityName = data.city.name;
        if (historyList.includes(cityName) === false) {
            // If history is less than 10, push the new city to the end of the array.
            if (historyList.length < 10) {
                historyList.push(cityName);
            }
            // Else, remove the oldest city and then push the new city to the end of the array.
            else {
                historyList.shift();
                historyList.push(cityName);
            }
        }

        // Update local storage
        localStorage.setItem("localHistory", JSON.stringify(historyList));
    })

    // If the fetch failed, return alert to user to check their spelling.
    .catch(err => alert("Unable To Retrieve Weather: Check that city spelling is correct."))
}

// When page is loaded, get history and make forecast body invisible.
document.getElementById("forecast-body").style.visibility = "hidden";
getHistory();

// Creates search button that grabs user input and gets forecast for that city from getTodaysForecast function.
searchButton.addEventListener("click", function(event) {
    let cityNameInput = document.getElementById("search-box").value;
    event.preventDefault();
    if(cityNameInput.length > 0) {
        document.getElementById("forecast-body").style.visibility = "visible";
        getTodaysForecast(cityNameInput);
    }
});

// Creates clear button that clears history and refreshes the page.
clearButton.addEventListener("click", function(event) {
    clearHistory();
    location.reload();
});