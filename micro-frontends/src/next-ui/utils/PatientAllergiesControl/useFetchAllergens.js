import axios from "axios";
import { useState, useEffect } from 'react';
import { FETCH_CONCEPT_URL } from "../../constants";
import { getLocale } from "../../Components/i18n/utils";

export const  useFetchAllergens = (conceptIdMap) => {
  console.log("inside useFetchAllergens");

  const [drugAllergenData, setDrugAllergenData] = useState([]);
  const [foodAllergenData, setFoodAllergenData] = useState([]);
  const [environmentAllergenData, setEnvironmentAllergenData] = useState([]);
  const [loading, setLoading] = useState(true);
  const locale= getLocale();
  const apiURL = FETCH_CONCEPT_URL.replace('{locale}',locale);

  const replaceConceptIdInapiURL = ( conceptId) => {
    console.log('conceptId',conceptId);
    return apiURL.replace('{conceptUuid}', conceptId);
    };

  const drugAllergenURL = replaceConceptIdInapiURL(conceptIdMap.drugAllergenUuid);
  const foodAllergenURL = replaceConceptIdInapiURL(conceptIdMap.foodAllergenUuid);
  const environmentAllergenURL = replaceConceptIdInapiURL(conceptIdMap.environmentalAllergenUuid);
 
    
  console.log('apiURL',apiURL);
  console.log('drugAllergenURL',drugAllergenURL);
  console.log('foodAllergenURL',foodAllergenURL);
  console.log('environmentAllergenURL',environmentAllergenURL);
    
  useEffect(() => {
  const fetchAllergenData = async () => {
    console.log(' inside fetchAllergenData');
  try {
    const [drugResponse, foodResponse, environmentResponse] = await Promise.all([
      axios.get(drugAllergenURL),
      axios.get(foodAllergenURL),
      axios.get(environmentAllergenURL),
    ]);

    console.log('drugResponse',drugResponse.data);
    console.log('foodResponse',foodResponse.data);
    console.log('environmentResponse',environmentResponse.data);

    setDrugAllergenData(drugResponse.data);
    setFoodAllergenData(foodResponse.data);
    setEnvironmentAllergenData(environmentResponse.data);

  } catch (error) {
console.error(error);
    
  }
  finally{
    setLoading(false);

  }
};
    fetchAllergenData();
  }, []);

  return {
    drugAllergenData,
    foodAllergenData,
    environmentAllergenData,
    loading,
  };
}
