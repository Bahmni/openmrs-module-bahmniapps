"use strict";

angular.module('bahmni.common.displaycontrol.navigationlinks')
    .directive('navigationLinks', ['$state', 'appService', function ($state, appService) {
        var controller = function ($scope) {
            if ((!$scope.params.showLinks && !$scope.params.customLinks) ||
                ($scope.params.showLinks && $scope.params.customLinks &&
                $scope.params.showLinks.length == 0 && $scope.params.customLinks.length == 0)) {
                $scope.noNavigationLinksMessage = Bahmni.Common.Constants.noNavigationLinksMessage;
            }

            $scope.standardLinks = [
                {
                    "name": "home",
                    "translationKey": "HOME_DASHBOARD_KEY",
                    "url": "../home/#/dashboard",
                    "title": "Home"
                },
                {
                    "name": "visit",
                    "translationKey": "PATIENT_VISIT_PAGE_KEY",
                    "url": "../clinical/#/default/patient/{{patientUuid}}/dashboard/visit/{{visitUuid}}/?encounterUuid=active",
                    "title": "Visit"
                },
                {
                    "name": "inpatient",
                    "translationKey": "PATIENT_ADT_PAGE_KEY",
                    "url": "../adt/#/patient/{{patientUuid}}/visit/{{visitUuid}}/",
                    "title": "In Patient"
                },
                {
                    "name": "enrolment",
                    "translationKey": "PROGRAM_MANAGEMENT_PAGE_KEY",
                    "url": "../clinical/#/programs/patient/{{patientUuid}}/consultationContext",
                    "title": "Enrolment"
                },
                {
                    "name": "visitAttribute",
                    "translationKey": "PATIENT_VISIT_ATTRIBUTES_PAGE_KEY",
                    "url": "../registration/#/patient/{{patientUuid}}/visit",
                    "title": "Patient Visit Attributes"
                },
                {
                    "name": "registration",
                    "translationKey": "PATIENT_REGISTRATION_PAGE_KEY",
                    "url": "../registration/#/patient/{{patientUuid}}",
                    "title": "Registration"
                }
            ];

            var filterLinks = function (links, showLinks) {
                var linksSpecifiedInShowLinks = function () {
                    return _.filter(links, function (link) {
                        return showLinks.indexOf(link.name) > -1;
                    });
                };

                return showLinks && linksSpecifiedInShowLinks();
            };

            $scope.getLinks = function () {
                return _.union(
                    filterLinks($scope.standardLinks, $scope.params.showLinks),
                    $scope.params.customLinks
                );
            };

            $scope.getUrl = function (link) {
                var url = getFormattedURL(link);
                window.open(url, link.title);
            };

            $scope.showUrl = function (link) {
                var params = getParamsToBeReplaced(link.url), isPropertyNotPresentInLinkParams;

                for (var i in params) {
                    var property = params[i];
                    isPropertyNotPresentInLinkParams = _.isEmpty($scope.linkParams[property]);
                    if (isPropertyNotPresentInLinkParams) {
                        return false;
                    }
                }
                return true;
            };

            var getFormattedURL = function (link) {
                return appService.getAppDescriptor().formatUrl(link.url, $scope.linkParams);
            };

            var getParamsToBeReplaced = function (link) {
                var pattern = /{{([^}]*)}}/g,
                    matches = link.match(pattern), params = [];
                if (matches) {
                    matches.forEach(function (el) {
                        var key = el.replace("{{", '').replace("}}", '');
                        params.push(key);
                    });
                }
                return params;
            };
        };

        return {
            restrict: 'E',
            controller: controller,
            templateUrl: "../common/displaycontrols/navigationlinks/views/navigationLinks.html",
            scope: {
                params: "=",
                linkParams: "="
            }
        };
    }]);
