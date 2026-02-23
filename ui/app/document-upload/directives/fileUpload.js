/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

angular.module('opd.documentupload')
    .directive('fileUpload', [function () {
        var link = function (scope, element) {
            element.bind("change", function () {
                var files = element[0].files;
                angular.forEach(files, function (file, index) {
                    var reader = new FileReader();
                    reader.onload = function (event) {
                        scope.onSelect()(event.target.result, scope.visit, file.name, file.type);
                    };
                    reader.readAsDataURL(file);
                });
            });
        };

        return {
            restrict: 'A',
            scope: {
                'visit': '=',
                'onSelect': '&'
            },
            link: link
        };
    }]);
