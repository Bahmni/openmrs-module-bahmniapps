import React, {useEffect, useState} from "react";
import propTypes from "prop-types";
import {Checkbox, Search, Tag } from "carbon-components-react";

export const SelectReactions = (props) => {
    const { onChange } = props;
    const initialReactionIds = ["121670AAAAAAA", "121671AAAAAAA", "121672AAAAAAA", "121673AAAAAAA", "121674AAAAAAA"];
    const [searchResults, setSearchResults] = useState(initialReactionIds);
    const [isSearchResultEmpty, setIsSearchResultEmpty] = useState(true);
    const [selectedReactions, setSelectedReactions] = useState([]);
    const reactions = {
        "121670AAAAAAA": {name: "Fever"},
        "121671AAAAAAA": {name: "Nausea"},
        "121672AAAAAAA": {name: "Anemia"},
        "121673AAAAAAA": {name: "Cough"},
        "121674AAAAAAA": {name: "Headache"},
        "121675AAAAAAA": {name: "Anaphylactic reaction due to adverse effect of correct drug or medicament properly administered, initial encounte"},
        "121676AAAAAAA": {name: "Anaphylactic reaction due to adverse effect of correct drug or medicament properly administered, sequela"},
        "121677AAAAAAA": {name: "Personal history of anaphylaxis"},
        "121678AAAAAAA": {name: "Angioedema"},
        "121679AAAAAAA": {name: "Asthma"},
        "121680AAAAAAA": {name: "Hepatotoxicity"},
        "121681AAAAAAA": {name: "Bronchospasm"},
        "121682AAAAAAA": {name: "GI Upset"},
        "121683AAAAAAA": {name: "Hives"}
    }
    const [allReactions,] = useState(reactions);

    const search = (key) => {
        console.log(key);
        if(!key){
            setIsSearchResultEmpty(true);
            setSearchResults(initialReactionIds);
            return;
        }
        const searchIds = []
        const secondarySearchIds = []
        Object.keys(allReactions).forEach((reactionId) => {
            if(allReactions[reactionId].name.toLowerCase().startsWith(key.toLowerCase())) {
                searchIds.push(reactionId);
            }
            else if(allReactions[reactionId].name.toLowerCase().includes(key.toLowerCase())) {
                secondarySearchIds.push(reactionId);
            }
        });
        searchIds.push(...secondarySearchIds);
        if(searchIds.length === 0) {
            setIsSearchResultEmpty(true);
            setSearchResults(initialReactionIds);
        }
        else {
            setIsSearchResultEmpty(false);
            setSearchResults(searchIds);
        }
    }
    useEffect(()=>{
        console.log("allReactions", allReactions);
        onChange(selectedReactions);
    }, [selectedReactions])

    return (
        <div className={"section"}>
            <div style={{fontSize: "16px", fontWeight: 600, marginBottom:"10px"}}>
                Search Reaction
            </div>
            <div style={{padding: "12px 0"}}>
                <Search id={"allergen-search"} placeholder={"Type to search Reactions"}
                        onChange={(e) => {search(e.target.value);}}/>
            </div>
            <div style={{paddingBottom: "12px"}}>
                {selectedReactions.map((reactionId) => {
                    return <Tag filter={true} type={"blue"} onClose={() => {
                        allReactions[reactionId].isSelected = false;
                        setSelectedReactions(selectedReactions.filter((reaction) => reaction !== reactionId));
                    }}>{allReactions[reactionId].name}</Tag>
                })}
            </div>
            <div style={{paddingBottom: "12px"}}>
                {isSearchResultEmpty && <div style={{paddingBottom: "12px", fontSize: "12px"}}>Common Reactions</div>}
                {searchResults.map((reactionId) => {
                    return <Checkbox id={reactionId} labelText={allReactions[reactionId].name} checked={allReactions[reactionId].isSelected}
                                 onChange={(e) => {
                                     allReactions[reactionId].isSelected = e;
                                     if(e) {
                                         setSelectedReactions((oldReactions) => [...oldReactions, reactionId]);
                                     }
                                     else {
                                         setSelectedReactions(selectedReactions.filter((reaction) => reaction !== reactionId));
                                     }
                    }}/>
                })}
            </div>
        </div>)
}

SelectReactions.propTypes = {
    onChange: propTypes.func.isRequired,
}