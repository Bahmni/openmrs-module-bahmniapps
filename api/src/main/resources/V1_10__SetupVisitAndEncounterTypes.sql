INSERT INTO visit_type (name, description, creator, uuid, date_created) VALUES ('REG', 'Regular patient visit', 1, uuid(), curdate());

INSERT INTO encounter_type (name, description, creator, date_created, uuid) VALUES ('REG', 'Registration encounter', 1, curdate(), uuid());
