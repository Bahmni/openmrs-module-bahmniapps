select concept.concept_id, concept_name.concept_name_id from concept, concept_name where concept_name.concept_id = concept.concept_id and
concept_name.name = 'COMMENTS' into @concept_id, @concept_name_id;
insert into concept_word (concept_id, word, locale, concept_name_id, weight) values (@concept_id, 'COMMENTS', 'en', @concept_name_id, 1.3738095238095238);

select concept.concept_id, concept_name.concept_name_id from concept, concept_name where concept_name.concept_id = concept.concept_id and
concept_name.name = 'REGISTRATION FEES' into @registration_fees_concept_id, @concept_name_id;
insert into concept_word (concept_id, word, locale, concept_name_id, weight) values (@registration_fees_concept_id, 'REGISTRATION', 'en', @concept_name_id, 2.1764705882352944);
insert into concept_word (concept_id, word, locale, concept_name_id, weight) values (@registration_fees_concept_id, 'FEES', 'en', @concept_name_id, 1.3634453781512605);

select concept.concept_id, concept_name.concept_name_id from concept, concept_name where concept_name.concept_id = concept.concept_id and
concept_name.name = 'HEIGHT' into @concept_id, @concept_name_id;
insert into concept_word (concept_id, word, locale, concept_name_id, weight) values (@concept_id, 'HEIGHT', 'en', @concept_name_id, 9.402777777777779);

select concept.concept_id, concept_name.concept_name_id from concept, concept_name where concept_name.concept_id = concept.concept_id and
concept_name.name = 'WEIGHT' into @concept_id, @concept_name_id;
insert into concept_word (concept_id, word, locale, concept_name_id, weight) values (@concept_id, 'WEIGHT', 'en', @concept_name_id, 9.402777777777779);

select concept.concept_id, concept_name.concept_name_id from concept, concept_name where concept_name.concept_id = concept.concept_id and
concept_name.name = 'BMI' into @concept_id, @concept_name_id;
insert into concept_word (concept_id, word, locale, concept_name_id, weight) values (@concept_id, 'BMI', 'en', @concept_name_id, 12.11111111111111);

select concept.concept_id, concept_name.concept_name_id from concept, concept_name where concept_name.concept_id = concept.concept_id and
concept_name.name = 'REGISTRATION_CONCEPTS' into @concept_id, @concept_name_id;
insert into concept_word (concept_id, word, locale, concept_name_id, weight) values (@concept_id, 'REGISTRATION', 'en', @concept_name_id, 2.1764705882352944);
insert into concept_word (concept_id, word, locale, concept_name_id, weight) values (@concept_id, 'CONCEPTS', 'en', @concept_name_id, 9.402777777777779);

select concept.concept_id from concept, concept_name where concept_name.concept_id = concept.concept_id and
concept_name.name = 'REGISTRATION_CONCEPTS' into @registration_concepts_concept_id;
insert into concept_set (concept_id, concept_set, sort_weight, creator, date_created, uuid)
    values (@registration_fees_concept_id, @registration_concepts_concept_id, 1000, 1, now(), uuid());