'use strict';

angular.module('bahmni.common.uicontrols.programmanagment')
    .directive('programAttributes', function(){


        return {
            templateUrl: "../common/uicontrols/programmanagement/views/programAttributes.html",
            scope:{
                attributes: "="
            }
        }

    });

