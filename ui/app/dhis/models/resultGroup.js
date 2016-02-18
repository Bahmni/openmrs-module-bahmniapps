'use strict';

Bahmni.Dhis.ResultGroups = (function () {

    var ResultGroups = function () {
        this.groups = [];
    };

    ResultGroups.prototype = {
        add: function (groupName, result) {
            var existingGroup = _.find(this.groups, function (resultGroup) {
                return resultGroup.groupName === groupName
            });

            if (existingGroup) {
                existingGroup.results.push(result);
            } else {
                this.groups.push(new Bahmni.Dhis.ResultGroup(result));
            }
        }
    };

    return ResultGroups;
})();


Bahmni.Dhis.ResultGroup = (function () {

    return function (result) {
        this.groupName = result.queryGroup;
        if (this.results) {
            this.results.push(result);
        } else {
            this.results = [result];
        }
    };
})();

