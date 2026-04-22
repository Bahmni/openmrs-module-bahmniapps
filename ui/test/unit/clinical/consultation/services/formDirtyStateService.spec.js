'use strict';

describe('formDirtyStateService', function () {
    var formDirtyStateService;

    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function (_formDirtyStateService_) {
        formDirtyStateService = _formDirtyStateService_;
    }));

    describe('collectObsValues', function () {
        it('should collect scalar observation values', function () {
            var values = [];
            var obs = {value: 'test-value'};
            formDirtyStateService.collectObsValues(obs, values);
            expect(values).toEqual(['test-value']);
        });

        it('should not collect null or undefined values', function () {
            var values = [];
            formDirtyStateService.collectObsValues({value: null}, values);
            formDirtyStateService.collectObsValues({value: undefined}, values);
            expect(values).toEqual([]);
        });

        it('should collect multiSelect observation values', function () {
            var values = [];
            var obs = {
                isMultiSelect: true,
                selectedObs: {option1: true, option2: false}
            };
            formDirtyStateService.collectObsValues(obs, values);
            expect(values.length).toBe(1);
            expect(values[0]).toEqual({option1: true, option2: false});
        });

        it('should ignore Angular $ prefixed keys in multiSelect', function () {
            var values = [];
            var obs = {
                isMultiSelect: true,
                selectedObs: {option1: true, $special: 'ignore'}
            };
            formDirtyStateService.collectObsValues(obs, values);
            expect(values.length).toBe(1);
            expect(values[0]).toEqual({option1: true, $special: 'ignore'});
        });

        it('should not collect multiSelect with no selected keys', function () {
            var values = [];
            var obs = {
                isMultiSelect: true,
                selectedObs: {}
            };
            formDirtyStateService.collectObsValues(obs, values);
            expect(values).toEqual([]);
        });

        it('should recursively collect group member values', function () {
            var values = [];
            var obs = {
                groupMembers: [
                    {value: 'member1-value'},
                    {value: 'member2-value'}
                ]
            };
            formDirtyStateService.collectObsValues(obs, values);
            expect(values).toEqual(['member1-value', 'member2-value']);
        });

        it('should handle null input gracefully', function () {
            var values = [];
            formDirtyStateService.collectObsValues(null, values);
            expect(values).toEqual([]);
        });
    });

    describe('getTemplateObservationsForDirtyTracking', function () {
        it('should return template observations when no component exists', function () {
            var template = {
                observations: [{value: 'obs1'}, {value: 'obs2'}]
            };
            var result = formDirtyStateService.getTemplateObservationsForDirtyTracking(template);
            expect(result).toEqual([{value: 'obs1'}, {value: 'obs2'}]);
        });

        it('should return empty array when no observations', function () {
            var template = {};
            var result = formDirtyStateService.getTemplateObservationsForDirtyTracking(template);
            expect(result).toEqual([]);
        });

        it('should call component.getValue for Form2/React components', function () {
            var mockComponent = {
                getValue: jasmine.createSpy('getValue').and.returnValue({
                    observations: [{value: 'form2-obs'}]
                })
            };
            var template = {
                component: mockComponent,
                observations: [{value: 'fallback'}]
            };
            var result = formDirtyStateService.getTemplateObservationsForDirtyTracking(template);
            expect(mockComponent.getValue).toHaveBeenCalled();
            expect(result).toEqual([{value: 'form2-obs'}]);
        });

        it('should fallback to template observations when component returns no observations', function () {
            var mockComponent = {
                getValue: jasmine.createSpy('getValue').and.returnValue({})
            };
            var template = {
                component: mockComponent,
                observations: [{value: 'fallback'}]
            };
            var result = formDirtyStateService.getTemplateObservationsForDirtyTracking(template);
            expect(result).toEqual([{value: 'fallback'}]);
        });
    });

    describe('getObsValues', function () {
        it('should return JSON string of all observation values', function () {
            var templates = [
                {
                    observations: [{value: 'obs1'}, {value: 'obs2'}]
                },
                {
                    observations: [{value: 'obs3'}]
                }
            ];
            var result = formDirtyStateService.getObsValues(templates);
            var parsed = JSON.parse(result);
            expect(parsed).toEqual(['obs1', 'obs2', 'obs3']);
        });

        it('should return empty JSON array when no templates', function () {
            var result = formDirtyStateService.getObsValues(null);
            expect(result).toBe('[]');
        });

        it('should handle templates with no observations', function () {
            var templates = [{observations: []}];
            var result = formDirtyStateService.getObsValues(templates);
            expect(result).toBe('[]');
        });

        it('should collect values from multiple group members', function () {
            var templates = [
                {
                    observations: [{
                        groupMembers: [
                            {value: 'member1'},
                            {value: 'member2'}
                        ]
                    }]
                }
            ];
            var result = formDirtyStateService.getObsValues(templates);
            var parsed = JSON.parse(result);
            expect(parsed).toEqual(['member1', 'member2']);
        });
    });

    describe('syncForm2Observations', function () {
        it('should sync Form2 component observations to form.observations', function () {
            var mockComponent = {
                getValue: jasmine.createSpy('getValue').and.returnValue({
                    observations: [{value: 'new-obs'}]
                })
            };
            var form = {
                component: mockComponent,
                observations: [{value: 'old-obs'}]
            };
            var forms = [form];

            formDirtyStateService.syncForm2Observations(forms);

            expect(form.observations).toEqual([{value: 'new-obs'}]);
        });

        it('should not update if observations are unchanged', function () {
            var obs = {value: 'same'};
            var mockComponent = {
                getValue: jasmine.createSpy('getValue').and.returnValue({
                    observations: [obs]
                })
            };
            var form = {
                component: mockComponent,
                observations: [obs]
            };
            var forms = [form];

            formDirtyStateService.syncForm2Observations(forms);

            expect(form.observations).toEqual([obs]);
        });

        it('should handle null observations gracefully', function () {
            var forms = [
                {
                    component: {
                        getValue: jasmine.createSpy('getValue').and.returnValue(null)
                    }
                }
            ];
            expect(function () {
                formDirtyStateService.syncForm2Observations(forms);
            }).not.toThrow();
        });

        it('should skip forms without getValue function', function () {
            var form = {
                component: {notGetValue: true},
                observations: [{value: 'original'}]
            };
            var forms = [form];

            formDirtyStateService.syncForm2Observations(forms);

            expect(form.observations).toEqual([{value: 'original'}]);
        });
    });

    describe('registerForm2SyncListeners', function () {
        var callbackSpy;

        beforeEach(function () {
            callbackSpy = jasmine.createSpy('onSyncCallback');
        });

        it('should return state object with registered flag set to true', function () {
            var state = formDirtyStateService.registerForm2SyncListeners(callbackSpy);

            expect(state.registered).toBe(true);
            expect(state.listener).toBeDefined();
            expect(state.events).toEqual(['input', 'change', 'keyup', 'click']);
        });

        it('should return listener function that invokes callback', function () {
            var state = formDirtyStateService.registerForm2SyncListeners(callbackSpy);

            expect(state.listener).toBeDefined();
            state.listener();

            expect(callbackSpy).toHaveBeenCalled();
        });

        it('should handle multiple callback executions', function () {
            var state = formDirtyStateService.registerForm2SyncListeners(callbackSpy);
            state.listener();
            state.listener();

            expect(callbackSpy.calls.count()).toBe(2);
        });
    });

    describe('unregisterForm2SyncListeners', function () {
        it('should handle null listener state gracefully', function () {
            expect(function () {
                formDirtyStateService.unregisterForm2SyncListeners(null);
            }).not.toThrow();
        });

        it('should handle unregistered listener state', function () {
            var listenerState = {
                registered: false,
                listener: jasmine.createSpy('listener'),
                events: []
            };

            expect(function () {
                formDirtyStateService.unregisterForm2SyncListeners(listenerState);
            }).not.toThrow();
        });

        it('should handle listener state without events array', function () {
            var listenerState = {
                registered: true,
                listener: jasmine.createSpy('listener')
            };

            expect(function () {
                formDirtyStateService.unregisterForm2SyncListeners(listenerState);
            }).not.toThrow();
        });

        it('should accept valid listener state for deregistration', function () {
            var mockListener = jasmine.createSpy('mockListener');
            var listenerState = {
                listener: mockListener,
                registered: true,
                events: ['input', 'change', 'keyup', 'click']
            };

            expect(function () {
                formDirtyStateService.unregisterForm2SyncListeners(listenerState);
            }).not.toThrow();
        });
    });

    describe('serializeFormData', function () {
        it('should serialize observations to JSON string', function () {
            var templates = [
                {
                    observations: [{uuid: 'obs1', value: 'val1'}]
                },
                {
                    observations: [{uuid: 'obs2', value: 'val2'}]
                }
            ];
            var result = formDirtyStateService.serializeFormData(templates);
            var parsed = JSON.parse(result);
            expect(parsed.length).toBe(2);
            expect(parsed[0].uuid).toBe('obs1');
            expect(parsed[1].uuid).toBe('obs2');
        });

        it('should return empty array when no templates', function () {
            var result = formDirtyStateService.serializeFormData(null);
            expect(result).toBe('[]');
        });

        it('should handle templates with no observations', function () {
            var templates = [{observations: []}];
            var result = formDirtyStateService.serializeFormData(templates);
            expect(result).toBe('[]');
        });

        it('should concatenate observations from multiple templates', function () {
            var templates = [
                {observations: [{value: 1}, {value: 2}]},
                {observations: [{value: 3}]}
            ];
            var result = formDirtyStateService.serializeFormData(templates);
            var parsed = JSON.parse(result);
            expect(parsed.length).toBe(3);
        });
    });

    describe('populateObservationValues', function () {
        it('should copy scalar observation value from draft to template', function () {
            var templateObs = {value: 'old'};
            var draftObs = {value: 'new'};

            formDirtyStateService.populateObservationValues(templateObs, draftObs);

            expect(templateObs.value).toBe('new');
        });

        it('should copy comment from draft to template', function () {
            var templateObs = {comment: 'old'};
            var draftObs = {comment: 'new'};

            formDirtyStateService.populateObservationValues(templateObs, draftObs);

            expect(templateObs.comment).toBe('new');
        });

        it('should copy multiSelect selectedObs from draft to template', function () {
            var templateObs = {isMultiSelect: true, selectedObs: {old: true}};
            var draftObs = {isMultiSelect: true, selectedObs: {new: true}};

            formDirtyStateService.populateObservationValues(templateObs, draftObs);

            expect(templateObs.selectedObs).toEqual({new: true});
        });

        it('should recursively populate group members', function () {
            var templateObs = {
                groupMembers: [
                    {concept: {uuid: 'uuid1'}, value: 'old1'},
                    {concept: {uuid: 'uuid2'}, value: 'old2'}
                ]
            };
            var draftObs = {
                groupMembers: [
                    {concept: {uuid: 'uuid1'}, value: 'new1'},
                    {concept: {uuid: 'uuid2'}, value: 'new2'}
                ]
            };

            formDirtyStateService.populateObservationValues(templateObs, draftObs);

            expect(templateObs.groupMembers[0].value).toBe('new1');
            expect(templateObs.groupMembers[1].value).toBe('new2');
        });

        it('should handle null observations gracefully', function () {
            expect(function () {
                formDirtyStateService.populateObservationValues(null, null);
                formDirtyStateService.populateObservationValues({value: 'test'}, null);
                formDirtyStateService.populateObservationValues(null, {value: 'test'});
            }).not.toThrow();
        });
    });

    describe('populateFormWithDraftData', function () {
        it('should parse and merge draft data onto templates', function () {
            var templates = [
                {
                    observations: [
                        {concept: {uuid: 'obs1-uuid'}, value: 'original1'}
                    ]
                }
            ];
            var draftData = JSON.stringify([
                {concept: {uuid: 'obs1-uuid'}, value: 'draft1', comment: 'test'}
            ]);

            var result = formDirtyStateService.populateFormWithDraftData(draftData, templates);

            expect(result.success).toBe(true);
            expect(templates[0].observations[0].value).toBe('draft1');
            expect(templates[0].observations[0].comment).toBe('test');
        });

        it('should return success: false for invalid JSON', function () {
            var templates = [{observations: []}];
            var invalidJson = '{invalid json}';

            var result = formDirtyStateService.populateFormWithDraftData(invalidJson, templates);

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it('should return success: false for missing data', function () {
            var result = formDirtyStateService.populateFormWithDraftData(null, null);
            expect(result.success).toBe(false);
        });

        it('should match draft obs by concept uuid', function () {
            var templates = [
                {
                    observations: [
                        {concept: {uuid: 'uuid-1'}, value: 'old'},
                        {concept: {uuid: 'uuid-2'}, value: 'old'}
                    ]
                }
            ];
            var draftData = JSON.stringify([
                {concept: {uuid: 'uuid-1'}, value: 'new1'},
                {concept: {uuid: 'uuid-2'}, value: 'new2'}
            ]);

            var result = formDirtyStateService.populateFormWithDraftData(draftData, templates);

            expect(result.success).toBe(true);
            expect(templates[0].observations[0].value).toBe('new1');
            expect(templates[0].observations[1].value).toBe('new2');
        });

        it('should handle empty draft data gracefully', function () {
            var templates = [{observations: [{value: 'original'}]}];
            var draftData = JSON.stringify([]);

            var result = formDirtyStateService.populateFormWithDraftData(draftData, templates);

            expect(result.success).toBe(true);
            expect(templates[0].observations[0].value).toBe('original');
        });

        it('should recursively populate group members in draft', function () {
            var templates = [
                {
                    observations: [
                        {
                            concept: {uuid: 'parent-uuid'},
                            groupMembers: [
                                {concept: {uuid: 'child-uuid'}, value: 'old'}
                            ]
                        }
                    ]
                }
            ];
            var draftData = JSON.stringify([
                {
                    concept: {uuid: 'parent-uuid'},
                    groupMembers: [
                        {concept: {uuid: 'child-uuid'}, value: 'new'}
                    ]
                }
            ]);

            var result = formDirtyStateService.populateFormWithDraftData(draftData, templates);

            expect(result.success).toBe(true);
            expect(templates[0].observations[0].groupMembers[0].value).toBe('new');
        });
    });
});
