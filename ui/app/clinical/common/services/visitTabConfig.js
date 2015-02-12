'use strict';

angular.module('bahmni.clinical')
    .service('visitTabConfig', ['appService', function (appService) {
        var self = this;

        var defaultVisitTabConfig = {
            title: "General",
            default: true,
            investigationResult: {
                title: "Lab Investigations",
                showChart: false,
                showTable: true,
                showNormalLabResults: true,
                showCommentsExpanded: true,
                showAccessionNotes: true,
                numberOfVisits: 10
            },
            treatment: {
                title: "Treatments",
                showFlowSheet: true,
                showListView: true,
                showOtherActive: false,
                showDetailsButton: true,
                showRoute: true,
                showDrugForm: true
            },
            disposition: {
                numberOfVisits: 1
            },
            observation: {
                numberOfVisits: 1
            },
            diagnosis: {
                title: "Diagnoses"
            }
        };

        this.load = function () {
            return appService.loadConfig('visit').then(function (response) {
                var defaultTab = _.find(response.data, function (visitTabConfig) {
                    return visitTabConfig.default;
                });

                if (defaultTab) {
                    angular.extend(defaultTab, defaultVisitTabConfig);
                } else {
                    response.data.push(defaultVisitTabConfig);
                }

                angular.extend(self, new Bahmni.Clinical.VisitTabConfig(response.data));
            });
        }

    }]);