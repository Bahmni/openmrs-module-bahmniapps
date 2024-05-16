import React, { useEffect, useState } from "react";
import propTypes from "prop-types";
import "../../../styles/common.scss";
import { Checkbox, Search, Tag } from "carbon-components-react";
import { FormattedMessage } from "react-intl";
import { cloneDeep } from "lodash";

const getReactionIds = (reactions) => {
  return Object.keys(reactions);
};

export const SelectReactions = (props) => {
  const { onChange, reactions, selectedAllergen } = props;
  const initialReactionIds = getReactionIds(reactions);
  const [searchResults, setSearchResults] = useState(initialReactionIds);
  const [isSearchResultEmpty, setIsSearchResultEmpty] = useState(true);
  const [selectedReactions, setSelectedReactions] = useState([]);
  const [allReactions] = useState(cloneDeep(reactions));
  const [searchKey, setSearchKey] = useState("");

  const search = (key) => {
    setSearchKey(key)
    if (!key) {
      setIsSearchResultEmpty(true);
      setSearchResults(initialReactionIds);
      return;
    }
    const searchIds = [];
    const secondarySearchIds = [];
    Object.keys(allReactions).forEach((reactionId) => {
      if (
        allReactions[reactionId].name
          .toLowerCase()
          .startsWith(key.toLowerCase())
      ) {
        searchIds.push(reactionId);
      } else if (
        allReactions[reactionId].name.toLowerCase().includes(key.toLowerCase())
      ) {
        secondarySearchIds.push(reactionId);
      }
    });
    searchIds.push(...secondarySearchIds);
    if (searchIds.length === 0) {
      setIsSearchResultEmpty(true);
      setSearchResults(initialReactionIds);
    } else {
      setIsSearchResultEmpty(false);
      setSearchResults(searchIds);
    }
  };
  useEffect(() => {
    if(selectedReactions.length > 0){
      setSearchKey("")
    }
    onChange(selectedReactions);
  }, [selectedReactions]);

  return (
    <div className={"section-next-ui"}>
      <div className={"font-large selected-allergen"}>
        <FormattedMessage id={"SELECTED_ALLERGEN"} defaultMessage={"Selected Allergen:"}/> {selectedAllergen.name}</div>
      <div className={"font-large bold"}><FormattedMessage id={"SEARCH_REACTION"} defaultMessage={"Search Reaction"}/><span className={"red-text"}>&nbsp;*</span></div>
      <div>
        <Search
          id={"reaction-search"}
          placeholder={"Type to search Reactions"}
          value={searchKey}
          onChange={(e) => {
            search(e.target.value);
          }}
        />
      </div>
      {selectedReactions.length > 0 && (
        <div>
          {selectedReactions.map((reactionId) => {
            return (
              <Tag
                key={reactionId}
                filter={true}
                type={"blue"}
                onClose={() => {
                  allReactions[reactionId].isSelected = false;
                  setSelectedReactions(
                    selectedReactions.filter(
                      (reaction) => reaction !== reactionId
                    )
                  );
                }}
              >
                {allReactions[reactionId].name}
              </Tag>
            );
          })}
        </div>
      )}
      <div>
        {isSearchResultEmpty && (
          <div className={"font-small selected-allergen"}>
            <FormattedMessage id={"COMMON_REACTIONS"} defaultMessage={"Common Reactions"}/>
          </div>
        )}
        {searchResults.map((reactionId) => {
          return (
            <Checkbox
              id={reactionId}
              key={reactionId}
              labelText={allReactions[reactionId].name}
              checked={allReactions[reactionId].isSelected}
              onChange={(e) => {
                allReactions[reactionId].isSelected = e;
                if (e) {
                  setSelectedReactions((oldReactions) => [
                    ...oldReactions,
                    reactionId,
                  ]);
                } else {
                  setSelectedReactions(
                    selectedReactions.filter(
                      (reaction) => reaction !== reactionId
                    )
                  );
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

SelectReactions.propTypes = {
  onChange: propTypes.func.isRequired,
  reactions: propTypes.object.isRequired,
  selectedAllergen: propTypes.object.isRequired,
};
