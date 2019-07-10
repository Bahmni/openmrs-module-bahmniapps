'use strict';

angular.module('bahmni.ipd')
    .service('bedManagementService', [function () {
        var maxX, maxY, minX, minY;

        var initialiseMinMaxRowColumnNumbers = function () {
            maxX = 1;
            maxY = 1;
            minX = 1;
            minY = 1;
        };

        this.createLayoutGrid = function (bedLayouts) {
            initialiseMinMaxRowColumnNumbers();
            self.layout = [];
            findMaxYMaxX(bedLayouts);
            var bedLayout;
            var rowLayout = [];
            for (var i = minX; i <= maxX; i++) {
                rowLayout = [];
                for (var j = minY; j <= maxY; j++) {
                    bedLayout = getBedLayoutWithCoordinates(i, j, bedLayouts);
                    rowLayout.push({
                        empty: isEmpty(bedLayout),
                        available: isAvailable(bedLayout),
                        bed: {
                            bedId: bedLayout !== null && bedLayout.bedId,
                            bedNumber: bedLayout !== null && bedLayout.bedNumber,
                            bedType: bedLayout !== null && bedLayout.bedType !== null && bedLayout.bedType.displayName,
                            bedTagMaps: bedLayout !== null && bedLayout.bedTagMaps,
                            status: bedLayout !== null && bedLayout.status,
                            patient: bedLayout !== null && bedLayout.patient
                        }
                    });
                }
                self.layout.push(rowLayout);
            }
            return self.layout;
        };

        var findMaxYMaxX = function (bedLayouts) {
            for (var i = 0; i < bedLayouts.length; i++) {
                var bedLayout = bedLayouts[i];
                if (bedLayout.rowNumber > maxX) {
                    maxX = bedLayout.rowNumber;
                }
                if (bedLayout.columnNumber > maxY) {
                    maxY = bedLayout.columnNumber;
                }
            }
        };

        var getBedLayoutWithCoordinates = function (rowNumber, columnNumber, bedLayouts) {
            for (var i = 0, len = bedLayouts.length; i < len; i++) {
                if (bedLayouts[i].rowNumber === rowNumber && bedLayouts[i].columnNumber === columnNumber) {
                    return bedLayouts[i];
                }
            }
            return null;
        };

        var isEmpty = function (bedLayout) {
            return bedLayout === null || bedLayout.bedId === null;
        };

        var isAvailable = function (bedLayout) {
            if (bedLayout === null) {
                return false;
            }
            return bedLayout.status === "AVAILABLE";
        };
    }]);
