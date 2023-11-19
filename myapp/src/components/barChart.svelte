<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import moment from 'moment';

  let allData = {};
  let totalCosts = 0;
  const launchesByCountry = {};
  const costsByCountry = {};

const USSR = [
  "Russia",
  "Ukraine",
  "Belarus",
  "Kazakhstan",
  "Uzbekistan",
  "Azerbaijan",
  "Georgia",
  "Lithuania",
  "Moldova",
  "Latvia",
  "Kyrgyzstan",
  "Armenia",
  "Turkmenistan",
  "Estonia",
  "Tajikistan"
];

const NAVO = [
  "USA",
  "Canada",
  "United Kingdom",
  "France",
  "Germany",
  "Italy",
  "Netherlands",
  "Belgium",
  "Luxembourg",
  "Denmark",
  "Norway",
  "Portugal",
  "Greece",
  "Turkey",
  "Iceland"
];

  onMount(() => {
    // Load JSON data using D3.js
    d3.json('src/data.json') // Adjust the path to your data.json file
    .then((jsonData) => {
      const missions = jsonData;
      
      // The start and end dates of the Cold War
      const coldWarStartDate = moment("1945-09-02", "YYYY-MM-DD");
      const coldWarEndDate = moment("1991-12-26", "YYYY-MM-DD");

      allData = missions.filter(mission => {
        const missionDate = moment(mission.Date, "ddd MMM DD, YYYY HH:mm UTC");
        return missionDate.isBetween(coldWarStartDate, coldWarEndDate, null, '[]');
      });
      
      // Used functions for transforming and filtering data

      // Function to sort countries based on NAVO, USSR or Non participants
      function findCountryByRightTeam(location) {
        if (NAVO.some(country => location.includes(country))) {
          return 'NAVO';
        } else if (USSR.some(country => location.includes(country))) {
          return 'USSR';
        } else {
          return 'Not a participant';
        }
      }

      // Function to convert string to number for costs
      function transformCosts(costs) {
        if (typeof costs === 'string') {
          return 0; // sommige costs hebben een string, die wil ik returnen als 0
        } else {
          return costs; // Als het al een getal is, return het al bestaande getal in
        }
      }

      // Function to extract only the country name from "Location"
      function extractCountryName(location) {
        // als de locatie een string en komma's bevat
        if (typeof location === 'string' && location.includes(',')) {
          // dan splitten we alles in een array waarin kommas staan
          const locationParts = location.split(",");
          // Dan willen we van location part de hoeveelheid items weten, om vervolgens de laatste te behouden en de andere te verwijderen en deze geven we return
          return locationParts[locationParts.length - 1].trim();
        } else {
          return location; // Return the original location if unable to split
        }
      }

      allData.forEach(item => {
        const country = extractCountryName(item.Location);
        const assignedTeam = findCountryByRightTeam(item.Location);
        item.AssignedTeam = assignedTeam;
      });


      allData.forEach(item => {
        item.Costs = transformCosts(item.Costs);
      });

      // This loops trough data to count for every country each missions
      allData.forEach(item => {
        // Nieuwe variabele van de nieuwe getransformeerde landen
        const country = extractCountryName(item.Location);
        
        // Nieuwe variabele van de nieuwe getransformeerde landen
        launchesByCountry[country] = (launchesByCountry[country] || 0) + 1;

        // costsByCountry[country] = (costsByCountry[country] || 0) + data.Costs;


      });

      console.log(launchesByCountry);

      allData.forEach(item => {
        // Convert the cost to a number if it's a string and add it to the totalCosts
        totalCosts += transformCosts(item.Costs);
      });


      // Launches

      // d3 data visualisations
      const chartWidth = 700;
      const chartHeight = 250;

      const uniqueCountries = Array.from(new Set(allData.map(data => extractCountryName(data.Location))));
      console.log(uniqueCountries);
      
      const launches = Object.values(launchesByCountry);
      const maxLaunches = d3.max(Object.values(launchesByCountry));

      // Create SVG element
      const svg = d3.select("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight);

      // Create scales
      const xScale = d3.scaleLinear()
        .domain([0, maxLaunches])
        .range([0, chartWidth - 90]); // 90 due to the translate offset

      const yScale = d3.scaleBand()
        .domain(uniqueCountries)
        .range([0, chartHeight])
        .paddingInner(0.1);

      // Create d3 visualisation bars based on data
      const bars = d3.select("#bars")
        .selectAll("g")
        .data(launches)
        .join("g");

      bars.selectAll("rect")
        .data(Object.values(launchesByCountry))
        .enter()
        .append("rect")
        .attr('fill', '#89FFFF')
        .attr("y", (d, i) => yScale(uniqueCountries[i]))
        .attr("width", d => xScale(d))
        .attr("height", yScale.bandwidth());

      bars.selectAll("text")
      .data(Object.values(launchesByCountry))
        .enter()
        .append("text")
        .attr("fill", "white")
        .attr("text-anchor", "start")
        .attr("dominant-baseline", "middle")
        .style("font-family", "Conthrax")
        .style("font-size", "10px")
        .style("font-weight", "thin")
        .attr("x", d => xScale(d) + 5)
        .attr("y", (d, i) => yScale(uniqueCountries[i]) + yScale.bandwidth() / 2)
        .text(d => d);

      d3.select("#labels")
        .selectAll("text")
        .data(uniqueCountries)
        .enter()
        .append("text")
        .attr("y", (d, i) => yScale(d) + yScale.bandwidth() / 2)
        .text(d => d);

      const axisBottom = d3.axisBottom(xScale);
      d3.select("#axis1").call(axisBottom);



      })
      .catch((error) => {
        // Handel eventuele fouten af die zijn opgetreden bij het laden van het JSON-bestand
        console.error('Fout bij het laden van het JSON-bestand:', error);
      });
  });
</script>

<svg>
  <g id="bars" transform="translate(90, 0)">
  </g>
  <g id="labels"></g>
  <!-- <g id="axis1" transform="translate(90)"></g> -->
</svg>


<style>
  text, p {
    font-family: sans-serif;
    color: white; 
    dominant-baseline: middle;
    }
  
  svg {
    width: 100%;
  }


  text {
      fill: white;
      alignment-baseline: center;
      text-anchor: end;
  }

  text, #labels {
    font-family:"Conthrax";
    font-size: 10px;
    fill: white;
  }

</style>