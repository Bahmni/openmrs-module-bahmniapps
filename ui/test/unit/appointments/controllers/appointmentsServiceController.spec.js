'use strict';

describe("AppointmentsServiceController", function () {
    var appointsServiceController, scope, appointmentsServiceService;

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            appointmentsServiceService = jasmine.createSpyObj('appointmentsServiceService', ['save']);
            appointsServiceController = $controller('AppointmentsServiceController', {
                $scope: scope,
                appointmentsServiceService: appointmentsServiceService
            }
            );
        });
    });

    it('should save all appointment service details', function () {
        scope.service = {name: 'Chemotherapy', description: 'For cancer'};
        scope.save();
        expect(appointmentsServiceService.save).toHaveBeenCalledWith(scope.service);
    });
});
