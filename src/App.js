import { React, useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import {
  ChakraProvider,
  extendTheme,
  useBoolean,
  Text,
  VStack,
} from '@chakra-ui/react';
import Search from './components/Search';
import SearchResults from './components/SearchResults';
import TagsPage from './components/TagsPage';
import Recommendations from './components/Recommendations';

function App() {
  const [searchTerm, setSearchTerm] = useState();
  const [backgroundImage, setBackgroundImage] = useState('');
  const [activeSearch, setActiveSearch] = useBoolean(false);
  const [tags, setTags] = useState();
  const [devs, setDevs] = useState();
  const [appid, setAppid] = useState();

  function handleBackground(img) {
    setBackgroundImage(img);
    return () => {
      setBackgroundImage('');
    };
  }

  var bgTheme = extendTheme({
    styles: {
      global: props => ({
        '.search-container': {
          position: searchTerm !== undefined ? 'relative' : 'fixed',
          top: '50%',
        },
        '.game-list, #game-details': {
          backgroundColor: 'rgba(0,0,0,0.2)',
        },
        '.results-load': {
          position: 'fixed',
          top: '40%',
        },
        '.tags-select': {
          paddingTop: '5',
          paddingBottom: '5',
        },
        '.continue-button': {
          paddingBottom: '5',
        },
        '#recommendation-buttons': {
          bottom: '0',
          left: '0',
          zIndex: '1000',
        },
        '#recommendation-tags': {
          minHeight: '10vh',
          overflow: 'none',
          zIndex: '900',
        },
        body: {
          backgroundColor: '#252930',
          backgroundImage: backgroundImage !== '' ? backgroundImage : null,
          backgroundSize: 'cover',
          backgroundPosition: 'top',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        },
      }),
    },
  });

  useEffect(() => {
    document.title = `GAMR`;
  });

  return (
    <ChakraProvider theme={bgTheme}>
      <Router>
        <Switch>
          <Route path="/recommendations">
            <Recommendations
              tags={tags}
              devs={devs}
              appid={appid}
              setBackgroundImage={handleBackground}
            />
          </Route>
          <Route path="/tags">
            <TagsPage
              handleBackground={handleBackground}
              stateTags={setTags}
              stateDevs={setDevs}
              appid={setAppid}
            />
          </Route>
          <Route path="/">
            <VStack align="center" justify="center">
              <Search
                search={searchTerm}
                setSearchTerm={setSearchTerm}
                activeSearch={activeSearch}
                setActiveSearch={setActiveSearch}
              />
              {searchTerm ? (
                <Text textAlign="right" fontSize="xs">
                  Game not listed? Search by id
                </Text>
              ) : null}
            </VStack>
            {activeSearch ? (
              <SearchResults
                searchTerm={searchTerm}
                setBackgroundImage={setBackgroundImage}
                backgroundImage={backgroundImage}
              />
            ) : null}
          </Route>
        </Switch>
      </Router>
    </ChakraProvider>
  );
}

export default App;
