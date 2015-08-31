describe("formConditions", function () {
    var obsUtil;

    beforeEach(function () {
        obsUtil = jasmine.createSpyObj('obsUtil', ['disable', 'flatten']);
    });

    it("Should not do anything if there is no condition function configured", function () {
        var e = {};
        Bahmni.ConceptSet.EventHandler(e, [], obsUtil);
        expect(obsUtil.disable).not.toHaveBeenCalled();
    });

    it("Should evaluate the condition function if configured", function () {
        var html = $("<div>" +
            "<div class='concept-set-group' data-concept-name='root-concept1'>" +
                "<input id='targetElement' data-concept-name='concept1' value='value1'/>" +
                "<input data-concept-name='concept2'/>" +
                "<input data-concept-name='concept3'/>" +
            "</div>" +
        "</div>");
        var e = {target: html.find('#targetElement')};
        var observations = [{concept: {name: 'root-concept1'}}];
        var formValues = {'concept1': 'value1', 'concept2': 'value2'};
        obsUtil.flatten.and.returnValue(formValues);
        Bahmni.ConceptSet.FormConditions = {
            'concept1': function(elementValue, flattenedObservations) {
                expect(flattenedObservations).toEqual(formValues);
                expect(elementValue).toEqual('value1');
                return {
                    'disable': ['concept2'],
                    'enable' : ['concept1']
                }
            }
        };

        Bahmni.ConceptSet.EventHandler(e, observations, obsUtil);

        expect(obsUtil.flatten).toHaveBeenCalledWith(observations[0]);
        expect(obsUtil.disable).toHaveBeenCalledWith(jasmine.any(Object), 'concept2', true);
        expect(obsUtil.disable).toHaveBeenCalledWith(jasmine.any(Object), 'concept1', false);
    });
});