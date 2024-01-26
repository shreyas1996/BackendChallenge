let serviceHandler = require('../serviceHandler.js').serviceHandler;
let citiesService = require('../services/CitiesService.js').getInst();

module.exports.init = function(app) {
    app.get('/cities-by-tag', function (req, res) {
        console.log("Processing cities by tag %s", req.query.tag);
        let result = citiesService.getCitiesByTag(req.query.tag, req.query.isActive)
        return serviceHandler(req, res, result)
    })
    
    app.get('/all-cities', function (req, res) {
        console.log("Requesting list of all cities");
        let result = citiesService.getCities()
        result.pipe(res);
    })
    
    app.get('/distance', function (req, res) {
        console.log("Processing distance from %s to %s", req.query.from, req.query.to);
        let result = citiesService.getDistance(req.query.from, req.query.to)
        return serviceHandler(req, res, result)
    })
    
    app.get('/area', function (req, res) {
        console.log("Processing area for %s", req.query.from);
        let result = citiesService.getArea(req.query.from, req.query.distance)
        return serviceHandler(req, res, result)
    })

    app.get('/area-result/:id', function (req, res) {
        console.log("Polling for result %s", req.params.id);
        let result = citiesService.getAreaResult(req.params.id)
        return serviceHandler(req, res, result)
    })

};