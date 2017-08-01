'use strict';

angular.module('bahmni.appointments')
    .directive('weekdaySelector', function () {
        var constDays = [{
            id: 0,
            displayName: 'Su'
        }, {
            id: 1,
            displayName: 'Mo'
        }, {
            id: 2,
            displayName: 'Tu'
        }, {
            id: 3,
            displayName: 'We'
        }, {
            id: 4,
            displayName: 'Th'
        }, {
            id: 5,
            displayName: 'Fr'
        }, {
            id: 6,
            displayName: 'Sa'
        }];

        var template = "<p class='service-ava-days' ng-class='{\"disabled\": ngDisabled===true}'>" +
            "<span id='day-0' ng-class='{\"is-selected\": isBitSet((0 + weekStartsIndex -1)%7)}' ng-click='onDayClicked((0 + weekStartsIndex -1)%7)'>{{constDays[(0 + weekStartsIndex -1)%7].displayName}}</span>" +
            "<span id='day-1' ng-class='{\"is-selected\": isBitSet((1 + weekStartsIndex -1)%7)}' ng-click='onDayClicked((1 + weekStartsIndex -1)%7)'>{{constDays[(1 + weekStartsIndex -1)%7].displayName}}</span>" +
            "<span id='day-2' ng-class='{\"is-selected\": isBitSet((2 + weekStartsIndex -1)%7)}' ng-click='onDayClicked((2 + weekStartsIndex -1)%7)'>{{constDays[(2 + weekStartsIndex -1)%7].displayName}}</span>" +
            "<span id='day-3' ng-class='{\"is-selected\": isBitSet((3 + weekStartsIndex -1)%7)}' ng-click='onDayClicked((3 + weekStartsIndex -1)%7)'>{{constDays[(3 + weekStartsIndex -1)%7].displayName}}</span>" +
            "<span id='day-4' ng-class='{\"is-selected\": isBitSet((4 + weekStartsIndex -1)%7)}' ng-click='onDayClicked((4 + weekStartsIndex -1)%7)'>{{constDays[(4 + weekStartsIndex -1)%7].displayName}}</span>" +
            "<span id='day-5' ng-class='{\"is-selected\": isBitSet((5 + weekStartsIndex -1)%7)}' ng-click='onDayClicked((5 + weekStartsIndex -1)%7)'>{{constDays[(5 + weekStartsIndex -1)%7].displayName}}</span>" +
            "<span id='day-6' ng-class='{\"is-selected\": isBitSet((6 + weekStartsIndex -1)%7)}' ng-click='onDayClicked((6 + weekStartsIndex -1)%7)'>{{constDays[(6 + weekStartsIndex -1)%7].displayName}}</span>" +
            "</p>";

        var link = function (scope) {
            var init = function () {
                scope.constDays = constDays;
                scope.ngDisabled = scope.ngDisabled || false;
                initDays();
            };

            var initDays = function () {
                scope.ngModel = scope.ngModel || 0;
            };

            scope.onDayClicked = function (dayIndex) {
                initDays();
                if (!scope.ngDisabled) {
                    scope.ngModel = scope.ngModel ^ Math.pow(2, dayIndex);
                    if (typeof scope.ngChange === 'function') {
                        scope.ngChange({newValue: {index: dayIndex, item: scope.ngModel}});
                    }
                }
            };

            scope.isBitSet = function (dayIndex) {
                return !((scope.ngModel & Math.pow(2, dayIndex)) == 0);
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
