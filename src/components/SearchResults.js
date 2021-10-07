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

function SearchResults(props) {
  const [loading, setLoading] = useBoolean(true);
  const [resultsData, setResultsData] = useState([]);

  const wordFilter = word => {
    return word.replace(/\./g, '．').replace(/\$/g, '＄').replace(/\//g, '%2F');
  };

  useEffect(() => {
    if (resultsData.length === 0) {
      if (props.searchTerm.startsWith('appid:')) {
        let term = props.searchTerm.substr(6);
        fetch(`http://${window.location.hostname}:3001/steam/appid/${term}`)
          .then(res => res.json())
          .then(game => {
            setResultsData([game]);
            setLoading.off();
          })
          .catch(console.error);
      } else {
        fetch(
          `http://${window.location.hostname}:3001/steam/name/${wordFilter(
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
    return (
      <SpinnerLoad />
    );
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
