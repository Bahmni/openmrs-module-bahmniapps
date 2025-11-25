export const allergyError = {
    "allergyapi.message.duplicateAllergen" : "This allergen is already saved for the patient"
}

export const getErrorKey = (error) => error.split(":")[2].replace("]", "")