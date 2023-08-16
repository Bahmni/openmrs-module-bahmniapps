describe('alertOnExit Directive', function () {
    var $rootScope, $compile, $scope, exitAlertService, $state;

    beforeEach(function () {
        module('bahmni.clinical');

        exitAlertService = {
            setIsNavigating: jasmine.createSpy('setIsNavigating').and.returnValue(true),
            setDirtyConsultationForm: jasmine.createSpy('setDirtyConsultationForm').and.returnValue(true),
            showExitAlert: jasmine.createSpy('showExitAlert')
        };

        module(function ($provide) {
            $provide.value('exitAlertService', exitAlertService);
            $provide.value('$state', {
                params: { patientUuid: 'currentPatientUuid' },
                dirtyConsultationForm: true
            });
        });

        inject(function (_$rootScope_, _$compile_, _$state_) {
            $rootScope = _$rootScope_;
            $compile = _$compile_;
            $state = _$state_;
            $scope = $rootScope.$new();
        });
    });

    it('should call exitAlertService methods with correct arguments on $stateChangeStart', function () {
        var element = angular.element('<div alert-on-exit></div>');
        $compile(element)($scope);
        $scope.$digest();

        var next = { url: '/patient/search', spinnerToken: 'spinner' };
        var current = { patientUuid: 'previousPatientUuid' };
        var event = $rootScope.$broadcast('$stateChangeStart', next, current);

        expect(exitAlertService.setIsNavigating).toHaveBeenCalledWith(next, 'currentPatientUuid', 'previousPatientUuid');
        expect(exitAlertService.showExitAlert).toHaveBeenCalledWith(true, true, event, 'spinner');
    });
});
