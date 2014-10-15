'use strict';

Bahmni.Clinical.Error = function () {

    var messages = [
        {
            serverMessage: "Cannot have more than one active order for the same orderable and care setting at same time",
            clientMessage: "One or more drugs you are trying to order are already active. Please change the start date of the conflicting drug or remove them from the new prescription."
        }
    ];

    var findClientMessage = function(message) {
        var result = _.find(messages, function (listItem) {
            return listItem.serverMessage === message
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
    }
}();
