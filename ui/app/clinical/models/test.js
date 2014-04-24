'use strict';

//Holds multi-value results
Bahmni.Clinical.Test = (function () {
    var Test = function (options) {
        angular.extend(this, options);
        this.results = this.results || [];
        this.isActuallyMultiValued = this.results.length > 1;
        this.display = this.getDisplayList();
    };

    Test.create = function (obs) {
        var results = obs.groupMembers.map(function (groupMember) { return Bahmni.Clinical.Result.create(obs.concept, groupMember.groupMembers); });
        return new Test({concept: obs.concept, orderDate: obs.observationDateTime, results: results});
    };

    Test.prototype.getDisplayList = function() {
        var displayList = [];
        if (this.isActuallyMultiValued || this.results.length === 0) {
            displayList.push({ name: this.concept.name, isSummary: true, hasResults: this.results.length > 0 });
            displayList.push({ name: "", isSummary: true, hasResults: this.results.length > 0 });
        }
        return displayList.concat(this.results);
    };

    return Test;
})();
