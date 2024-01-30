const { parentPort, workerData } = require('worker_threads');
const CitiesService = require(`../api/services/CitiesService.js`).getInst();

const _ = require('lodash');
const Promise = require('bluebird');

// Import addresses.json
const addresses = require('../addresses.json');

// Divide the addresses array into chunks of 1000 elements each
const chunks = _.chunk(addresses, 1000);

const processArea = async function (guid, distance) {
    try {
        if (distance) {
            distance = Number(distance);
        }
        // Find cities that have the specified tag
        const cities = addresses.filter(address => address.guid === guid);

        // Get the first city from the result
        const city = cities[0];

        const startTime = Date.now();

        // Process each chunk in parallel
        const promiseArray = Promise.map(chunks, (chunk) => {
            // Process each address in the chunk
            // Calculate the distance from the first city to other cities
            return Promise.all(chunk.map((address) => {
                if (address.guid !== city.guid) {
                    return CitiesService.getDistance(city.guid, address.guid)
                        .then((result) => {
                            if (result.distance <= distance) {
                                return address;
                            }
                        }).catch((error) => {
                            console.error('Error getting distance:', error);
                            return error;
                        });
                }
            }));
        }, { concurrency: 200 }); // 200 parallel chunk executions at a time

        // Wait for all the promises to resolve
        let nearbyCities = await Promise.all(promiseArray);

        // Flatten the array of arrays into a single array and filter out undefined values
        nearbyCities = _.flatten(nearbyCities).filter(Boolean);

        const endTime = Date.now();

        const elapsedTime = endTime - startTime;
        console.log("🚀 ~ processArea ~ elapsedTime:", elapsedTime)
        

        //send the result back to the main thread
        parentPort.postMessage(nearbyCities);
    }
    catch (error) {
        console.error('Error processing area:', error);
        throw new Error('Error processing area');
    }

}

processArea(workerData.guid, workerData.distance);