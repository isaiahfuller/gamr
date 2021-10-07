import React, { useEffect } from 'react';
import {
  Container,
  useColorMode,
  Text,
  Tag,
  TagLabel,
  Box,
  Button,
  Flex,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';

function GameDetails(props) {
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    props.setBackgroundImage(props.game.steam[0].background);
    if (colorMode === 'light') toggleColorMode();
    return () => {
      props.setBackgroundImage('');
    };
  }, [colorMode, props, toggleColorMode]);

  var tags = Object.keys(props.game.tags);
  function handleClick() {
    // window.location.replace();
  }
  return (
    <Container>
      <Flex className="active-game" direction="column" paddingX="5">
        <Text size="sm" as="i">
          {props.game.developer} • {props.game.publisher}
        </Text>
        <Box>
          <Text padding="3">{props.game.steam[0].short_description}</Text>
        </Box>
      </Flex>
      {tags.map((tag, index) => {
        return (
          <Tag size="sm" margin="1" key={index}>
            <TagLabel>{tag}</TagLabel>
          </Tag>
        );
      })}
      <br />
      <Flex direction="row-reverse">
        <Link to={`/tags?appid=${props.game.appid}`}>
          <Button onClick={handleClick}>Select Game</Button>
        </Link>
      </Flex>
    </Container>
  );
}

export default GameDetails;
