'use strict';

angular.module('bahmni.common.config')
    .directive('showIfPrivilege', function ($rootScope) {
        return{
            scope : {
                showIfPrivilege :"@"
            },
            link : function(scope,element,attr){
                var requiredPrivilege = _.find($rootScope.currentUser.privileges,function(privilege){
                    return scope.showIfPrivilege === privilege.name;
                });
                if(!requiredPrivilege){
                    element.hide()
                }
            }
        }
    });

