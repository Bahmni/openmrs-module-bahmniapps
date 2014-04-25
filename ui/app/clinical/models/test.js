'use strict';

Bahmni.Clinical.Test = (function () {
    var Test = function (options) {
        angular.extend(this, options);
        this.results = this.results || [];
    };

    Test.create = function (obs) {
        var results = obs.groupMembers.map(function (groupMember) { return Bahmni.Clinical.Result.create(obs.concept, groupMember.groupMembers); });
        return new Test({concept: obs.concept, orderDate: obs.observationDateTime, results: results});
    };

    Test.prototype = {
       hasMultipleResults: function() {
            return this.results.length > 1;
       },

       hasPendingResults: function() {
            return this.results.length === 0;
       },

       hasResults: function() {
            return !this.hasPendingResults();
       },

       getDisplayList: function() {
            var displayList = [];
            if (this.hasMultipleResults() || this.hasPendingResults()) {
                displayList.push({ name: this.concept.name, isSummary: true, hasResults: this.hasResults() });
                displayList.push({ name: "", isSummary: true, hasResults: this.hasResults() });
            }
            return displayList.concat(this.results);
        }
    }

    return Test;
})();
