'use strict';

describe('TreatmentController', function () {
    var $controller, $rootScope, $scope, appService, mockAppDescriptor, filter;
    var clinicalAppConfigService;
    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function (_$controller_, _$rootScope_, _$filter_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        clinicalAppConfigService = jasmine.createSpyObj('clinicalAppConfigService', ['getVisitTypeForRetrospectiveEntries'])
        mockAppDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfig', 'getConfigValue']);
        mockAppDescriptor.getConfig.and.returnValue({value: true});
        mockAppDescriptor.getConfigValue.and.returnValue(true);

        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        appService.getAppDescriptor.and.returnValue(mockAppDescriptor);
        filter = _$filter_;
    }));

    it('should initialize the newlyAddedTabTreatments', function () {
        var controller = $controller('TreatmentController', {
            $scope: $scope,
            treatmentConfig: {drugOrderHistoryConfig: {view: 'default'}},
            $stateParams: {tabConfigName: 'allMedicationTabConfig'},
            appService: appService,
            clinicalAppConfigService: clinicalAppConfigService,
            $filter: filter
        });
        controller.initializeTreatments = jasmine.createSpy('initializeTreatments');
        $scope.consultation = {
            newlyAddedTabTreatments: {
                allMedicationTabConfig: {
                    treatments: [],
                    orderSetTreatments: [],
                    newOrderSet: "new order"
                }
            }
        }
        $scope.$apply();
        expect($scope.newOrderSet).toEqual("new order");
    });

});