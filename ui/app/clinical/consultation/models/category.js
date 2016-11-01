'use strict';

Bahmni.Clinical.Category = function (name, tests) {
    this.name = name;
    this.tests = tests;
    this.filteredTests = tests;

    this.filter = function (filterFunction) {
        this.filteredTests = tests.filter(filterFunction);
    };

    this.hasTests = function () {
        return this.filteredTests.length > 0;
    };
};
