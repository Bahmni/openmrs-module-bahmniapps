'use strict';

angular.module('bahmni.appointments')
    .directive('weekdaySelector', function () {
        var constDays = [{
            id: 0,
            name: 'SUNDAY',
            isSelected: false
        }, {
            id: 1,
            name: 'MONDAY',
            isSelected: false
        }, {
            id: 2,
            name: 'TUESDAY',
            isSelected: false
        }, {
            id: 3,
            name: 'WEDNESDAY',
            isSelected: false
        }, {
            id: 4,
            name: 'THURSDAY',
            isSelected: false
        }, {
            id: 5,
            name: 'FRIDAY',
            isSelected: false
        }, {
            id: 6,
            name: 'SATURDAY',
            isSelected: false
        }];

        var template = '<div ng-repeat="id in weekDaysIds" ng-class="{\'disabled\': ngDisabled === true}">' +
            '<div class="day-circle day-0" ng-class="{\'is-selected\': ngModel[id].isSelected}" ng-click="onDayClicked(id)">{{constDays[id].name.substring(0,2)}}</div>' +
            '</div>';

        var link = function (scope) {
            var init = function () {
                if (!scope.weekStartsIndex) {
                    scope.weekStartsIndex = 0;
                }
                if (scope.ngDisabled === undefined || scope.ngDisabled === null) {
                    scope.ngDisabled = false;
                }
                scope.constDays = constDays;
                scope.weekDaysIds = _.map(constDays, 'id');
                scope.weekDaysIds = _.map(scope.weekDaysIds, function (id) {
                    return (id + scope.weekStartsIndex) % 7;
                });
                initDaysSelected();
                initControl();
            };

            var initDaysSelected = function () {
                if (!scope.ngModel) {
                    scope.ngModel = [];
                    scope.ngModel = angular.copy(constDays);
                }
            };

            var initControl = function () {
                if (scope.control) {
                    scope.control.toggleDayByIndex = function (dayIndex) {
                        if (scope.ngModel) {
                            scope.ngModel[dayIndex].isSelected = !scope.ngModel[dayIndex].isSelected;
                        } else {
                            console.log('Error, no model to toggle for!');
                        }
                    };
                }
            };

            scope.onDayClicked = function (dayIndex) {
                initDaysSelected();
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
