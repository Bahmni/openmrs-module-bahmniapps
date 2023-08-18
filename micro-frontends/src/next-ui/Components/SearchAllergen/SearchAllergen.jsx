import React, { useState } from "react";
import propTypes from "prop-types";
import "../../../styles/common.scss";
import "./SearchAllergen.scss";
import {Link, Search, Tag} from "carbon-components-react";

export function SearchAllergen(props) {
    const { onChange } = props;
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchResultEmpty, setIsSearchResultEmpty] = useState(false);

    const allergens = [
        { name: "Eggs", kind: "Food"},
        { name: "Peanuts", kind: "Food"},
        { name: "Seafood", kind: "Food"},
        { name: "Bee", kind: "Environment"},
        { name: "Serum", kind: "Biological"},
        { name: "Penicillin", kind: "Medication"},
        { name: "Narcotic agent", kind: "Medication"}];

    const clearSearch = () => {
        setIsSearchResultEmpty(false);
        setSearchResults([]);
    }

    const search = (key) => {
        if(!key){
            clearSearch();
            return;
        }
        let search =[], secondSearch = [];
        allergens.map((allergen) => {
            if(allergen.name.toLowerCase().startsWith(key.toLowerCase())) {
                search.push(allergen);
            }
            else if(allergen.name.toLowerCase().includes(key.toLowerCase())) {
                secondSearch.push(allergen);
            }
        });
        search.push(...secondSearch);
        setSearchResults(search);
        setIsSearchResultEmpty(search.length === 0);
    }
    return (
        <div className={"section"}>
            <div className={"font-large bold"}>
                Search Allergen
            </div>
            <div>
                <Search id={"allergen-search"} placeholder={"Type to search Allergen"}
                        onChange={(e) => {search(e.target.value);}}/>
            </div>
            {
                isSearchResultEmpty ? <div>No Allergen found</div> :
                searchResults.map((allergen) => {
                    return <div className={"allergen"}>
                        <span className={"allergen"}>
                            {allergen.name}
                            &nbsp;
                            <Tag type={"blue"}>{allergen.kind}</Tag>
                        </span>
                        <span>
                            <Link onClick={() => onChange(allergen)}>Reaction(s)</Link>
                        </span>
                    </div>
                })
            }
        </div>
    )
}

SearchAllergen.propTypes = {
    onChange: propTypes.func.isRequired
}