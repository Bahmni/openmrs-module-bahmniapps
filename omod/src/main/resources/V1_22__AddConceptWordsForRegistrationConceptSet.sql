select concept.concept_id, concept_name.concept_name_id from concept, concept_name where concept_name.concept_id = concept.concept_id and
concept_name.name = 'REGISTRATION_CONCEPTS' into @concept_id, @concept_name_id;
insert into concept_word (concept_id, word, locale, concept_name_id, weight) values (@concept_id, 'REGISTRATION', 'en', @concept_name_id, 2.1764705882352944);
insert into concept_word (concept_id, word, locale, concept_name_id, weight) values (@concept_id, 'CONCEPTS', 'en', @concept_name_id, 9.402777777777779);