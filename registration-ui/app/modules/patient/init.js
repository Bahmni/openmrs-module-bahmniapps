angular.module('registration.patient.models', ['registration.util']);
angular.module('registration.patient.mappers', ['registration.patient.models']);

//angular.module('resources.patientAttributeType', [])
angular.module('registration.patient.services', ['registration.patient.models', 'registration.patient.mappers'])


angular.module('registration.patient.controllers', ['registration.patient.services', 'registration.patient.models',
													 'registration.patient.mappers','registration.util','registration.patient.services', 
													 'infrastructure.spinner', 'infrastructure.loader','registration.photoCapture', 
                                                     'infrastructure.printer', 'resources.bmi', 'infinite-scroll']);
angular.module('registration.patient.directives', ['registration.patient.services']);