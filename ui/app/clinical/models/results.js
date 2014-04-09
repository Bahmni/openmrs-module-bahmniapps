'use strict';

//Holds multi-value results
Bahmni.Clinical.Results = (function () {
    var Results = function (options) {
        options = options || {};
        var self = this;
        self.name = options.name;
        self.results = options.results || [];
        this.isActuallyMultiValued = function () {
            return self.results.length > 1;
        };
        this.display = this.displayList();
    };

    Results.create = function (obs) {
        var options = {results: []};
        obs.groupMembers.forEach(function (groupMember) {
            options.results.push(Bahmni.Clinical.Result.create(obs.concept.name, groupMember.groupMembers));
        });
        options.name = obs.concept.name;
        options.orderDate = obs.observationDateTime;
        return new Bahmni.Clinical.Results(options);
    };

    Results.prototype.displayList = function() {
        var response = [];
        if (this.isActuallyMultiValued() || this.results.length === 0) {
            response.push({
                name: this.name,
                isSummary: true
            });
        }
        response = response.concat(this.results);
        return response;
    };

    return Results;
})();
