import React, { useEffect, useState } from 'react';
import {
  Container,
  Text,
  useBoolean,
  Accordion,
  AccordionButton,
  AccordionPanel,
  AccordionItem,
  Collapse,
  CircularProgress,
  CircularProgressLabel,
  HStack,
} from '@chakra-ui/react';
import GameDetails from './GameDetails';
import fetch from 'node-fetch';
import SpinnerLoad from './SpinnerLoad';
const { REACT_APP_SERVER } = process.env;

function SearchResults(props) {
  const [loading, setLoading] = useBoolean(true);
  const [resultsData, setResultsData] = useState([]);

  const wordFilter = word => {
    return word.replace(/\./g, '．').replace(/\$/g, '＄').replace(/\//g, '%2F');
  };

  useEffect(() => {
    if (resultsData.length === 0) {
      if (props.searchTerm.startsWith('appid:')) {
        let appid = props.searchTerm.split(':')[1];
        window.location.href = `tags?appid=${appid}&direct`;
      } else {
        if (props.searchTerm === '') setLoading.off();
        else
          fetch(
            `http://${REACT_APP_SERVER}/steam/name/${wordFilter(
              props.searchTerm
            )}`
          )
            .then(res => res.json())
            .then(games => {
              let gameString = JSON.stringify(games)
                .replace(/．/g, '.')
                .replace(/＄/g, '$');
              setResultsData(JSON.parse(gameString));
              setLoading.off();
            })
            .catch(console.error);
      }
    }
  }, [props.searchTerm, setLoading, resultsData]);

  function scoreColor(reviewScore) {
    switch (true) {
      case reviewScore < 0:
        return 'gray.500';
      case reviewScore <= 35:
        return 'red.500';
      case reviewScore <= 50:
        return 'orange.400';
      case reviewScore <= 70:
        return 'yellow.500';
      case reviewScore <= 80:
        return 'green.500';
      case reviewScore <= 100:
        return 'green.700';
      default:
        return 'gray.500';
    }
  }
  function reviewScore(positive, negative) {
    if (positive + negative === 0) return -1;
    return (positive / (positive + negative)) * 100;
  }
  function progressLabel(score) {
    if (score === -1) return 'None';
    return `${Math.ceil(score)}%`;
  }

  if (loading) {
    return <SpinnerLoad />;
  } else {
    return (
      <Collapse in={!loading} reverse>
        <Container maxWidth="70ch">
          <Accordion className="game-list" allowToggle>
            {resultsData.map(game => {
              return (
                <AccordionItem key={game.appid}>
                  {({ isExpanded }) => (
                    <>
                      <AccordionButton>
                        <HStack>
                          <CircularProgress
                            align="right"
                            value={reviewScore(game.positive, game.negative)}
                            color={scoreColor(
                              reviewScore(game.positive, game.negative)
                            )}
                            isIndeterminate={
                              game.positive + game.negative === 0
                            }
                          >
                            <CircularProgressLabel>
                              {progressLabel(
                                reviewScore(game.positive, game.negative)
                              )}
                            </CircularProgressLabel>
                          </CircularProgress>
                          <Text>{game.name}</Text>
                        </HStack>
                      </AccordionButton>
                      <AccordionPanel>
                        {isExpanded ? (
                          <GameDetails
                            game={game}
                            setBackgroundImage={props.setBackgroundImage}
                            backgroundImage={props.backgroundImage}
                          />
                        ) : (
                          ''
                        )}
                      </AccordionPanel>
                    </>
                  )}
                </AccordionItem>
              );
            })}
          </Accordion>
        </Container>
      </Collapse>
    );
    // }
  }
}

export default SearchResults;
