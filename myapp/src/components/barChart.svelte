<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import moment from 'moment';

  let filteredData = {
    missionsDuringColdWar: [],
    groupedByCountry: {},
  };

  onMount(() => {
    // Load JSON data using D3.js
    d3.json('src/data.json') // Aangepaste pad naar het data.json bestand
      .then((jsonData) => {
        const Missies = jsonData;
        
        // De begin- en einddatums van de Koude Oorlog
        const coldWarStartDate = moment("1945-09-02", "YYYY-MM-DD");
        const coldWarEndDate = moment("1991-12-26", "YYYY-MM-DD");

        // Filter de missies op datums binnen de Koude Oorlog
        filteredData.missionsDuringColdWar = Missies.filter(mission => {
          // Converteer de 'Date' in je dataset naar een moment object
          const missionDate = moment(mission.Date, "ddd MMM DD, YYYY HH:mm UTC");

          // Vergelijk de momenten met de Koude Oorlog begin- en einddatums
          return missionDate.isBetween(coldWarStartDate, coldWarEndDate, null, '[]');
        });

        // Maak een object om landen en hun locaties te groeperen
        filteredData.groupedByCountry = Missies.reduce((acc, mission) => {
          const country = mission.Location.split(', ').pop(); // Verkrijg het land uit de locatie
          if (!acc[country]) {
            acc[country] = []; // Maak een nieuwe array voor het land als deze nog niet bestaat
          }
          acc[country].push(mission.Location); // Voeg de locatie toe aan de array van het land
          return acc;
        }, {});

        console.log(filteredData)

    // Selecteer de SVG om de bar chart te maken
    const svg = d3.select("svg");
    
    // Definieer de dimensies van de chart
    const chartWidth = 700;
    const chartHeight = 300;

    // Creëer een nieuwe SVG groep voor de bars
    const barsGroup = svg.append("g").attr("id", "bars").attr("transform", "translate(90, 0)");

    // Creëer een schaal voor de x-as
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.count)]) // op basis van het aantal missies
      .range([0, chartWidth]);

    // Creëer een schaal voor de y-as
    const yScale = d3.scaleBand()
      .domain(filteredData.map(d => d.location)) // op basis van de locatie
      .range([0, chartHeight])
      .paddingInner(0.1);

    // Voeg de bars toe aan de chart
    barsGroup.selectAll("rect")
      .data(filteredData)
      .join("rect")
      .attr("x", 0)
      .attr("y", d => yScale(d.location))
      .attr("width", d => xScale(d.count))
      .attr("height", yScale.bandwidth())
      .attr("fill", "steelblue"); // Kleur van de bars, kan worden aangepast

    // Voeg de labels toe aan de bars
    barsGroup.selectAll("text")
      .data(filteredData)
      .join("text")
      .attr("x", d => xScale(d.count) + 5)
      .attr("y", d => yScale(d.location) + yScale.bandwidth() / 2)
      .attr("alignment-baseline", "middle")
      .text(d => `${d.location} (${d.count})`); // Tekst, kan worden aangepast

      })
      .catch((error) => {
        // Handel eventuele fouten af die zijn opgetreden bij het laden van het JSON-bestand
        console.error('Fout bij het laden van het JSON-bestand:', error);
      });
  });
</script>

<svg width="800" height="300">
  <g id="bars" transform="translate(90, 0)">
  </g>
  <g id="labels"></g>
</svg>
