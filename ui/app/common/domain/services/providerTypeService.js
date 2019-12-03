'use strict';

angular.module('bahmni.common.domain')
    .factory('providerTypeService', ['$http', 'providerService', function ($http, providerService) {

        var isCurrentUserHavingPrivilege = function (privilege, currentUserPrivileges) {
            return !_.isUndefined(_.find(currentUserPrivileges, function (userPrivilege) {
                return userPrivilege.name.includes(privilege);
            }));
        };

        var getCurrentUserPrivilegeName = function (privilege, currentUserPrivileges) {
            var something =  [];
           _.filter(_.map(currentUserPrivileges, function(currentObj) {
                if (currentObj.name.includes(privilege)) {
                    var match = currentObj.name.split(":viewFormsFor");
                    something.push(match[1]);
                }
            }));
          return something;
        };

        return {
            isCurrentUserHavingPrivilege: isCurrentUserHavingPrivilege,
            getCurrentUserPrivilegeName: getCurrentUserPrivilegeName
        };
    }]);
