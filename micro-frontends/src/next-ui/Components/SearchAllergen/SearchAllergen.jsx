import React, { useState } from "react";
import propTypes from "prop-types";
import "../../../styles/common.scss";
import "./SearchAllergen.scss";
import {Link, Search, Tag} from "carbon-components-react";
import {FormattedMessage} from "react-intl";

export function SearchAllergen(props) {
    const { onChange } = props;
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchResultEmpty, setIsSearchResultEmpty] = useState(false);
    const noAllergenText = <FormattedMessage id={'NO_ALLERGENS_FOUND'} defaultMessage={'No Allergen found'}/>;
    const searchAllergenText = <FormattedMessage id={'SEARCH_ALLERGEN'} defaultMessage={'Search Allergen'}/>;
    const reactionsLinkText = <FormattedMessage id={'REACTIONS'} defaultMessage={'Reaction(s)'}/>;

    const allergens = [
        { name: "Eggs", kind: "Food", uuid: "162301AAAAAA"},
        { name: "Peanuts", kind: "Food", uuid: "162302AAAAAA"},
        { name: "Seafood", kind: "Food", uuid: "162303AAAAAA"},
        { name: "Bee", kind: "Environment", uuid: "162304AAAAAA"},
        { name: "Serum", kind: "Biological", uuid: "162305AAAAAA"},
        { name: "Penicillin", kind: "Medication", uuid: "162306AAAAAA"},
        { name: "Narcotic agent", kind: "Medication", uuid: "162307AAAAAA"},];

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
            <div className={"font-large bold"}>{searchAllergenText}</div>
            <div>
                <Search id={"allergen-search"} placeholder={"Type to search Allergen"}
                        onChange={(e) => {search(e.target.value);}}/>
            </div>
            {
                isSearchResultEmpty ? <div>{noAllergenText}</div> :
                searchResults.map((allergen) => {
                    return <div key={allergen.uuid} className={"allergen"}>
                        <span className={"allergen"}>
                            {allergen.name}
                            &nbsp;
                            <Tag type={"blue"}>{allergen.kind}</Tag>
                        </span>
                        <span>
                            <Link onClick={() => onChange(allergen)}>{reactionsLinkText}</Link>
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
