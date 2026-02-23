/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('bahmni.clinical')
    .directive('diagnosisAutoComplete', ['$parse', function ($parse) {
        var link = function (scope, element, attrs) {
            var ngModel = $parse(attrs.ngModel);
            var source = scope.source();
            var responseMap = scope.responseMap();
            var onSelect = scope.onSelect();

            element.autocomplete({
                autofocus: true,
                minLength: 2,
                source: function (request, response) {
                    source(request.term).success(function (data) {
                        var results = responseMap ? responseMap(data) : data;
                        response(results);
                    });
                },
                select: function (event, ui) {
                    scope.$apply(function () {
                        ngModel.assign(scope, ui.item.value);
                        if (onSelect) {
                            onSelect(scope.index, ui.item.lookup);
                        }
                        scope.$eval(attrs.ngChange);
                    });
                    return true;
                },
                search: function (event) {
                    var searchTerm = $.trim(element.val());
                    if (searchTerm.length < 2) {
                        event.preventDefault();
                    }
                }
            });
        };
        return {
            link: link,
            require: 'ngModel',
            scope: {
                source: '&',
                responseMap: '&',
                onSelect: '&',
                index: '='
            }
        };
    }]);
