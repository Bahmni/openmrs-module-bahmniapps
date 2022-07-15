'use strict';

angular.module('bahmni.common.displaycontrol.pacsOrders')
    .directive('pacsOrders', ['orderService', 'orderTypeService', 'spinner', 'messagingService', '$window', '$translate', 'pacsService',
        function (orderService, orderTypeService, spinner, messagingService, $window, $translate, pacsService) {
            var controller = function ($scope) {
                $scope.orderTypeUuid = orderTypeService.getOrderTypeUuid($scope.orderType);
                const radiologyImageUrl = $scope.section.pacsStudyUrl || "/oviyam2/viewer.html?patientID={{patientID}}&studyUID={{studyUID}}";
                var includeAllObs = true;
                var getOrders = function () {
                    var params = {
                        patientUuid: $scope.patient.uuid,
                        orderTypeUuid: $scope.orderTypeUuid,
                        conceptNames: $scope.config.conceptNames,
                        includeObs: includeAllObs,
                        numberOfVisits: $scope.config.numberOfVisits,
                        obsIgnoreList: $scope.config.obsIgnoreList,
                        visitUuid: $scope.visitUuid,
                        orderUuid: $scope.orderUuid
                    };
                    return orderService.getOrders(params);
                };

                var queryPacsStudies = function () {
                    return pacsService.search($scope.patient.identifier);
                };

                var correlateWithStudies = function (radiologyOrders, radiologyStudies) {
                    if (radiologyOrders) {
                        radiologyOrders.forEach(function (ro) {
                            ro.pacsImageUrl = ($scope.config.pacsImageUrl || "").replace('{{patientID}}', $scope.patient.identifier).replace('{{orderNumber}}', ro.orderNumber);
                            if (radiologyStudies) {
                                var matchingStudy = radiologyStudies.find(function (rs) {
                                    if (!rs.identifier) {
                                        return false;
                                    }
                                    var matches = rs.identifier.filter(function (rsi) {
                                        return pacsService.getAccessionNumber(rsi) === ro.orderNumber;
                                    });
                                    return (matches && matches.length > 0);
                                });

                                if (matchingStudy) {
                                    ro.studyInstanceUID = matchingStudy.id;
                                    ro.pacsStudyUrl = radiologyImageUrl
                                        .replace('{{patientID}}', $scope.patient.identifier)
                                        .replace('{{studyUID}}', matchingStudy.id)
                                        .replace('{{accessionNumber}}', ro.orderNumber);
                                }
                            }
                        });
                        $scope.bahmniOrders = radiologyOrders || [];
                    } else {
                        if (_.isEmpty($scope.bahmniOrders)) {
                            $scope.noOrdersMessage = $scope.orderType;
                            $scope.$emit("no-data-present-event");
                        }
                    }
                };

                var init = function () {
                    return getOrders().then(function (radiologyOrders) {
                        queryPacsStudies().then(function successCallback (response) {
                            correlateWithStudies(radiologyOrders.data, response.data);
                        },
                        function errorCallback (errorResponse) {
                            $window.console.error("Error occurred while trying to fetch radiology studies", errorResponse);
                            if (errorResponse.status !== 501) {
                                messagingService.showMessage('error', "RADIOLOGY_STUDY_FETCH_ERROR");
                            }
                            correlateWithStudies(radiologyOrders.data, []);
                        });
                    });
                };

                $scope.getUrl = function (orderNumber) {
                    var pacsImageTemplate = $scope.config.pacsImageUrl || "";
                    return pacsImageTemplate
                        .replace('{{patientID}}', $scope.patient.identifier)
                        .replace('{{orderNumber}}', orderNumber);
                };

                $scope.getLabel = function (bahmniOrder) {
                    return bahmniOrder.concept.shortName || bahmniOrder.concept.name;
                };

                $scope.openImage = function (bahmniOrder) {
                    if (!bahmniOrder.pacsStudyUrl) {
                        messagingService.showMessage('info', "NO_PACS_STUDY_FOR_ORDER");
                    }
                    var url = bahmniOrder.pacsStudyUrl || bahmniOrder.pacsImageUrl;
                    $window.open(url, "_blank");
                };

                $scope.initialization = init();
            };

            var link = function ($scope, element) {
                spinner.forPromise($scope.initialization, element);
            };

            return {
                restrict: 'E',
                controller: controller,
                link: link,
                templateUrl: "../common/displaycontrols/pacsOrders/views/pacsOrders.html",
                scope: {
                    patient: "=",
                    section: "=",
                    orderType: "=",
                    orderUuid: "=",
                    config: "=",
                    visitUuid: "="
                }
            };
        }
    ]);
