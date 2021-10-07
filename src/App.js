import { React, useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import {
  extendTheme,
  useBoolean,
  Alert,
  AlertIcon,
  AlertDescription,
  AlertTitle,
  Text,
  VStack,
  useColorMode,
} from '@chakra-ui/react';
import Search from './components/Search';
import SearchResults from './components/SearchResults';
import { ChakraProvider } from '@chakra-ui/react';
import TagsPage from './components/TagsPage';
import Recommendations from './components/Recommendations';

function App() {
  const [searchTerm, setSearchTerm] = useState();
  const [backgroundImage, setBackgroundImage] = useState('');
  const [activeSearch, setActiveSearch] = useBoolean(false);
  const [backendStatus, setBackendStatus] = useState('working');
  const [tags, setTags] = useState();
  const [devs, setDevs] = useState();
  const [appid, setAppid] = useState();
  const { colorMode, toggleColorMode } = useColorMode();

  function handleBackground(img) {
    setBackgroundImage(img);
    if (colorMode === 'light') toggleColorMode();
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
  }, [searchTerm]);

  useEffect(() => {
    fetch(`http://${window.location.hostname}:3001/api/status`)
      .then(res => res.json())
      .then(status => {
        switch (status) {
          case 'updating':
            setBackendStatus('updating');
            break;
          case 'working':
            setBackendStatus('working');
            break;
          default:
            break;
        }
      });
  });

  return (
    <Router>
      <ChakraProvider theme={bgTheme}>
        <Switch>
          <Route path="/recommendations">
            <Recommendations tags={tags} devs={devs} appid={appid} />
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
            {backendStatus === 'working' ? (
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
            ) : (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle>Offline</AlertTitle>
                <AlertDescription>Updating game database</AlertDescription>
              </Alert>
            )}
            {activeSearch ? (
              <SearchResults
                searchTerm={searchTerm}
                setBackgroundImage={setBackgroundImage}
                backgroundImage={backgroundImage}
              />
            ) : null}
          </Route>
        </Switch>
      </ChakraProvider>
    </Router>
  );
}

export default App;
