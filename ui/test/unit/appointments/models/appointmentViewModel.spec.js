'use strict';

describe('AppointmentViewModel', function () {
    var appointmentModel;
    var dateUtil = Bahmni.Common.Util.DateUtil;
    var timeFormat = 'HH:mm:ss';
    var startDateTime = new Date('1970-01-01T11:30:00.000Z');
    var endDateTime = new Date('1970-01-01T14:30:00.000Z');

    var appointmentResponse = {
        uuid: 'b2b23e00-fb5e-4400-8783-758aeaaf583c',
        appointmentNumber: '0000',
        patient: {
            identifier: 'GAN203008',
            name: 'test validation',
            uuid: 'a1cec3d9-aaab-4cbc-89c1-2e96bb202b9a'
        },
        service: {
            appointmentServiceId: 77,
            name: 'serviceHavingT',
            description: 'ajlskdfjaksd',
            speciality: {
                name: 'Cardiology',
                uuid: '664b48a1-7ce1-11e7-aaf1-080027e15975'
            },
            startTime: '08:30:00',
            endTime: '16:50:00',
            maxAppointmentsLimit: 34,
            durationMins: null,
            location: {
                name: 'Ganiyari',
                uuid: 'c1e42932-3f10-11e4-adec-0800271c1b75'
            },
            uuid: '6a8455a0-7080-4701-92bd-05bb1c903d85',
            color: '#DC143C',
            creatorName: null
        },
        serviceType: {
            duration: 30,
            name: 'type1',
            uuid: 'f5203cea-f4d2-4cd9-b7d2-b00f7e8890e9'
        },
        provider: {
            name: 'labsystem system',
            uuid: '7d162c29-3f12-11e4-adec-0800271c1b75'
        },
        location: {
            name: 'Ganiyari',
            uuid: 'c1e42932-3f10-11e4-adec-0800271c1b75'
        },
        startDateTime: 1502210400000,
        endDateTime: 1502212200000,
        appointmentKind: 'WalkIn',
        status: 'Scheduled',
        comments: null
    };

    beforeEach(function () {
        // appointmentModel = Bahmni.Appointments.AppointmentViewModel.create(appointmentResponse, {});
    });

    it('should get date & timings', function () {
        
    });
});
