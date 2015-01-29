'use strict';

Bahmni.Dhis.Result = (function () {
    var Result = function (result) {
        this.queryName = result.queryName;
        this.queryGroup = result.queryGroupname;
        this.resultRows = result.result ? result.result : [];
        this.rowResults =  this.getRowResults();
        this.headers = this.getHeaders();
    };

    Result.prototype = {
        getHeaders: function () {
            if (this.resultRows.length > 0) {
                return _.keys(this.resultRows[0]).reverse();
            }
        },
        getRowResults: function() {
            if (this.resultRows.length > 0) {
                return this.resultRows.map( function(resultRow) { return _.values(resultRow).reverse() } );
            }
        }
    };

    Result.create = function (result) {
        return new Result(result);
    };

    return Result;
})();

