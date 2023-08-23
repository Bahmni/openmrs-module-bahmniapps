import React, {useEffect, useState} from "react";
import propTypes from "prop-types";
import "../../../styles/common.scss";
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
        onChange(selectedReactions);
    }, [selectedReactions])

    return (
        <div className={"section"}>
            <div className={"font-large bold"}>
                Search Reaction
            </div>
            <div>
                <Search id={"reaction-search"} placeholder={"Type to search Reactions"}
                        onChange={(e) => {search(e.target.value);}}/>
            </div>
            {selectedReactions.length > 0  &&
                <div>
                    {selectedReactions.map((reactionId) => {
                        return <Tag key={reactionId} filter={true} type={"blue"} onClose={() => {
                            allReactions[reactionId].isSelected = false;
                            setSelectedReactions(selectedReactions.filter((reaction) => reaction !== reactionId));
                        }}>{allReactions[reactionId].name}</Tag>
                    })}
                </div>
            }
            <div>
                {isSearchResultEmpty && <div className={"font-small"} style={{marginBottom: "8px", marginTop: "10px"}}>Common Reactions</div>}
                {searchResults.map((reactionId) => {
                    return <Checkbox id={reactionId} key={reactionId} labelText={allReactions[reactionId].name} checked={allReactions[reactionId].isSelected}
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
