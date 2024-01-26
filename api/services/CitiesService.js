const fs = require('fs');
const { Worker } = require('worker_threads');
const path = require('path');


// Import addresses.json
const addresses = require('../../addresses.json');
const BaseService = require('./BaseService');

// Endpoint ID for the area result(from index.js)
const AREA_RESULT_ENDPOINT_ID = '2152f96f-50c7-4d76-9e18-f7033bd14428';

const protocol = 'http';
const host = '127.0.0.1';
const port = '8080';
const server = `${protocol}://${host}:${port}`;

function CitiesService() {
    BaseService.call(this);
}

// Function to get cities by tag
CitiesService.prototype.getCitiesByTag = async (tag, isActive) => {
    try {
        isActive = isActive === 'true';
        // Filter cities that have the specified tag and isActive flag
        const cities = addresses.filter(address => address.isActive === isActive && address.tags.includes(tag));
        let responseObject = {
            cities: cities
        }

        return responseObject;
    } catch (error) {
        throw new Error('Error retrieving cities by tag');
    }
};

// Function to calculate the distance between two cities
CitiesService.prototype.getDistance = async function(guid1, guid2) {
    try {
        // Find the cities by guid
        const city1 = addresses.find(address => address.guid === guid1);
        const city2 = addresses.find(address => address.guid === guid2);

        if (!city1 || !city2) {
            throw new Error('One or both cities not found');
        }

        // Helper function to convert degrees to radians
        const deg2rad = (deg) => deg * (Math.PI/180);

        // Calculate distance using a common method called Haversine formula
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(city2.latitude - city1.latitude);
        const dLon = deg2rad(city2.longitude - city1.longitude);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(city1.latitude)) * Math.cos(deg2rad(city2.latitude)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = Number((R * c).toFixed(2)); // Distance in km

        let responseObject = {
            from: city1,
            to: city2,
            unit: 'km',
            distance: distance
        }

        return responseObject;
    } catch (error) {
        throw new Error('Error calculating distance between cities');
    }
};

// Store results in memory
let results = {};

// Function to get all cities within 250 km
CitiesService.prototype.getArea = async function(guid, distance) {
    try {
        // Start the process in the background
        setTimeout(() => {
            // Create a new worker
            const worker = new Worker(path.resolve(__dirname, '..','..', 'scripts', 'worker.js'), {
                workerData: {
                    guid: guid,
                    distance: distance
                }
            });

             // Listen for messages from the worker
            worker.on('message', (nearbyCities) => {
                results[AREA_RESULT_ENDPOINT_ID] = nearbyCities;
            });
        });
        // Return the URL that can be polled for the final result
        let urlEndpoint = `area-result/${AREA_RESULT_ENDPOINT_ID}`

        let responseObject = {
            resultsUrl: `${server}/${urlEndpoint}`,
            customCode: 202
        }
        return responseObject;
    } catch (error) {
        console.log(error);
        throw new Error('Error retrieving nearby cities');
    }
};

CitiesService.prototype.getAreaResult = async function(id) {
    try {
        // Get the result from memory
        const result = results[id];

        if (!result) {
            return {
                customCode: 202,
            }
        }

        // Return the result
        let responseObject = {
            cities: result
        }
        return responseObject;
    } catch (error) {
        console.error(error);
        throw new Error('Error retrieving nearby cities');
    }
}

CitiesService.prototype.getCities = () => {
    const fileStream = fs.createReadStream('./addresses.json');

    return fileStream;
};

module.exports = {
    getInst: function () {
        return new CitiesService();
    }
};