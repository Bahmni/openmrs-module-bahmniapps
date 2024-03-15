'use strict';

function getWatchers (element) {
    var elementToWatch = element ? angular.element(element) : angular.element(document.getElementsByTagName('body'));

    var watchers = [];

    var traverseScopes = function (element) {
        angular.forEach(['$scope', '$isolateScope'], function (scopeProperty) {
            var scope = element.data() && element.data()[scopeProperty];
            if (scope && scope.$$watchers) {
                angular.forEach(scope.$$watchers, function (watcher) {
                    watchers.push(watcher);
                });
            }
        });

        angular.forEach(element.children(), function (childElement) {
            traverseScopes(angular.element(childElement));
        });
    };

    traverseScopes(elementToWatch);

    // Remove duplicate watchers
     var watchersWithoutDuplicates = watchers.filter(function (item, index) {
        return watchers.indexOf(item) === index;
    });

    console.log(watchersWithoutDuplicates);
    return watchersWithoutDuplicates;
}
