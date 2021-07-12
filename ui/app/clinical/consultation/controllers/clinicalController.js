'use strict';

angular.module('bahmni.clinical').controller('ClinicalController',
    ['$scope', 'retrospectiveEntryService', '$rootScope', 'appService', '$document',
        function ($scope, retrospectiveEntryService, $rootScope, appService, $document) {
            $scope.showTeleConsultationWindow = false;
            var api = null;

            // eslint-disable-next-line angular/on-watch
            $rootScope.$on("event:launchVirtualConsult", function (event, params) {
                $scope.showTeleConsultationWindow = true;
                var teleConsultationWindow = angular.element(document.getElementById('tele-consultation-meet'));
                teleConsultationWindow.empty();
                var meetId = params.uuid;
                var domain = 'meet.jit.si';

                if (params.link && params.link.trim().length > 0) {
                    var meetingUrl = new URL(params.link.trim());
                    domain = meetingUrl.host;
                    var roomDetails = meetingUrl.pathname;
                    meetId = roomDetails.substring(roomDetails.indexOf("/") + 1, roomDetails.length);
                }

                var options = {
                    roomName: meetId || "",
                    parentNode: document.querySelector('#tele-consultation-meet')
                };
                api = new JitsiMeetExternalAPI(domain, options);
            });

            $scope.closeTeleConsultation = function () {
                api.executeCommand('hangup');
                $scope.showTeleConsultationWindow = false;
                var teleConsultationWindow = angular.element(document.getElementById('tele-consultation'));
                teleConsultationWindow.css({
                    top: '0px',
                    left: '0px'
                });
                teleConsultationWindow.css({
                    position: 'fixed',
                    top: '40%',
                    left: '40%'
                });
            };

            $scope.retrospectiveClass = function () {
                return !_.isEmpty(retrospectiveEntryService.getRetrospectiveEntry());
            };

            $rootScope.toggleControlPanel = function () {
                $rootScope.showControlPanel = !$rootScope.showControlPanel;
            };

            $rootScope.collapseControlPanel = function () {
                $rootScope.showControlPanel = false;
            };

            $rootScope.getLocaleCSS = function () {
                var localeCSS = "offline-language-english";
                var networkConnectivity;
                if (appService.getAppDescriptor()) {
                    networkConnectivity = appService.getAppDescriptor().getConfigValue("networkConnectivity");
                }
                var locales = networkConnectivity != undefined ? networkConnectivity.locales : null;
                var currentUser = $rootScope.currentUser;
                if (currentUser && currentUser.userProperties && locales) {
                    _.each(locales, function (localeObj) {
                        if (localeObj.locale == currentUser.userProperties.defaultLocale) {
                            localeCSS = localeObj.css;
                        }
                    });
                }
                return localeCSS;
            };
        }]);
