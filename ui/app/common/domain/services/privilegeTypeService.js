'use strict';

angular.module('bahmni.common.domain')
    .factory('privilegeTypeService', [function () {
        var isCurrentUserHavingPrivilege = function (privilege, currentUserPrivileges) {
            return !_.isUndefined(_.find(currentUserPrivileges, function (userPrivilege) {
                return userPrivilege.name.includes(privilege);
            }));
        };

        var getCurrentUserPrivilegeName = function (privilege, currentUserPrivileges) {
            var privilegeNames = [];
            _.filter(_.map(currentUserPrivileges, function (currentObj) {
                if (currentObj.name.includes(privilege)) {
                    var match = currentObj.name.split(":viewFormsFor");
                    privilegeNames.push(match[1]);
                }
            }));
            return privilegeNames;
        };

        return {
            isCurrentUserHavingPrivilege: isCurrentUserHavingPrivilege,
            getCurrentUserPrivilegeName: getCurrentUserPrivilegeName
        };
    }]);
