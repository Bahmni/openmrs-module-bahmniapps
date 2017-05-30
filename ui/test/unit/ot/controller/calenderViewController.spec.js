'use strict';

describe("calendarViewController", function () {

    var controller,scope;
    var state = jasmine.createSpyObj('$state', ['go']);
    var appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
    var appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
    appService.getAppDescriptor.and.returnValue(appDescriptor);

    appDescriptor.getConfigValue.and.callFake(function (value) {
        if (value == 'calendarView') {
            return {dayViewStart: "09:00",
                dayViewEnd: "17:00",
                dayViewSplit: "60"};
        }
    });

    beforeEach(function () {
        module('bahmni.ot');
        inject(function ($controller, $rootScope) {
            controller = $controller;
            scope = $rootScope.$new();
        });
    });

    var createController = function () {
        controller('calendarViewController', {
            $scope: scope,
            $state: state,
            appService: appService
        });
    };


    it('should go to the previous date on click of left arrow', function () {
        createController();
        scope.viewDate = new Date(moment('2017-02-01').startOf('day'));
        scope.goToPreviousDate(scope.viewDate);
        expect(scope.viewDate).toEqual(new Date(moment('2017-01-31').startOf('day')));
    });

    it('should go to the next date on click of right arrow', function () {
        createController();
        scope.viewDate = new Date(moment('2017-02-01').startOf('day'));
        scope.goToNextDate(scope.viewDate);
        expect(scope.viewDate).toEqual(new Date(moment('2017-02-02').startOf('day')));
    });

    it('should go to the current date on click of today', function () {
        createController();
        scope.goToCurrentDate();
        expect(scope.viewDate).toEqual(new Date(moment().startOf('day')));
    });
});