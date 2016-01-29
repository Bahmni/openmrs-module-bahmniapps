'use strict';

describe('patientDbService', function () {
    var patientDbService;

    var mockHttp = jasmine.createSpyObj('$http', ['get']);

    beforeEach(function () {
        module('bahmni.common.offline');
        module(function ($provide) {
            $provide.value('$http', mockHttp);
        });
    });

    beforeEach(inject(['patientDbService', function (patientDbServiceInjected) {
        patientDbService = patientDbServiceInjected
    }]));

    var dataTypes = {
        "INTEGER": lf.Type.INTEGER,
        "STRING": lf.Type.STRING,
        "DATE_TIME": lf.Type.DATE_TIME,
        "OBJECT": lf.Type.OBJECT,
        "ARRAY_BUFFER": lf.Type.ARRAY_BUFFER
    };

    var createTable = function (schemaBuilder, tableDefinition) {
        var table = schemaBuilder.createTable(tableDefinition.tableName);

        _.map(tableDefinition.columns, function (column) {
            table.addColumn(column.name, dataTypes[column.type]);
        });

        table.addNullable(tableDefinition.nullableColumns);
        table.addPrimaryKey(tableDefinition.primaryKeyColumns);
        _.each(tableDefinition.indexes, function (index) {
            table.addIndex(index.indexName, index.columnNames);
        })
    };

    it("insert patient and get from lovefield database", function(done){
        var schemaBuilder = lf.schema.create('BahmniTest', 1);
        createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.Patient);
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var patientJson = JSON.parse(readFixtures('patient.json'));
        schemaBuilder.connect().then(function(db){
            patientDbService.insertPatientData(db, patientJson).then(function(){
                var uuid = 'e34992ca-894f-4344-b4b3-54a4aa1e5558';
                patientDbService.getPatientByUuid(db, uuid).then(function(result){
                    expect(result.patient.uuid).toBe(uuid);
                    done();
                });
                var identifier = 'GAN200076';
            });
        });
    });


});