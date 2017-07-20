var specUtil = {
    createServicePromise: function (name) {
        var servicePromise = {};
        servicePromise.then = jasmine.createSpy(name + ' then').and.returnValue(servicePromise);
        servicePromise.success = jasmine.createSpy(name + ' success').and.returnValue(servicePromise);
        servicePromise.error = jasmine.createSpy(name + ' error').and.returnValue(servicePromise);
        servicePromise['finally'] = jasmine.createSpy(name + ' finally').and.returnValue(servicePromise);
        servicePromise.callSuccessCallBack = function () {
            servicePromise.success.calls.mostRecent().args[0].apply(servicePromise, arguments);
        };
        servicePromise.callErrorCallBack = function () {
            servicePromise.error.calls.mostRecent().args[0].apply(servicePromise, arguments);
        };
        servicePromise.callThenCallBack = function () {
            servicePromise.then.calls.mostRecent().args[0].apply(servicePromise, arguments);
        };
        return servicePromise;
    },

    controller: function () {

    },

    respondWith: function (data) {
        var deferred = Q.defer();
        deferred.resolve(data);
        return deferred.promise;
    },

    respondWithPromise: function($q, data) {
        var deferred = $q.defer();
        deferred.resolve(data);
        return deferred.promise;
    }

};

specUtil.simplePromise = function(data) {
    var SimplePromise = function(data) {
        this.then = function(callback) {
            return new SimplePromise(callback(data));
        };
        this.success = function(callback){
            return new SimplePromise(callback(data));
        }
    };
    return new SimplePromise(data);
}

specUtil.createFakePromise = function (data) {
    var FakePromise = function(data){
        this.data=data;
    };
    FakePromise.prototype.then=function(callback){
        return new FakePromise(callback({data:this.data}));
    };
    FakePromise.prototype.success=function(resolve){
        resolve(this.data);
    };
    FakePromise.prototype.error=function(reject){
        reject(this.data);
    };
    FakePromise.prototype.finally=function(callback){
        callback();
    };
    FakePromise.prototype.catch=function(errorCallBack){
        errorCallBack(data);
    };
    return new FakePromise(data);
};

// catch the error thrown by a promise in async specs
var notifyError = function (error) {
    expect(error).toBeTruthy();
    expect("Error : '" + error.message + "' not to be thrown").toBeNull(); // It is a hack. But, instead of wasting time on making it perfect it's better to go with it
};
// log a message to see whether a then callback is called or not.
// ex:  101 - promise.then(...)
//      102 -       .then(...)
//      103 -       .then(specUtil.debug(103))
//      104 -       .then(...);
specUtil.debug = function (lineNumber) {
    return function(data){
        console.log(lineNumber+" : here");
        return data;
    };
};
