
UPDATE idgen_identifier_source SET name = 'SIV' where description = 'ID sequence source for patients whose primary health center is Shivtarai';

UPDATE location_attribute SET value_reference = 'SIV' where value_reference = 'SHI';

update idgen_seq_id_gen set prefix = 'SIV' where prefix = 'SHI';