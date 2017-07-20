'use strict';

angular.module('bahmni.common.offline').service('initializeOfflineSchema', [function () {
    var DB_VERSION = 2;
    var DB_VERSION_OLD;
    var dbPromises = {};

    var dataTypes = {
        "INTEGER": lf.Type.INTEGER,
        "STRING": lf.Type.STRING,
        "DATE_TIME": lf.Type.DATE_TIME,
        "OBJECT": lf.Type.OBJECT,
        "ARRAY_BUFFER": lf.Type.ARRAY_BUFFER,
        "BOOLEAN": lf.Type.BOOLEAN
    };

    var upgradeExistingSchemaFn = function (migrations, rawDb) {
        if (migrations.Queries) {
            migrations.Queries.forEach(function (query) {
                query(rawDb);
            });
        }
    };

    var createSchemaFn = function (migrations, schemaBuilder) {
        if (migrations.SchemaDefinitions) {
            var tablesFromMigrations = _.values(migrations.SchemaDefinitions);
            tablesFromMigrations.forEach(function (table) {
                createTable(schemaBuilder, table);
            });
        }
    };

    var migrateDataUsingCustomLoveFieldQueries = function (migrations, db) {
        if (migrations.CopyOver) {
            var tablesFromMigrations = _.values(migrations.CopyOver);
            tablesFromMigrations.forEach(function (query) {
                query(db);
            });
        }
    };

    var runMigration = function (oldVersion, db, applyOn) {
        while (oldVersion < DB_VERSION) {
            var migrations = Bahmni.Common.Offline["Migration" + oldVersion] || {};
            applyOn(migrations, db);
            oldVersion = oldVersion + 1;
        }
    };

    var onUpgrade = function (rawDb) {
        DB_VERSION_OLD = rawDb.getVersion();
        var oldVersion = DB_VERSION_OLD;
        runMigration(oldVersion, rawDb, upgradeExistingSchemaFn);
        return rawDb.dump();
    };

    var LOVEFIELD_DB_CONFIG = {
        storeType: lf.schema.DataStoreType.INDEXED_DB,
        onUpgrade: onUpgrade
    };

    this.databasePromise = null;

    var initDbSchema = function (schemaBuilder, definitions) {
        var tables = _.values(definitions);
        var initalMigrationVersion = 2;
        tables.forEach(function (table) {
            createTable(schemaBuilder, table);
        });

        runMigration(initalMigrationVersion, schemaBuilder, createSchemaFn);
    };

    this.initSchema = function (dbName) {
        if (dbPromises[dbName] != null) {
            return dbPromises[dbName];
        }
        var schemaBuilder = lf.schema.create(dbName, DB_VERSION);
        if (dbName === Bahmni.Common.Constants.bahmniConnectMetaDataDb) {
            initDbSchema(schemaBuilder, Bahmni.Common.Offline.MetaDataSchemaDefinitions);
            this.databasePromise = schemaBuilder.connect(LOVEFIELD_DB_CONFIG);
            dbPromises[dbName] = this.databasePromise;
        } else {
            initDbSchema(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions);
            this.databasePromise = schemaBuilder.connect(LOVEFIELD_DB_CONFIG);
            dbPromises[dbName] = this.databasePromise;
            this.databasePromise.then(function (db) {
                var initalMigrationVersion = DB_VERSION_OLD || 2;
                runMigration(initalMigrationVersion, db, migrateDataUsingCustomLoveFieldQueries);
            });
        }
        return this.databasePromise;
    };

    this.reinitSchema = function (dbName) {
        this.databasePromise = null;
        return this.initSchema(dbName);
    };

    var createTable = function (schemaBuilder, tableDefinition) {
        var table = schemaBuilder.createTable(tableDefinition.tableName);

        _.map(tableDefinition.columns, function (column) {
            table.addColumn(column.name, dataTypes[column.type]);
        });

        table.addNullable(tableDefinition.nullableColumns);
        if (tableDefinition.autoIncrement) {
            table.addPrimaryKey(tableDefinition.primaryKeyColumns, true);
        } else {
            table.addPrimaryKey(tableDefinition.primaryKeyColumns);
        }
        if (tableDefinition.uniqueKeyColumns) {
            table.addUnique("uKey" + tableDefinition.uniqueKeyColumns.join(""), tableDefinition.uniqueKeyColumns);
        }
        _.each(tableDefinition.indexes, function (index) {
            table.addIndex(index.indexName, index.columnNames);
        });
    };
}]);
