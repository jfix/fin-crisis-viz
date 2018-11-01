//
// this script generates data for some charts; it then needs to be copied
// and pasted in the Codepens at the appropriate places... this is just a POC!
//
// see Codepens here:
// - Stream graph: https://codepen.io/jfix/full/BqPKyj/
// - Bubble chart: https://codepen.io/jfix/full/jevzQe/
//
const fs = require('fs')
const { timeSeries } = JSON.parse(fs.readFileSync('eco-survey-germany-ids-out.json', 'utf8'))
const colors = ['#000000', '#1b1b1b', '#d40000', '#FFAA1D', '#FFBA00']

const getImportantConcepts = (concept) => (concept[1] >= 2000)
const noEconomicSurveyConcept = (concept) => (concept[0] !== 'economic surveys')

const getConcepts = (series) => {
  const { concepts } = series
  const conceptsAsArrays = Object.entries(concepts)
  return conceptsAsArrays
    .filter(noEconomicSurveyConcept)
    .filter(getImportantConcepts)
    .map(i => i[0])
}

const aggregateOccurrences = concept => {
  return timeSeries.map(series => {
    const { concepts } = series
    return concepts[concept] ? Math.round(concepts[concept]) : 0
  })
}

const constructBubbleData = series => {
  const x = parseInt(series.pubDate.substring(0, 4))
  const localConcepts = series.concepts
  return concepts
    .sort()
    .reverse()
    .filter((concept, y) => localConcepts[concept])
    .map((concept) => {
      return {
        name: concept,
        concept,
        x,
        y: concepts.indexOf(concept),
        z: localConcepts[concept],
        color: colors[concepts.indexOf(concept) % 5],
        fillColor: colors[concepts.indexOf(concept) % 5]
      }
    })
}

const constructDataset = concept => {
  return {
    name: concept,
    data: [0, ...aggregateOccurrences(concept)]
  }
}

// sorted array of all unique concepts
const concepts = [...new Set(timeSeries
  .map(getConcepts)
  .reduce((acc, val) => acc.concat(val)))]
  .sort()

// create the data for a "Stream graph" using Highcharts
const streamGraphData = concepts.map(constructDataset)

// create the data for a "Bubble chart" using Highcharts
const bubbleData = timeSeries
  .map(constructBubbleData)
  .reduce((acc, val) => acc.concat(val), [])
const bubbleLabels = Array.from(new Set(bubbleData
  .map(d => d.concept)
  .sort().reverse()
))

fs.writeFileSync('de-data-streamgraph.json', JSON.stringify(streamGraphData, {}, 2), 'utf8')
fs.writeFileSync('de-data-bubble.json', JSON.stringify([bubbleLabels, bubbleData], {}, 2), 'utf8')
