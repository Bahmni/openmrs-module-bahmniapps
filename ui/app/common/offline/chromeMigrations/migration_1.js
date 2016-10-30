var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.Offline = Bahmni.Common.Offline || {};

// This file is added as a template, If need to run migrations use this template and create a new and change Migration1 to Migration[DB_VERSION-1]

Bahmni.Common.Offline.Migration1 = {
    SchemaDefinitions: {
        // Define table schema for new tables, same as that of SchemaDefinitions.js
    },
    Queries: [
        function (rawDb) {
            // Write your queries that rawDb supports
        }
    ],
    CopyOver: [
        function (db) {
            // Write your Lovefield queries using the given db instance
        }
    ]

};
