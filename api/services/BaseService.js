function BaseService (){
}

BaseService.prototype.parseJSON = function(string) {
    try {
        return JSON.parse(string) || {};
    } catch (e) {
        return string;
    }
};

BaseService.prototype.toJSON = function(string){
    return this.parseJSON(JSON.stringify(string));
}

module.exports = BaseService;