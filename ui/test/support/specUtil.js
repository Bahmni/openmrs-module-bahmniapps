var specUtil = {
    createServicePromise: function(name){
        var servicePromise = {}
        servicePromise.then = jasmine.createSpy(name + ' then').andReturn(servicePromise);
        servicePromise.success = jasmine.createSpy(name + ' success').andReturn(servicePromise);
        servicePromise.error = jasmine.createSpy(name + ' error').andReturn(servicePromise);
        servicePromise['finally'] = jasmine.createSpy(name + ' finally').andReturn(servicePromise);
        servicePromise.callSuccessCallBack = function() {                
            servicePromise.success.mostRecentCall.args[0].apply(servicePromise, arguments);
        }
        servicePromise.callErrorCallBack = function() {
            servicePromise.error.mostRecentCall.args[0].apply(servicePromise, arguments);
        }
        servicePromise.callThenCallBack = function() {                
            servicePromise.then.mostRecentCall.args[0].apply(servicePromise, arguments);
        }
        return servicePromise;
    }
}