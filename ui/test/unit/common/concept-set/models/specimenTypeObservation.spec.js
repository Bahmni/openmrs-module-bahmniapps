'use strict';

describe("Specimen Type Observation", function() {
    var allSamples=[];
    var blood,urine;
    var specimen,specimenTypeObs;

    function init()
    {
        blood = {uuid: "23c1ac3f-9aa9-4261-b434-622dab8fe2bd", name: "Blood Sample", shortName: "Blood" ,displayString:"Blood"};
        allSamples.push(blood);
        urine = {uuid: "23c1ac3f-9aa9-4261-b434-622dab8fe2bae", name: "Sputum Sample", shortName: "sputum" ,displayString:"sputum"};
        allSamples.push(urine);
        specimen = new Bahmni.Clinical.Specimen(null,allSamples);
        specimenTypeObs = specimen.typeObservation;
    }
    it("toggleSelection should toggle selection a value", function() {
         init();
        specimenTypeObs.toggleSelection(blood);
        expect(specimen.type).toBe(blood);

    });

    it("toggleSelection should set null value if toggled twice", function() {
        init();
        specimenTypeObs.toggleSelection(blood);
        specimenTypeObs.toggleSelection(blood);
        expect(specimen.type).toBeNull();
    });

 });
