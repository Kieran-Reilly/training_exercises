# Promises

## Introduction

MDN Reference: [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

- Promises are JavaScript objects that represent the eventual result of an asynchronous operation.
- Promises can be in one of three states: pending, resolved, or rejected.
- A promise is settled if it is either resolved or rejected.
- We construct a promise by using the new keyword and passing an executor function to the Promise constructor method.
- setTimeout() is a Node function which delays the execution of a callback function using the event-loop.
- We use .then() with a success handler callback containing the logic for what should happen if a promise resolves.
- We use .catch() with a failure handler callback containing the logic for what should happen if a promise rejects.
- Promise composition enables us to write complex, asynchronous code that’s still readable. We do this by chaining multiple .then()‘s and .catch()‘s.
- To use promise composition correctly, we have to remember to return promises constructed within a .then().
- We should chain multiple promises rather than nesting them.
- To take advantage of concurrency, we can use Promise.all().

## Exercise - Weather API

In the following exercise, we're going to make use of an open-source free to access weather api [Open-Meteo](https://open-meteo.com/) to get weather data for a given city.

Promises provide a way for us to call asynchronous functions and avoid callback hell (nested callbacks). Quite often 
when you interact with an external API, or when you request data from some database, it will take time for that request
to be processed and for the data to be returned. This is a perfect time to utilise the power of promises.

In this exercise, we'll be utilising the Fetch API to make requests to the Open-Meteo API. 
Side note, you can generate your own API request URLs for open-meteo using the following generator: [Open-Meteo API Generator](https://open-meteo.com/en/docs).

### Step 1 - Fetching Cape Town's Hourly Temperature Data

Within src > promises > weather.js create a function which returns a promise. The promise should use the Fetch API to make a call to Open-Meteo to retrieve the current temperature for Cape Town. 
You can use the following URL to retrieve the data:

```https://api.open-meteo.com/v1/forecast?latitude=-33.9258&longitude=18.4232&hourly=temperature_2m&forecast_days=1```

The promise should resolve with the temperature data as a json object, for e.g.

```json
{
  "latitude": -34,
  "longitude": 18.5,
  "generationtime_ms": 0.01704692840576172,
  "utc_offset_seconds": 0,
  "timezone": "GMT",
  "timezone_abbreviation": "GMT",
  "elevation": 25,
  "hourly_units": {
    "time": "iso8601",
    "temperature_2m": "°C"
  },
  "hourly": {
    "time": [
      "2023-11-30T00:00",
      "2023-11-30T01:00",
      "2023-11-30T02:00",
      "2023-11-30T03:00",
      "2023-11-30T04:00",
      "2023-11-30T05:00",
      "2023-11-30T06:00",
      "2023-11-30T07:00",
      "2023-11-30T08:00",
      "2023-11-30T09:00",
      "2023-11-30T10:00",
      "2023-11-30T11:00",
      "2023-11-30T12:00",
      "2023-11-30T13:00",
      "2023-11-30T14:00",
      "2023-11-30T15:00",
      "2023-11-30T16:00",
      "2023-11-30T17:00",
      "2023-11-30T18:00",
      "2023-11-30T19:00",
      "2023-11-30T20:00",
      "2023-11-30T21:00",
      "2023-11-30T22:00",
      "2023-11-30T23:00"
    ],
    "temperature_2m": [
      16.7,
      16.4,
      16.1,
      16.3,
      17,
      18.2,
      19.6,
      21.4,
      23.5,
      25.4,
      27.1,
      28.6,
      29.6,
      29.9,
      29.7,
      29,
      27.9,
      26.3,
      24.9,
      23.7,
      22.7,
      21.8,
      21.3,
      21
    ]
  }
}
```
Your promise should also cater for any errors that may occur during the fetch request. If an error occurs, the promise should reject with the error message.

### Step 2 - Creating and Executing Weather Requests

Note in the previous step, we retrieved temperature data on an hourly basis. In this step, 
we'll create another function whereby you can pass an array of weather variables (e.g. ["temperature_2m", "relative_humidity_2m"])
and it will compose the URL for you. 

Examples of weather variables you could use include:

- temperature_2m
- relative_humidity_2m
- wind_speed_10m
- wind_direction_10m
- rain
- cloud_cover
- visibility

If you handed the function temperature_2m, relative_humidity_2m, and wind_speed_10m it should return the following URL:

```https://api.open-meteo.com/v1/forecast?latitude=-33.9258&longitude=18.4232&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&forecast_days=1```

Create another function that will take in a URL and return a promise. The promise will use the Fetch API to execute the request and return the data as a json object.

### Step 3 - Processing the Weather Data

Note in the previous two steps, when data was returned we would get a time array and corresponding arrays of values for each weather variable.

Imagine after we fetched the data we needed to process it in some way. For example, we needed to map the time array to the values for each weather variable. 
So if you had three weather variables, you would have three maps of time to values.

Create a function that will take in the weather data and for each weather variable, a promise will be created to map the time array to the values array.
All promises will need to resolve before the function returns the processed data as an object.

for e.g.

```json
{
  "temperature_2m": {
    "2023-11-30T00:00": 16.7,
    "2023-11-30T01:00": 16.4,
    "2023-11-30T02:00": 16.1
  },
  "relative_humidity_2m": {
    "2023-11-30T00:00": "50%",
    "2023-11-30T01:00": "55%",
    "2023-11-30T02:00": "62%"
  },
  "wind_speed_10m": {
    "2023-11-30T00:00": "10km/h",
    "2023-11-30T01:00": "12km/h",
    "2023-11-30T02:00": "15km/h"
  }
}
```