import axios from 'axios';
import { OT_NOTES_BASE_URL } from "../../constants";

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

export const constructPayload = function (noteDate, note, noteEndDate) {
    const payload = [];
    const currentDate = new Date(noteDate);
    while (currentDate <= noteEndDate) {
        payload.push({
            noteTypeName: "OT module",
            noteDate: new Date(currentDate),
            noteText: note
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return payload;
};

export const saveNote = async (note, startDate, endDate) => {
    try{
        const payload = endDate != null ? constructPayload(startDate, note, endDate) : [{
            noteTypeName: "OT module",
            noteDate: startDate,
            noteText: note
        }];
        const response = await axios.post(OT_NOTES_BASE_URL, payload);
        return response.data;
    }
    catch (e) {
        console.error(e);
    }
}

export const updateNoteForADay = async (noteId, note, providerUuid) => {
    const payload = {
        noteText: note,
        providerUuid: providerUuid
    };
    try{
        const response = await axios.post(OT_NOTES_BASE_URL + "/" + noteId, payload, {
            headers: {"Accept": "application/json", "Content-Type": "application/json"}
        });
        return response.data;
    }
    catch (e) {
        console.error(e);
    }
};