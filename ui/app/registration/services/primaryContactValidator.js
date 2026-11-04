'use strict';

// Stops a patient being saved without a Primary Contact, and points the user at the field.
// Called first by $scope.create() and $scope.update(), so it covers every submit button
// on the form (Save, Start Visit, Enter Visit Details).
angular.module('bahmni.registration')
    .factory('primaryContactValidator', ['$rootScope', '$document', 'ngDialog', function ($rootScope, $document, ngDialog) {
        var ATTRIBUTE_NAME = 'telephoneNumber'; // also the id of the rendered input (see attributeInformation.html)
        var DIALOG_TEMPLATE = 'views/primaryContactRequired.html'; // its strings are in locale_en.json
        var ANCHOR_CLASS = 'primary-contact-anchor';
        var ARROW_CLASS = 'primary-contact-arrow';
        var isDialogOpen = false;

        // The field may sit in a collapsed section, where the arrow and focus would be invisible.
        var expandSectionContainingField = function () {
            var sections = $rootScope.patientConfiguration && $rootScope.patientConfiguration.getPatientAttributesSections();
            _.each(sections, function (section) {
                if (_.some(section.attributes, {name: ATTRIBUTE_NAME})) {
                    section.expand = true;
                }
            });
        };

        // The arrow is added here rather than in attributeInformation.html because that template
        // is shared by every attribute. It stays until the field has a value, even if the field
        // is later cleared: it only comes back on the next Save.
        var showArrow = function (input) {
            var anchor = angular.element(input.parentNode);
            if (anchor[0].querySelector('.' + ARROW_CLASS)) {
                return;
            }
            var arrow = angular.element('<span aria-hidden="true"></span>').addClass(ARROW_CLASS);
            anchor.addClass(ANCHOR_CLASS).append(arrow);

            var field = angular.element(input);
            var removeArrowOnceFilled = function () {
                if (_.trim(input.value)) {
                    arrow.remove();
                    anchor.removeClass(ANCHOR_CLASS);
                    field.off('input change', removeArrowOnceFilled);
                }
            };
            field.on('input change', removeArrowOnceFilled);
        };

        // Uses its own dialog because messagingService renders every error in one shared template.
        // Enter or the Save access key can resubmit the form behind the dialog, hence isDialogOpen.
        var showDialogThenFocusField = function (input) {
            if (isDialogOpen) {
                return;
            }
            isDialogOpen = true;
            ngDialog.open({
                template: DIALOG_TEMPLATE,
                className: 'ngdialog-theme-default primary-contact-dialog',
                showClose: false
            }).closePromise.then(function () {
                isDialogOpen = false;
                input.scrollIntoView({block: 'center'});
                input.focus();
            });
        };

        // Returns false, and alerts the user, if saving should stop.
        var validate = function () {
            var input = $document[0].getElementById(ATTRIBUTE_NAME);
            // Not on the form (not configured, or hidden by a show/hide rule) or read-only: the
            // user could never fill it in, so blocking here would make the patient unsaveable.
            if (!input || input.disabled || _.trim(input.value)) {
                return true;
            }
            expandSectionContainingField();
            showArrow(input);
            showDialogThenFocusField(input);
            return false;
        };

        return {
            validate: validate
        };
    }]);
