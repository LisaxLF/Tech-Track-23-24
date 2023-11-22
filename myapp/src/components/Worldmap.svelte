<script>
import { onMount } from 'svelte';
import * as d3 from 'd3';
import moment from 'moment';

let allData = {};
let launchesByCountry = {};

onMount(() => {
    // Load JSON data using D3.js
    d3.json('src/data.json') // Adjust the path to your data.json file
    .then((jsonData) => {
      const missions = jsonData;
      
      // The start and end dates of the Cold War
      const coldWarStartDate = moment("1945-09-02", "YYYY-MM-DD");
      const coldWarEndDate = moment("1991-12-26", "YYYY-MM-DD");

      // Filter the data based on the start and end dates of the Cold War
      allData = missions.filter(mission => {
        const missionDate = moment(mission.Date, "ddd MMM DD, YYYY HH:mm UTC");
        return missionDate.isBetween(coldWarStartDate, coldWarEndDate, null, '[]');
      });

      // Used functions for transforming and filtering data //

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
            
      // ALL THE LOOPS //

      // Loop om gegevens te verwerken en het aantal lanceringen per land te tellen
      allData.forEach(item => {
        const country = extractCountryName(item.Location);
        launchesByCountry[country] = (launchesByCountry[country] || 0) + 1;
      });

      // Sorteren van de landen op basis van het aantal lanceringen
      let sortedLaunchesByCountry = Object.entries(launchesByCountry);
      sortedLaunchesByCountry.sort((a, b) => b[1] - a[1]);

      // Het land met de meeste lanceringen
      const maxLaunchesNew = d3.max(sortedLaunchesByCountry, d => d[1]);

      // ALL THE D3 VISUALISATIONS //
     // Create SVG element
      const chartWidth = 700;
      const chartHeight = 250;

      const svg = d3.select("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight);

      // Create scales
      const xScale = d3.scaleLinear()
        .domain([0, maxLaunchesNew])
        .range([0, chartWidth - 90]); // 90 due to the translate offset

      const yScale = d3.scaleBand()
        .domain(sortedLaunchesByCountry.map(d => d[0]))
        .range([0, chartHeight])
        .paddingInner(0.1);

      const colorScaleLinear = d3
        .scaleLinear()
        .domain([0, maxLaunchesNew])
        .range(['#BCD1D1', '#0FAFAF']);


      // Create d3 visualisation bars based on data
      const bars = d3.select("#bars")
        .selectAll("g")
        .data(sortedLaunchesByCountry)
        .join("g");

      bars.append("rect")
        .attr('fill', d => colorScaleLinear(d[1]))
        .attr("y", (d, i) => yScale(d[0]))
        .attr("width", d => xScale(d[1]))
        .attr("height", yScale.bandwidth());

      bars.append("text")
        .attr("fill", "white")
        .attr("text-anchor", "start")
        .attr("dominant-baseline", "middle")
        .style("font-family", "Conthrax")
        .style("font-size", "10px")
        .style("font-weight", "thin")
        .attr("x", d => xScale(d[1]) + 5)
        .attr("y", (d, i) => yScale(d[0]) + yScale.bandwidth() / 2)
        .text(d => d[1]); // Toon het aantal lanceringen

      // Voeg labels toe aan de y-as voor landen
      d3.select("#labels")
        .selectAll("text")
        .data(sortedLaunchesByCountry)
        .enter()
        .append("text")
        .attr("y", (d, i) => yScale(d[0]) + yScale.bandwidth() / 2)
        .text(d => d[0]); // Toon de landen

      // Voeg een as toe onderaan voor de aantallen lanceringen
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
  <g id="bars" transform="translate(90, 0)"></g>
  <g id="labels"></g>
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