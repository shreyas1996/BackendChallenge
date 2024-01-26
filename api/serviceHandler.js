let _ = require('lodash');

function errorHandler(err, req, res){
    
    let errorResponse = _.pick(err,['customCode', 'message', 'errors']);
    console.log("Error %s -> %s", req.originalUrl, JSON.stringify(errorResponse));
    res.status(err.customCode || 500).send(errorResponse);
}

function serviceHandler(req, res, serviceP) {
    serviceP.then(function(body){
        
        body = _.isUndefined(body) && _.isNull(body) ? {} : body;
        // Capturing custom status code if any
        let status = null;
        if(body?.customCode) {
            status = body.customCode;
            body = _.omit(body, 'status');
        }
        res.status(status || 200).send(body);   
    }).catch(function(e){
        return errorHandler(e, req, res);
    });
}

module.exports.serviceHandler = serviceHandler;
module.exports.errorHandler = errorHandler;