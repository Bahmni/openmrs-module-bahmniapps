'use strict';

describe('surgicalBlockHelper', function () {
    var surgicalBlockHelper, surgicalAppointmentHelper;

    beforeEach(function () {
        module('bahmni.ot');
        inject(['surgicalBlockHelper', function (helper, _surgicalAppointmentHelper_) {
            surgicalBlockHelper = helper;
            surgicalAppointmentHelper = _surgicalAppointmentHelper_;
        }]);
    });

    it('should give the block duration', function () {
        var surgicalAppointment = {patient: {display: "EG101322M - Albert Hassan", uuid: "2e8a575f-3f87-4abb-ace6-4c5d42e44254"}, surgicalAppointmentAttributes: {cleaningTime: {value: "15"}, "estTimeHours": {"value": "0"}, "estTimeMinutes": {"value": "0"}}};
        var surgicalBlock =  {id: 71, uuid: "cdcf3c4b-6149-4a69-8113-97f651fae024", provider: {person: {uuid: "8ead3402-20e0-11e7-9532-000c290433a8", display: "Hanna Janho"}}, startDatetime: "2017-08-18T03:30:00.000+0000", endDatetime: "2017-08-18T04:00:00.000+0000", surgicalAppointments: [surgicalAppointment]};

        var duration = surgicalBlockHelper.getAvailableBlockDuration(surgicalBlock);
        expect(duration).toBe(15);
    });

    it('should not consider postponed and cancelled appointments while calculating available block duration', function () {
        var scheduledAppointment = {
            sortweight: 0,
            status: "SCHEDULED",
            patient: {
                display: "EG101322M - Albert Hassan",
                uuid: "2e8a575f-3f87-4abb-ace6-4c5d42e44254"
            },
            surgicalAppointmentAttributes: {
                cleaningTime: {value: "30"},
                estTimeHours: {value: "1"},
                estTimeMinutes: {value: "0"}
            }
        };
        var postponedAppointment = {
            sortweight: 0,
            status: "POSTPONED",
            patient: {
                display: "EG101323M - Tom Cruise",
                uuid: "2e8a575f-3f87-4abb-ace6-4c5d42e44255"
            },
            surgicalAppointmentAttributes: {
                cleaningTime: {value: "15"},
                estTimeHours: {value: "0"},
                estTimeMinutes: {value: "0"}
            }
        };
        var cancelledAppointment = {
            sortweight: 1,
            status: "CANCELLED",
            patient: {
                display: "EG101324F - Angelina Jolie",
                uuid: "2e8a575f-3f87-4abb-ace6-4c5d42e44256"
            },
            surgicalAppointmentAttributes: {
                cleaningTime: {value: "15"},
                estTimeHours: {value: "0"},
                estTimeMinutes: {value: "45"}
            }
        };
        var surgicalBlock = {
            id: 71,
            uuid: "cdcf3c4b-6149-4a69-8113-97f651fae024",
            provider: {person: {uuid: "8ead3402-20e0-11e7-9532-000c290433a8", display: "Hanna Janho"}},
            startDatetime: "2017-08-18T03:30:00.000+0000",
            endDatetime: "2017-08-18T07:00:00.000+0000",
            surgicalAppointments: [scheduledAppointment, postponedAppointment, cancelledAppointment]
        };

        var duration = surgicalBlockHelper.getAvailableBlockDuration(surgicalBlock);
        expect(duration).toBe(120);
    })
});