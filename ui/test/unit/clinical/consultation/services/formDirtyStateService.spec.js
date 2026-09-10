'use strict';

describe('formDirtyStateService', function () {
    var formDirtyStateService;

    beforeEach(function () {
        module('bahmni.clinical');
        inject(function (_formDirtyStateService_) {
            formDirtyStateService = _formDirtyStateService_;
        });
    });

    describe('observation value normalization (via collectObsValues)', function () {
        it('should handle null and undefined values gracefully', function () {
            var values1 = [];
            var values2 = [];
            formDirtyStateService.collectObsValues(null, values1);
            formDirtyStateService.collectObsValues(undefined, values2);
            expect(values1).toEqual([]);
            expect(values2).toEqual([]);
        });

        it('should extract uuid from objects with uuid property', function () {
            var obs = {value: {uuid: 'concept-uuid-123', name: 'Some Concept'}};
            var values = [];
            formDirtyStateService.collectObsValues(obs, values);
            expect(values).toContain('concept-uuid-123');
        });

        it('should normalize numeric values to strings', function () {
            var obs = {value: 123};
            var values = [];
            formDirtyStateService.collectObsValues(obs, values);
            expect(values).toContain('123');
        });

        it('should handle string values', function () {
            var obs = {value: '456'};
            var values = [];
            formDirtyStateService.collectObsValues(obs, values);
            expect(values).toContain('456');
        });

        it('should extract value property from wrapped objects', function () {
            var obs = {value: {value: 'wrapped-value'}};
            var values = [];
            formDirtyStateService.collectObsValues(obs, values);
            expect(values).toContain('wrapped-value');
        });

        it('should handle objects without special properties', function () {
            var obs = {value: {foo: 'bar', baz: 'qux'}};
            var values = [];
            formDirtyStateService.collectObsValues(obs, values);
            expect(values.length).toBe(1);
        });
    });

    describe('collectObsValues with provider fields', function () {
        it('should collect values for raw provider IDs', function () {
            var obs = {value: '123'};
            var values = [];
            formDirtyStateService.collectObsValues(obs, values);
            expect(values).toEqual(['123']);
        });

        it('should collect values for provider objects with uuid', function () {
            var obs = {value: {id: 123, name: 'Dr. Smith', uuid: 'provider-uuid'}};
            var values = [];
            formDirtyStateService.collectObsValues(obs, values);
            expect(values).toEqual(['provider-uuid']);
        });

        it('should handle null observation', function () {
            var values = [];
            formDirtyStateService.collectObsValues(null, values);
            expect(values).toEqual([]);
        });

        it('should push null for voided observation with a value (so removal is detectable as dirty)', function () {
            var values = [];
            var obs = {value: 'image-url', voided: true};
            formDirtyStateService.collectObsValues(obs, values);
            expect(values).toEqual([null]);
        });

        it('should collect value when observation is not voided', function () {
            var values = [];
            var obs = {value: 'image-url', voided: false};
            formDirtyStateService.collectObsValues(obs, values);
            expect(values).toEqual(['image-url']);
        });

        it('should detect dirty state when image is removed (voided) — upload then void on fresh form', function () {
            var templates = [{observations: [{value: 'image-url', voided: undefined}]}];
            var cleanState = formDirtyStateService.getObsValues(templates);  // '["image-url"]'

            templates[0].observations[0].voided = true;
            var afterVoidState = formDirtyStateService.getObsValues(templates);  // '[null]'

            expect(afterVoidState).not.toEqual(cleanState);
        });

        it('should detect dirty state when image removed after save-as-draft (cleanState has url)', function () {
            var templates = [{observations: [{value: 'image-url', voided: false}]}];
            var cleanState = formDirtyStateService.getObsValues(templates);  // '["image-url"]'

            templates[0].observations[0].voided = true;
            var afterVoidState = formDirtyStateService.getObsValues(templates);  // '[null]'

            expect(afterVoidState).not.toEqual(cleanState);
        });

        it('should restore clean state when image void is undone', function () {
            var templates = [{observations: [{value: 'image-url', voided: false}]}];
            var cleanState = formDirtyStateService.getObsValues(templates);

            templates[0].observations[0].voided = true;
            templates[0].observations[0].voided = false;
            var afterUndoState = formDirtyStateService.getObsValues(templates);

            expect(afterUndoState).toEqual(cleanState);
        });

        it('should handle undefined observation', function () {
            var values = [];
            formDirtyStateService.collectObsValues(undefined, values);
            expect(values).toEqual([]);
        });

        it('should handle multiSelect observations', function () {
            var obs = {
                isMultiSelect: true,
                selectedObs: {
                    'uuid-1': {uuid: 'uuid-1'},
                    'uuid-2': {uuid: 'uuid-2'}
                }
            };
            var values = [];
            formDirtyStateService.collectObsValues(obs, values);
            expect(values.length).toBe(1);
            expect(values[0]).toContain('uuid-1');
            expect(values[0]).toContain('uuid-2');
        });

        it('should recursively handle group members', function () {
            var obs = {
                groupMembers: [
                    {value: '123'},
                    {value: {name: 'Provider', uuid: 'member-uuid'}}
                ]
            };
            var values = [];
            formDirtyStateService.collectObsValues(obs, values);
            expect(values).toContain('123');
            expect(values).toContain('member-uuid');
        });

        it('should handle null and undefined values within observation', function () {
            var obs1 = {value: null};
            var obs2 = {value: undefined};
            var obs3 = {};

            var values1 = [];
            var values2 = [];
            var values3 = [];

            formDirtyStateService.collectObsValues(obs1, values1);
            formDirtyStateService.collectObsValues(obs2, values2);
            formDirtyStateService.collectObsValues(obs3, values3);

            expect(values1).toEqual([]);
            expect(values2).toEqual([]);
            expect(values3).toEqual([]);
        });
    });

    describe('getObsValues for templates', function () {
        it('should serialize template observations to JSON', function () {
            var template = {
                observations: [{
                    value: '123'
                }]
            };

            var result = formDirtyStateService.getObsValuesForTemplate(template);
            expect(result).toContain('123');
        });

        it('should handle templates without observations', function () {
            var template = {};
            var result = formDirtyStateService.getObsValuesForTemplate(template);
            expect(result).toBe(angular.toJson([]));
        });

        it('should handle empty observations array', function () {
            var template = {observations: []};
            var result = formDirtyStateService.getObsValuesForTemplate(template);
            expect(result).toBe(angular.toJson([]));
        });

        it('should extract uuid from objects with uuid property', function () {
            var template = {
                observations: [{
                    value: {uuid: 'concept-uuid', name: 'Test Concept'}
                }]
            };

            var result = formDirtyStateService.getObsValuesForTemplate(template);
            expect(result).toContain('concept-uuid');
        });
    });

    describe('getObsValues for multiple templates', function () {
        it('should collect observations from all templates', function () {
            var templates = [
                {observations: [{value: '123'}]},
                {observations: [{value: '456'}]}
            ];

            var result = formDirtyStateService.getObsValues(templates);
            expect(result).toContain('123');
            expect(result).toContain('456');
        });

        it('should return sorted values for consistent comparison', function () {
            var template1 = {
                observations: [
                    {value: '111'},
                    {value: {uuid: 'uuid-222'}}
                ]
            };

            var template2 = {
                observations: [
                    {value: {uuid: 'uuid-111'}},
                    {value: '222'}
                ]
            };

            var result1 = formDirtyStateService.getObsValues([template1]);
            var result2 = formDirtyStateService.getObsValues([template2]);

            var parsed1 = JSON.parse(result1);
            var parsed2 = JSON.parse(result2);

            expect(parsed1).toContain('111');
            expect(parsed1).toContain('uuid-222');
            expect(parsed2).toContain('uuid-111');
            expect(parsed2).toContain('222');
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

        it('should return listener function that invokes callback', inject(function ($timeout) {
            var state = formDirtyStateService.registerForm2SyncListeners(callbackSpy);

            expect(state.listener).toBeDefined();
            state.listener();
            $timeout.flush();

            expect(callbackSpy).toHaveBeenCalled();
        }));

        it('should coalesce rapid interactions into one callback', inject(function ($timeout) {
            var state = formDirtyStateService.registerForm2SyncListeners(callbackSpy);
            state.listener();
            state.listener();
            $timeout.flush();

            expect(callbackSpy.calls.count()).toBe(1);
        }));

        it('should invoke the callback again for a later, separate interaction', inject(function ($timeout) {
            var state = formDirtyStateService.registerForm2SyncListeners(callbackSpy);
            state.listener();
            $timeout.flush();
            state.listener();
            $timeout.flush();

            expect(callbackSpy.calls.count()).toBe(2);
        }));
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

        it('should return updatedTemplates with templates that received draft data', function () {
            var template1 = {observations: [{concept: {uuid: 'uuid-1'}, value: 'old'}]};
            var template2 = {observations: [{concept: {uuid: 'uuid-2'}, value: 'old'}]};
            var templates = [template1, template2];
            var draftData = JSON.stringify([{concept: {uuid: 'uuid-1'}, value: 'new'}]);

            var result = formDirtyStateService.populateFormWithDraftData(draftData, templates);

            expect(result.success).toBe(true);
            expect(result.updatedTemplates.length).toBe(1);
            expect(result.updatedTemplates[0]).toBe(template1);
        });

        it('should return empty updatedTemplates when no obs matched draft data', function () {
            var templates = [{observations: [{concept: {uuid: 'uuid-X'}, value: 'old'}]}];
            var draftData = JSON.stringify([{concept: {uuid: 'uuid-not-found'}, value: 'new'}]);

            var result = formDirtyStateService.populateFormWithDraftData(draftData, templates);

            expect(result.success).toBe(true);
            expect(result.updatedTemplates.length).toBe(0);
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

    describe('getObsValuesForTemplate - shorter value detection', function () {
        it('should detect value changes even when the new serialized value is shorter', function () {
            var template = {
                observations: [
                    {concept: {name: 'Height'}, value: 100}
                ]
            };

            var cleanState = formDirtyStateService.getObsValuesForTemplate(template);

            template.observations[0].value = 5;
            var currentVal = formDirtyStateService.getObsValuesForTemplate(template);

            expect(currentVal).not.toEqual(cleanState);
            expect(currentVal.length).toBeLessThan(cleanState.length);
        });

        it('should detect value changes when the new serialized value is longer', function () {
            var template = {
                observations: [
                    {concept: {name: 'Height'}, value: 5}
                ]
            };

            var cleanState = formDirtyStateService.getObsValuesForTemplate(template);

            template.observations[0].value = 100;
            var currentVal = formDirtyStateService.getObsValuesForTemplate(template);

            expect(currentVal).not.toEqual(cleanState);
            expect(currentVal.length).toBeGreaterThan(cleanState.length);
        });

        it('should detect multi-select value changes', function () {
            var template = {
                observations: [
                    {
                        isMultiSelect: true,
                        selectedObs: {
                            'Fever': {uuid: 'obs-1', value: {name: 'Fever'}}
                        }
                    }
                ]
            };

            var cleanState = formDirtyStateService.getObsValuesForTemplate(template);

            template.observations[0].selectedObs = {
                'Fever': {uuid: 'obs-1', value: {name: 'Fever'}},
                'Cough': {uuid: 'obs-2', value: {name: 'Cough'}}
            };
            var currentVal = formDirtyStateService.getObsValuesForTemplate(template);

            expect(currentVal).not.toEqual(cleanState);
        });
    });

    describe('form2 dirty tracking integration', function () {
        it('should detect dirty after syncForm2Observations populates observations into an empty template', function () {
            var template = {observations: [], component: {getValue: function () {}}};
            var cleanState = formDirtyStateService.getObsValuesForTemplate(template);

            var mockComponent = {
                getValue: jasmine.createSpy('getValue').and.returnValue({
                    observations: [{value: 'user-selection'}]
                })
            };
            template.component = mockComponent;

            formDirtyStateService.syncForm2Observations([template]);

            var currentVal = formDirtyStateService.getObsValuesForTemplate(template);
            expect(currentVal).not.toEqual(cleanState);
        });

        it('should detect dirty when form2 component changes after initial sync', function () {
            var template = {
                observations: [{value: 'first-selection'}],
                component: {getValue: function () {return {observations: [{value: 'first-selection'}]};}}
            };
            var cleanState = formDirtyStateService.getObsValuesForTemplate(template);

            template.component = {
                getValue: jasmine.createSpy('getValue').and.returnValue({
                    observations: [{value: 'second-selection'}]
                })
            };
            formDirtyStateService.syncForm2Observations([template]);

            var currentVal = formDirtyStateService.getObsValuesForTemplate(template);
            expect(currentVal).not.toEqual(cleanState);
        });

        it('should detect dirty via getObsValues when a form2 template in a multi-template array changes', function () {
            var regularTemplate = {observations: [{value: 'regular-obs'}]};
            var form2Template = {observations: [], component: null};
            var templates = [regularTemplate, form2Template];

            var baseline = formDirtyStateService.getObsValues(templates);

            form2Template.component = {
                getValue: jasmine.createSpy('getValue').and.returnValue({
                    observations: [{value: 'form2-value'}]
                })
            };
            formDirtyStateService.syncForm2Observations([form2Template]);

            var afterSync = formDirtyStateService.getObsValues(templates);
            expect(afterSync).not.toEqual(baseline);
        });
    });

    describe('isRealTemplateChange', function () {
        var emptyBaseline = angular.toJson([]);

        afterEach(function () {
            formDirtyStateService.resetForm2Interaction();
        });

        it('should report no change when the value is identical', function () {
            expect(formDirtyStateService.isRealTemplateChange({}, '["a"]', '["a"]')).toBe(false);
        });

        it('should report a real change for a plain template', function () {
            expect(formDirtyStateService.isRealTemplateChange({}, '["100"]', '["5"]')).toBe(true);
        });

        it('should report a real change when the new value serializes shorter', function () {
            expect(formDirtyStateService.isRealTemplateChange({}, '["100"]', '["5"]')).toBe(true);
        });

        it('should ignore a Form2 template filling in from an empty baseline before any interaction', function () {
            var template = {component: {getValue: function () {}}};
            expect(formDirtyStateService.isRealTemplateChange(template, emptyBaseline, '["hydrated"]')).toBe(false);
        });

        it('should report a real change for a Form2 template once the user has interacted', function () {
            var template = {component: {getValue: function () {}}};
            var listenerState = formDirtyStateService.registerForm2SyncListeners(function () {});
            listenerState.listener();

            expect(formDirtyStateService.hasForm2Interaction()).toBe(true);
            expect(formDirtyStateService.isRealTemplateChange(template, emptyBaseline, '["typed"]')).toBe(true);

            formDirtyStateService.unregisterForm2SyncListeners(listenerState);
        });

        it('should report a real change for a Form2 template whose baseline was not empty', function () {
            var template = {component: {getValue: function () {}}};
            expect(formDirtyStateService.isRealTemplateChange(template, '["old"]', '["new"]')).toBe(true);
        });

        it('should forget interaction once a new baseline is captured', function () {
            var listenerState = formDirtyStateService.registerForm2SyncListeners(function () {});
            listenerState.listener();
            expect(formDirtyStateService.hasForm2Interaction()).toBe(true);

            formDirtyStateService.resetForm2Interaction();
            expect(formDirtyStateService.hasForm2Interaction()).toBe(false);

            formDirtyStateService.unregisterForm2SyncListeners(listenerState);
        });
    });

    describe('registerForm2SyncListeners debouncing', function () {
        it('should collapse a burst of interactions into a single sync', inject(function ($timeout) {
            var syncSpy = jasmine.createSpy('onSync');
            var listenerState = formDirtyStateService.registerForm2SyncListeners(syncSpy);

            listenerState.listener();
            listenerState.listener();
            listenerState.listener();
            expect(syncSpy).not.toHaveBeenCalled();

            $timeout.flush();
            expect(syncSpy.calls.count()).toBe(1);

            formDirtyStateService.unregisterForm2SyncListeners(listenerState);
            formDirtyStateService.resetForm2Interaction();
        }));

        it('should drop a pending sync on deregistration', inject(function ($timeout) {
            var syncSpy = jasmine.createSpy('onSync');
            var listenerState = formDirtyStateService.registerForm2SyncListeners(syncSpy);

            listenerState.listener();
            formDirtyStateService.unregisterForm2SyncListeners(listenerState);
            $timeout.verifyNoPendingTasks();

            expect(syncSpy).not.toHaveBeenCalled();
            formDirtyStateService.resetForm2Interaction();
        }));
    });
});
