'use strict';

Bahmni.Clinical.Error = (function () {
    var messages = Bahmni.Common.Constants.serverErrorMessages;

    var findClientMessage = function (message) {
        var result = _.find(messages, function (listItem) {
            return listItem.serverMessage === message;
        });
        return result && result.clientMessage || message;
    };

    var translate = function (error) {
        if (error && error.data && error.data.error && error.data.error.message) {
            return findClientMessage(error.data.error.message);
        }
        return null;
    };

    return {
        translate: translate
    };
})();
