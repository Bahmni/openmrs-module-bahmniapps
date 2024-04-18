'use strict';

angular.module('bahmni.clinical')
    .factory('labOrderResultService', ['$http', '$q', 'configurationService', function ($http, $q, configurationService) {
        var allTestsAndPanelsConcept = {};
        configurationService.getConfigurations(['allTestsAndPanelsConcept']).then(function (configurations) {
            allTestsAndPanelsConcept = configurations.allTestsAndPanelsConcept.results[0];
        });
        var sanitizeData = function (labOrderResults) {
            labOrderResults.forEach(function (result) {
                result.accessionDateTime = Bahmni.Common.Util.DateUtil.parse(result.accessionDateTime);
                result.hasRange = result.minNormal || result.maxNormal;
            });
        };

        var groupLabOrdersByPanel = function (labOrders) {
            var panels = {};
            var accessionGroup = [];
            if (labOrders) {
                labOrders.forEach(function (labOrder) {
                    if (!labOrder.panelName) {
                        labOrder.isPanel = false;
                        labOrder.orderName = labOrder.testName;
                        accessionGroup.push(labOrder);
                    } else {
                        panels[labOrder.panelName] = panels[labOrder.panelName] || {
                            accessionDateTime: labOrder.accessionDateTime,
                            orderName: labOrder.panelName,
                            tests: [],
                            isPanel: true
                        };
                        panels[labOrder.panelName].tests.push(labOrder);
                    }
                });
            }
            _.values(panels).forEach(function (value) {
                accessionGroup.push(value);
            });
            return accessionGroup;
        };

        var groupByPanel = function (accessions) {
            var grouped = [];
            accessions.forEach(function (labOrders) {
                grouped.push(groupLabOrdersByPanel(labOrders));
            });
            return grouped;
        };

        var flattened = function (accessions) {
            return accessions.map(
                function (results) {
                    var flattenedResults = _(results).map(
                        function (result) {
                            return result.isPanel === true ? [result, result.tests] : result;
                        }).flattenDeep().value();
                    return flattenedResults;
                }
            );
        };

        var flattenedTabularData = function (results) {
            var flattenedResults = _(results).map(
                function (result) {
                    return result.isPanel === true ? [result, result.tests] : result;
                }
            ).flattenDeep().value();
            return flattenedResults;
        };

        var transformGroupSort = function (results, initialAccessionCount, latestAccessionCount, sortResultColumnsLatestFirst, groupOrdersByPanel) {
            var labOrderResults = results.results;
            sanitizeData(labOrderResults);

            var accessionConfig = {
                initialAccessionCount: initialAccessionCount,
                latestAccessionCount: latestAccessionCount
            };

            var tabularResult = new Bahmni.Clinical.TabularLabOrderResults(results.tabularResult, accessionConfig, sortResultColumnsLatestFirst);
            if (groupOrdersByPanel) {
                tabularResult.tabularResult.orders = groupLabOrdersByPanel(tabularResult.tabularResult.orders);
            }
            var accessions = _.groupBy(labOrderResults, function (labOrderResult) {
                return labOrderResult.accessionUuid;
            });
            accessions = _.sortBy(accessions, function (accession) {
                return accession[0].accessionDateTime;
            });

            if (accessionConfig.initialAccessionCount || accessionConfig.latestAccessionCount) {
                var initial = _.take(accessions, accessionConfig.initialAccessionCount || 0);
                var latest = _.takeRight(accessions, accessionConfig.latestAccessionCount || 0);

                accessions = _.union(initial, latest);
            }
            accessions.reverse();
            return {
                accessions: groupByPanel(accessions),
                tabularResult: tabularResult
            };
        };
        var getAllForPatient = function (params) {
            var deferred = $q.defer();
            var paramsToBeSent = {};
            if (params.visitUuids) {
                paramsToBeSent.visitUuids = params.visitUuids;
            } else {
                if (!params.patientUuid) {
                    deferred.reject('patient uuid is mandatory');
                }
                paramsToBeSent.patientUuid = params.patientUuid;
                if (params.numberOfVisits !== 0) {
                    paramsToBeSent.numberOfVisits = params.numberOfVisits;
                }
            }

            $http.get(Bahmni.Common.Constants.bahmniLabOrderResultsUrl, {
                method: "GET",
                params: paramsToBeSent,
                withCredentials: true
            }).then(function (response) {
                var results = transformGroupSort(response.data, params.initialAccessionCount, params.latestAccessionCount, params.sortResultColumnsLatestFirst, params.groupOrdersByPanel);
                var sortedConceptSet = new Bahmni.Clinical.ConceptWeightBasedSorter(allTestsAndPanelsConcept);
                results.tabularResult.tabularResult.orders = sortedConceptSet.sortTestResults(results.tabularResult.tabularResult.orders);
                var resultObject = {
                    labAccessions: flattened(results.accessions.map(sortedConceptSet.sortTestResults)),
                    tabular: results.tabularResult
                };
                if (params.groupOrdersByPanel) {
                    resultObject.tabular.tabularResult.orders = flattenedTabularData(resultObject.tabular.tabularResult.orders);
                }
                deferred.resolve(resultObject);
            });

            return deferred.promise;
        };

        return {
            getAllForPatient: getAllForPatient
        };
    }]);
