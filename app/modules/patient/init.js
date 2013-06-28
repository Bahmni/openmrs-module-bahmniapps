angular.module('registration.patient.models', ['resources.date']);
angular.module('registration.patient.mappers', ['resources.patientAttributeType', 'registration.patient.models']);

//angular.module('resources.patientAttributeType', [])
angular.module('registration.patient.services', ['registration.patient.models', 'registration.patient.mappers'])


angular.module('registration.patient.controllers', ['registration.patient.services', 'registration.patient.models',
													 'registration.patient.mappers','resources.date','registration.patient.services', 
													 'infrastructure.spinner', 'registration.photoCapture', 'infrastructure.printer',
													 'resources.bmi']);