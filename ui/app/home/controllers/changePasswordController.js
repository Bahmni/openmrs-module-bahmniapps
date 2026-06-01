'use strict';
angular.module('bahmni.home')
    .controller('ChangePasswordController', ['$scope', '$state', 'sessionService', '$rootScope', 'authenticator', '$window', 'userService', 'messagingService', function ($scope, $state, sessionService, $rootScope, authenticator, $window, userService, messagingService) {
        $scope.loginInfo = {};
        $scope.passwordDoesNotMatch = false;
        $scope.passwordPolicies = [];
        $scope.redirectToHomePage = function () {
            $state.go('dashboard');
        };
        var checkPasswordMatches = function () {
            return $scope.loginInfo.newPassword == $scope.loginInfo.confirmPassword;
        };
        $scope.changePassword = function () {
            if (_.isEmpty($scope.loginInfo.oldPassword) || _.isEmpty($scope.loginInfo.newPassword) || _.isEmpty($scope.loginInfo.confirmPassword)) {
                return;
            }
            if (checkPasswordMatches()) {
                $scope.passwordDoesNotMatch = false;
                sessionService.changePassword($rootScope.currentUser.uuid, $scope.loginInfo.oldPassword, $scope.loginInfo.newPassword).then(function (data) {
                    messagingService.showMessage("info", 'CHANGE_PASSWORD_SUCCESSFUL_MESSAGE');
                    clearPasswordFields();
                });
            }
            else {
                $scope.passwordDoesNotMatch = true;
            }
        };
        var clearPasswordFields = function () {
            $scope.loginInfo.newPassword = undefined;
            $scope.loginInfo.oldPassword = undefined;
            $scope.loginInfo.confirmPassword = undefined;
        };
        var convertPasswordPolicies = function (policies) {
            _.forEach(policies, function (value, key) {
                switch (key) {
                case "security.passwordCannotMatchUsername" :
                    value == "true" ? $scope.passwordPolicies.splice(0, 0, 'PASSWORD_SHOULD_NOT_MATCH_USER_NAME') : '';
                    break;
                case "security.passwordMinimumLength" :
                    $scope.passwordLength = value;
                    $scope.passwordPolicies.splice(1, 0, 'PASSWORD_SHOULD_BE_MINIMUM_CHARACTERS');
                    break;
                case "security.passwordRequiresUpperAndLowerCase":
                    value == "true" ? $scope.passwordPolicies.splice(2, 0, 'PASSWORD_SHOULD_BE_A_MIX_OF_BOTH_UPPER_CASE_AND_LOWER_CASE') : '';
                    break;
                case "security.passwordRequiresDigit" :
                    value == "true" ? $scope.passwordPolicies.splice(3, 0, 'PASSWORD_SHOULD_CONTAIN_DIGITS') : '';
                    break;
                case "security.passwordRequiresNonDigit" :
                    value == "true" ? $scope.passwordPolicies.splice(4, 0, 'PASSWORD_SHOULD_HAVE_ATLEAST_ONE_NON_DIGIT') : '';
                    break;
                case "security.passwordCustomRegex":
                    if (!_.isEmpty(value)) {
                        $scope.passwordPolicies.splice(5, 0, 'PASSWORD_SHOULD_MATCH_THE_REGEX');
                        $scope.passwordRegex = value;
                    }
                }
            });
        };
        var init = function () {
            authenticator.authenticateUser().then(function () {
                userService.getPasswordPolicies().then(function (response) {
                    convertPasswordPolicies(response.data);
                });
                sessionService.loadCredentials().then(function (data) {
                });
            }, function () {
                $window.location = "../home/index.html#/login";
            });
        };
        init();
    }]);
