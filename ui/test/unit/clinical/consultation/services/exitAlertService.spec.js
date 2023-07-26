describe('exitAlertService', function () {
    var exitAlertService, messagingService, spinner, $state, $location;

    beforeEach(function () {
        module('bahmni.clinical');

        messagingService = {
            showMessage: jasmine.createSpy('showMessage')
        };
        spinner = {
            hide: jasmine.createSpy('hide')
        };
        $state = {
            newPatientUuid: '',
            discardChanges: false,
            dirtyConsultationForm: true
        };
        $location = {
            path: jasmine.createSpy('path')
        };

        module(function ($provide) {
            $provide.value('messagingService', messagingService);
            $provide.value('spinner', spinner);
            $provide.value('$state', $state);
            $provide.value('$location', $location);
        });

        inject(function ($injector) {
            exitAlertService = $injector.get('exitAlertService');
        });
    });

    it('should show exit alert when isNavigating is true and dirtyConsultationForm is true', function () {
        var event = {
            preventDefault: jasmine.createSpy('preventDefault')
        };
        exitAlertService.showExitAlert(true, true, event, 'spinnerToken');
        expect(messagingService.showMessage).toHaveBeenCalledWith('alert', jasmine.any(String));
        expect(event.preventDefault).toHaveBeenCalled();
        expect(spinner.hide).toHaveBeenCalledWith('spinnerToken');
    });

    it('should not show exit alert when isNavigating is false or dirtyConsultationForm is false', function () {
        exitAlertService.showExitAlert(false, true, {}, 'spinnerToken');
        expect(messagingService.showMessage).not.toHaveBeenCalled();
        expect(spinner.hide).not.toHaveBeenCalled();

        exitAlertService.showExitAlert(true, false, {}, 'spinnerToken');
        expect(messagingService.showMessage).not.toHaveBeenCalled();
        expect(spinner.hide).not.toHaveBeenCalled();
    });

    it('should set isPatientSearch correctly in setIsNavigating function', function () {
        var next = { url: '/patient/search' };
        var uuid = 'prevPatientUuid';
        var currentUuid = 'currentPatientUuid';

        var isNavigating = exitAlertService.setIsNavigating(next, uuid, currentUuid);
        expect(isNavigating).toBe(true);
        expect($state.isPatientSearch).toBe(true);

        next.url = '/patient/currentPatientUuid/dashboard';
        isNavigating = exitAlertService.setIsNavigating(next, uuid, currentUuid);
        expect(isNavigating).toBe(true);
        expect($state.isPatientSearch).toBe(false);
    });

    it('should set newPatientUuid correctly in setIsNavigating function', function () {
        var next = { url: '/patient/456/dashboard' };
        var currentUuid = 'currentPatientUuid';

        exitAlertService.setIsNavigating(next, '', currentUuid);
        expect($state.newPatientUuid).toBe(currentUuid);
    });

    it('should return false for setDirtyConsultationForm when discardChanges is true', function () {
        $state.discardChanges = true;
        expect(exitAlertService.setDirtyConsultationForm()).toBe(false);
    });

    it('should return true for setDirtyConsultationForm when discardChanges is false and dirtyConsultationForm is true', function () {
        $state.discardChanges = false;
        $state.dirtyConsultationForm = true;
        expect(exitAlertService.setDirtyConsultationForm()).toBe(true);
    });

    it('should return false for setDirtyConsultationForm when discardChanges is false and dirtyConsultationForm is false', function () {
        $state.discardChanges = false;
        $state.dirtyConsultationForm = false;
        expect(exitAlertService.setDirtyConsultationForm()).toBe(false);
    });

    it('should redirect to patient search when isPatientSearch is true', function () {
        $state.isPatientSearch = true;
        exitAlertService.redirectUrl();
        expect($location.path).toHaveBeenCalledWith('/default/patient/search');
    });

    it('should redirect to patient dashboard when isPatientSearch is false', function () {
        $state.isPatientSearch = false;
        $state.newPatientUuid = 'newPatientUuid';
        exitAlertService.redirectUrl();
        expect($location.path).toHaveBeenCalledWith('/default/patient/newPatientUuid/dashboard');
    });
});
