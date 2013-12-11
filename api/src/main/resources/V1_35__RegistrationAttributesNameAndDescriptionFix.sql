UPDATE person_attribute_type SET name = 'givenNameLocal' WHERE name = 'givenNameHindi';
UPDATE person_attribute_type SET name = 'familyNameLocal' WHERE name = 'familyNameHindi';
UPDATE person_attribute_type SET description = 'मरीज़ का नाम' WHERE name = 'givenNameLocal';
UPDATE person_attribute_type SET description = 'मरीज़ का उपनाम' WHERE name = 'familyNameLocal';
