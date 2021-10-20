import {
  Container,
  Text,
  Heading,
  useBoolean,
  Flex,
  Image,
  Tag,
  TagLabel,
  Box,
  ButtonGroup,
  Button,
  Divider,
  Link,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import React, { useEffect, useReducer, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import SpinnerLoad from './SpinnerLoad';
const {REACT_APP_SERVER} = process.env

function init(initialCount) {
  return { count: initialCount };
}

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      if (state.count === 0) return { count: state.count };
      return { count: state.count - 1 };
    case 'reset':
      return init(action.payload);
    default:
      throw new Error();
  }
}

function Recommendations(props) {
  const { tags, devs, appid } = props;
  const [games, setGames] = useState();
  const [isLoading, setIsLoading] = useBoolean(true);
  const [state, dispatch] = useReducer(reducer, 0, init);
  const handlers = useSwipeable({
    onSwipedRight: e => dispatch({ type: 'decrement' }),
    onSwipedLeft: e => dispatch({ type: 'increment' }),
    onSwiping: e => {},
    onSwipedDown: e => {},
    trackMouse: true,
    preventDefaultTouchmoveEvent: true,
  });
  const [sortedDevs, setSortedDevs] = useState({
    developer: [],
    publisher: [],
  });

  useEffect(() => {
    devs.forEach(dev => {
      if (dev.includes('dev-')) {
        setSortedDevs(prev => {
          prev['developer'].push(dev.replace('dev-', ''));
          return prev;
        });
      }
      if (dev.includes('pub-')) {
        setSortedDevs(prev => {
          prev['publisher'].push(dev.replace('pub-', ''));
          return prev;
        });
      }
    });
    fetch(`http://${REACT_APP_SERVER}/steam/recc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        Object.assign(sortedDevs, { tags: Object.keys(tags), appid: appid })
      ),
    })
      .then(res => res.json())
      .then(game => {
        setGames(game);
        setIsLoading.off();
      }); // eslint-disable-next-line
  }, [sortedDevs, devs, tags]);

  if (isLoading) return <SpinnerLoad />;
  else if(games.length === 0){
    return(
      <Container>
        <Heading>No results</Heading>
      </Container>
    )
  }
  else {
    return (
      <Container id="game-details" {...handlers}>
        <Flex direction="column">
          <Link
            href={`https://store.steampowered.com/app/${
              games[state.count].appid
            }/`}
            target="_blank"
            isExternal
          >
            <Heading margin="1">
              {games[state.count].name}
              <ExternalLinkIcon mx="2px" />
            </Heading>
          </Link>
          <Image
            src={games[state.count].steam[0].header_image}
            alt={games[state.count].name}
            margin="5"
            style={{ touchAction: 'none' }}
          />
          <Text margin="3">
            {games[state.count].steam[0].short_description}
          </Text>
        </Flex>
        <Box margin="1" style={{ touchAction: 'none' }}>
          {Object.keys(games[state.count].tags).map((tag, i) => {
            return (
              <Tag margin="1">
                <TagLabel>{tag}</TagLabel>
              </Tag>
            );
          })}
        </Box>
        <ButtonGroup isAttached width="100%" marginTop="5" marginBottom="5">
          {state.count === 0 ? (
            <Button
              isDisabled
              onClick={e => {
                dispatch({ type: 'decrement' });
              }}
              isFullWidth
            >
              Previous
            </Button>
          ) : (
            <Button
              onClick={e => {
                dispatch({ type: 'decrement' });
              }}
              isFullWidth
            >
              Previous
            </Button>
          )}
          <Divider orientation="vertical" />
          {state.count === games.length - 1 ? (
            <Button
              isDisabled
              onClick={e => {
                dispatch({ type: 'increment' });
              }}
              isFullWidth
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={e => {
                dispatch({ type: 'increment' });
              }}
              isFullWidth
            >
              Next
            </Button>
          )}
        </ButtonGroup>
      </Container>
    );
  }
}

export default Recommendations;
