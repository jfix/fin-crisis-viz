/* global $ Chart vis moment google */
let concepts = []
let countries = []
let timeSeries = []

let conceptLabels = []
let conceptData = []
let timelineData = []
let timeline // the actual timeline object
let conceptChart // the actual concept bar chart

const itemTemplate = (i) => {
  return `
    <div class='eventWrapper'>
      <div style='font-weight: strong;'>${i.title}</div>
      <a target='_blank' href='https://doi.org/${i.doi}' border='0'><img src='https://assets.oecdcode.org/covers/80/10.1787/${i.doi.split('/')[1]}.jpg'/></a>
      <br/>
      <ul>
      ${i.concepts.map((c) => ('<li>' + c + '</li>')).join('')}
      </ul>
    </div>
    `
}

const eventSelect = (props) => {
  const id = props.items[0]
  const obj = timeSeries.find((o) => {
    return o.id === id
  })
  console.log(`OBJ: ${JSON.stringify(obj.concepts)}`)

  const indexes = []
  obj.concepts.forEach((c) => {
    const index = conceptChart.data.labels.indexOf(c)
    if (index >= 0) {
      indexes.push(index)
    }
  })
  const backgroundColor = []
  conceptChart.data.labels.forEach((e, i) => {
    if (indexes.indexOf(i) >= 0) {
      backgroundColor[i] = 'orange'
    } else {
      backgroundColor[i] = '#007bff'
    }
  })
  conceptChart.data.datasets[0].backgroundColor = backgroundColor
  conceptChart.update()
}

const dataInit = () => {
  conceptLabels = concepts.map((i) => Object.keys(i)[0])
  conceptData = concepts.map((i) => Object.values(i)[0])
  timelineData = timeSeries.map((i) => ({
    id: i.id,
    start: i.pubDate,
    content: itemTemplate(i)
  }))
}

const drawTimeline = () => {
  const items = new vis.DataSet(timelineData)

  const container = document.getElementById('timeline')
  const options = {
    clickToUse: false,
    horizontalScroll: true,
    moveable: true,
    type: 'box',
    min: new Date('1965-01-01'), // arbitrary date
    max: new Date('2020-01-01'), // arbitrary date
    height: 500,
    maxHeight: 400,
    stack: false,
    start: moment().clone().add(-6, 'months'),
    end: moment().clone().add(1, 'days'),
    zoomMin: 1000 * 60 * 60 * 24 * 7 // one week in milliseconds
    // zoomMax: 1000 * 60 * 60 * 24 * 31 * 3 // about three months in milliseconds
  }
  timeline = new vis.Timeline(container, items, options)
  timeline.on('select', eventSelect)
}

const drawConceptChart = () => {
  // CHART STUFF
  const ctx = document.getElementById('conceptFrequencies')
  conceptChart = new Chart(ctx, {
    type: 'horizontalBar',
    data: {
      labels: conceptLabels,
      datasets: [{
        label: 'times a concepts has been mentioned',
        data: conceptData,
        lineTension: 0,
        backgroundColor: '#007bff',
        borderColor: '#007bff',
        borderWidth: 0,
        pointBackgroundColor: '#007bff'
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: false
          }
        }]
      },
      legend: {
        display: false
      }
    }
  })
}

const drawCountryChart = () => {
  google.charts.load('current', {
    'packages': ['geochart'],
    // Note: you will need to get a mapsApiKey for your project.
    // See: https://developers.google.com/chart/interactive/docs/basic_load_libs#load-settings
    'mapsApiKey': 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'
  })
  google.charts.setOnLoadCallback(drawRegionsMap)

  const countryArray = countries.map((o) => {
    return [Object.keys(o)[0], Object.values(o)[0]]
  })
  countryArray.unshift(['Country', 'Mentioned'])
  function drawRegionsMap () {
    var data = google.visualization.arrayToDataTable(countryArray)

    var options = {}
    var chart = new google.visualization.GeoChart(document.getElementById('countryOccurrences'))
    chart.draw(data, options)
  }
}

$(document).ready(function () {
  $.getJSON('data/data.json', (d) => {
    concepts = d.overallConcepts
    countries = d.overallCountries
    timeSeries = d.timeSeries
    dataInit()
    drawTimeline()
    drawConceptChart()
    drawCountryChart()
  })
})
