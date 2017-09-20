'use strict';

angular.module('bahmni.appointments')
    .directive('weekdaySelector', function () {
        var constDays = [{
            dayOfWeek: 'SUNDAY',
            isSelected: false
        }, {
            dayOfWeek: 'MONDAY',
            isSelected: false
        }, {
            dayOfWeek: 'TUESDAY',
            isSelected: false
        }, {
            dayOfWeek: 'WEDNESDAY',
            isSelected: false
        }, {
            dayOfWeek: 'THURSDAY',
            isSelected: false
        }, {
            dayOfWeek: 'FRIDAY',
            isSelected: false
        }, {
            dayOfWeek: 'SATURDAY',
            isSelected: false
        }];

        var template = "<p class='service-ava-days' ng-class='{\"disabled\": ngDisabled===true}'>" +
            "<span id='day-0' ng-class='{\"is-selected\": ngModel[(0 + weekStartsIndex -1)%7].isSelected}' ng-click='onDayClicked((0 + weekStartsIndex -1)%7)'>{{constDays[(0 + weekStartsIndex -1)%7].dayOfWeek | translate}}</span>" +
            "<span id='day-1' ng-class='{\"is-selected\": ngModel[(1 + weekStartsIndex -1)%7].isSelected}' ng-click='onDayClicked((1 + weekStartsIndex -1)%7)'>{{constDays[(1 + weekStartsIndex -1)%7].dayOfWeek | translate}}</span>" +
            "<span id='day-2' ng-class='{\"is-selected\": ngModel[(2 + weekStartsIndex -1)%7].isSelected}' ng-click='onDayClicked((2 + weekStartsIndex -1)%7)'>{{constDays[(2 + weekStartsIndex -1)%7].dayOfWeek | translate}}</span>" +
            "<span id='day-3' ng-class='{\"is-selected\": ngModel[(3 + weekStartsIndex -1)%7].isSelected}' ng-click='onDayClicked((3 + weekStartsIndex -1)%7)'>{{constDays[(3 + weekStartsIndex -1)%7].dayOfWeek | translate}}</span>" +
            "<span id='day-4' ng-class='{\"is-selected\": ngModel[(4 + weekStartsIndex -1)%7].isSelected}' ng-click='onDayClicked((4 + weekStartsIndex -1)%7)'>{{constDays[(4 + weekStartsIndex -1)%7].dayOfWeek | translate}}</span>" +
            "<span id='day-5' ng-class='{\"is-selected\": ngModel[(5 + weekStartsIndex -1)%7].isSelected}' ng-click='onDayClicked((5 + weekStartsIndex -1)%7)'>{{constDays[(5 + weekStartsIndex -1)%7].dayOfWeek | translate}}</span>" +
            "<span id='day-6' ng-class='{\"is-selected\": ngModel[(6 + weekStartsIndex -1)%7].isSelected}' ng-click='onDayClicked((6 + weekStartsIndex -1)%7)'>{{constDays[(6 + weekStartsIndex -1)%7].dayOfWeek | translate}}</span>" +
            "</p>";

        var link = function (scope) {
            var init = function () {
                scope.constDays = constDays;
                scope.weekStartsIndex = scope.weekStartsIndex || 1;
                initDays();
            };

            var initDays = function () {
                scope.ngModel = scope.ngModel || angular.copy(scope.constDays);
            };

            scope.onDayClicked = function (dayIndex) {
                initDays();
                if (!scope.ngDisabled) {
                    scope.ngModel[dayIndex].isSelected = !scope.ngModel[dayIndex].isSelected;
                    if (scope.ngChange) {
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
                ngDisabled: '=?'
            },
            link: link,
            template: template
        };
    });
