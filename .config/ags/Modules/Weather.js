
import App from 'resource:///com/github/Aylur/ags/app.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Gtk from 'gi://Gtk'
import GObject from 'gi://GObject'
import { timeout } from 'resource:///com/github/Aylur/ags/utils.js'
import { data } from '../Options/options.js'

///////////////////////////////////
//  Weather setup
///////////////////////////////////

// Read in user settings
//const data = JSON.parse(Utils.readFile(`${App.configDir}/../../.cache/ags/UserSettings.json`))
//const data = GetOptions()

// Get lat and lon from city
// Get data from api
async function getCord(cityName){
    let url = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=5&language=en&format=json`

    // Try to make request to weather api
    try {
        // await is needed to wait for the return of the data
        const data = await Utils.fetch(url)
            .then(res => res.json())
            .catch(err => print(err))
        //print("data = " + JSON.stringify(data))
        return data
    }

    // If request fails
    catch{
        return null
    }
}

const searchResults = Variable([], {})

async function updateCities(text){ 
    //let cities = ["london", "new york", "tokyo"] 
    try{
        let data = await getCord(text)
        //let cities = data.results.map(city => city.name.toString())
        let cities = data.results
        print("Cities = " + cities)    
        searchResults.value = cities
    }
    catch(err){
        print(err)
    }

}


const listStore = new Gtk.ListStore()
listStore.set_column_types([GObject.TYPE_STRING, GObject.TYPE_JSOBJECT]);
const completion = new Gtk.EntryCompletion();
completion.set_text_column(0)
completion.set_inline_completion = true
completion.set_inline_selection = true
completion.popup_set_width = true
completion.connect("match-selected", (completion, model, iter) =>{
    print(listStore.get_value(iter, 1).latitude)
    print(listStore.get_value(iter, 1).longitude)
    completion.get_entry().text = listStore.get_value(iter, 0)
    return true
})

// match-selected(entryCompletion, model, iter) 
export const locationSearch = Widget.Entry({
    placeholder_text: "Enter city",
    on_change: self => {
        Utils.timeout(1000, () => {
            // runs with a second delay
            updateCities(self.text).catch(err => print(err))
        })
    },
    on_accept: (self) => {
        print("Entered.. ")
        const [matched, iter] = listStore.get_iter_first()
        print(listStore.get_value(iter, 1).latitude)
        print(listStore.get_value(iter, 1).longitude)
        completion.get_entry().text = listStore.get_value(iter, 0)

    },
}).hook(searchResults, self => {
    print(searchResults.value)

    listStore.clear()
    let cities = searchResults.value
    for (const city of cities) {
        print(city.name.toString()) 
        const iter = listStore.append()
        listStore.set(iter, [0, 1], [city.name.toString() + ", " + city.country_code.toString(), city]);
    }
    completion.set_model(listStore)
    completion.complete()
    self.set_completion(completion)
}, "changed")



if (data != null){
    var lat = data.lat
    var lon = data.lon
}
else{
    var lat = 0
    var lon = 0
}

//TODO add variables for units
var url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,precipitation,weather_code,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=ms&precipitation_unit=inch`

/*
WMO Weather interpretation codes (WW)
Code 	Description
0 	Clear sky
1, 2, 3 	Mainly clear, partly cloudy, and overcast
45, 48 	Fog and depositing rime fog
51, 53, 55 	Drizzle: Light, moderate, and dense intensity
56, 57 	Freezing Drizzle: Light and dense intensity
61, 63, 65 	Rain: Slight, moderate and heavy intensity
66, 67 	Freezing Rain: Light and heavy intensity
71, 73, 75 	Snow fall: Slight, moderate, and heavy intensity
77 	Snow grains
80, 81, 82 	Rain showers: Slight, moderate, and violent
85, 86 	Snow showers slight and heavy
95 * 	Thunderstorm: Slight or moderate
96, 99 * 	Thunderstorm with slight and heavy hail
*/
function LookupWeatherCode(code){
    // Get day/night state
    let mode = ""
    var currentHour = new Date().getHours()
    print("DATE = " + currentHour)
    // If night
    if (currentHour >= 18 || currentHour < 6){
        print("night")
        mode="-night"
    }
    // Else day
    else{
        mode=""
    }

    switch(code) {
        case 0:
            return {
                icon: `weather-clear${mode}-symbolic`, // "weather-clear-night-symbolic"
                image: `weather-clear${mode}`,
                name: "Clear sky",
            }
        case 1:
            return {
                icon: `weather-few-clouds${mode}-symbolic`, // "weather-few-clouds-symbolic"
                image: `weather-few-clouds${mode}`,
                name: "Mostly clear",
            }
        case 2:
            return {
                icon: `weather-few-clouds${mode}-symbolic`, // "weather-few-clouds-symbolic"
                image: `weather-partly-cloudy${mode}`,
                name: "Partly cloudy",
            }
        case 3:
            return {
                icon: `weather-overcast-symbolic`,
                image: `weather-overcast`,
                name: "Overcast",
            }
        case 45:
        case 48:
            return {
                icon: "weather-fog-symbolic",
                image: "weather-fog",
                name: "Fog",
            }
        case 51:
        case 53:
        case 55:
        case 61:
        case 63:
        case 65:
        case 80:
        case 81:
        case 82:
            return {
                icon: "weather-showers-symbolic",
                image: "weather-showers",
                name: "Rain",
            }
        case 95:
        case 96:
        case 99:
            return {
                icon: "weather-storms-symbolic",
                image: "weather-storms",
                name: "Storms",
            }
        // Need to add more
        default:
            print(`Weather code ${code} not recognized.`)
            return {
                icon: "Unknown",
                name: "Unknown",
            }
    } 
}

// Weather icons
//weather-fog-symbolic
//weather-severe-alert-symbolic
//weather-showers-scattered-symbolic
//weather-showers-symbolic
//weather-snow-symbolic
//weather-storm-symbolic
//weather-tornado-symbolic
//weather-windy-symbolic

// Get data from api
async function getWeather(){
    // Try to make request to weather api
    try {
        // await is needed to wait for the return of the data
        const data = await Utils.fetch(url)
            .then(res => res.json())
            //.catch(console.error)
        return data
    }

    // If request fails
    catch{
        return null
    }
}

export const weather = Variable(null, {
    poll: [400000, () => { return getWeather() }]
})

// Current temp
export const currentTemp = Utils.derive([weather], (weather) => {
    if (weather != null){
        return Math.round(weather.current.temperature_2m).toString() + weather.current_units.temperature_2m.toString()
    }
    else{
        return "0"
    }
}) 

// Hi temp
export const hiTemp = Utils.derive([weather], (weather) => {
    if (weather != null){
        return "hi: " + Math.round(weather.daily.temperature_2m_max[0]).toString() + weather.current_units.temperature_2m.toString()
    }
    else{
        return "0"
    }
}) 

// Lo temp
export const loTemp = Utils.derive([weather], (weather) => {
    if (weather != null){
        return "lo: " + Math.round(weather.daily.temperature_2m_min[0]).toString() + weather.current_units.temperature_2m.toString()
    }
    else{
        return "0"
    }
}) 

// status
export const weatherStatus = Utils.derive([weather], (weather) => {
    if (weather != null){
        return LookupWeatherCode(weather.current.weather_code).name
    }
    else{
        return "0"
    }
}) 

// Image
export const weatherImage = Utils.derive([weather], (weather) => {
    if (weather != null){
        print("weather image = " + LookupWeatherCode(weather.current.weather_code).image)
        return LookupWeatherCode(weather.current.weather_code).image
    }
    else{
        return "Unknown"
    }
}) 

// Icon
export const weatherIcon = Utils.derive([weather], (weather) => {
    if (weather != null){
        print("weather code" + weather.current.weather_code)
        return LookupWeatherCode(weather.current.weather_code).icon
    }
    else{
        return "action-unavailable-symbolic"
    }
}) 

// Precipitation
export const precipitation = Utils.derive([weather], (weather) => {
    if (weather != null){
        return Math.round(weather.current.precipitation).toString() + "%"
    }
    else{
        return "0"
    }
}) 

// Humidity
export const humidity = Utils.derive([weather], (weather) => {
    if (weather != null){
        return Math.round(weather.current.relative_humidity_2m).toString() + "%"
    }
    else{
        return "0"
    }
}) 


export const Weather = (w, h) => Widget.Box({
    css: `
        min-width: ${w}rem;
        min-height: ${h}rem;
    `,
    children: [
        // Background image
        Widget.CenterBox({
            class_name: "control-panel-button",
            hexpand: true,
            centerWidget: Widget.Box({
                vertical: true,
                hexpand: false,
                vpack: "center",
                //class_name: "weather-container",
                spacing: 8,
                children: [
                    //Temperature
                    Widget.Box({
                        spacing: 12,
                        children:[
                            // Current temp
                            Widget.Label({
                                hexpand: true,
                                css: `
                                    font-size: 1.8rem;
                                `,
                                label: currentTemp.bind()
                            }),
                            Widget.Box({
                                vertical: true,
                                hexpand: true,
                                css: `
                                    font-size: 0.8rem;
                                `,
                                children: [
                                    // Hi
                                    Widget.Label({
                                        hpack: "start",
                                        label: hiTemp.bind(),
                                    }),
                                    // Lo
                                    Widget.Label({
                                        hpack: "start",
                                        label: loTemp.bind(),
                                    }),

                                ]
                            })
                        ]
                    }),
                    // Status
                    Widget.Box({
                        hexpand: true,
                        hpack: "center",
                        spacing: 8,
                        children: [
                            Widget.Icon({
                                size: 24,
                                icon: weatherIcon.bind(),
                            }),
                            Widget.Label({
                                label: weatherStatus.bind()
                            }),
                        ],
                    }),
                    Widget.Box({
                        spacing: 4,
                        children: [
                            // Precipitation
                            Widget.Box({
                                spacing: 4,
                                tooltip_text: "Precipitation",
                                children: [
                                    Widget.Icon({
                                        size: 18,
                                        icon: "weather-showers-symbolic",
                                    }),
                                    Widget.Label({
                                        hexpand: true,
                                        label: precipitation.bind()
                                    }),
                                ],
                            }),
                            // Humidity
                            Widget.Box({
                                spacing: 4,
                                tooltip_text: "Humidity",
                                children: [
                                    Widget.Icon({
                                        size: 18,
                                        icon: "raindrop",
                                    }),
                                    Widget.Label({
                                        hexpand: true,
                                        label: humidity.bind()
                                    }),
                                ],
                            })
                        ]
                    }),
                ]
            })
        }).hook(weatherImage, self => {
            // Update weather widget background based on current weather status
            /*
            print("image "+weatherImage.value)
            self.css = `
                background-image: url("${App.configDir}/assets/${weatherImage.value}.jpg"); 
                background-position: center;
                background-size: cover;
            `;
            */
        }, "changed"),
    ]
})
