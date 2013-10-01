insert into concept (datatype_id, class_id, is_set, creator, date_created, changed_by, date_changed, uuid)
    values (3, 12, 0, 1, now(), 1, now(), uuid());
select max(concept_id) from concept into @chief_complaint_concept_id;
insert into concept_name (concept_id, name, locale, locale_preferred, creator, date_created, concept_name_type, uuid)
    values (@chief_complaint_concept_id, 'CHIEF COMPLAINT', 'en', 1, 1, now(), 'FULLY_SPECIFIED', uuid());
-- insert into concept_word (concept_id, word, locale, concept_name_id, weight)
--    values (select max(concept_id) from concept, 'CHIEF', 'en', select max(concept_name_id) from concept_name, );

insert into concept (datatype_id, class_id, is_set, creator, date_created, changed_by, date_changed, uuid)
    values (1, 11, 0, 1, now(), 1, now(), uuid());
select max(concept_id) from concept into @registration_fees_concept_id;
insert into concept_name (concept_id, name, locale, locale_preferred, creator, date_created, concept_name_type, uuid)
    values (@registration_fees_concept_id, 'REGISTRATION FEES', 'en', 1, 1, now(), 'FULLY_SPECIFIED', uuid());

insert into concept (datatype_id, class_id, is_set, creator, date_created, changed_by, date_changed, uuid)
    values (1, 1, 0, 1, now(), 1, now(), uuid());
select max(concept_id) from concept into @height_concept_id;
insert into concept_name (concept_id, name, locale, locale_preferred, creator, date_created, concept_name_type, uuid)
    values (@height_concept_id, 'HEIGHT', 'en', 1, 1, now(), 'FULLY_SPECIFIED', uuid());

insert into concept (datatype_id, class_id, is_set, creator, date_created, changed_by, date_changed, uuid)
    values (1, 1, 0, 1, now(), 1, now(), uuid());
select max(concept_id) from concept into @weight_concept_id;
insert into concept_name (concept_id, name, locale, locale_preferred, creator, date_created, concept_name_type, uuid)
    values (@weight_concept_id, 'WEIGHT', 'en', 1, 1, now(), 'FULLY_SPECIFIED', uuid());

insert into concept (datatype_id, class_id, is_set, creator, date_created, changed_by, date_changed, uuid)
    values (1, 1, 0, 1, now(), 1, now(), uuid());
select max(concept_id) from concept into @bmi_concept_id;
insert into concept_name (concept_id, name, locale, locale_preferred, creator, date_created, concept_name_type, uuid)
    values (@bmi_concept_id, 'BMI', 'en', 1, 1, now(), 'FULLY_SPECIFIED', uuid());

-- This is a concept for concept-set
insert into concept (datatype_id, class_id, is_set, creator, date_created, changed_by, date_changed, uuid)
    values (1, 10, 0, 1, now(), 1, now(), uuid());
select max(concept_id) from concept into @registration_concepts_concept_id;
insert into concept_name (concept_id, name, locale, locale_preferred, creator, date_created, concept_name_type, uuid)
    values (@registration_concepts_concept_id, 'REGISTRATION_CONCEPTS', 'en', 1, 1, now(), 'FULLY_SPECIFIED', uuid());
-- create the concept set entries
insert into concept_set (concept_id, concept_set, sort_weight, creator, date_created, uuid)
    values (@chief_complaint_concept_id, @registration_concepts_concept_id, 1000, 1, now(), uuid());
insert into concept_set (concept_id, concept_set, sort_weight, creator, date_created, uuid)
    values (@registration_concepts_concept_id, @registration_concepts_concept_id, 1000, 1, now(), uuid());
insert into concept_set (concept_id, concept_set, sort_weight, creator, date_created, uuid)
    values (@height_concept_id, @registration_concepts_concept_id, 1000, 1, now(), uuid());
insert into concept_set (concept_id, concept_set, sort_weight, creator, date_created, uuid)
    values (@weight_concept_id, @registration_concepts_concept_id, 1000, 1, now(), uuid());
insert into concept_set (concept_id, concept_set, sort_weight, creator, date_created, uuid)
    values (@bmi_concept_id, @registration_concepts_concept_id, 1000, 1, now(), uuid());