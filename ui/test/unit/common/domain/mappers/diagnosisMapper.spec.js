describe("Diagnosis Mapper", function () {
    var diagnosisStatus = [
        {
            label: "RULED OUT",
            concept: {
                name: "Ruled Out Diagnosis"
            }
        },
        {
            label:  "CURED",
            concept:{
                name: "Cured Diagnosis"
            }
        }
    ];

    it("should map simple diagnosis", function() {
        var mappedDiagnosis = new Bahmni.DiagnosisMapper().mapDiagnosis({});
        expect(mappedDiagnosis).toEqual(jasmine.any(Bahmni.Common.Domain.Diagnosis));
        expect(mappedDiagnosis.codedAnswer).toEqual({name: undefined, uuid: undefined});
    });

    it("should find the exact diagnosis status", function() {
        var mappedDiagnosis = new Bahmni.DiagnosisMapper(diagnosisStatus).mapDiagnosis({diagnosisStatusConcept: {name: "Ruled Out Diagnosis"}});
        expect(mappedDiagnosis.diagnosisStatus).toBe(diagnosisStatus[0]);//object equality
        expect(mappedDiagnosis.diagnosisStatus).toEqual({
            label: "RULED OUT",
            concept: {
                name: "Ruled Out Diagnosis"
            }
        });//content equality
    });

    it("should map first diagnosis", function() {
        var mappedDiagnosis = new Bahmni.DiagnosisMapper().mapDiagnosis({firstDiagnosis: {}});
        expect(mappedDiagnosis.firstDiagnosis).toEqual(jasmine.any(Bahmni.Common.Domain.Diagnosis));
    });

    it("should map saved diagnoses from current encounter", function() {
        var mappedDiagnosis = new Bahmni.DiagnosisMapper().mapDiagnosis({firstDiagnosis: {}});
        expect(mappedDiagnosis.firstDiagnosis).toEqual(jasmine.any(Bahmni.Common.Domain.Diagnosis));
    });

    it("should map simple diagnoses", function() {
        var mappedDiagnoses = new Bahmni.DiagnosisMapper().mapDiagnoses([{}, {}]);
        expect(mappedDiagnoses.length).toBe(2);
        expect(mappedDiagnoses[0]).toEqual(jasmine.any(Bahmni.Common.Domain.Diagnosis));
        expect(mappedDiagnoses[1]).toEqual(jasmine.any(Bahmni.Common.Domain.Diagnosis));
    });

    it("should map latest diagnosis", function() {
        var mappedDiagnosis = new Bahmni.DiagnosisMapper().mapDiagnosis({latestDiagnosis: {}});
        expect(mappedDiagnosis.latestDiagnosis).toEqual(jasmine.any(Bahmni.Common.Domain.Diagnosis));
    });

});