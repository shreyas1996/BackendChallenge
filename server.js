const express = require('express');
const app = express();
const port = 8080;

function init() {

    let api = require("./api")
    api.init(app);
    app.listen(port, (err) => {
        if (err) {
            console.log('Error in starting api server:', err);
        }
        else {
            console.log(`Server is running on port ${port}`);
        }
    });
}

// module.exports.init = init;
init();

