describe("BedManagementService", function() {
    var bedLayouts = [
            {bedId: 1,
             bedNumber: "I1",
             bedType: {description: "This is the ICU bed type",
                       displayName: "ICU Bed",
                       id: 102,
                       name: "ICU Bed"},
             bedTagMaps: {uuid: "tagMapUuuid", bed: {id: 2}, bedTag: {id: 1, name: "lost"}},
             columnNumber: 1, 
             rowNumber: 1, 
             status: "OCCUPIED",
             patient: {uuid: "patientUuid"}
            },
            {bedId: 2,
             bedNumber: "I2",
             bedType: {description: "This is another bed type",
                       displayName: "ICU Bed",
                       id: 103,
                       name: "ICU Bed"},
             bedTagMaps: {uuid: "tagMapUuuid", bed: {id: 2}, bedTag: {id: 1, name: "lost"}},
             columnNumber: 2, 
             rowNumber: 2, 
             status: "AVAILABLE",
             patient: undefined
            }];

    beforeEach(module('bahmni.ipd'));

    beforeEach(inject(['bedManagementService', function (bedManagementServiceInjected) {
    	BedManagementService = bedManagementServiceInjected;
    }]));

	describe("createLayoutGrid", function(){
		it("should create grid layout", function(){
            var expectedBedLayout = [
                [
                    {
                        empty : false,
                        available : false,
                        bed : {
                            bedId: 1,
                            bedNumber: 'I1',
                            bedType: 'ICU Bed',
                            bedTagMaps: {uuid: "tagMapUuuid", bed: {id: 2}, bedTag: {id: 1, name: "lost"}},
                            status: 'OCCUPIED',
                            patient: {uuid: "patientUuid"}
                        }
                    },
                    {
                        empty : true,
                        available : false,
                        bed : {
                            bedId: false,
                            bedNumber: false,
                            bedType: false,
                            bedTagMaps: false,
                            status: false,
                            patient: false
                        }
                    }
                ],
                [
                    {
                        empty : true,
                        available : false,
                        bed : {
                            bedId: false,
                            bedNumber: false,
                            bedType: false,
                            bedTagMaps: false,
                            status: false,
                            patient: false
                        }
                    },
                    {
                        empty : false,
                        available : true,
                        bed : {
                            bedId: 2,
                            bedNumber: 'I2',
                            bedType: 'ICU Bed',
                            bedTagMaps: {uuid: "tagMapUuuid", bed: {id: 2}, bedTag: {id: 1, name: "lost"}},
                            status: 'AVAILABLE',
                            patient: undefined
                        }
                    }
                ]
            ];
            var actualLayout = BedManagementService.createLayoutGrid(bedLayouts);
            expect(actualLayout).toEqual(expectedBedLayout);
        });

		it("should initialise min max row column numbers before creating bedLayout", function(){
            var expectedBedLayout = [
                [
                    {
                        empty : false,
                        available : false,
                        bed : {
                            bedId: 1,
                            bedNumber: 'I1',
                            bedType: 'ICU Bed',
                            bedTagMaps: {uuid: "tagMapUuuid", bed: {id: 2}, bedTag: {id: 1, name: "lost"}},
                            status: 'OCCUPIED',
                            patient: {uuid: "patientUuid"}
                        }
                    },
                    {
                        empty : true,
                        available : false,
                        bed : {
                            bedId: false,
                            bedNumber: false,
                            bedType: false,
                            bedTagMaps: false,
                            status: false,
                            patient: false
                        }
                    }
                ],
                [
                    {
                        empty : true,
                        available : false,
                        bed : {
                            bedId: false,
                            bedNumber: false,
                            bedType: false,
                            bedTagMaps: false,
                            status: false,
                            patient: false
                        }
                    },
                    {
                        empty : false,
                        available : true,
                        bed : {
                            bedId: 2,
                            bedNumber: 'I2',
                            bedType: 'ICU Bed',
                            bedTagMaps: {uuid: "tagMapUuuid", bed: {id: 2}, bedTag: {id: 1, name: "lost"}},
                            status: 'AVAILABLE',
                            patient: undefined
                        }
                    }
                ]
            ];

            var otherBedLayouts = [
                {bedId: 1,
                    bedNumber: "I1",
                    bedType: {description: "This is the ICU bed type",
                        displayName: "ICU Bed",
                        id: 102,
                        name: "ICU Bed"},
                    bedTagMaps: {uuid: "tagMapUuuid", bed: {id: 2}, bedTag: {id: 1, name: "lost"}},
                    columnNumber: 1,
                    rowNumber: 1,
                    status: "OCCUPIED",
                    patient: {uuid: "patientUuid"}
                }];

            var otherExpectedBedLayout = [
                [
                    {
                        empty : false,
                        available : false,
                        bed : {
                            bedId: 1,
                            bedNumber: 'I1',
                            bedType: 'ICU Bed',
                            bedTagMaps: {uuid: "tagMapUuuid", bed: {id: 2}, bedTag: {id: 1, name: "lost"}},
                            status: 'OCCUPIED',
                            patient: {uuid: "patientUuid"}
                        }
                    }
                ]
            ];
            var actualLayout = BedManagementService.createLayoutGrid(bedLayouts);
            var otherActualLayout = BedManagementService.createLayoutGrid(otherBedLayouts);
            expect(actualLayout).toEqual(expectedBedLayout);
            expect(otherActualLayout).toEqual(otherExpectedBedLayout);
        });
    });
});
