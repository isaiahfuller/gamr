import {
  Container,
  Image,
  Flex,
  useBoolean,
  Tag,
  TagLabel,
  TagLeftIcon,
  Heading,
  Box,
  Divider,
  Button,
  Checkbox,
  Stack,
} from '@chakra-ui/react';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';
import fetch from 'node-fetch';
import { React, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SpinnerLoad from './SpinnerLoad';
const { REACT_APP_SERVER } = process.env;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function TagsPage(props) {
  const { handleBackground, stateTags, stateDevs, appid } = props;
  let query = useQuery();
  const [gameDetails, setGameDetails] = useState({});
  const [activeTags, setActiveTags] = useState({});
  const [inactiveTags, setInactiveTags] = useState({});
  const [isLoading, setIsLoading] = useBoolean(true);
  const [tagsSet, setTagsSet] = useBoolean(false);
  const [activeDevs, setActiveDevs] = useState([]);
  const url = `http://${REACT_APP_SERVER}/steam/appid/${query.get('appid')}`;

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(res => {
        setGameDetails(res._doc);
        setInactiveTags(res._doc.tags);
        setIsLoading.off();
        handleBackground(res._doc.steam[0].background);
      }); //eslint-disable-next-line
  }, [url]);

  function tagList(tags, firstSet, secondSet, icon) {
    return (
      <Box>
        {Object.keys(tags).map((tag, index) => {
          const handleTagClick = e => {
            firstSet(prev => {
              prev[`${tag}`] = tags[`${tag}`];
              return prev;
            });
            secondSet(prev => {
              const { [tag]: removed, ...tempArray } = prev;
              return tempArray;
            });
          };
          return (
            <Tag
              onClick={handleTagClick}
              className="game-tag"
              margin="1"
              variant={icon ? 'subtle' : 'solid'}
              colorScheme={icon ? 'gray' : 'green'}
              size={icon ? 'md' : 'lg'}
            >
              <TagLeftIcon as={icon ? AddIcon : CloseIcon} />
              <TagLabel>{tag}</TagLabel>
            </Tag>
          );
        })}
      </Box>
    );
  }

  if (tagsSet) {
    const handleButtonClick = () => {
      appid(gameDetails.appid);
      stateDevs(activeDevs);
    };
    const handleCheckbox = e => {
      if (e.target.checked)
        setActiveDevs(prev => {
          prev.push(e.target.value);
          return prev;
        });
      else
        setActiveDevs(prev => {
          prev.splice(prev.indexOf(e.target.value), 1);
          return prev;
        });
    };
    return (
      <Container id="game-details">
        <Flex direction="column">
          <Heading>Are the developers and/or publishers important?</Heading>
          <Image
            src={gameDetails.steam[0].header_image}
            alt={gameDetails.name}
            margin="5"
          />
        </Flex>
        <Stack margin="5">
          {gameDetails.steam[0].developers.map((dev, i) => {
            return (
              <Checkbox value={`dev-${dev}`} onChange={handleCheckbox}>
                {dev}
              </Checkbox>
            );
          })}
        </Stack>
        <Divider marginBottom="5" marginTop="5" />
        <Stack margin="5">
          {gameDetails.steam[0].publishers.map((dev, i) => {
            return (
              <Checkbox value={`pub-${dev}`} onChange={handleCheckbox}>
                {dev}
              </Checkbox>
            );
          })}
        </Stack>
        <Flex direction="row-reverse" margin="1">
          <Link to="/recommendations">
            <Button onClick={handleButtonClick}>Continue</Button>
          </Link>
        </Flex>
      </Container>
    );
  } else if (!isLoading) {
    const handleButtonClick = () => {
      setTagsSet.on();
      stateTags(activeTags);
    };
    return (
      <Container id="game-details">
        <Flex direction="column">
          <Heading>Which tags are important to you?</Heading>
          <Image
            src={gameDetails.steam[0].header_image}
            alt={gameDetails.name}
            margin="5"
          />
        </Flex>
        {tagList(activeTags, setInactiveTags, setActiveTags, false)}
        {Object.keys(activeTags).length && Object.keys(inactiveTags).length ? (
          <Divider />
        ) : null}
        {tagList(inactiveTags, setActiveTags, setInactiveTags, true)}
        {Object.keys(activeTags).length > 0 ? (
          <Flex direction="row-reverse" margin="1">
            <Button onClick={handleButtonClick}>Continue</Button>
          </Flex>
        ) : null}
      </Container>
    );
  } else {
    return <SpinnerLoad />;
  }
}

export default TagsPage;
