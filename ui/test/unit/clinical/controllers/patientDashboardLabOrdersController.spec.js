/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

describe("PatientDashboardLabOrdersController", function () {

    beforeEach(module('bahmni.clinical'));

    var scope, stateParams, controller, visitActionsService, allergyService, observationsService, orderService, treatmentService, $q, $rootScope;

    var labResultSection = {
        "type": "labOrders",
        "dashboardConfig": {
            "title": null,
            "showChart": false,
            "showTable": true,
            "showNormalValues": true,
            "showCommentsExpanded": true,
            "showAccessionNotes": true
        }
    };

    var labResultSectionWithPrintConfig = angular.extend({}, labResultSection, {
        "labResultsPrint": {
            "templateUrl": "/bahmni_config/openmrs/apps/clinical/clinicalPrints/labResultsPrint.html",
            "providerAttributesForPrint": ["Provider Full Name", "Provider Title", "Medical Licence Number"]
        }
    });

    beforeEach(inject(function ($controller, _$rootScope_, _$q_) {
        controller = $controller;
        $rootScope = _$rootScope_;
        $q = _$q_;
        scope = $rootScope.$new();
        scope.patient = {uuid: "patient123"};
        scope.dialogData = {};
        stateParams = {patientUuid: "patient123"};

        $rootScope.facilityLocation = {address5: 'Test Address'};
        $rootScope.currentProvider = {uuid: 'provider-fallback', display: 'Dr. Fallback'};

        visitActionsService = jasmine.createSpyObj('visitActionsService', ['downloadLabResults']);
        allergyService = jasmine.createSpyObj('allergyService', ['fetchAndProcessAllergies']);
        allergyService.fetchAndProcessAllergies.and.returnValue($q.when('Pollen'));
        observationsService = jasmine.createSpyObj('observationsService', ['fetch']);
        observationsService.fetch.and.returnValue($q.when({data: []}));
        orderService = jasmine.createSpyObj('orderService', ['getOrderByUuid']);
        orderService.getOrderByUuid.and.returnValue($q.when({
            data: {orderer: {uuid: 'provider-uuid', display: 'Dr. Test', attributes: []}}
        }));
        treatmentService = jasmine.createSpyObj('treatmentService', ['getOrderedProviderAttributesForPrint']);
        treatmentService.getOrderedProviderAttributesForPrint.and.callFake(function (attributes, filter) {
            if (!filter || !filter.length) { return attributes; }
            var ordered = [];
            filter.forEach(function (name) {
                var match = (attributes || []).filter(function (a) { return a.attributeType.display === name; })[0];
                if (match) { ordered.push(match); }
            });
            return ordered;
        });
    }));

    var initController = function () {
        return controller('PatientDashboardLabOrdersController', {
            $scope: scope,
            $stateParams: stateParams,
            $rootScope: $rootScope,
            $q: $q,
            visitActionsService: visitActionsService,
            allergyService: allergyService,
            observationsService: observationsService,
            orderService: orderService,
            treatmentService: treatmentService
        });
    };

    describe("when initialized", function () {
        it("should create configuration for displaying lab orders", function () {
            scope.dashboard = Bahmni.Common.DisplayControl.Dashboard.create({
                "dashboardName": "General",
                "sections": [labResultSection]
            });
            initController();
            expect(scope.dashboardConfig.patientUuid).toBe("patient123");
            expect(scope.dashboardConfig.showNormalValues).toBe(labResultSection.dashboardConfig.showNormalValues);
        });

    });

    describe("Allergies Fetch", function () {
        beforeEach(function () {
            scope.dashboard = Bahmni.Common.DisplayControl.Dashboard.create({
                "dashboardName": "General",
                "sections": [labResultSection]
            });
        });

        it("should set allergies on patient when returned", function () {
            initController();
            var labOrderResults = [{orderUuid: 'order-1', isPanel: false}];
            scope.$broadcast("event:downloadLabResultsFromDashboard", labOrderResults, '2024-01-01', 'acc-1');
            $rootScope.$digest();
            var patient = visitActionsService.downloadLabResults.calls.mostRecent().args[0];
            expect(patient.allergies).toBe('Pollen');
        });

        it("should set empty string on patient when allergies fetch fails", function () {
            allergyService.fetchAndProcessAllergies.and.returnValue($q.reject('error'));
            initController();
            var labOrderResults = [{orderUuid: 'order-1', isPanel: false}];
            scope.$broadcast("event:downloadLabResultsFromDashboard", labOrderResults, '2024-01-01', 'acc-1');
            $rootScope.$digest();
            var patient = visitActionsService.downloadLabResults.calls.mostRecent().args[0];
            expect(patient.allergies).toBe('');
        });
    });

    describe("Weight Fetch", function () {
        beforeEach(function () {
            scope.dashboard = Bahmni.Common.DisplayControl.Dashboard.create({
                "dashboardName": "General",
                "sections": [labResultSection]
            });
        });

        it("should call observationsService.fetch with null numberOfVisits to search across all visits", function () {
            initController();
            $rootScope.$digest();
            expect(observationsService.fetch).toHaveBeenCalledWith(
                "patient123",
                [Bahmni.Common.Constants.weightConceptName],
                'latest',
                null,
                null, null, null, null
            );
        });

        it("should set weight on patient when observation is returned", function () {
            observationsService.fetch.and.returnValue($q.when({data: [{value: 65.5}]}));
            initController();
            var labOrderResults = [{orderUuid: 'order-1', isPanel: false}];
            scope.$broadcast("event:downloadLabResultsFromDashboard", labOrderResults, '2024-01-01', 'acc-1');
            $rootScope.$digest();
            var patient = visitActionsService.downloadLabResults.calls.mostRecent().args[0];
            expect(patient.weight).toBe(65.5);
        });

        it("should not set weight when no observations are returned", function () {
            observationsService.fetch.and.returnValue($q.when({data: []}));
            initController();
            var labOrderResults = [{orderUuid: 'order-1', isPanel: false}];
            scope.$broadcast("event:downloadLabResultsFromDashboard", labOrderResults, '2024-01-01', 'acc-1');
            $rootScope.$digest();
            var patient = visitActionsService.downloadLabResults.calls.mostRecent().args[0];
            expect(patient.weight).toBeUndefined();
        });

        it("should proceed with download even when weight fetch fails", function () {
            observationsService.fetch.and.returnValue($q.reject('error'));
            initController();
            var labOrderResults = [{orderUuid: 'order-1', isPanel: false}];
            scope.$broadcast("event:downloadLabResultsFromDashboard", labOrderResults, '2024-01-01', 'acc-1');
            $rootScope.$digest();
            expect(visitActionsService.downloadLabResults).toHaveBeenCalled();
        });
    });

    describe("Download Lab Results event", function () {
        beforeEach(function () {
            scope.dashboard = Bahmni.Common.DisplayControl.Dashboard.create({
                "dashboardName": "General",
                "sections": [labResultSection]
            });
        });

        it("should call orderService.getOrderByUuid with the correct orderUuid and representation", function () {
            initController();
            var labOrderResults = [{orderUuid: 'order-uuid-1', isPanel: false}];
            scope.$broadcast("event:downloadLabResultsFromDashboard", labOrderResults, '2024-01-01', 'acc-1');
            $rootScope.$digest();
            expect(orderService.getOrderByUuid).toHaveBeenCalledWith(
                'order-uuid-1',
                'custom:(orderer:(uuid,display,attributes:(value,attributeType:(display))))'
            );
        });

        it("should use orderUuid from first test in a panel result", function () {
            initController();
            var labOrderResults = [{isPanel: true, tests: [{orderUuid: 'panel-order-uuid'}]}];
            scope.$broadcast("event:downloadLabResultsFromDashboard", labOrderResults, '2024-01-01', 'acc-1');
            $rootScope.$digest();
            expect(orderService.getOrderByUuid).toHaveBeenCalledWith(
                'panel-order-uuid',
                jasmine.any(String)
            );
        });

        it("should pass raw orderer from order API in print config", function () {
            var attrs = [{value: 'Dr. Full Name', attributeType: {display: 'Provider Full Name'}}];
            orderService.getOrderByUuid.and.returnValue($q.when({
                data: {orderer: {uuid: 'p1', display: 'Dr. Test', attributes: attrs}}
            }));
            initController();
            var labOrderResults = [{orderUuid: 'order-1', isPanel: false}];
            scope.$broadcast("event:downloadLabResultsFromDashboard", labOrderResults, '2024-01-01', 'acc-1');
            $rootScope.$digest();

            var printConfig = visitActionsService.downloadLabResults.calls.mostRecent().args[4];
            expect(printConfig.orderer.uuid).toBe('p1');
            expect(printConfig.orderer.display).toBe('Dr. Test');
        });

        it("should call getOrderedProviderAttributesForPrint with orderer attributes and config filter", function () {
            scope.dashboard = Bahmni.Common.DisplayControl.Dashboard.create({
                "dashboardName": "General",
                "sections": [labResultSectionWithPrintConfig]
            });
            var attrs = [
                {value: 'Dr. Full Name', attributeType: {display: 'Provider Full Name'}},
                {value: 'MD', attributeType: {display: 'Provider Title'}}
            ];
            orderService.getOrderByUuid.and.returnValue($q.when({
                data: {orderer: {uuid: 'p1', display: 'Dr. Test', attributes: attrs}}
            }));
            initController();
            scope.$broadcast("event:downloadLabResultsFromDashboard", [{orderUuid: 'order-1', isPanel: false}], '2024-01-01', 'acc-1');
            $rootScope.$digest();
            expect(treatmentService.getOrderedProviderAttributesForPrint).toHaveBeenCalledWith(
                attrs,
                ["Provider Full Name", "Provider Title", "Medical Licence Number"]
            );
        });

        it("should fall back to currentProvider when orderUuid is missing", function () {
            initController();
            var labOrderResults = [{isPanel: false}];
            scope.$broadcast("event:downloadLabResultsFromDashboard", labOrderResults, '2024-01-01', 'acc-1');
            $rootScope.$digest();

            expect(orderService.getOrderByUuid).not.toHaveBeenCalled();
            var printConfig = visitActionsService.downloadLabResults.calls.mostRecent().args[4];
            expect(printConfig.orderer).toEqual($rootScope.currentProvider);
        });

        it("should fall back to currentProvider when order API call fails", function () {
            orderService.getOrderByUuid.and.returnValue($q.reject('API error'));
            initController();
            var labOrderResults = [{orderUuid: 'order-1', isPanel: false}];
            scope.$broadcast("event:downloadLabResultsFromDashboard", labOrderResults, '2024-01-01', 'acc-1');
            $rootScope.$digest();

            var printConfig = visitActionsService.downloadLabResults.calls.mostRecent().args[4];
            expect(printConfig.orderer).toEqual($rootScope.currentProvider);
        });

        it("should fall back to currentProvider when orderer is missing in order response", function () {
            orderService.getOrderByUuid.and.returnValue($q.when({data: {}}));
            initController();
            var labOrderResults = [{orderUuid: 'order-1', isPanel: false}];
            scope.$broadcast("event:downloadLabResultsFromDashboard", labOrderResults, '2024-01-01', 'acc-1');
            $rootScope.$digest();

            var printConfig = visitActionsService.downloadLabResults.calls.mostRecent().args[4];
            expect(printConfig.orderer).toEqual($rootScope.currentProvider);
        });

        it("should set locationAddress from facilityLocation.address5 in print config", function () {
            initController();
            var labOrderResults = [{orderUuid: 'order-1', isPanel: false}];
            scope.$broadcast("event:downloadLabResultsFromDashboard", labOrderResults, '2024-01-01', 'acc-1');
            $rootScope.$digest();

            var printConfig = visitActionsService.downloadLabResults.calls.mostRecent().args[4];
            expect(printConfig.locationAddress).toBe('Test Address');
        });

        it("should use templateUrl from labResultsPrint config", function () {
            scope.dashboard = Bahmni.Common.DisplayControl.Dashboard.create({
                "dashboardName": "General",
                "sections": [labResultSectionWithPrintConfig]
            });
            initController();
            scope.$broadcast("event:downloadLabResultsFromDashboard", [{orderUuid: 'order-1', isPanel: false}], '2024-01-01', 'acc-1');
            $rootScope.$digest();

            var printConfig = visitActionsService.downloadLabResults.calls.mostRecent().args[4];
            expect(printConfig.templateUrl).toBe('/bahmni_config/openmrs/apps/clinical/clinicalPrints/labResultsPrint.html');
        });

        it("should not set templateUrl when labResultsPrint config is absent", function () {
            initController();
            scope.$broadcast("event:downloadLabResultsFromDashboard", [{orderUuid: 'order-1', isPanel: false}], '2024-01-01', 'acc-1');
            $rootScope.$digest();

            var printConfig = visitActionsService.downloadLabResults.calls.mostRecent().args[4];
            expect(printConfig.templateUrl).toBeUndefined();
        });

        it("should pass labOrderResults and accession details to downloadLabResults", function () {
            initController();
            var labOrderResults = [{orderUuid: 'order-1', isPanel: false}];
            scope.$broadcast("event:downloadLabResultsFromDashboard", labOrderResults, '2024-01-01', 'acc-uuid-1');
            $rootScope.$digest();

            var args = visitActionsService.downloadLabResults.calls.mostRecent().args;
            expect(args[1]).toBe(labOrderResults);
            expect(args[2]).toBe('2024-01-01');
            expect(args[3]).toBe('acc-uuid-1');
        });
    });
});
