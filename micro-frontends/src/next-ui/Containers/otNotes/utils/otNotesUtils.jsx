import axios from 'axios';
import { OT_NOTES_BASE_URL } from "../../../constants";

export const deleteOtNote = async (id) => {
    try {
        const response = await axios.delete(OT_NOTES_BASE_URL + "/" + id, {
            headers: {"Accept": "application/json", "Content-Type": "application/json", withCredentials: true}
        });
        return response.data;

    } catch (e) {
        console.error(e);
    }
}