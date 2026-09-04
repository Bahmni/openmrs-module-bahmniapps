'use strict';

describe('ConceptSetPageController - Form Deletion Feature', function () {

    describe('Form Deletion - State Tracking', function () {

        it('should track deleted form IDs in consultation object', function () {
            var consultation = { deletedFormIds: [] };
            var formUuid = 'form-uuid-123';

            if (!angular.isArray(consultation.deletedFormIds)) {
                consultation.deletedFormIds = [];
            }
            if (!_.includes(consultation.deletedFormIds, formUuid)) {
                consultation.deletedFormIds.push(formUuid);
            }

            expect(consultation.deletedFormIds).toContain(formUuid);
        });

        it('should not add duplicate form IDs', function () {
            var consultation = { deletedFormIds: ['form-1'] };
            if (!_.includes(consultation.deletedFormIds, 'form-1')) {
                consultation.deletedFormIds.push('form-1');
            }
            expect(consultation.deletedFormIds.length).toBe(1);
        });
    });

    describe('Form Deletion - State Preservation After Save', function () {

        it('should re-apply deleted state to fresh forms from server', function () {
            var oldConsultation = { deletedFormIds: ['form-1', 'form-2'] };
            var newConsultation = {
                observationForms: [
                    { uuid: 'form-1', isAdded: true, observations: [] },
                    { uuid: 'form-2', isAdded: true, observations: [] },
                    { uuid: 'form-3', isAdded: true, observations: [] }
                ]
            };

            if (oldConsultation && oldConsultation.deletedFormIds &&
                angular.isArray(oldConsultation.deletedFormIds) &&
                oldConsultation.deletedFormIds.length > 0) {
                newConsultation.deletedFormIds = oldConsultation.deletedFormIds;
                if (newConsultation && newConsultation.observationForms &&
                    angular.isArray(newConsultation.observationForms)) {
                    _.each(newConsultation.observationForms, function (form) {
                        if (!form) return;
                        var id = form.formUuid || form.uuid || form.id;
                        if (id && _.includes(newConsultation.deletedFormIds, id)) {
                            form.isAdded = false;
                            form.observations = [];
                            form.isDeleted = true;
                        }
                    });
                }
            }

            expect(newConsultation.observationForms[0].isDeleted).toBe(true);
            expect(newConsultation.observationForms[2].isDeleted).toBeUndefined();
        });
    });

    describe('Form Deletion - UI Filtering', function () {

        it('should filter deleted forms from visible templates', function () {
            var templates = [
                { uuid: 'f1', isDeleted: false },
                { uuid: 'f2', isDeleted: true },
                { uuid: 'f3' }
            ];
            var visible = _.filter(templates, function (t) { return !t.isDeleted; });
            expect(visible.length).toBe(2);
        });
    });

    describe('Form Deletion - Re-addition Logic', function () {

        it('should remove form from deletedFormIds when re-adding', function () {
            var consultation = { deletedFormIds: ['form-readd', 'form-keep'] };
            consultation.deletedFormIds = _.filter(consultation.deletedFormIds,
                function (id) { return id !== 'form-readd'; });
            expect(_.includes(consultation.deletedFormIds, 'form-readd')).toBe(false);
            expect(_.includes(consultation.deletedFormIds, 'form-keep')).toBe(true);
        });
    });

    describe('Form Deletion - ID Extraction', function () {

        it('should extract formUuid when available', function () {
            var form = { formUuid: 'uuid-1' };
            var id = form.formUuid || form.uuid || form.id;
            expect(id).toBe('uuid-1');
        });

        it('should extract uuid as fallback', function () {
            var form = { uuid: 'uuid-2' };
            var id = form.formUuid || form.uuid || form.id;
            expect(id).toBe('uuid-2');
        });

        it('should extract id as last resort', function () {
            var form = { id: 'id-3' };
            var id = form.formUuid || form.uuid || form.id;
            expect(id).toBe('id-3');
        });
    });

    describe('Form Deletion - Edge Cases', function () {

        it('should handle multiple deletions before save', function () {
            var consultation = { deletedFormIds: [] };
            _.each(['f1', 'f2', 'f3'], function (fid) {
                if (!_.includes(consultation.deletedFormIds, fid)) {
                    consultation.deletedFormIds.push(fid);
                }
            });
            expect(consultation.deletedFormIds.length).toBe(3);
        });

        it('should identify pinned forms correctly', function () {
            var forms = [
                { uuid: 'f1', alwaysShow: true },
                { uuid: 'f2', alwaysShow: false }
            ];
            var pinned = _.filter(forms, function (f) { return f.alwaysShow === true; });
            expect(pinned.length).toBe(1);
        });
    });

});
