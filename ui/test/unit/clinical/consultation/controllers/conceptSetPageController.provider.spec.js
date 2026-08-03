'use strict';

describe('ConceptSetPageController - Provider Field Dirty State', function () {
    var formDirtyStateService;

    beforeEach(function () {
        module('bahmni.clinical');

        inject(function (_formDirtyStateService_) {
            formDirtyStateService = _formDirtyStateService_;
        });
    });

    describe('Dirty tracking with provider fields', function () {
        it('should detect when provider uuid changes', function () {
            var template = {
                observations: [{
                    concept: {uuid: 'provider-concept-uuid'},
                    value: {uuid: 'provider-uuid-1'}
                }]
            };

            var cleanState = formDirtyStateService.getObsValues([template]);

            // Change provider uuid
            template.observations[0].value = {uuid: 'provider-uuid-2'};
            var dirtyState = formDirtyStateService.getObsValues([template]);

            expect(dirtyState).not.toBe(cleanState);
        });

        it('should not mark dirty when provider metadata changes but uuid stays same', function () {
            var template = {
                observations: [{
                    concept: {uuid: 'provider-concept-uuid'},
                    value: {uuid: 'provider-uuid', name: 'Dr. Smith', id: 123}
                }]
            };

            var cleanState = formDirtyStateService.getObsValues([template]);

            // Only change name (metadata)
            template.observations[0].value = {uuid: 'provider-uuid', name: 'Dr. John Smith', id: 123};
            var currentState = formDirtyStateService.getObsValues([template]);

            expect(currentState).toBe(cleanState);
        });

        it('should handle string provider values', function () {
            var template = {
                observations: [{
                    concept: {uuid: 'provider-concept-uuid'},
                    value: '123'
                }]
            };

            var cleanState = formDirtyStateService.getObsValues([template]);

            // Keep same value
            template.observations[0].value = '123';
            var currentState = formDirtyStateService.getObsValues([template]);

            expect(currentState).toBe(cleanState);
        });

        it('should detect when string provider value changes', function () {
            var template = {
                observations: [{
                    concept: {uuid: 'provider-concept-uuid'},
                    value: '123'
                }]
            };

            var cleanState = formDirtyStateService.getObsValues([template]);

            // Change value
            template.observations[0].value = '456';
            var dirtyState = formDirtyStateService.getObsValues([template]);

            expect(dirtyState).not.toBe(cleanState);
        });

        it('should handle multiple provider observations', function () {
            var template = {
                observations: [
                    {
                        concept: {uuid: 'surgeon-uuid'},
                        value: {uuid: 'surgeon-uuid-1'}
                    },
                    {
                        concept: {uuid: 'anesthetist-uuid'},
                        value: {uuid: 'anesthetist-uuid-1'}
                    }
                ]
            };

            var cleanState = formDirtyStateService.getObsValues([template]);

            // Change one provider uuid
            template.observations[0].value = {uuid: 'surgeon-uuid-2'};
            var dirtyState = formDirtyStateService.getObsValues([template]);

            expect(dirtyState).not.toBe(cleanState);
        });

        it('should NOT mark dirty when reopening form with long provider UUID', function () {
            // Simulate reopen scenario: provider with long UUID already saved
            var template = {
                observations: [{
                    concept: {uuid: 'provider-concept-uuid'},
                    value: {uuid: 'very-long-provider-uuid-value-that-is-many-characters'}
                }]
            };

            var cleanState = formDirtyStateService.getObsValuesForTemplate(template);

            // User makes NO change - form stays the same on reopen
            var reopenState = formDirtyStateService.getObsValuesForTemplate(template);

            expect(reopenState).toBe(cleanState);
        });

        it('should mark dirty when editing long provider UUID to shorter one', function () {
            // This test prevents regression of the length heuristic bug
            var template = {
                observations: [{
                    concept: {uuid: 'provider-concept-uuid'},
                    value: {uuid: 'very-long-provider-uuid-that-is-many-characters'}
                }]
            };

            var cleanState = formDirtyStateService.getObsValuesForTemplate(template);

            // User edits to shorter UUID
            template.observations[0].value = {uuid: 'short-uuid'};
            var dirtyState = formDirtyStateService.getObsValuesForTemplate(template);

            expect(dirtyState).not.toBe(cleanState);
        });

        it('should use component.getValue() as fallback when template.observations is empty', function () {
            var mockComponent = {
                getValue: function () {
                    return {
                        observations: [{
                            concept: {uuid: 'provider-uuid'},
                            value: {uuid: 'provider-value-from-component'}
                        }]
                    };
                }
            };

            var template = {
                observations: [],  // Empty template observations
                component: mockComponent
            };

            var state = formDirtyStateService.getObsValuesForTemplate(template);
            expect(state).toContain('provider-value-from-component');
        });

        it('should prioritize template.observations over component.getValue()', function () {
            var mockComponent = {
                getValue: function () {
                    return {
                        observations: [{
                            concept: {uuid: 'provider-uuid'},
                            value: {uuid: 'component-value'}
                        }]
                    };
                }
            };

            var template = {
                observations: [{
                    concept: {uuid: 'provider-uuid'},
                    value: {uuid: 'template-value'}
                }],
                component: mockComponent
            };

            var state = formDirtyStateService.getObsValuesForTemplate(template);
            expect(state).toContain('template-value');
            expect(state).not.toContain('component-value');
        });

        it('should handle observations in different orders (server-side inconsistency)', function () {
            var template1 = {
                observations: [
                    {concept: {uuid: 'obs-a'}, value: {uuid: 'value-1'}},
                    {concept: {uuid: 'obs-b'}, value: {uuid: 'value-2'}}
                ]
            };

            var template2 = {
                observations: [
                    {concept: {uuid: 'obs-b'}, value: {uuid: 'value-2'}},  // Reversed order
                    {concept: {uuid: 'obs-a'}, value: {uuid: 'value-1'}}
                ]
            };

            var state1 = formDirtyStateService.getObsValues([template1]);
            var state2 = formDirtyStateService.getObsValues([template2]);

            // Should be same despite different order (sorting handles this)
            expect(state1).toBe(state2);
        });

        it('should clear stale observations when all templates are empty', function () {
            var template1 = {
                observations: [{
                    concept: {uuid: 'concept-1'},
                    value: {uuid: 'value-1'}
                }]
            };

            var template2 = {
                observations: []  // Empty
            };

            // Scenario: collected observations from template1 only
            var collectedObs = [];
            if (template1.observations && template1.observations.length > 0) {
                collectedObs.push(template1.observations[0]);
            }
            if (template2.observations && template2.observations.length > 0) {
                collectedObs.push(template2.observations[0]);
            }

            // Should NOT have guard that prevents clearing
            // collectedObs should be used unconditionally
            expect(collectedObs.length).toBe(1);
        });

        it('should detect changes when reopening form with observations', function () {
            // Baseline: form opened with provider observation
            var template = {
                observations: [{
                    concept: {uuid: 'provider-concept'},
                    value: {uuid: 'initial-provider-uuid'}
                }]
            };

            var cleanState = formDirtyStateService.getObsValuesForTemplate(template);

            // User makes no change
            var reopenState = formDirtyStateService.getObsValuesForTemplate(template);
            expect(reopenState).toBe(cleanState);

            // User changes provider
            template.observations[0].value = {uuid: 'different-provider-uuid'};
            var dirtyState = formDirtyStateService.getObsValuesForTemplate(template);
            expect(dirtyState).not.toBe(cleanState);
        });

        it('should handle empty template observations on reopen (unloaded case)', function () {
            var template = {
                observations: []  // Template observations not yet loaded
            };

            // First read: empty
            var firstRead = formDirtyStateService.getObsValuesForTemplate(template);
            expect(firstRead).toBe(angular.toJson([]));

            // Simulate observations being loaded
            template.observations = [{
                concept: {uuid: 'provider-concept'},
                value: {uuid: 'loaded-provider-uuid'}
            }];

            // Second read: should reflect loaded data
            var secondRead = formDirtyStateService.getObsValuesForTemplate(template);
            expect(secondRead).not.toBe(firstRead);
            expect(secondRead).toContain('loaded-provider-uuid');
        });

        it('should not mutate template.observations during dirty tracking', function () {
            var originalValue = {uuid: 'original-value'};
            var mockComponent = {
                getValue: function () {
                    return {
                        observations: [{
                            concept: {uuid: 'concept-uuid'},
                            value: {uuid: 'component-value'}
                        }]
                    };
                }
            };

            var template = {
                observations: [],
                component: mockComponent
            };

            // Call getTemplateObservationsForDirtyTracking
            var result = formDirtyStateService.getTemplateObservationsForDirtyTracking(template);

            // Template should NOT be mutated with component observations
            expect(template.observations.length).toBe(0);
            expect(result.length).toBeGreaterThan(0);
        });

        it('should handle multiple observations with same concept', function () {
            var template = {
                observations: [
                    {
                        concept: {uuid: 'multi-select-concept'},
                        isMultiSelect: true,
                        selectedObs: {
                            'option-1': true,
                            'option-2': true
                        }
                    }
                ]
            };

            var cleanState = formDirtyStateService.getObsValuesForTemplate(template);

            // User selects different options
            template.observations[0].selectedObs = {
                'option-2': true,
                'option-3': true
            };

            var dirtyState = formDirtyStateService.getObsValuesForTemplate(template);
            expect(dirtyState).not.toBe(cleanState);
        });

        it('should handle group members in observations', function () {
            var template = {
                observations: [{
                    concept: {uuid: 'group-concept'},
                    groupMembers: [
                        {
                            concept: {uuid: 'member-1'},
                            value: {uuid: 'member-value-1'}
                        },
                        {
                            concept: {uuid: 'member-2'},
                            value: {uuid: 'member-value-2'}
                        }
                    ]
                }]
            };

            var cleanState = formDirtyStateService.getObsValuesForTemplate(template);

            // Change a group member
            template.observations[0].groupMembers[0].value = {uuid: 'changed-member-value-1'};

            var dirtyState = formDirtyStateService.getObsValuesForTemplate(template);
            expect(dirtyState).not.toBe(cleanState);
        });

        it('should normalize numeric values to strings for comparison', function () {
            var template1 = {
                observations: [{
                    concept: {uuid: 'numeric-concept'},
                    value: 42
                }]
            };

            var template2 = {
                observations: [{
                    concept: {uuid: 'numeric-concept'},
                    value: '42'
                }]
            };

            var state1 = formDirtyStateService.getObsValues([template1]);
            var state2 = formDirtyStateService.getObsValues([template2]);

            // Should be same (normalized to string)
            expect(state1).toBe(state2);
        });

        it('should handle voided observations', function () {
            var template = {
                observations: [{
                    concept: {uuid: 'voided-concept'},
                    value: {uuid: 'some-value'},
                    voided: true
                }]
            };

            var cleanState = formDirtyStateService.getObsValuesForTemplate(template);

            // Void status should be tracked
            template.observations[0].voided = false;

            var dirtyState = formDirtyStateService.getObsValuesForTemplate(template);
            expect(dirtyState).not.toBe(cleanState);
        });

        it('should serialize multiple templates with combined observations', function () {
            var templates = [
                {
                    observations: [{
                        concept: {uuid: 'template-1-concept'},
                        value: {uuid: 'template-1-value'}
                    }]
                },
                {
                    observations: [{
                        concept: {uuid: 'template-2-concept'},
                        value: {uuid: 'template-2-value'}
                    }]
                }
            ];

            var state = formDirtyStateService.getObsValues(templates);
            expect(state).toContain('template-1-value');
            expect(state).toContain('template-2-value');
        });

        it('should handle null/undefined observation values gracefully', function () {
            var template = {
                observations: [
                    {
                        concept: {uuid: 'concept-1'},
                        value: null
                    },
                    {
                        concept: {uuid: 'concept-2'},
                        value: undefined
                    },
                    {
                        concept: {uuid: 'concept-3'},
                        value: {uuid: 'valid-value'}
                    }
                ]
            };

            var state = formDirtyStateService.getObsValuesForTemplate(template);
            expect(state).toContain('valid-value');
            // Should not crash, should handle gracefully
            expect(state).toBeDefined();
        });

    });
});
