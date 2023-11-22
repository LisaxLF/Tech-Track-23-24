<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import moment from 'moment';
  import LabelsAbove from '../components/labels.svelte';
  

  let missiesColdwar = {};
  
  let uniqueCountriesNames = [];
  let lanceringenPerLand = {};
  let selectedFilter = "WholePeriod";

  onMount(async () => {
    try {
      // Laden van missies.json
      const missiesResponse = await fetch('/src/missies.json');
      const missiesData = await missiesResponse.json();

      // Definiëren van de start- en einddatums van de Koude Oorlog
      const coldWarStartDate = moment("1945-09-02", "YYYY-MM-DD");
      const coldWarEndDate = moment("1991-12-26", "YYYY-MM-DD");

      const coldWarPeriod1StartDate = moment("1945-09-02", "YYYY-MM-DD");
      const coldWarPeriod1EndDate = moment("1960-12-31", "YYYY-MM-DD");

      const coldWarPeriod2StartDate = moment("1961-01-01", "YYYY-MM-DD");
      const coldWarPeriod2EndDate = moment("1975-12-31", "YYYY-MM-DD");

      const coldWarPeriod3StartDate = moment("1976-01-01", "YYYY-MM-DD");
      const coldWarPeriod3EndDate = moment("1991-12-31", "YYYY-MM-DD");

      // Buttons voor de verschillende periodes
      const buttonWholePeriod = document.getElementById("WholePeriod");
      const buttonPeriod1 = document.getElementById("Period1");
      const buttonPeriod2 = document.getElementById("Period2");
      const buttonPeriod3 = document.getElementById("Period3");

      // Eventlisteners voor de verschillende periodes
      buttonWholePeriod.addEventListener("click", async function() {
        selectedFilter = "WholePeriod";
        ChoosePeriodFilterMissions(coldWarStartDate, coldWarEndDate);
        ChangeCountLaunchesPeriods();
        getUniqueCountries();
        
        // loggen van de data, om te controleren of het werkt
        console.log(lanceringenPerLand);
        console.log(uniqueCountriesNames);
        console.log(missiesColdwar);
      
        // Bijwerken van de visualisatie met nieuwe gegevens
        updateVisualization(lanceringenPerLand); 
      });

      buttonPeriod1.addEventListener("click", async function() {
      selectedFilter = "Period1";
      ChoosePeriodFilterMissions(coldWarPeriod1StartDate, coldWarPeriod1EndDate);
      ChangeCountLaunchesPeriods();
      getUniqueCountries(); 

      // loggen van de data, om te controleren of het werkt
      console.log(lanceringenPerLand);
      console.log(uniqueCountriesNames);
      console.log(missiesColdwar);

      // Bijwerken van de visualisatie met nieuwe gegevens
      updateVisualization(lanceringenPerLand); 
    });

      buttonPeriod2.addEventListener("click", function() {
      selectedFilter = "Period2";
      ChoosePeriodFilterMissions(coldWarPeriod2StartDate, coldWarPeriod2EndDate);
      ChangeCountLaunchesPeriods();
      getUniqueCountries();

      // loggen van de data, om te controleren of het werkt
      console.log(lanceringenPerLand);
      console.log(uniqueCountriesNames);
      console.log(missiesColdwar);

      // Bijwerken van de visualisatie met nieuwe gegevens
      updateVisualization(lanceringenPerLand); 
    });

      buttonPeriod3.addEventListener("click", function() {
      selectedFilter = "Period3";
      ChoosePeriodFilterMissions(coldWarPeriod3StartDate, coldWarPeriod3EndDate);
      lanceringenPerLand = ChangeCountLaunchesPeriods();
      getUniqueCountries();
      
      // loggen van de data, om te controleren of het werkt
      console.log(lanceringenPerLand);
      console.log(uniqueCountriesNames);
      console.log(missiesColdwar);

      // Bijwerken van de visualisatie met nieuwe gegevens
      updateVisualization(lanceringenPerLand); 
    });
    
    function ChoosePeriodFilterMissions(startDate, endDate) {
      // missiesColdwar-array leeg maken voor nieuwe gegevens
      missiesColdwar = [];
      
      missiesData.forEach(missie => {
        const missionDate = moment(missie.Date, "ddd MMM DD, YYYY HH:mm UTC");
        if (missionDate.isBetween(startDate, endDate, null, '[]')) {
          missiesColdwar.push(missie);
        }
      });
    }

    function ChangeCountLaunchesPeriods() {
      // Maak de lanceringenPerLand-object leeg voordat je nieuwe gegevens toewijst
      lanceringenPerLand = {};

      missiesColdwar.forEach(missie => {
        const landNaam = extractCountryName(missie.Location);
        if (landNaam) {
          lanceringenPerLand[landNaam] = (lanceringenPerLand[landNaam] || 0) + 1;
        }
      });

      return lanceringenPerLand;
    }

    // Functie om alleen de naam van het land uit "Location" te extraheren
    function extractCountryName(location) {
        if (typeof location === 'string' && location.includes(',')) {
          const locationCityParts = location.split(",");
          const CountryPart = locationCityParts[locationCityParts.length - 1].trim();
          return CountryPart;
        } else {
          return location;
        }
    }

    function getUniqueCountries() {
      missiesColdwar.forEach(item => {
      const country = extractCountryName(item.Location);
      if (country && !uniqueCountriesNames.includes(country)) {
        uniqueCountriesNames.push(country);
      }

      return uniqueCountriesNames;
    });
}
    // Functie om de D3-visualisatie te maken
    const width = innerWidth;
    const height = 600;

    const svg = d3.select("#worldmap")
      .attr("width", width)
      .attr("height", height);

    const projection = d3.geoMercator()
      .scale(150)
      .translate([width / 2.5, height / 1.6]);

    const path = d3.geoPath().projection(projection);

    // Laad en toon de wereldkaart
    d3.json("https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson").then(function (data) {
      // Render de kaart
      svg.selectAll("path")
        .data(data.features)
        .enter().append("path")
        .attr("class", "country")
        .attr("fill", "#89ffff33")
        .attr("d", path);
    });

    // Tooltip element
    const tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("background-color", "black")
      .style("color", "white")
      .style("font-family", "Conthrax")
      .style("font-size", "10px")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("opacity", 0);

    // Functie om de D3-visualisatie bij te werken met nieuwe data
    function updateVisualization(missiedata) {
      try {
        d3.json("https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson").then(function (data) {
          // Filter de GeoJSON-gegevens op basis van landen in je dataset
          const filteredData = data.features.filter(feature => {
            return Object.keys(lanceringenPerLand).includes(feature.properties.ADMIN);
          });

          const maxLaunches = d3.max(Object.values(lanceringenPerLand));
          console.log('Max launches:', maxLaunches);

          // Kleurenschaal voor de legenda
          const colorScale = d3.scaleLinear()
            .domain([0, maxLaunches])
            .range(['#3293A8', '#182C72'])

          // Selecteer en stijl de specifieke landen met transitie
          svg.selectAll(".country-marked")
            .data(filteredData)
            .join(
              enter => enter.append("path")
                .attr("class", "country-marked")
                .attr("d", path)
                .attr("fill", function (d) {
                  const countryName = d.properties.ADMIN;
                  const launches = lanceringenPerLand[countryName] || 0;
                  return colorScale(launches);
                })
                .style("stroke", "transparent")
                .on("mouseover", function (event, d) {
                  const countryName = d.properties.ADMIN;
                  const launches = lanceringenPerLand[countryName] || 0;
                  tooltip.style("opacity", 1)
                    .html(`<strong>${countryName}</strong><br>Launches: ${launches}`)

                  // Verandering van de randkleur en -dikte tijdens hover
                  d3.select(this)
                    .style('stroke', 'white')
                    .style('stroke-width', '1px');
                })
                .on("mousemove", function (event) {
                  tooltip.style("left", event.pageX + 15 + "px")
                    .style("top", event.pageY + 15 + "px");
                })
                .on("mouseout", function () {
                  tooltip.style("opacity", 0);

                  // Zet de oorspronkelijke randkleur en -dikte terug
                  d3.select(this)
                    .style('stroke', 'transparent')
                })
                .style("fill", "rgba(137, 255, 255, 0)") // startkleur
                .transition()
                .duration(750)
                .style("fill", function (d) {
                  const countryName = d.properties.ADMIN;
                  const launches = lanceringenPerLand[countryName] || 0;
                  return colorScale(launches);
                }),
              update => update // Hier kan ik transitie toevoegen als ik de visualisatie wil bijwerken
                .transition()
                .duration(250) // Duur van de overgang in milliseconden
                .style("fill", function (d) {
                  const countryName = d.properties.ADMIN;
                  const launches = lanceringenPerLand[countryName] || 0;
                  return colorScale(launches);
                })
            );
        });
      } catch (error) {
        console.error('Fout bij het bijwerken van de visualisatie:', error);
      }
    }

    } catch (error) {
      console.error('Fout bij het laden of verwerken van de data:', error);
    }
  });
</script>

<svg id="worldmap"></svg>
<fieldset class="filtering">
  <legend>FILTER THROUGH TIME</legend>
  <div id="buttonHolder">
    <input type="button" id="WholePeriod" value="WholePeriod" checked/>
    <input type="button" id="Period1" value="Period1"/>
    <input type="button" id="Period2" value="Period2"/>
    <input type="button" id="Period3" value="Period3"/>
  </div>
</fieldset>

<style>
    input[type="radio"] {
      margin-right: 1em;
      margin: 0;
      background: linear-gradient(90deg, rgba(137, 255, 255, 0.218) 0%, rgba(255, 255, 255, 0.234) 60%);
      border-radius: 25px;
      border: 1px solid rgba(137, 255, 255, 0.153);
      width: 1.5em;
    }

    legend{
      font-family: 'Sutherla';
      font-size: 1.5em;
      color: white;
      margin-bottom: .1em;
      letter-spacing: .1em;
    }
    
    fieldset {
      padding: 1em 1em;
      font-family: "Conthrax";
      border-radius: 1em;
      width: fit-content;
    }

    label {
      color: white;
      margin-left: .1em;
      font-family: 'Conthrax';
      font-size: .8em;
    }

    input[type="button"] {
      padding: 12px 16px;
      font-size: 12px;
      font-family: 'Conthrax', sans-serif;
      cursor: pointer;
      color: white;
      border-radius: 25px;
      background: linear-gradient(142deg, rgba(137, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 80%);
      border: 1px solid #ffffff29;
      margin-bottom: 1em;
      margin-right: .5em;
    }

    input[type="button"]:hover {
      background: rgba(137, 255, 255, 0.408);
      transition: 100ms linear;
    }
</style>
