var specUtil = {
    createServicePromise: function(name){
        var servicePromise = {}
        servicePromise.success = jasmine.createSpy(name + ' success').andReturn(servicePromise);
        servicePromise.error = jasmine.createSpy(name + ' error').andReturn(servicePromise);
        servicePromise.callSuccessCallBack = function() {
            servicePromise.success.mostRecentCall.args[0].apply(servicePromise, arguments);
        }
        servicePromise.callErrorCallBack = function() {
            servicePromise.error.mostRecentCall.args[0].apply(servicePromise, arguments);
        }
        return servicePromise;
    }
}