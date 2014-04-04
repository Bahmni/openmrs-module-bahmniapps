describe("Observation Filter", function () {    
    describe("filter", function() {
      it("should remove new observations without value", function() {
        var buildObservation = Bahmni.Tests.observationMother.build;
        var observations = [buildObservation({value: null, uuid: null}), buildObservation({value: 10, uuid: null})];
        var observationFilter = new Bahmni.Common.Domain.ObservationFilter();

        var filteredObservations = observationFilter.filter(observations);
        
        expect(filteredObservations.length).toBe(1);
        expect(filteredObservations[0].value).toBe(10);
      });

      it("should void existing observations without value", function() {
        var buildObservation = Bahmni.Tests.observationMother.build;
        var observations = [buildObservation({value: null, uuid: '1111'}), buildObservation({value: 10, uuid: '2222'})];
        var observationFilter = new Bahmni.Common.Domain.ObservationFilter();

        var filteredObservations = observationFilter.filter(observations);
        
        expect(filteredObservations.length).toBe(2);
        expect(filteredObservations[0].voided).toBe(true);
        expect(filteredObservations[1].voided).toBe(false);
      });

      it("should remove new observations groups which has no valid members", function() {
        var buildObservation = Bahmni.Tests.observationMother.build;
        var observation1 = buildObservation({ uuid: null,
          groupMembers: [buildObservation({value: null, uuid: null})]
        });
        var observation2 = buildObservation({ uuid: null,
          groupMembers: [buildObservation({value: 10, uuid: null})]
        });
        var observations = [observation1, observation2];
        var observationFilter = new Bahmni.Common.Domain.ObservationFilter();

        var filteredObservations = observationFilter.filter(observations);
        
        expect(filteredObservations.length).toBe(1);
        expect(filteredObservations[0].groupMembers[0].value).toBe(10);
      });

      it("should void existing observations groups which has no valid members", function() {
        var buildObservation = Bahmni.Tests.observationMother.build;
        var observations = [buildObservation({ uuid: '1111',
          groupMembers: [buildObservation({value: null, uuid: '2222'})]
        })];
        var observationFilter = new Bahmni.Common.Domain.ObservationFilter();

        var filteredObservations = observationFilter.filter(observations);
        
        expect(filteredObservations.length).toBe(1);
        expect(filteredObservations[0].voided).toBe(true);
        expect(filteredObservations[0].groupMembers[0].voided).toBe(true);
      });

      it("should not void existing observations groups which has mamber with value", function() {
        var buildObservation = Bahmni.Tests.observationMother.build;
        var observations = [buildObservation({ uuid: '1111', value: null,
          groupMembers: [buildObservation({value: '10', uuid: '2222'})]
        })];
        var observationFilter = new Bahmni.Common.Domain.ObservationFilter();

        var filteredObservations = observationFilter.filter(observations);
        
        expect(filteredObservations.length).toBe(1);
        expect(filteredObservations[0].voided).toBe(false);
        expect(filteredObservations[0].groupMembers[0].voided).toBe(false);
      });

      it("should remove new member observations without value", function() {
        var buildObservation = Bahmni.Tests.observationMother.build;
        var observation = buildObservation({ uuid: null,
          groupMembers: [buildObservation({value: null, uuid: null}), buildObservation({value: 10, uuid: null})]
        });
        var observations = [observation];
        var observationFilter = new Bahmni.Common.Domain.ObservationFilter();

        var filteredObservations = observationFilter.filter(observations);
        
        expect(filteredObservations.length).toBe(1);
        expect(filteredObservations[0].groupMembers.length).toBe(1);
        expect(filteredObservations[0].groupMembers[0].value).toBe(10);
      });
    });
});