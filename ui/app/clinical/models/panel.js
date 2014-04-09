'use strict';

Bahmni.Clinical.Panel = (function () {
    var Panel = function (options) {
        options = options || {};
        this.name = options.name;
        this.results = options.results || [];
        this.display = this.displayList();
    };

    Panel.create = function (obs) {
        var results = [];
        obs.groupMembers.forEach(function (groupMember) {
            results.push(Bahmni.Clinical.Results.create(groupMember));
        });

        return new Bahmni.Clinical.Panel({
            name: obs.concept.name,
            results: results
        });
    };

    var flattenResults = function (panels) {
        return panels.map(function (panel) {
            return panel.results;
        }).reduce(function (a, b) {
                return a.concat(b);
            });
    };

    Panel.prototype.displayList = function() {
        var response = [];
        response.push({
            name: this.name,
            isSummary: true,
            hasResults: true
        });
        this.results.forEach(function(result) {
            response = response.concat(result.displayList());
        })
        response.push({
            name: "",
            isSummary: true
        });
        return response;
    };

    Panel.merge = function (panels) {
        var results = flattenResults(panels);
        return new Bahmni.Clinical.Panel({
            name: panels[0].name,
            results: results
        });
    };

    return Panel;
})();
