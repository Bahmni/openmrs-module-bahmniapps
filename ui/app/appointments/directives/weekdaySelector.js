'use strict';

angular.module('bahmni.appointments')
    .directive('weekdaySelector', function () {
        var constDays = [{
            id: 0,
            name: 'SUNDAY',
            displayName: 'Su',
            isSelected: false
        }, {
            id: 1,
            name: 'MONDAY',
            displayName: 'Mo',
            isSelected: false
        }, {
            id: 2,
            name: 'TUESDAY',
            displayName: 'Tu',
            isSelected: false
        }, {
            id: 3,
            name: 'WEDNESDAY',
            displayName: 'We',
            isSelected: false
        }, {
            id: 4,
            name: 'THURSDAY',
            displayName: 'Th',
            isSelected: false
        }, {
            id: 5,
            name: 'FRIDAY',
            displayName: 'Fr',
            isSelected: false
        }, {
            id: 6,
            name: 'SATURDAY',
            displayName: 'Sa',
            isSelected: false
        }];

        var template = '<p class="service-ava-days" ng-repeat="id in weekDaysIds" ng-class="{\'disabled\': ngDisabled === true}">' +
            '<span id="day-{{id}}" class="day-circle" ng-class="{\'is-selected\': ngModel[id].isSelected}" ng-click="onDayClicked(id)">{{constDays[id].displayName}}</span>' +
            '</p>';

        var link = function (scope) {
            var init = function () {
                scope.constDays = constDays;
                scope.weekStartsIndex = scope.weekStartsIndex || 1;
                scope.weekDaysIds = _.map(scope.constDays, 'id');
                scope.ngDisabled = scope.ngDisabled || false;
                initDays();
                arrangeIdsInOrder();
            };

            var arrangeIdsInOrder = function () {
                scope.weekDaysIds = _.map(scope.weekDaysIds, function (id) {
                    return (id + scope.weekStartsIndex - 1) % 7;
                });
            };

            var initDays = function () {
                scope.ngModel = scope.ngModel || angular.copy(scope.constDays);
            };

            scope.onDayClicked = function (dayIndex) {
                initDays();
                if (!scope.ngDisabled) {
                    scope.ngModel[dayIndex].isSelected = !scope.ngModel[dayIndex].isSelected;
                    if (typeof scope.ngChange === 'function') {
                        scope.ngChange({newValue: {index: dayIndex, item: scope.ngModel[dayIndex]}});
                    }
                }
            };

            init();
        };

        return {
            restrict: 'AE',
            scope: {
                ngModel: '=?',
                ngChange: '&',
                weekStartsIndex: '=',
                ngDisabled: '=?',
                control: '=?'
            },
            link: link,
            template: template
        };
    });
