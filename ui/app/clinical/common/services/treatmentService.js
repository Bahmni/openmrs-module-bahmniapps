'use strict';

angular.module('bahmni.clinical')
    .factory('treatmentService', ['$http', '$q', '$compile', '$timeout', 'spinner', 'appService', '$rootScope', 'transmissionService', '$filter', 'printer', function ($http, $q, $compile, $timeout, spinner, appService, $rootScope, transmissionService, $filter, printer) {
        var createDrugOrder = function (drugOrder) {
            return Bahmni.Clinical.DrugOrder.create(drugOrder);
        };
        var getActiveDrugOrdersFromServer = function (patientUuid, startDate, endDate) {
            return $http.get(Bahmni.Common.Constants.bahmniDrugOrderUrl + "/active", {
                params: {
                    patientUuid: patientUuid,
                    startDate: startDate,
                    endDate: endDate
                },
                withCredentials: true
            });
        };

        var getPrescribedAndActiveDrugOrders = function (patientUuid, numberOfVisits, getOtherActive, visitUuids, startDate, endDate, getEffectiveOrdersOnly) {
            return $http.get(Bahmni.Common.Constants.bahmniDrugOrderUrl + "/prescribedAndActive", {
                params: {
                    patientUuid: patientUuid,
                    numberOfVisits: numberOfVisits,
                    getOtherActive: getOtherActive,
                    visitUuids: visitUuids,
                    startDate: startDate,
                    endDate: endDate,
                    getEffectiveOrdersOnly: getEffectiveOrdersOnly,
                    preferredLocale: $rootScope.currentUser.userProperties.defaultLocale
                },
                withCredentials: true
            }).success(function (response) {
                for (var key in response) {
                    response[key] = response[key].map(createDrugOrder);
                }
            });
        };

        var getMedicationSchedulesForOrders = function (patientUuid, orderUuids) {
            return $http.get(Bahmni.Common.Constants.medicationSchedulesForOrders, {
                params: {
                    patientUuid: patientUuid,
                    orderUuids: orderUuids
                },
                withCredentials: true
            });
        };

        var getConfig = function () {
            return $http.get(Bahmni.Common.Constants.drugOrderConfigurationUrl, {
                withCredentials: true
            });
        };

        var getProgramConfig = function () {
            var programConfig = appService.getAppDescriptor() ? appService.getAppDescriptor().getConfigValue("program") || {} : {};
            return programConfig;
        };

        var getActiveDrugOrders = function (patientUuid, fromDate, toDate) {
            var programConfig = getProgramConfig();
            var startDate = programConfig.showDetailsWithinDateRange ? fromDate : null;
            var endDate = programConfig.showDetailsWithinDateRange ? toDate : null;

            var deferred = $q.defer();
            getActiveDrugOrdersFromServer(patientUuid, startDate, endDate).success(function (response) {
                var activeDrugOrders = response.map(createDrugOrder);
                deferred.resolve(activeDrugOrders);
            });
            return deferred.promise;
        };

        var getPrescribedDrugOrders = function (patientUuid, includeActiveVisit, numberOfVisits, fromDate, toDate) {
            var programConfig = getProgramConfig();
            var startDate = programConfig.showDetailsWithinDateRange ? fromDate : null;
            var endDate = programConfig.showDetailsWithinDateRange ? toDate : null;

            var deferred = $q.defer();
            $http.get(Bahmni.Common.Constants.bahmniDrugOrderUrl, {
                method: "GET",
                params: {
                    patientUuid: patientUuid,
                    numberOfVisits: numberOfVisits,
                    includeActiveVisit: includeActiveVisit,
                    startDate: startDate,
                    endDate: endDate
                },
                withCredentials: true
            }).success(function (response) {
                var activeDrugOrders = response.map(createDrugOrder);
                deferred.resolve(activeDrugOrders);
            });
            return deferred.promise;
        };

        var getNonCodedDrugConcept = function () {
            var deferred = $q.defer();
            $http.get(Bahmni.Common.Constants.globalPropertyUrl, {
                method: "GET",
                params: {
                    property: 'drugOrder.drugOther'
                },
                withCredentials: true,
                headers: {
                    Accept: 'text/plain'
                }
            }).success(function (conceptUuid) {
                deferred.resolve(conceptUuid);
            });
            return deferred.promise;
        };

        var getAllDrugOrdersFor = function (patientUuid, conceptSetToBeIncluded, conceptSetToBeExcluded, isActive, patientProgramUuid) {
            var deferred = $q.defer();
            var params = {patientUuid: patientUuid};
            if (conceptSetToBeIncluded) {
                params.includeConceptSet = conceptSetToBeIncluded;
            }
            if (conceptSetToBeExcluded) {
                params.excludeConceptSet = conceptSetToBeExcluded;
            }
            if (isActive !== undefined) {
                params.isActive = isActive;
            }
            if (patientProgramUuid) {
                params.patientProgramUuid = patientProgramUuid;
            }

            $http.get(Bahmni.Common.Constants.bahmniDrugOrderUrl + "/drugOrderDetails", {
                params: params,
                withCredentials: true
            }).success(function (response) {
                deferred.resolve(response);
            });
            return deferred.promise;
        };

        var voidDrugOrder = function (drugOrder) {
            var deferred = $q.defer();

            $http.delete([Bahmni.Common.Constants.ordersUrl, '/', drugOrder.uuid].join('')).success(function (response) {
                deferred.resolve(response);
            });

            return deferred.promise;
        };

        var sharePrescriptions = function (prescriptionDetails) {
            $http.get('common/views/prescriptionPrint.html').then(function (templateData) {
                var template = templateData.data;
                var printScope = $rootScope.$new();
                angular.extend(printScope, prescriptionDetails);
                var element = $compile($('<div>' + template + '</div>'))(printScope);
                var renderAndSendPromise = $q.defer();
                var waitForRenderAndSend = function () {
                    if (printScope.$$phase || $http.pendingRequests.length) {
                        $timeout(waitForRenderAndSend, 1000);
                    } else {
                        html2pdf().from(element.html()).outputPdf().then(function (pdfContent) {
                            var attachments = [{
                                "contentType": "application/pdf",
                                "name": "Precription_" + $filter("bahmniDate")(prescriptionDetails.visitDate).split(" ").join("-") + ".pdf",
                                "data": btoa(pdfContent),
                                "url": null
                            }];
                            var subject = "Prescription for consultation at " + $rootScope.facilityLocation.name + " on " + $filter("bahmniDate")(prescriptionDetails.visitDate);
                            var body = transmissionService.getSharePrescriptionMailContent(prescriptionDetails);
                            var emailUrl = appService.getAppDescriptor().formatUrl(Bahmni.Common.Constants.sendViaEmailUrl, { 'patientUuid': prescriptionDetails.patient.uuid });
                            transmissionService.sendEmail(attachments, subject, body, emailUrl, [], []);
                        });
                        renderAndSendPromise.resolve();
                        printScope.$destroy();
                    }
                    return renderAndSendPromise.promise;
                };
                spinner.forPromise(waitForRenderAndSend());
            });
        };

        var getOrderedProviderAttributesForPrint = function (attributeData, attributeTypesToFilter) {
            if (!attributeTypesToFilter) return;
            var filteredAttributes = attributeData.filter(function (attribute) {
                return attributeTypesToFilter.includes(attribute.attributeType.display);
            });
            filteredAttributes.sort(function (a, b) {
                return attributeTypesToFilter.indexOf(a.attributeType.display) - attributeTypesToFilter.indexOf(b.attributeType.display);
            });
            return filteredAttributes;
        };

        var printSelectedPrescriptions = function (printPrescriptionFeatureConfig, drugOrdersForPrint, patient, additionalInfo, diagnosesCodes, dispenserInfo, observationsEntries, allergiesData, visitDate) {
            if (drugOrdersForPrint.length > 0) {
                var encounterDrugOrderMap = Object.values(drugOrdersForPrint.reduce(function (orderMap, item) {
                    const providerUuid = item.provider.uuid;
                    if (!orderMap[providerUuid]) {
                        orderMap[providerUuid] = {
                            providerUuid: providerUuid,
                            drugOrders: []
                        };
                    }
                    orderMap[providerUuid].drugOrders.push(item);
                    return orderMap;
                }, {}));

                var printParams = {
                    title: printPrescriptionFeatureConfig.title || "",
                    header: printPrescriptionFeatureConfig.header || "",
                    logo: printPrescriptionFeatureConfig.logo || ""
                };
                var templateUrl = printPrescriptionFeatureConfig.templateUrl || '../common/displaycontrols/prescription/views/prescription.html';
                var fileName = patient.givenName + patient.familyName + "_" + patient.identifier + "_Prescription";
                const printData = {
                    patient: patient,
                    encounterDrugOrderMap: encounterDrugOrderMap,
                    printParams: printParams,
                    additionalInfo: additionalInfo,
                    diagnosesCodes: diagnosesCodes,
                    dispenserInfo: dispenserInfo,
                    observationsEntries: observationsEntries,
                    allergies: allergiesData,
                    visitDate: visitDate
                };
                printer.print(templateUrl, printData, fileName);
            }
        };

        return {
            getActiveDrugOrders: getActiveDrugOrders,
            getConfig: getConfig,
            getPrescribedDrugOrders: getPrescribedDrugOrders,
            getPrescribedAndActiveDrugOrders: getPrescribedAndActiveDrugOrders,
            getMedicationSchedulesForOrders: getMedicationSchedulesForOrders,
            getNonCodedDrugConcept: getNonCodedDrugConcept,
            getAllDrugOrdersFor: getAllDrugOrdersFor,
            voidDrugOrder: voidDrugOrder,
            sharePrescriptions: sharePrescriptions,
            printSelectedPrescriptions: printSelectedPrescriptions,
            getOrderedProviderAttributesForPrint: getOrderedProviderAttributesForPrint
        };
    }]);
