let express = require("express");
let fs = require('fs');
let authMiddleware = require("./authMiddleware");
const router = express.Router()

function init(path, app) {
    authMiddleware.init(router)
    let rest = path + '/rest';
    let files = fs.readdirSync(rest);

    files.forEach(function(file) {
        if (['.', '..'].indexOf(file) > -1) {
            return;
        }
        let filePath = [rest, file].join('/');
        let pathStat = fs.statSync(filePath);
        if (pathStat.isFile() && file.substr(-3) === '.js') {
            require(filePath).init(router);
        }
    });
    app.use(router);
}

module.exports.init = function(app) {
    init(__dirname, app);
};