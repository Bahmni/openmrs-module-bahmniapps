'use strict';

Bahmni.Admin.ImportedItem = function (data) {
    angular.extend(this, data);
    // TODO: Make this configurable
    this.baseUrl = '/uploaded-files/mrs';
};

Bahmni.Admin.ImportedItem.prototype = {
    hasError: function () {
        return this.failedRecords > 0;
    },

    errorFileUrl: function () {
        return this.baseUrl + '/' + this.errorFileName;
    }
};
