'use strict';

Bahmni.Clinical.Panel = (function () {
    var Panel = function (options) {
        angular.extend(this, options);
    };

    Panel.create = function (concept, observations) {
        var tests = _.flatten(observations, 'groupMembers').map(Bahmni.Clinical.Test.create);
        return new Panel({ concept: concept, tests: tests });
    };

    Panel.prototype = {
        getDisplayList: function()     {
            var displayList = [];
            displayList.push({ name: this.concept.name, isSummary: true, hasResults: true });
            this.tests.forEach(function(test) { displayList = displayList.concat(test.getDisplayList()); });
            displayList.push({ name: "", isSummary: true, hasResults: false });
            return displayList;
        },
        hasResults: function() {
            return this.tests.length > 0;
        }
    }

    return Panel;
})();
