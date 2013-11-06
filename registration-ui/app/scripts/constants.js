var constants = {
    encounterType : {
        registration: "REG",
    },

    visitType: {
        registration: "REG",
        returningPatient: "REVISIT",
        emergency: "EMERGENCY",
    },
    centers: [
        {name: 'GAN'},
        {name: 'SEM'},
        {name: 'SIV'},
        {name: 'BAM'}
    ],
    openmrsUrl: "/openmrs",
    bahmniRESTBaseURL: "/openmrs/ws/rest/v1/bahmnicore",
    emrApiRESTBaseURL: "/openmrs/ws/rest/emrapi",
    webServiceRestBaseURL: "/openmrs/ws/rest/v1",
    registrationFeesConcept : "REGISTRATION FEES"
};