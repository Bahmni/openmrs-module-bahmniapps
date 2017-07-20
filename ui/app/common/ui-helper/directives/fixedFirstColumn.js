'use strict';

angular.module('bahmni.common.uiHelper')
 .directive("fixedFirstColumn", ["$interval", function ($interval) {
     return {
         restrict: "A",
         template: "<div class='table-responsive'><div ng-transclude  class='table-responsive-fixedColumn' ></div></div>",
         transclude: true,
         link: function ($scope, $element) {
             var checkIfTableLoaded = $interval(function () {
                 if ($element.find("table").length > 0) {
                     var tr = $element.find("tr");
                     angular.forEach(tr, function (i) {
                         var columns = angular.element(i).children();

                         if (columns.length < 1) {
                            // Row with no columns? Ignore it.
                             return;
                         }
                         var column0 = columns[0];
                         var column1 = columns[1];

                        // Calculate heights of each <td>.
                         var height0 = (column0).offsetHeight;
                         var height1 = column1 ? column1.offsetHeight : 0;

                        // Calculate final height.
                         var height = Math.max(height0, height1);

                        // Set heights of <td> and <tr>.
                         columns[0].style.height = height + "px";
                         i.style.height = height + "px";

                         if (column1) {
                             column1.style.height = height + "px";
                         }

                        // If <td> heights have stabilized.
                         if (height0 !== 0 && height0 === height1) {
                             clearInterval(checkIfTableLoaded);
                         }
                     });
                     clearInterval(checkIfTableLoaded);
                 }
             }, 100, 1);
         }
     };
 }]);
