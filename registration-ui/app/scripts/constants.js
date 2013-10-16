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
    registrationFeesConcept : "REGISTRATION FEES"
};