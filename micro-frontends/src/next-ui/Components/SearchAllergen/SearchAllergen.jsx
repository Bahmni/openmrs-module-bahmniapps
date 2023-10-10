import React, { useState } from "react";
import propTypes from "prop-types";
import "../../../styles/common.scss";
import "./SearchAllergen.scss";
import { Link, Search, Tag } from "carbon-components-react";
import { FormattedMessage } from "react-intl";
export function SearchAllergen(props) {
  const { onChange, allergens } = props;
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchResultEmpty, setIsSearchResultEmpty] = useState(false);
  const noAllergenText = (
    <FormattedMessage
      id={"NO_ALLERGENS_FOUND"}
      defaultMessage={"No Allergen found"}
    />
  );
  const searchAllergenText = (
    <FormattedMessage
      id={"SEARCH_ALLERGEN"}
      defaultMessage={"Search Allergen"}
    />
  );
  const reactionsLinkText = (
    <FormattedMessage id={"REACTIONS"} defaultMessage={"Reaction(s)"} />
  );

  const clearSearch = () => {
    setIsSearchResultEmpty(false);
    setSearchResults([]);
  };

  const search = (key) => {
    if (!key) {
      clearSearch();
      return;
    }
    let search = [],
      secondSearch = [];
    allergens.map((allergen) => {
      if (
        allergen.name.toLowerCase().startsWith(key.toLowerCase()) ||
        allergen.kind.toLowerCase().startsWith(key.toLowerCase())
      ) {
        search.push(allergen);
      } else if (
        allergen.name.toLowerCase().includes(key.toLowerCase()) ||
        allergen.kind.toLowerCase().includes(key.toLowerCase())
      ) {
        secondSearch.push(allergen);
      }
    });
    search.push(...secondSearch);
    setSearchResults(search);
    setIsSearchResultEmpty(search.length === 0);
  };
  return (
    <div className={"section-next-ui"}>
      <div className={"font-large bold"}>{searchAllergenText}<span className={"red-text"}>&nbsp;*</span></div>
      <div>
        <Search
          id={"allergen-search"}
          placeholder={"Type to search Allergen"}
          onChange={(e) => {
            search(e.target.value);
          }}
        />
      </div>
      {isSearchResultEmpty ? (
        <div>{noAllergenText}</div>
      ) : (
        searchResults.map((allergen) => {
          return (
            <div
              onClick={() => onChange(allergen)}
              key={allergen.uuid}
              className={"allergen"}
            >
              <span className={"allergen"}>
                <span className={"allergen-name"}>{allergen.name}</span>
                &nbsp;
                <Tag type={"blue"}>{allergen.kind}</Tag>
              </span>
              <span>
                <Link onClick={() => onChange(allergen)}>
                  {reactionsLinkText}
                </Link>
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}

SearchAllergen.propTypes = {
  onChange: propTypes.func.isRequired,
  allergens: propTypes.array.isRequired,
};
