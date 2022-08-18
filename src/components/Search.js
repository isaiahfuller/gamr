import React, { useEffect } from 'react';
import {
  Input,
  Container,
  FormControl,
  Button,
  ButtonGroup,
  Flex,
  useColorMode,
  useBoolean,
} from '@chakra-ui/react';
import { Select } from 'chakra-react-select';
import { Link } from 'react-router-dom';
import tagsFile from '../data/tags.json';

function Search(props) {
  const setTags = props.tags;
  const { width } = props;
  const { colorMode, toggleColorMode } = useColorMode();
  const [advancedSearch, setAdvancedSearch] = useBoolean(false);
  const tags = tagsFile.response.tags.sort((first, second) => {
    if (first.name.toLowerCase() > second.name.toLowerCase()) return 1;
    else return -1;
  });
  let tagSelectOptions = [];

  useEffect(() => {
    tags.forEach(e => {
      tagSelectOptions.push({ label: e.name, value: e.name });
    });
    if (colorMode === 'light') toggleColorMode();
  });

  function handleTagUpdate(tags) {
    let temp = [];
    tags.forEach(e => {
      temp.push(e.value);
    });
    setTags(temp);
  }

  function handleSubmit(event) {
    event.preventDefault();
    props.setActiveSearch.on();
  }
  function handleSearch(e) {
    if (props.activeSearch) props.setActiveSearch.off();
    props.setSearchTerm(e.target.value);
  }

  return (
    <Container id="search-container" maxWidth="120ch" style={{marginTop: '1em'}}>
      <form onSubmit={handleSubmit}>
        <FormControl>
          <Flex direction={width > 700 ? 'row' : 'column'}>
            {!advancedSearch ? (
              <Input
                name="game-search"
                placeholder="Start with a game"
                size="lg"
                onInput={handleSearch}
                disabled={advancedSearch}
                id="search-input"
              />
            ) : (
              <Select
                id="search-input"
                size="lg"
                placeholder="Get games by tag"
                selectedOptionStyle="check"
                onChange={handleTagUpdate}
                options={tagSelectOptions}
                isMulti
              />
            )}
            <ButtonGroup maxWidth="90%" margin="auto" paddingX="2">
              {advancedSearch ? (
                <Link to="/recommendations">
                  <Button size="lg" colorScheme="blue" type="submit">
                    Search
                  </Button>
                </Link>
              ) : (
                <Button size="lg" colorScheme="blue" type="submit">
                  Search
                </Button>
              )}
              <Button
                size="lg"
                colorScheme="blue"
                onClick={setAdvancedSearch.toggle}
              >
                {!advancedSearch ? 'Tags' : 'Game'}
              </Button>
            </ButtonGroup>
          </Flex>
        </FormControl>
      </form>
    </Container>
  );
}

export default Search;
