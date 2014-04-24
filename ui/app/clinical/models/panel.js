'use strict';

Bahmni.Clinical.Panel = (function () {
    var Panel = function (options) {
        options = options || {};
        this.concept = options.concept;
        this.results = options.results || [];
        this.display = this.getDisplayList();
    };

    Panel.create = function (obs) {
        var results = obs.groupMembers.map(Bahmni.Clinical.Results.create);
        return new Bahmni.Clinical.Panel({ concept: obs.concept, results: results });
    };

    Panel.prototype.getDisplayList = function() {
        var displayList = [];
        displayList.push({ name: this.concept.name, isSummary: true, hasResults: true });
        this.results.forEach(function(result) { displayList = displayList.concat(result.getDisplayList()); });
        displayList.push({ name: "", isSummary: true, hasResults: false });
        return displayList;
    };

    Panel.merge = function (panels) {
        var results = Bahmni.Common.Util.ArrayUtil.flatten(panels, 'results');
        return new Bahmni.Clinical.Panel({ concept: panels[0].concept, results: results });
    };

    return Panel;
})();
