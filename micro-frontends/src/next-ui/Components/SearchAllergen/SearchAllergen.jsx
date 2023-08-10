import React from "react";
import propTypes from "prop-types";
import "../../../styles/common.scss";
import {Link, Search, Tag} from "carbon-components-react";

export function SearchAllergen(props) {
    const { onChange } = props;
    const [searchResults, setSearchResults] = React.useState([]);
    const [isSearchResultEmpty, setIsSearchResultEmpty] = React.useState(false);

    const allergens = [
        { name: "Eggs", kind: "Food"},
        { name: "Peanuts", kind: "Food"},
        { name: "Seafood", kind: "Food"},
        { name: "Bee", kind: "Environment"},
        { name: "Serum", kind: "Biological"},
        { name: "Penicillin", kind: "Medication"},
        { name: "Narcotic agent", kind: "Medication"}];

    const search = (key) => {
        const search =  allergens.filter((allergen) => {
            return allergen.name.toLowerCase().startsWith(key.toLowerCase());
        });
        const secondSearch = allergens.filter((allergen) => {
            return !(allergen.name.toLowerCase().startsWith(key.toLowerCase())) && allergen.name.toLowerCase().includes(key.toLowerCase())
        });
        search.push(...secondSearch);
        setSearchResults(search);
        setIsSearchResultEmpty(search.length === 0);
    }
    return (
        <div className={"section"}>
            <div style={{fontSize: "16px", fontWeight: 600, marginBottom:"10px"}}>
                Search Allergen
            </div>
            <div style={{padding: "12px 0"}}>
                <Search id={"allergen-search"} placeholder={"Type to search Allergen"} onChange={(e) => {
                    if(e.target.value.length === 0) {
                        setIsSearchResultEmpty(false);
                        setSearchResults([])
                    }
                    else {
                        search(e.target.value);
                    }
                }}/>
            </div>
            {
                isSearchResultEmpty ? <div style={{padding: "12px 0"}}>No Allergen found</div> :
                searchResults.map((allergen) => {
                    return <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "10px"}}>
                        <span style={{display: "flex", alignItems: "center"}}>
                            {allergen.name}
                            &nbsp;
                            <Tag type={"blue"} className={"tag"}>{allergen.kind}</Tag>
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