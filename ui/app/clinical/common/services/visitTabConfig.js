'use strict';

angular.module('bahmni.clinical')
    .service('visitTabConfig', ['appService', function (appService) {
        var self = this;

        var defaultVisitTabConfig = {
            title: "General",
            default: true,
            investigationResult: {
                title: "Lab Investigations",
                showChart: true,
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
                numberOfVisits: 1,
                showDetailsButton: true
            },
            observation: {
                numberOfVisits: 1,
                obsIgnoreList: ["Patient file", "Radiology", "Lab Manager Notes", "Accession Uuid", "Impression"],
                showDetailsButton: true
            },
            diagnosis: {
                title: "Diagnoses",
                showCertainty: true,
                showOrder: true,
                showDetailsButton: true
            },
            patientInformation: {
                title: "PatientInformation",
                patientAttributes : ["caste", "class", "education", "occupation"]
            },
            radiology: {
                title: "Radiology"
            },
            patientFiles: {
                title: "Patient Files"
            },
            otherInvestigations: {
                Radiology: "Radiology Order",
                Endoscopy: "Endoscopy Order"
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