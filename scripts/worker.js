const { parentPort, workerData } = require('worker_threads');
const CitiesService = require(`../api/services/CitiesService.js`).getInst();

// Import addresses.json
const addresses = require('../addresses.json');

const processArea = async function(guid, distance) {
    try {
        if(distance) {
            distance = Number(distance);
        }
        // Find cities that have the specified tag
        const cities = addresses.filter(address => address.guid === guid);
   
        // Get the first city from the result
        const city = cities[0];
   
        // Calculate the distance from the first city to other cities
        const nearbyCities = [];
        const promiseArray = addresses.map((address) => {
            if(address.guid !== city.guid) {
                return CitiesService.getDistance(city.guid, address.guid)
                .then((result) => {
                    if (result.distance <= distance) {
                        nearbyCities.push(address);
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
            }
        });

        // Wait for all the promises to resolve
        await Promise.all(promiseArray);
   
        //send the result back to the main thread
        parentPort.postMessage(nearbyCities);
    }
    catch (error) {
        console.error('Error processing area:', error);
        throw new Error('Error processing area');
    }

}

processArea(workerData.guid, workerData.distance);