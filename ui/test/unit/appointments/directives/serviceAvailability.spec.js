'use strict';

describe('ServiceAvailability', function () {
    var compile, scope, httpBackend, appService, appDescriptor, confirmBox;

    var days = [{
        dayOfWeek: 'SUNDAY',
        isSelected: false
    }, {
        dayOfWeek: 'MONDAY',
        isSelected: false
    }, {
        dayOfWeek: 'TUESDAY',
        isSelected: false
    }, {
        dayOfWeek: 'WEDNESDAY',
        isSelected: false
    }, {
        dayOfWeek: 'THURSDAY',
        isSelected: false
    }, {
        dayOfWeek: 'FRIDAY',
        isSelected: false
    }, {
        dayOfWeek: 'SATURDAY',
        isSelected: false
    }];

    beforeEach(module('bahmni.appointments', function ($provide) {
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
        appService.getAppDescriptor.and.returnValue(appDescriptor);
        confirmBox = jasmine.createSpy('confirmBox');

        $provide.value('appService', appService);
        $provide.value('confirmBox', confirmBox);
    }));

    beforeEach(inject(function ($compile, $httpBackend, $rootScope) {
        compile = $compile;
        scope = $rootScope.$new();
        httpBackend = $httpBackend;
        httpBackend.expectGET('../i18n/appointments/locale_en.json').respond({});
        httpBackend.expectGET('/bahmni_config/openmrs/i18n/appointments/locale_en.json').respond({});
        httpBackend.expectGET('../appointments/views/admin/appointmentServiceAvailability.html').respond('<div></div>');
    }));

    var createElement = function () {
        var html = '<service-availability availability="availability" availability-list="availabilityList" state="state"></service-availability>';

        var element = compile(angular.element(html))(scope);
        scope.$digest();
        httpBackend.flush();
        return element;
    };

    it('should init availability and startOfWeek', function () {
        appDescriptor.getConfigValue.and.returnValue("Tuesday");
        expect(scope.availability).toBeUndefined();
        var element = createElement();
        var compiledElementScope = element.isolateScope();

        expect(scope.availability).toEqual({});
        expect(compiledElementScope.startOfWeek).toBe(3);
    });

    it('should take 2 as startOfWeek by default', function () {
        var element = createElement();
        var compiledElementScope = element.isolateScope();

        expect(compiledElementScope.startOfWeek).toBe(2);
    });

    describe('checkState', function () {
        it('isNew should return true if state is 0', function () {
            scope.state = 0;
            var element = createElement();
            var compiledElementScope = element.isolateScope();
            expect(compiledElementScope.isNew()).toBeTruthy();
            expect(compiledElementScope.isReadOnly()).toBeFalsy();
            expect(compiledElementScope.isEdit()).toBeFalsy();
        });

        it('isEdit should return true if state is 1', function () {
            scope.state = 1;
            var element = createElement();
            var compiledElementScope = element.isolateScope();
            expect(compiledElementScope.isEdit()).toBeTruthy();
            expect(compiledElementScope.isNew()).toBeFalsy();
            expect(compiledElementScope.isReadOnly()).toBeFalsy();
        });

        it('isReadOnly should return true if state is 2', function () {
            scope.state = 2;
            var element = createElement();
            var compiledElementScope = element.isolateScope();
            expect(compiledElementScope.isReadOnly()).toBeTruthy();
            expect(compiledElementScope.isNew()).toBeFalsy();
            expect(compiledElementScope.isEdit()).toBeFalsy();
        });
    });

    describe('validateAvailability', function () {
        it('should return true if all fields are valid', function () {
            var startDateTime = new Date("2015-10-01T09:30:00.000Z").toString();
            var endDateTime = new Date("2015-10-01T10:30:00.000Z").toString();
            var avbdays = angular.copy(days);
            avbdays[0].isSelected = true;
            scope.availability = {
                startTime: startDateTime,
                endTime: endDateTime,
                days: avbdays
            };
            scope.availabilityList = [];
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.isValid()).toBeTruthy();
        });

        it('should return false if all fields are empty', function () {
            scope.availabilityList = [];
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(scope.availability).toEqual({});
            expect(compiledElementScope.isValid()).toBeFalsy();
        });

        it('should return false if startTime is not filled', function () {
            scope.availability = {
                startTime: undefined,
                endTime: new Date().toString(),
                days: 2
            };
            scope.availabilityList = [];
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.isValid()).toBeFalsy();
        });

        it('should return false if endTime is not filled', function () {
            scope.availability = {
                startTime: new Date().toString(),
                endTime: undefined,
                days: 2
            };
            scope.availabilityList = [];
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.isValid()).toBeFalsy();
        });

        it('should return false if not even one day is selected', function () {
            scope.availability = {
                startTime: new Date().toString(),
                endTime: new Date().toString(),
                days: 0
            };
            scope.availabilityList = [];
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.isValid()).toBeFalsy();
        });

        it('should return false if startTime is greater than endTime', function () {
            var startDateTime = new Date("2015-10-01T11:30:00.000Z").toString();
            var endDateTime = new Date("2015-10-01T10:30:00.000Z").toString();
            scope.availability = {
                startTime: startDateTime,
                endTime: endDateTime,
                days: 2
            };
            scope.availabilityList = [];
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.isValid()).toBeFalsy();
        });

        it('should return false if startTime is equal to endTime', function () {
            var dateTime = new Date("2015-10-01T10:30:00.000Z").toString();
            scope.availability = {
                startTime: dateTime,
                endTime: dateTime,
                days: 2
            };
            scope.availabilityList = [];
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.isValid()).toBeFalsy();
        });
    });

    describe('addAvailability', function () {
        it('should add availability to weeklyAvailability list', function () {
            scope.availability = {
                startTime: new Date().toString(),
                endTime: new Date().toString(),
                days: angular.copy(days)
            };
            scope.availability.days[1].isSelected = true;
            scope.availabilityList = [];
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.availabilityList.length).toBe(0);
            compiledElementScope.add();
            expect(compiledElementScope.availabilityList.length).toBe(1);
            expect(compiledElementScope.availabilityList[0]).toEqual(scope.availability);
            expect(compiledElementScope.availability).toEqual({days: angular.copy(days)});
        });

        it('should not add availability if endTime is within existing duration', function () {
            var availability1 = {
                startTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T11:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            availability1.days[1].isSelected = true;

            var availability2 = {
                startTime: new Date("2015-10-01T08:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T10:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            availability2.days[1].isSelected = true;

            scope.availabilityList = [availability1];
            scope.availability = availability2;
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.availabilityList.length).toBe(1);
            compiledElementScope.add();
            expect(compiledElementScope.doesOverlap).toBeTruthy();
            expect(compiledElementScope.availabilityList.length).toBe(1);
        });

        it('should add availability if endTime falls on existing duration startTime', function () {
            var availability1 = {
                startTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T11:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            var availability2 = {
                startTime: new Date("2015-10-01T08:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                days: angular.copy(days)
            };

            availability1.days[1].isSelected = true;
            availability2.days[1].isSelected = true;

            scope.availabilityList = [availability1];
            scope.availability = availability2;
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.availabilityList.length).toBe(1);
            compiledElementScope.add();
            expect(compiledElementScope.doesOverlap).toBeFalsy();
            expect(compiledElementScope.availabilityList.length).toBe(2);
            expect(compiledElementScope.availabilityList[1]).toEqual(availability2);
            expect(compiledElementScope.availability).toEqual({days: angular.copy(days)});
        });

        it('should not add availability if startTime is within existing duration)', function () {
            var availability1 = {
                startTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T11:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            var availability2 = {
                startTime: new Date("2015-10-01T10:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T12:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            availability1.days[1].isSelected = true;
            availability2.days[1].isSelected = true;

            scope.availabilityList = [availability1];
            scope.availability = availability2;
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.availabilityList.length).toBe(1);
            compiledElementScope.add();
            expect(compiledElementScope.doesOverlap).toBeTruthy();
            expect(compiledElementScope.availabilityList.length).toBe(1);
        });

        it('should add availability if startTime falls on existing duration endTime)', function () {
            var availability1 = {
                startTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T10:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            var availability2 = {
                startTime: new Date("2015-10-01T10:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T12:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            availability1.days[1].isSelected = true;
            availability2.days[1].isSelected = true;
            scope.availabilityList = [availability1];
            scope.availability = availability2;
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.availabilityList.length).toBe(1);
            compiledElementScope.add();
            expect(compiledElementScope.doesOverlap).toBeFalsy();
            expect(compiledElementScope.availabilityList.length).toBe(2);
            expect(compiledElementScope.availabilityList[1]).toEqual(availability2);
            expect(compiledElementScope.availability).toEqual({days: angular.copy(days)});
        });

        it('should not add availability if new duration is within existing duration)', function () {
            var availability1 = {
                startTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T11:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            var availability2 = {
                startTime: new Date("2015-10-01T09:45:00.000Z").toString(),
                endTime: new Date("2015-10-01T10:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            availability1.days[1].isSelected = true;
            availability2.days[1].isSelected = true;

            scope.availabilityList = [availability1];
            scope.availability = availability2;
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.availabilityList.length).toBe(1);
            compiledElementScope.add();
            expect(compiledElementScope.doesOverlap).toBeTruthy();
            expect(compiledElementScope.availabilityList.length).toBe(1);
        });

        it('should not add availability if duration equals existing duration )', function () {
            var availability1 = {
                startTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T11:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            var availability2 = {
                startTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T11:30:00.000Z").toString(),
                days: angular.copy(days)
            };

            availability1.days[1].isSelected = true;
            availability2.days[1].isSelected = true;
            scope.availabilityList = [availability1];
            scope.availability = availability2;
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.availabilityList.length).toBe(1);
            compiledElementScope.add();
            expect(compiledElementScope.doesOverlap).toBeTruthy();
            expect(compiledElementScope.availabilityList.length).toBe(1);
        });

        it('should add availability(duration matches but not days)', function () {
            var availability1 = {
                startTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T11:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            var availability2 = {
                startTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T11:30:00.000Z").toString(),
                days: angular.copy(days)
            };

            availability1.days[1].isSelected = true;
            availability2.days[3].isSelected = true;

            scope.availabilityList = [availability1];
            scope.availability = availability2;
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.availabilityList.length).toBe(1);
            compiledElementScope.add();
            expect(compiledElementScope.doesOverlap).toBeFalsy();
            expect(compiledElementScope.availabilityList.length).toBe(2);
            expect(compiledElementScope.availabilityList[1]).toEqual(availability2);
        });
    });

    it('should clear max appointments limit if it is invalid', function () {
        scope.availability = {maxAppointmentsLimit: -3};
        var element = createElement();
        var compiledElementScope = element.isolateScope();
        compiledElementScope.clearValueIfInvalid();
        expect(scope.availability.maxAppointmentsLimit).toEqual('');
    });

    it('should not clear max appointments limit if it is valid', function () {
        scope.availability = {maxAppointmentsLimit: 2};
        var element = createElement();
        var compiledElementScope = element.isolateScope();
        compiledElementScope.clearValueIfInvalid();
        expect(scope.availability.maxAppointmentsLimit).toBe(2);
    });

    it('should not delete availability if not confirmed', function () {
        var availability1 = {
            startTime: new Date().toString(),
            endTime: new Date().toString(),
            days: 2
        };
        scope.availabilityList = [availability1];
        confirmBox.and.callFake(function (config) {
            config.scope.cancel(function () {
            });
        });
        var element = createElement();
        var compiledElementScope = element.isolateScope();

        expect(compiledElementScope.availabilityList.length).toBe(1);
        expect(compiledElementScope.availabilityList[0]).toEqual(availability1);
        compiledElementScope.confirmDelete();
        expect(compiledElementScope.availabilityList.length).toBe(1);
        expect(compiledElementScope.availabilityList[0]).toEqual(availability1);
    });

    it('should delete availability from weeklyAvailability list if confirmed', function () {
        var availability1 = {
            startTime: new Date().toString(),
            endTime: new Date().toString(),
            days: angular.copy(days)
        };
        var availability2 = {
            startTime: new Date().toString(),
            endTime: new Date().toString(),
            days: angular.copy(days)
        };
        availability1.days[1].isSelected = true;
        availability2.days[1].isSelected = true;
        scope.availability = availability1;
        scope.availabilityList = [scope.availability, availability2];
        confirmBox.and.callFake(function (config) {
            config.scope.ok(function () {
            });
        });

        var element = createElement();
        var compiledElementScope = element.isolateScope();

        expect(compiledElementScope.availabilityList.length).toBe(2);
        expect(compiledElementScope.availabilityList[0]).toEqual(availability1);
        expect(compiledElementScope.availabilityList[1]).toEqual(availability2);
        compiledElementScope.confirmDelete();
        expect(compiledElementScope.availabilityList.length).toBe(1);
        expect(compiledElementScope.availabilityList[0]).toEqual(availability2);
    });

    it('should change state to edit and take backup availability on enableEdit', function () {
        scope.state = 2;
        scope.availability = {
            startTime: new Date().toString(),
            endTime: new Date().toString(),
            days: angular.copy(days)
        };
        scope.availability.days[1].isSelected = true;
        scope.availabilityList = [scope.availability];

        var element = createElement();
        var compiledElementScope = element.isolateScope();

        expect(compiledElementScope.state).toBe(2);
        compiledElementScope.enableEdit();
        expect(compiledElementScope.backUpAvailability).toBe(scope.availability);
        expect(compiledElementScope.availability).not.toBe(scope.availability);
        expect(compiledElementScope.availability).toEqual(scope.availability);
        expect(compiledElementScope.state).toBe(1);
    });

    it('should change state to readonly and restore availability on cancel', function () {
        scope.state = 1;
        scope.availability = {
            startTime: new Date().toString(),
            endTime: new Date().toString(),
            days: angular.copy(days)
        };
        scope.availability.days[1].isSelected = true;
        scope.availabilityList = [scope.availability];

        var element = createElement();
        var compiledElementScope = element.isolateScope();

        expect(compiledElementScope.state).toBe(1);
        compiledElementScope.cancel();
        expect(compiledElementScope.doesOverlap).toBeFalsy();
        expect(compiledElementScope.availability).toBe(compiledElementScope.backUpAvailability);
        expect(compiledElementScope.state).toBe(2);
    });

    describe('updateAvailability', function () {
        it('should update availability on weeklyAvailability list and set its state to read only', function () {
            var availability1 = {
                startTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T11:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            var availability2 = {
                startTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T11:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            availability1.days[3].isSelected = true;
            availability1.days[1].isSelected = true;
            scope.availability = availability1;
            scope.availabilityList = [availability1, availability2];
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.availabilityList.length).toBe(2);
            expect(compiledElementScope.availabilityList[0]).toEqual(availability1);
            expect(compiledElementScope.availabilityList[1]).toEqual(availability2);
            compiledElementScope.backUpAvailability = availability1;
            compiledElementScope.availability = {
                startTime: new Date("2015-10-01T04:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T08:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            compiledElementScope.availability.days[0].isSelected = true;
            compiledElementScope.availability.days[2].isSelected = true;
            compiledElementScope.update();
            expect(compiledElementScope.doesOverlap).toBeFalsy();
            expect(compiledElementScope.availabilityList.length).toBe(2);
            expect(compiledElementScope.availabilityList[0]).toEqual(compiledElementScope.availability);
            expect(compiledElementScope.availabilityList[1]).toEqual(availability2);
            expect(compiledElementScope.state).toBe(2);
        });

        it('should add availability even if it overlaps with availability in list at the same index', function () {
            var availability1 = {
                startTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T11:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            availability1.days[2].isSelected = true;
            scope.availability = availability1;
            scope.availabilityList = [availability1];
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.availabilityList.length).toBe(1);
            expect(compiledElementScope.availabilityList[0]).toEqual(availability1);
            compiledElementScope.backUpAvailability = availability1;
            compiledElementScope.availability = {
                startTime: new Date("2015-10-01T10:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T11:00:00.000Z").toString(),
                days: angular.copy(days)
            };
            compiledElementScope.availability.days[0].isSelected = true;
            compiledElementScope.availability.days[2].isSelected = true;
            compiledElementScope.update();
            expect(compiledElementScope.doesOverlap).toBeFalsy();
            expect(compiledElementScope.availabilityList.length).toBe(1);
            expect(compiledElementScope.availabilityList[0]).toEqual(compiledElementScope.availability);
            expect(compiledElementScope.state).toBe(2);
        });

        it('should not update availability if endTime is within existing duration)', function () {
            var availability1 = {
                startTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T11:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            var availability2 = {
                startTime: new Date("2015-10-01T08:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T10:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            availability1.days[2].isSelected = true;
            availability2.days[1].isSelected = true;
            scope.availability = availability1;
            scope.availabilityList = [availability1, availability2];
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.availabilityList.length).toBe(2);
            expect(compiledElementScope.availabilityList[0]).toEqual(availability1);
            expect(compiledElementScope.availabilityList[1]).toEqual(availability2);
            compiledElementScope.backUpAvailability = availability1;
            compiledElementScope.availability = {
                startTime: new Date("2015-10-01T07:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            compiledElementScope.availability.days[0].isSelected = true;
            compiledElementScope.availability.days[1].isSelected = true;
            compiledElementScope.update();
            expect(compiledElementScope.doesOverlap).toBeTruthy();
            expect(compiledElementScope.availabilityList.length).toBe(2);
            expect(compiledElementScope.state).not.toBe(2);
        });

        it('should add availability if endTime falls on existing duration startTime)', function () {
            var availability1 = {
                startTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T11:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            var availability2 = {
                startTime: new Date("2015-10-01T10:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T11:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            availability1.days[2].isSelected = true;
            availability2.days[1].isSelected = true;
            scope.availability = availability1;
            scope.availabilityList = [availability1, availability2];
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.availabilityList.length).toBe(2);
            expect(compiledElementScope.availabilityList[0]).toEqual(availability1);
            expect(compiledElementScope.availabilityList[1]).toEqual(availability2);
            compiledElementScope.backUpAvailability = availability2;
            compiledElementScope.availability = {
                startTime: new Date("2015-10-01T07:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            compiledElementScope.availability.days[2].isSelected = true;
            compiledElementScope.availability.days[1].isSelected = true;
            compiledElementScope.update();
            expect(compiledElementScope.doesOverlap).toBeFalsy();
            expect(compiledElementScope.availabilityList.length).toBe(2);
            expect(compiledElementScope.availabilityList[0]).toEqual(availability1);
            expect(compiledElementScope.availabilityList[1]).toEqual(compiledElementScope.availability);
            expect(compiledElementScope.state).toBe(2);
        });

        it('should not add availability if startTime is within existing duration', function () {
            var availability1 = {
                startTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T11:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            var availability2 = {
                startTime: new Date("2015-10-01T08:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T10:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            availability1.days[2].isSelected = true;
            availability2.days[1].isSelected = true;
            scope.availability = availability1;
            scope.availabilityList = [availability1, availability2];
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.availabilityList.length).toBe(2);
            expect(compiledElementScope.availabilityList[0]).toEqual(availability1);
            expect(compiledElementScope.availabilityList[1]).toEqual(availability2);
            compiledElementScope.backUpAvailability = availability1;
            compiledElementScope.availability = {
                startTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T11:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            compiledElementScope.availability.days[0].isSelected = true;
            compiledElementScope.availability.days[1].isSelected = true;
            compiledElementScope.update();
            expect(compiledElementScope.doesOverlap).toBeTruthy();
            expect(compiledElementScope.availabilityList.length).toBe(2);
            expect(compiledElementScope.state).not.toBe(2);
        });

        it('should add availability if startTime falls on existing duration endTime)', function () {
            var availability1 = {
                startTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T11:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            var availability2 = {
                startTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T11:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            availability1.days[2].isSelected = true;
            availability2.days[1].isSelected = true;
            scope.availability = availability1;
            scope.availabilityList = [availability1, availability2];
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.availabilityList.length).toBe(2);
            expect(compiledElementScope.availabilityList[0]).toEqual(availability1);
            expect(compiledElementScope.availabilityList[1]).toEqual(availability2);
            compiledElementScope.backUpAvailability = availability1;
            compiledElementScope.availability = {
                startTime: new Date("2015-10-01T11:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T12:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            compiledElementScope.availability.days[2].isSelected = true;
            compiledElementScope.availability.days[1].isSelected = true;
            compiledElementScope.update();
            expect(compiledElementScope.doesOverlap).toBeFalsy();
            expect(compiledElementScope.availabilityList.length).toBe(2);
            expect(compiledElementScope.availabilityList[0]).toEqual(compiledElementScope.availability);
            expect(compiledElementScope.availabilityList[1]).toEqual(availability2);
            expect(compiledElementScope.state).toBe(2);
        });

        it('should not add availability if duration is within existing duration)', function () {
            var availability1 = {
                startTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T11:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            var availability2 = {
                startTime: new Date("2015-10-01T08:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T12:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            availability1.days[2].isSelected = true;
            availability2.days[1].isSelected = true;
            scope.availability = availability1;
            scope.availabilityList = [availability1, availability2];
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.availabilityList.length).toBe(2);
            expect(compiledElementScope.availabilityList[0]).toEqual(availability1);
            expect(compiledElementScope.availabilityList[1]).toEqual(availability2);
            compiledElementScope.backUpAvailability = availability1;
            compiledElementScope.availability = {
                startTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T11:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            compiledElementScope.availability.days[2].isSelected = true;
            compiledElementScope.availability.days[1].isSelected = true;
            compiledElementScope.update();
            expect(compiledElementScope.doesOverlap).toBeTruthy();
            expect(compiledElementScope.availabilityList.length).toBe(2);
            expect(compiledElementScope.state).not.toBe(2);
        });

        it('should not add availability if duration equals existing duration )', function () {
            var availability1 = {
                startTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T11:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            var availability2 = {
                startTime: new Date("2015-10-01T07:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T10:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            availability1.days[2].isSelected = true;
            availability2.days[1].isSelected = true;
            scope.availability = availability1;
            scope.availabilityList = [availability1, availability2];
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.availabilityList.length).toBe(2);
            expect(compiledElementScope.availabilityList[0]).toEqual(availability1);
            expect(compiledElementScope.availabilityList[1]).toEqual(availability2);
            compiledElementScope.backUpAvailability = availability1;
            compiledElementScope.availability = {
                startTime: new Date("2015-10-01T08:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            compiledElementScope.availability.days[2].isSelected = true;
            compiledElementScope.availability.days[1].isSelected = true;
            compiledElementScope.update();
            expect(compiledElementScope.doesOverlap).toBeTruthy();
            expect(compiledElementScope.availabilityList.length).toBe(2);
            expect(compiledElementScope.state).not.toBe(2);
        });

        it('should add availability if duration matches but not days)', function () {
            var availability1 = {
                startTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T11:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            var availability2 = {
                startTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T11:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            availability1.days[2].isSelected = true;
            availability2.days[1].isSelected = true;
            scope.availability = availability1;
            scope.availabilityList = [availability1, availability2];
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.availabilityList.length).toBe(2);
            expect(compiledElementScope.availabilityList[0]).toEqual(availability1);
            expect(compiledElementScope.availabilityList[1]).toEqual(availability2);
            compiledElementScope.backUpAvailability = availability1;
            compiledElementScope.availability = {
                startTime: new Date("2015-10-01T09:30:00.000Z").toString(),
                endTime: new Date("2015-10-01T11:30:00.000Z").toString(),
                days: angular.copy(days)
            };
            compiledElementScope.availability.days[0].isSelected = true;
            compiledElementScope.availability.days[2].isSelected = true;
            compiledElementScope.update();
            expect(compiledElementScope.doesOverlap).toBeFalsy();
            expect(compiledElementScope.availabilityList.length).toBe(2);
            expect(compiledElementScope.availabilityList[0]).toEqual(compiledElementScope.availability);
            expect(compiledElementScope.availabilityList[1]).toEqual(availability2);
            expect(compiledElementScope.state).toBe(2);
        });
    });
});

