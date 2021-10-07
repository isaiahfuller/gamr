import React from 'react';
import {
  Input,
  Container,
  FormControl,
  Button,
  HStack,
} from '@chakra-ui/react';

function Search(props) {
  function handleSubmit(event) {
    event.preventDefault();
    props.setActiveSearch.on();
  }
  function handleSearch(e) {
    if (props.activeSearch) props.setActiveSearch.off();
    props.setSearchTerm(e.target.value);
  }
  return (
    <Container className="search-container" maxWidth="80ch">
      <form onSubmit={handleSubmit}>
        <FormControl>
          <HStack paddingTop="5px">
            <Input
              name="game-search"
              placeholder="Basic usage"
              size="lg"
              onInput={handleSearch}
            />
            <Button size="lg" colorScheme="blue" type="submit">
              Search
            </Button>
          </HStack>
        </FormControl>
      </form>
    </Container>
  );
}

export default Search;
