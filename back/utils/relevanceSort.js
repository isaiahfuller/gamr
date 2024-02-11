import _ from "lodash";

function relevanceSort(array, searchTerm) {
    searchTerm = searchTerm.trim();
    let scoreArray = _.filter(array, o => {
      return o.positive + o.negative > 0;
    });
  
    let scoreSortedArray = scoreArray.sort((first, second) => {
      firstScore = first.positive / (first.positive + first.negative);
      secondScore = second.positive / (second.positive + second.negative);
      if (firstScore > secondScore) return -1;
      else if (secondScore > firstScore) return 1;
      else if (firstScore === secondScore) return 0;
    });
  
    let startsWithArray = _.filter(scoreSortedArray, o => {
      return o.name
        .trim()
        .toLowerCase()
        .startsWith(searchTerm.toLowerCase() + ' ');
    });
  
    let nameSortedArray = _.filter(scoreSortedArray, o => {
      return o.name.trim().toLowerCase().startsWith(searchTerm.toLowerCase());
    });
  
    let finalArray = _.uniq(
      _.concat(
        startsWithArray,
        nameSortedArray,
        scoreSortedArray,
        scoreArray,
        array
      )
    );
  
    return finalArray;
}

module.exports = relevanceSort;