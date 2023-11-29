<script>
  import { onMount } from 'svelte';

  import * as d3 from 'd3';
  import moment from 'moment';
  import gsap from 'gsap';

  let missiesColdwar = {};
  let rockets = {};
  let lanceringenPerLand = {};
  let USAmissions = [];

  onMount(async () => {
    try {
      // Laden van missies.json
      const missiesResponse = await fetch('/data/missies.json');
      const missiesData = await missiesResponse.json();

      // Definiëren van de start- en einddatums van de Koude Oorlog
      const coldWarStartDate = moment("1945-09-02", "YYYY-MM-DD");
      const coldWarEndDate = moment("1991-12-26", "YYYY-MM-DD");

      // Definiëren van de start- en einddatums van de verschillende perioden van de Koude Oorlog
      const coldWarPeriod1StartDate = moment("1945-09-02", "YYYY-MM-DD");
      const coldWarPeriod1EndDate = moment("1960-12-31", "YYYY-MM-DD");

      const coldWarPeriod2StartDate = moment("1961-01-01", "YYYY-MM-DD");
      const coldWarPeriod2EndDate = moment("1975-12-31", "YYYY-MM-DD");

      const coldWarPeriod3StartDate = moment("1976-01-01", "YYYY-MM-DD");
      const coldWarPeriod3EndDate = moment("1991-12-31", "YYYY-MM-DD");

      const buttonWholePeriod = document.getElementById("WholePeriod");
      const buttonPeriod1 = document.getElementById("Period1");
      const buttonPeriod2 = document.getElementById("Period2");
      const buttonPeriod3 = document.getElementById("Period3");

      buttonWholePeriod.addEventListener("click", async function () {
        await UpdatePeriodAndCountLaunches(coldWarStartDate, coldWarEndDate);
      });

      buttonPeriod1.addEventListener("click", async function () {
        await UpdatePeriodAndCountLaunches(coldWarPeriod1StartDate, coldWarPeriod1EndDate);
      });

      buttonPeriod2.addEventListener("click", async function () {
        await UpdatePeriodAndCountLaunches(coldWarPeriod2StartDate, coldWarPeriod2EndDate);
      });

      buttonPeriod3.addEventListener("click", async function () {
        await UpdatePeriodAndCountLaunches(coldWarPeriod3StartDate, coldWarPeriod3EndDate);
      });

      async function UpdatePeriodAndCountLaunches(startDate, endDate) {
        await ChoosePeriodFilterMissions(startDate, endDate);
        ChangeCountLaunchesPeriods();
        console.log(lanceringenPerLand);
        console.log(missiesColdwar);
        updateVisualization(lanceringenPerLand);
      }

      function ChoosePeriodFilterMissions(startDate, endDate) {
        missiesColdwar = [];

        missiesData.forEach(missie => {
          const missionDate = moment(missie.Date, "ddd MMM DD, YYYY HH:mm UTC");
          if (
            (missionDate.isBetween(startDate, endDate, null, '[]')) || // Dit controleert de periode tussen startDate en endDate
            (missionDate.isSameOrAfter(startDate) && missionDate.isSameOrBefore(endDate)) // Dit controleert of de datum binnen de opgegeven periode ligt
          ) {
            missiesColdwar.push(missie);
          }
        });
      }

      function ChangeCountLaunchesPeriods() {
        lanceringenPerLand = {};

        missiesColdwar.forEach(missie => {
          const landNaam = extractCountryName(missie.Location);
          if (landNaam) {
            lanceringenPerLand[landNaam] = (lanceringenPerLand[landNaam] || 0) + 1;
          }
        });

        return lanceringenPerLand;
      }

      function extractCountryName(location) {
        if (typeof location === 'string' && location.includes(',')) {
          const locationParts = location.split(",");
          const CountryPart = locationParts[locationParts.length - 1].trim();
          return CountryPart;
        } else {
          return location;
        }
      }

      // Functie om de missies van de Verenigde Staten te filteren
      missiesData.forEach(missie => {
        const missionDate = moment(missie.Date, "ddd MMM DD, YYYY HH:mm UTC");
        if (missionDate.isBetween(coldWarStartDate, coldWarEndDate, null, '[]')) {
          if (missie.Location.includes("United States of America")) {
            USAmissions.push(missie);
          }
        }
      });

      console.log("Alle missies van de Verenigde Staten:", USAmissions);


      USAmissions.forEach(missie => {
        rockets[missie.RocketName] = (rockets[missie.RocketName] || 0) + 1;
      });

      console.log("Alle raketten van de Verenigde Staten:", rockets);

      let rocketsNamesFirstWord = Object.keys(rockets).map(rocketName => {
        const rocketNameParts = rocketName.split(/[\s|-]/);
        return rocketNameParts[0].trim();
      });

      const rocketsFirstWord = {};
      rocketsNamesFirstWord.forEach(rocketName => {
        rocketsFirstWord[rocketName] = (rocketsFirstWord[rocketName] || 0) + 1;
      });

      console.log("Alle raketten van de Verenigde Staten met alleen het eerste woord:", rocketsNamesFirstWord);
      console.log("Alle raketten van de Verenigde Staten met alleen het eerste woord en hoe vaak ze voorkomen:", rocketsFirstWord);

      const titanLaunches = rocketsFirstWord["Titan"] || 0;
      const atlasLaunches = rocketsFirstWord["Atlas"] || 0;

      console.log("Titan-lanceringen:", titanLaunches);
      console.log("Atlas-lanceringen:", atlasLaunches);

      const titanLaunchesSpan = document.getElementById("titanLaunches");
      const atlasLaunchesSpan = document.getElementById("atlasLaunches");

      titanLaunchesSpan.innerHTML = titanLaunches;
      atlasLaunchesSpan.innerHTML = atlasLaunches;
    
      // Eerst de breedte en hoogte instellen
      let width = 800;
      let height = 400;

      // Creëer het SVG-element
      const svg = d3.select("#worldmap")
        .attr("width", width)
        .attr("height", height);

      // Definieer de projectie zonder schaal of translatie
      const projection = d3.geoMercator();

      // Creëer het pad met de projectie
      const path = d3.geoPath().projection(projection);

      // Controleer de schermgrootte en pas de projectieschaal aan
      if (window.innerWidth < 500) {
        width = window.innerWidth;
        height = width / 2;
        projection.scale(60);
        projection.translate([width / 2.5, height / 1]);
      } else {
        projection.scale(140);
        projection.translate([width / 2.5, height / 1.6]);
      }

      // Laad en toon de wereldkaart
      d3.json("https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson").then(function (data) {
        // Render de kaart
        svg.selectAll("path")
          .data(data.features)
          .enter()
          .append("path")
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
        .style("opacity", 0)
        .style("user-select", "none")
        .style("z-index", 10);
      
      // Functie om de D3-visualisatie bij te werken met nieuwe data
      function updateVisualization(missiedata) {
        try {
          d3.json("https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson").then(function (data) {
          // Filter de GeoJSON-gegevens op basis van landen in je dataset
          const filteredData = data.features.filter(feature => {
            return Object.keys(lanceringenPerLand).includes(feature.properties.NAME)
          });

          // Log de eigenschappen van elk land in de gefilterde data
          filteredData.forEach(land => {
            console.log('Landnaam:', land.properties.ADMIN);
            // Hier kun je andere eigenschappen van het land loggen indien nodig
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
                  .on("click", function (event, d) {
                      if (d.properties.ADMIN === "United States of America") {
                        console.log("Het werkt, het is de USA");

                        // informatie van de USA
                        const infoUSAElem = document.querySelector(".InformationUSA");
                        const terugKnop = document.getElementById('terugKnop');
                        const Rocketinfo = document.querySelector(".rockets");

                        const timeline = gsap.timeline();
                        
                        // rakketten van de USA
                        const titan = document.getElementById("titan");
                        const atlas = document.getElementById("atlas");

                        const tl = gsap.timeline({ repeat: -1 });

                        // Toon de informatie van de Verenigde Staten
                        timeline
                          .set(infoUSAElem, { opacity: 1, zIndex: 10 })
                          .from(infoUSAElem.querySelector("h2"), { duration: 1.5, x: "-100%", opacity: 1, ease: "power2.out" }, "-=0.3")
                          .from(infoUSAElem.querySelector("p"), { duration: 1.5, y: "-100%", opacity: 1, ease: "power2.out" }, "-=1.7")
                          .from(infoUSAElem.querySelector(".rockets"), { duration: 2, x: "200%", opacity: 1, ease: "power2.out" }, "-=2")
                          .from(infoUSAElem.querySelector(".infoContent"), { duration: 1.5, y: "100%", opacity: 1, ease: "power2.out" }, "-=1.7")
                          .from(infoUSAElem.querySelector(".CardsHolder"), { duration: 1.5, y: "100%", opacity: 1, ease: "power2.out" }, "-=0.3");
                          

                        // Terugknop event listener om de informatie van de Verenigde Staten te verbergen
                        terugKnop.addEventListener('click', () => {
                          timeline
                            .to(infoUSAElem, { opacity: 0, zIndex: -10, duration: 0.5})
                            .set(infoUSAElem, { opacity: 0, zIndex: -1});
                          });

                        
                        tl
                          .set(titan, { opacity: 1 })
                          .to(titan.querySelector("#thruster_left"), { duration: 1.5, x: "-20", y:"20", ease: "easeInOut"}, "-=.5")
                          .to(titan.querySelector("#thruster_right"), { duration: 1.5, x: "20", y:"20", ease: "easeInOut"}, "-=.3")
                          .to(titan.querySelector("#pod"), { duration: 1.5, y: "-20", ease: "easeInOut" }, "-=.3")
                          .to(titan.querySelector("#Rockets_left"), { duration: 1.5, x: "-20", ease: "easeInOut" }, "-=.3")
                          .to(titan.querySelector("#Rockets_right"), { duration: 1.5, x: "20", ease: "easeInOut" }, "-=.3")
                          .to(titan.querySelector("#nozzle"), { duration: 1.5, y: "20", ease: "easeInOut" }, "-=.3")
                          // atlas
                          .set(atlas, { display: "block", opacity: 1 })
                          .to(atlas.querySelector("#thruster_left"), { duration: 1.5, x: "-20", y:"20", ease: "easeInOut" }, "-=.5")
                          .to(atlas.querySelector("#thruster_right"), { duration: 1.5, x: "20", y:"20", ease: "easeInOut" }, "-=.3")
                          .to(atlas.querySelector("#pod"), { duration: 1.5, y: "-20", ease: "easeInOut" }, "-=.3")
                          .to(atlas.querySelector("#rocket_left"), { duration: 1.5, x: "-20", ease: "easeInOut" }, "-=.3")
                          .to(atlas.querySelector("#rocket_right"), { duration: 1.5, x: "20", ease: "easeInOut" }, "-=.3")
                          .to(atlas.querySelector("#nozzle"), { duration: 1.5, y: "20", ease: "easeInOut" }, "-=.3")

                          // titan terug op plek
                          .to(titan.querySelector("#nozzle"), { duration: 1, y: "0", ease: "easeInOut" }, "-=.3")
                          .to(titan.querySelector("#Rockets_right"), { duration: 1, x: "0", ease: "easeInOut" }, "-=.3")
                          .to(titan.querySelector("#Rockets_left"), { duration: 1, x: "0", ease: "easeInOut" }, "-=.3")
                          .to(titan.querySelector("#pod"), { duration: 1, y: "0", ease: "easeInOut" }, "-=.3")
                          .to(titan.querySelector("#thruster_right"), { duration: 1, x: "0", y:"0", ease: "easeInOut" }, "-=.3")
                          .to(titan.querySelector("#thruster_left"), { duration: 1, x: "0", y:"0", ease: "easeInOut" }, "-=.5")
                          .to(titan, {opacity: 1, duration: 1, ease: "easeInOut" }, "-=.3")
                          // atlas terug op plek
                          .to(atlas.querySelector("#nozzle"), { duration: 1, y: "0", ease: "easeInOut" }, "-=.3")
                          .to(atlas.querySelector("#rocket_right"), { duration: 1, x: "0", ease: "easeInOut" }, "-=.3")
                          .to(atlas.querySelector("#rocket_left"), { duration: 1, x: "0", ease: "easeInOut" }, "-=.3")
                          .to(atlas.querySelector("#pod"), { duration: 1, y: "0", ease: "easeInOut" }, "-=.3")
                          .to(atlas.querySelector("#thruster_right"), { duration: 1, x: "0", y:"0", ease: "easeInOut" }, "-=.3")
                          .to(atlas.querySelector("#thruster_left"), { duration: 1, x: "0", y:"0", ease: "easeInOut" }, "-=.5")
                          .to(atlas, {opacity: 1, duration: 1, ease: "easeInOut" }, "-=.3")

                        
                        // Animatie voor het op en neer bewegen van de raket
                        tl.to(atlas, {
                          y: -5, // Verkleinde afstand
                          duration: 2,
                          ease: "easeInOut", // Ander easing-type, zoals easeInOut
                          repeat: -1,
                          yoyo: true // Terugkeren naar oorspronkelijke positie
                        });

                        // Animatie voor het op en neer bewegen van de raket
                        tl.to(titan, {
                          y: -5, // Verkleinde afstand
                          duration: 2,
                          ease: "easeInOut", // Ander easing-type, zoals easeInOut
                          repeat: -1,
                          yoyo: true // Terugkeren naar oorspronkelijke positie
                        });
                          tl.play();
                        }
                    })
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
                  }),
                exit => exit 
                  .transition()
                  .duration(50)
                  .remove()
                  .style("fill", "rgba(137, 255, 255, 0)")
              );
          });
        } catch (error) {
          console.error('Fout bij het bijwerken van de visualisatie:', error);
        }
      }} catch (error) {
        console.error('Fout bij het laden of verwerken van de data:', error);
      }
    });
</script>

<div class="SVG">
  <fieldset class="filtering">
    <legend>FILTER THROUGH TIME</legend>
    <div id="buttonHolder">
      <input type="button" id="WholePeriod" value="WholePeriod" checked/>
      <input type="button" id="Period1" value="Period1"/>
      <input type="button" id="Period2" value="Period2"/>
      <input type="button" id="Period3" value="Period3"/>
    </div>
  </fieldset>
  <div class="worldmap-container">
    <svg id="worldmap"></svg>
  </div>
  <article class="InformationUSA">
    <input type="button" id="terugKnop" value="Terug"/>
    <div class="infoContent">
      <h2>
        _SPACE MISSON <br>
        <span>USA</span>
      </h2>
      <p>
        <span>Overview:</span>
        During the Cold War, the USA's Atlas and Titan rockets stood as pillars of space exploration. Originally designed as ballistic missiles, both rocket families swiftly transitioned into critical tools for space missions.
      <br>
      <p>
        <span>Atlas and Titan rockets:</span><br>
        <strong>Atlas Rockets:</strong> Originally developed as intercontinental ballistic missiles, the Atlas rockets quickly became vital for early space missions. Their unique design and reliability made them instrumental in launching satellites and kickstarting space exploration.
      <br>
        <strong>Titan Rockets:</strong> Initially serving as military missiles, Titans evolved into versatile space launch vehicles. Their adaptability allowed them to support a wide range of missions, from scientific probes to crewed spaceflights.  
      </p>
      <p>
        <span>Legacy:</span>
        The Atlas and Titan rockets played significant roles in advancing the USA's space capabilities, marking milestones in satellite deployment, scientific exploration, and human spaceflight. Their reliability and adaptability shaped the trajectory of space exploration during the Cold War.
      </p>
    </div>
    <div class="rockets">
      <div class="titan-info">
        <svg id="titanRocket" width="97" height="350" viewBox="0 0 97 481" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="titan">
          <g id="thruster_left">
          <path id="Rectangle 47" d="M33.5093 478.47C33.8801 479.451 33.1551 480.5 32.1061 480.5L2.89386 480.5C1.84493 480.5 1.11991 479.451 1.49072 478.47L5.26979 468.47C5.49033 467.886 6.04907 467.5 6.67293 467.5L28.3271 467.5C28.9509 467.5 29.5097 467.886 29.7302 468.47L33.5093 478.47Z" fill="#29B4B4" fill-opacity="0.4" stroke="#29B4B4"/>
          <path id="Rectangle 50" d="M25.9882 478.683C26.19 479.618 25.4779 480.5 24.522 480.5L9.47799 480.5C8.52205 480.5 7.81001 479.618 8.01179 478.683L10.1713 468.683C10.3204 467.993 10.931 467.5 11.6375 467.5L22.3625 467.5C23.069 467.5 23.6796 467.993 23.8287 468.683L25.9882 478.683Z" stroke="#29B4B4"/>
          <path id="Rectangle 52" d="M20.3389 478.887C20.4047 479.757 19.7161 480.5 18.8431 480.5L16.1569 480.5C15.2839 480.5 14.5953 479.757 14.6611 478.887L15.4169 468.887C15.4761 468.105 16.1281 467.5 16.9127 467.5L18.0873 467.5C18.8719 467.5 19.5239 468.105 19.5831 468.887L20.3389 478.887Z" stroke="#29B4B4"/>
          </g>
          <g id="thruster_right">
          <path id="Rectangle 48" d="M95.5093 478.47C95.8801 479.451 95.1551 480.5 94.1061 480.5L64.8939 480.5C63.8449 480.5 63.1199 479.451 63.4907 478.47L67.2698 468.47C67.4903 467.886 68.0491 467.5 68.6729 467.5L90.3271 467.5C90.9509 467.5 91.5097 467.886 91.7302 468.47L95.5093 478.47Z" fill="#29B4B4" fill-opacity="0.4" stroke="#29B4B4"/>
          <path id="Rectangle 49" d="M87.9882 478.683C88.19 479.618 87.4779 480.5 86.522 480.5L71.478 480.5C70.5221 480.5 69.81 479.618 70.0118 478.683L72.1713 468.683C72.3204 467.993 72.931 467.5 73.6375 467.5L84.3625 467.5C85.069 467.5 85.6796 467.993 85.8287 468.683L87.9882 478.683Z" stroke="#29B4B4"/>
          <path id="Rectangle 51" d="M83.2892 478.855C83.3749 479.737 82.682 480.5 81.7962 480.5L77.2038 480.5C76.318 480.5 75.6251 479.737 75.7108 478.855L76.6826 468.855C76.7573 468.086 77.4033 467.5 78.1755 467.5L80.8245 467.5C81.5967 467.5 82.2427 468.086 82.3174 468.855L83.2892 478.855Z" stroke="#29B4B4"/>
          </g>
          <g id="Group 37">
          <path id="pod" fill-rule="evenodd" clip-rule="evenodd" d="M26.9998 147.264L26.9951 147.312L26.5859 151.532C26.6461 151.509 26.7107 151.485 26.7797 151.462L26.7833 151.461C27.6013 151.186 29.0296 150.935 30.9224 150.722V147.163L30.9224 120.278C29.1869 120.083 27.8419 119.855 26.9998 119.607L26.9998 147.216V147.264ZM26.9998 118.393C27.8419 118.144 29.1869 117.917 30.9224 117.721L30.9224 87.2786C29.1869 87.0829 27.8419 86.8556 26.9998 86.6072L26.9998 118.393ZM30.9224 118.728C30.1733 118.814 29.5071 118.905 28.9317 119C29.5071 119.095 30.1733 119.186 30.9224 119.272V118.728ZM31.9224 119.379V118.621C32.0574 118.608 32.1947 118.594 32.334 118.581C33.7808 118.445 35.4401 118.329 37.2622 118.237V119.763C35.4401 119.671 33.7808 119.554 32.334 119.418C32.1947 119.405 32.0574 119.392 31.9224 119.379ZM31.9224 120.384L31.9224 147.163V150.617C33.4713 150.465 35.2723 150.336 37.2622 150.236V146.958L37.2622 120.764C35.2723 120.664 33.4713 120.535 31.9224 120.384ZM38.2622 120.811L38.2622 146.958V150.189C39.9349 150.115 41.7262 150.061 43.6021 150.03V146.446V120.97C41.7262 120.939 39.9349 120.885 38.2622 120.811ZM44.6021 120.984V146.446V150.016C45.4878 150.006 46.3904 150 47.3066 150C48.4513 150 49.575 150.009 50.6708 150.025V146.446V120.975C49.575 120.991 48.4513 121 47.3066 121C46.3904 121 45.4878 120.994 44.6021 120.984ZM50.6708 119.975C49.5756 119.991 48.4519 120 47.3066 120C46.39 120 45.4874 119.994 44.6021 119.984V118.016C45.4874 118.005 46.39 118 47.3066 118C48.4519 118 49.5756 118.008 50.6708 118.025V119.975ZM51.6708 120.958V146.446V150.042C53.5538 150.079 55.3456 150.139 57.0104 150.219V146.958V120.781C55.3456 120.861 53.5538 120.921 51.6708 120.958ZM57.0104 119.78C55.3485 119.86 53.5565 119.921 51.6708 119.958V118.042C53.5565 118.079 55.3485 118.14 57.0104 118.22V119.78ZM58.0104 120.73V146.958V150.271C60.023 150.381 61.8261 150.521 63.35 150.684V147.163V120.316C61.8261 120.48 60.023 120.62 58.0104 120.73ZM63.35 119.31C63.0087 119.347 62.6515 119.383 62.2791 119.418C61.0088 119.538 59.5747 119.642 58.0104 119.728V118.272C59.5747 118.358 61.0088 118.462 62.2791 118.581C62.6515 118.616 63.0087 118.652 63.35 118.69V119.31ZM64.35 120.2V147.163V150.8C65.9166 150.995 67.1097 151.219 67.8299 151.461L67.8334 151.462C68.3415 151.633 68.6131 151.814 68.6131 152C68.6131 152.187 68.3415 152.367 67.8334 152.538L67.8299 152.539C67.1097 152.781 65.9166 153.005 64.35 153.201V167.991C64.35 169.632 63.5595 171.088 62.3385 172H66.7754C69.1984 172 71.065 169.863 70.739 167.462L68.0089 147.35L67.9998 147.283V147.216V119.478C67.9475 119.498 67.892 119.518 67.8334 119.538L67.8299 119.539C67.1097 119.781 65.9166 120.005 64.35 120.2ZM67.9998 118.521L67.9998 86.4783C67.9475 86.4983 67.892 86.5182 67.8334 86.538L67.8299 86.5392C67.1097 86.7812 65.9166 87.0047 64.35 87.2004L64.35 117.799C65.9166 117.995 67.1097 118.219 67.8299 118.461L67.8334 118.462C67.892 118.482 67.9475 118.501 67.9998 118.521ZM64.35 118.807C64.8361 118.869 65.2808 118.934 65.6814 119C65.2808 119.066 64.8361 119.13 64.35 119.192V118.807ZM63.35 117.684L63.35 87.3161C61.8261 87.4796 60.023 87.6197 58.0104 87.7297V117.27C60.023 117.38 61.8261 117.52 63.35 117.684ZM57.0104 117.219V87.781C55.3456 87.8611 53.5538 87.9212 51.6708 87.958V117.042C53.5538 117.079 55.3456 117.139 57.0104 117.219ZM50.6708 117.025V87.9752C49.575 87.9915 48.4513 88 47.3066 88C46.3904 88 45.4878 87.9945 44.6021 87.984V117.016C45.4878 117.005 46.3904 117 47.3066 117C48.4513 117 49.575 117.008 50.6708 117.025ZM43.6021 117.03V87.9699C41.7262 87.939 39.9349 87.8851 38.2622 87.8114L38.2622 117.188C39.9349 117.115 41.7262 117.061 43.6021 117.03ZM38.2622 118.189V119.81C39.9322 119.884 41.7237 119.939 43.6021 119.97V118.03C41.7237 118.061 39.9322 118.115 38.2622 118.189ZM37.2622 117.236L37.2622 87.7642C35.2723 87.6642 33.4713 87.5354 31.9224 87.3837L31.9224 117.616C33.4713 117.464 35.2723 117.336 37.2622 117.236ZM25.0267 167.614L26.4987 152.432C26.5823 152.468 26.6761 152.503 26.7797 152.538L26.7833 152.539C27.6013 152.814 29.0296 153.065 30.9224 153.279L30.9224 167.991C30.9224 169.632 31.7129 171.088 32.9339 172H29.008C26.6463 172 24.7988 169.965 25.0267 167.614ZM31.9224 167.991L31.9224 153.384C33.4713 153.536 35.2723 153.664 37.2622 153.764L37.2622 167.991C37.2622 169.626 38.0476 171.079 39.2617 171.991H35.9224C33.7133 171.991 31.9224 170.2 31.9224 167.991ZM32.334 152.419C33.7808 152.555 35.4401 152.671 37.2622 152.763V151.237C35.4401 151.329 33.7808 151.446 32.334 151.582C32.1947 151.595 32.0574 151.608 31.9224 151.621L31.9224 152.379C32.0574 152.392 32.1947 152.406 32.334 152.419ZM38.2622 167.991L38.2622 153.812C39.9349 153.885 41.7262 153.939 43.6021 153.97L43.6021 171.991H42.2622C40.0531 171.991 38.2622 170.2 38.2622 167.991ZM38.2622 152.811C39.9322 152.885 41.7237 152.939 43.6021 152.97V151.03C41.7237 151.062 39.9322 151.116 38.2622 151.19V152.811ZM44.6021 171.991L44.6021 153.984C45.4878 153.995 46.3904 154 47.3066 154C48.4513 154 49.575 153.992 50.6708 153.975V171.991H44.6021ZM47.3066 153C48.4519 153 49.5756 152.992 50.6708 152.975V151.025C49.5756 151.009 48.4519 151 47.3066 151C46.39 151 45.4874 151.006 44.6021 151.016V152.984C45.4874 152.995 46.39 153 47.3066 153ZM51.6708 171.991V153.958C53.5538 153.921 55.3456 153.861 57.0104 153.781V167.991C57.0104 170.2 55.2196 171.991 53.0104 171.991H51.6708ZM51.6708 152.958C53.5565 152.921 55.3485 152.861 57.0104 152.78V151.22C55.3485 151.14 53.5565 151.079 51.6708 151.042V152.958ZM58.0104 167.991V153.73C60.023 153.62 61.8261 153.48 63.35 153.316V167.991C63.35 170.2 61.5592 171.991 59.35 171.991H56.0109C57.2251 171.079 58.0104 169.626 58.0104 167.991ZM62.2791 152.419C62.6515 152.384 63.0087 152.348 63.35 152.311V151.69C63.0087 151.653 62.6515 151.617 62.2791 151.582C61.0088 151.462 59.5747 151.358 58.0104 151.272V152.728C59.5747 152.642 61.0088 152.538 62.2791 152.419ZM65.6814 152C65.2808 151.934 64.8361 151.87 64.35 151.808V152.193C64.8361 152.131 65.2808 152.066 65.6814 152ZM28.9317 152C29.5071 152.095 30.1733 152.186 30.9224 152.272V151.728C30.1733 151.814 29.5071 151.905 28.9317 152ZM26.9998 85.3928C27.8419 85.1444 29.1869 84.9171 30.9224 84.7213L30.9224 54.9676C30.9224 54.7026 30.9259 54.4377 30.9329 54.1731C29.2877 53.9878 27.9926 53.7742 27.143 53.5412C27.0477 54.4959 26.9998 55.4565 26.9998 56.4194L26.9998 85.3928ZM30.9224 85.7278C30.1733 85.8137 29.5071 85.9049 28.9317 86C29.5071 86.095 30.1733 86.1862 30.9224 86.2722V85.7278ZM31.9224 85.6211C32.0574 85.6077 32.1947 85.5945 32.334 85.5814C33.7808 85.4456 35.4401 85.3292 37.2622 85.237V86.763C35.4401 86.6708 33.7808 86.5544 32.334 86.4186C32.1947 86.4055 32.0574 86.3922 31.9224 86.3788V85.6211ZM50.6708 86.9751C49.5756 86.9915 48.4519 87 47.3066 87C46.39 87 45.4874 86.9945 44.6021 86.9839V85.016C45.4874 85.0054 46.39 85 47.3066 85C48.4519 85 49.5756 85.0085 50.6708 85.0249V86.9751ZM57.0104 86.7798C55.3485 86.8603 53.5565 86.9208 51.6708 86.9578V85.0422C53.5565 85.0792 55.3485 85.1397 57.0104 85.2201V86.7798ZM63.35 86.3103C63.0087 86.3475 62.6515 86.3836 62.2791 86.4186C61.0088 86.5378 59.5747 86.6421 58.0104 86.7282V85.2718C59.5747 85.3579 61.0088 85.4622 62.2791 85.5814C62.6515 85.6163 63.0087 85.6525 63.35 85.6897V86.3103ZM67.9998 85.5216V56.4194C67.9998 55.4182 67.9479 54.4196 67.845 53.4273L67.8334 53.4312L67.8299 53.4324C67.1077 53.6751 65.9102 53.8992 64.3373 54.0952C64.3458 54.3858 64.35 54.6766 64.35 54.9676V84.7996C65.9166 84.9952 67.1097 85.2188 67.8299 85.4608L67.8334 85.462C67.892 85.4817 67.9475 85.5016 67.9998 85.5216ZM64.35 85.8075C64.8361 85.8695 65.2808 85.9338 65.6814 86C65.2808 86.0662 64.8361 86.1305 64.35 86.1925V85.8075ZM63.35 84.6839V54.9676C63.35 54.715 63.3467 54.4626 63.3401 54.2104C61.8183 54.3735 60.0186 54.5132 58.0104 54.6229V84.2703C60.023 84.3803 61.8261 84.5203 63.35 84.6839ZM57.0104 84.219V54.6743C55.3456 54.7543 53.5538 54.8145 51.6708 54.8513L51.6708 84.042C53.5538 84.0788 55.3456 84.1389 57.0104 84.219ZM50.6708 84.0248L50.6708 54.8685C49.575 54.8848 48.4513 54.8933 47.3066 54.8933C46.3904 54.8933 45.4878 54.8878 44.6021 54.8773V84.0159C45.4878 84.0054 46.3904 84 47.3066 84C48.4513 84 49.575 84.0084 50.6708 84.0248ZM43.6021 84.0301V54.8631C41.7262 54.8323 39.9349 54.7784 38.2622 54.7047L38.2622 84.1886C39.9349 84.1149 41.7262 84.061 43.6021 84.0301ZM38.2622 86.8104C39.9322 86.8844 41.7237 86.9387 43.6021 86.9697V85.0302C41.7237 85.0613 39.9322 85.1155 38.2622 85.1896V86.8104ZM37.2622 84.2357L37.2622 54.6575C35.2758 54.5577 33.4776 54.4291 31.9306 54.2778C31.9251 54.5076 31.9224 54.7375 31.9224 54.9676L31.9224 84.6163C33.4713 84.4646 35.2723 84.3357 37.2622 84.2357ZM26.1781 53.153C26.0595 54.2358 25.9998 55.3261 25.9998 56.4194L25.9998 147.216L24.0314 167.517C23.7465 170.456 26.0559 173 29.008 173H66.7754C69.8041 173 72.1374 170.328 71.73 167.327L68.9998 147.216L68.9998 56.4194C68.9998 52.5806 68.263 48.7774 66.8294 45.2162L49.3551 1.80878C48.6825 0.137958 46.3171 0.137959 45.6445 1.80878L28.1702 45.2162C27.2159 47.5868 26.5703 50.0646 26.2453 52.5888C26.0838 52.6881 26 52.7897 26 52.8933C26 52.9813 26.0606 53.068 26.1781 53.153ZM27.3081 52.2017C28.1892 51.9773 29.4867 51.7718 31.1127 51.5935C31.3264 49.7056 31.7192 47.8398 32.2873 46.0215L36.5609 32.3425C35.6999 32.1473 35.059 31.9278 34.6925 31.6922L29.0978 45.5896C28.2403 47.7198 27.6407 49.9396 27.3081 52.2017ZM33.2418 46.3197L37.5472 32.5388C38.3826 32.6854 39.3559 32.8134 40.4365 32.918L37.8025 46.6093C37.5155 48.1007 37.3424 49.6113 37.2842 51.1279C35.3746 51.2236 33.6386 51.3458 32.1317 51.4893C32.3433 49.7383 32.7144 48.0078 33.2418 46.3197ZM38.3443 31.6557C39.0295 31.7599 39.7949 31.8526 40.6263 31.9316L40.901 30.5033C39.9631 30.5876 39.1043 30.6891 38.3443 30.8046C38.2531 30.8185 38.1636 30.8325 38.0759 30.8467L37.848 31.5759C38.0074 31.6031 38.1729 31.6297 38.3443 31.6557ZM38.7845 46.7982L41.4379 33.0058C42.4297 33.0842 43.4953 33.1439 44.6148 33.182L43.6021 46.9848V50.9234C41.7355 50.9541 39.9525 51.0076 38.2869 51.0808C38.3462 49.6434 38.5125 48.2119 38.7845 46.7982ZM41.628 32.0177C42.5832 32.0913 43.6093 32.1478 44.6881 32.1839L44.8284 30.2719C43.8135 30.3041 42.8442 30.3542 41.9355 30.4198L41.628 32.0177ZM44.6021 47.0215L45.6155 33.2098C46.2308 33.2232 46.8598 33.2302 47.4995 33.2302C48.2343 33.2302 48.955 33.221 49.6569 33.2034L50.6708 47.0215V50.918C49.575 50.9017 48.4513 50.8933 47.3066 50.8933C46.3904 50.8933 45.4878 50.8987 44.6021 50.9092V47.0215ZM47.4995 32.2302C48.2098 32.2302 48.9059 32.2215 49.5837 32.2049L49.4404 30.252C48.8079 30.2377 48.1598 30.2302 47.4995 30.2302C46.9343 30.2302 46.3781 30.2357 45.8329 30.2463L45.6887 32.2112C46.2799 32.2237 46.8844 32.2302 47.4995 32.2302ZM51.6708 46.9848L50.6573 33.1722C51.7785 33.1303 52.8431 33.0665 53.8305 32.984L56.4882 46.7982C56.7621 48.2219 56.9287 49.6636 56.987 51.1111C55.3288 51.0316 53.5449 50.9719 51.6708 50.9353V46.9848ZM50.5841 32.1743C51.6645 32.1343 52.6896 32.0739 53.6405 31.9963L53.3412 30.4404C52.4342 30.3709 51.4637 30.3169 50.4452 30.2811L50.5841 32.1743ZM57.4702 46.6093L54.831 32.8913C55.9164 32.7804 56.8871 32.6457 57.7106 32.4919L62.0306 46.3197C62.5647 48.0292 62.9385 49.7821 63.1486 51.5558C61.6628 51.4009 59.9226 51.2678 57.9897 51.1624C57.9329 49.6342 57.7593 48.1121 57.4702 46.6093ZM56.6548 31.6557C56.9212 31.6153 57.1731 31.5734 57.4102 31.5304L57.2116 30.8948C57.0337 30.8641 56.848 30.834 56.6548 30.8046C55.9707 30.7006 55.2065 30.608 54.3766 30.5291L54.6413 31.9054C55.3695 31.8323 56.044 31.7486 56.6548 31.6557ZM62.9851 46.0215L58.6928 32.2825C59.4264 32.1026 59.9775 31.9038 60.307 31.6919L65.9017 45.5896C66.7735 47.7553 67.3788 50.0135 67.7078 52.3146C66.9488 52.0785 65.7375 51.8609 64.1683 51.6705C63.9566 49.7564 63.5609 47.8645 62.9851 46.0215ZM52.2746 11.739L59.841 30.5343C59.3882 30.3489 58.7598 30.1765 57.9865 30.0217L52.2746 11.739ZM58.7669 31.2302C58.6312 31.1928 58.4853 31.1557 58.3293 31.119L58.394 31.326C58.5258 31.2943 58.6501 31.2624 58.7669 31.2302ZM50.0156 7.8616L56.878 29.8272C56.0765 29.7034 55.1698 29.5955 54.1799 29.5067L50.0156 7.8616ZM48.6787 6.20594L53.1454 29.4231C52.2698 29.3598 51.3408 29.3107 50.3716 29.278L48.6787 6.20594ZM47.6364 5.66604L49.3669 29.2502C48.7569 29.237 48.1335 29.2302 47.4995 29.2302C46.9603 29.2302 46.4286 29.2351 45.9064 29.2447L47.6364 5.66604ZM46.5943 6.20385L44.9019 29.2691C43.9359 29.2985 43.008 29.344 42.131 29.4036L46.5943 6.20385ZM45.2574 7.85957L41.0975 29.4824C40.1169 29.5655 39.2135 29.6672 38.4078 29.7842L45.2574 7.85957ZM43.9434 8.71226L37.3034 29.9656C36.3963 30.1344 35.6669 30.326 35.1587 30.5341L43.9434 8.71226ZM36.8601 31.3847L36.9637 31.0531C36.6941 31.1109 36.4499 31.1701 36.2322 31.2302C36.4217 31.2824 36.6312 31.3341 36.8601 31.3847ZM31.0151 52.6105C30.2282 52.6995 29.5307 52.7943 28.9317 52.8933C29.5208 52.9906 30.2051 53.0839 30.9762 53.1716C30.9874 52.9844 31.0004 52.7974 31.0151 52.6105ZM31.9717 53.277C31.9868 53.019 32.0053 52.7614 32.0272 52.5041C32.1283 52.4942 32.2306 52.4844 32.334 52.4747C33.7809 52.3389 35.4403 52.2224 37.2626 52.1302C37.2623 52.1791 37.2622 52.228 37.2622 52.2769V53.6562C35.4401 53.5641 33.7808 53.4477 32.334 53.3118C32.2116 53.3004 32.0908 53.2887 31.9717 53.277ZM50.6708 53.8684C49.5756 53.8847 48.4519 53.8933 47.3066 53.8933C46.39 53.8933 45.4874 53.8878 44.6021 53.8772V51.9093C45.4874 51.8987 46.39 51.8933 47.3066 51.8933C48.4519 51.8933 49.5756 51.9018 50.6708 51.9182V53.8684ZM57.0104 53.6731C55.3485 53.7536 53.5565 53.814 51.6708 53.8511V51.9354C53.5563 51.9725 55.3482 52.033 57.01 52.1134C57.0103 52.1679 57.0104 52.2224 57.0104 52.277V53.6731ZM63.2967 53.2093C62.9715 53.2445 62.6322 53.2787 62.2791 53.3118C61.0088 53.4311 59.5747 53.5354 58.0104 53.6214V52.277L58.0102 52.1651C59.5746 52.2511 61.0088 52.3554 62.2791 52.4747C62.6156 52.5063 62.9397 52.5388 63.2509 52.5723C63.2685 52.7844 63.2838 52.9968 63.2967 53.2093ZM64.2634 52.6898C64.7834 52.7552 65.2571 52.8232 65.6814 52.8933C65.2647 52.9621 64.8004 53.0289 64.2914 53.0932C64.283 52.9586 64.2737 52.8242 64.2634 52.6898ZM38.2629 52.0828C38.2624 52.1475 38.2622 52.2122 38.2622 52.2769V53.7037C39.9322 53.7777 41.7237 53.8319 43.6021 53.863V51.9235C41.724 51.9546 39.9326 52.0088 38.2629 52.0828ZM47.821 1.60704C47.5351 1.51269 47.2116 1.5483 46.9541 1.71388C47.2319 1.61676 47.529 1.58115 47.821 1.60704ZM46.2791 4.58932C47.027 3.91128 48.2452 3.91118 48.9932 4.58902L48.5907 3.30066C48.2984 2.36493 46.974 2.36493 46.6817 3.30066L46.2791 4.58932ZM59.8158 31.6461C59.816 31.6461 59.8134 31.6436 59.8072 31.6386C59.8124 31.6437 59.8155 31.6462 59.8158 31.6461ZM35.1833 31.6461L35.1844 31.6455C35.1857 31.6444 35.1883 31.6421 35.1919 31.6386C35.1857 31.6436 35.1831 31.6461 35.1833 31.6461ZM35.1833 30.8142C35.1831 30.8142 35.1857 30.8168 35.1919 30.8218C35.1867 30.8167 35.1836 30.8142 35.1833 30.8142ZM59.8072 30.8218L59.8105 30.819L59.8148 30.8153L59.8154 30.8147C59.8157 30.8144 59.8158 30.8142 59.8158 30.8142C59.8155 30.8142 59.8124 30.8167 59.8072 30.8218Z" fill="#29B4B4"/>
          </g>
          <g id="Rockets_right">
          <path id="Rectangle 35" d="M67 466.5C64.5147 466.5 62.5 464.485 62.5 462L62.5 430.817L62.5 298.605C62.5 296.409 62.7451 294.22 63.2308 292.079L77.5372 229.007C77.8905 227.449 80.1095 227.449 80.4628 229.007L94.7692 292.079C95.2549 294.22 95.5 296.409 95.5 298.605L95.5 430.817L95.5 462C95.5 464.485 93.4853 466.5 91 466.5L67 466.5Z" fill="#29B4B4" fill-opacity="0.4" stroke="#29B4B4"/>
          <path id="Rectangle 40" d="M71 466.5C68.5147 466.5 66.5 464.485 66.5 462L66.5 430.48L66.5 296.205C66.5 294.53 66.6426 292.859 66.9262 291.208L77.5217 229.554C77.8072 227.893 80.1928 227.893 80.4783 229.554L91.0738 291.208C91.3574 292.859 91.5 294.53 91.5 296.205L91.5 430.48L91.5 462C91.5 464.485 89.4853 466.5 87 466.5L71 466.5Z" stroke="#29B4B4"/>
          <path id="Rectangle 41" d="M76 466.5C73.5147 466.5 71.5 464.485 71.5 462L71.5 429.16L71.5 287.405L77.5077 228.544C77.6912 226.747 80.3088 226.748 80.4922 228.544L86.5 287.405L86.5 429.16L86.5 462C86.5 464.485 84.4853 466.5 82 466.5L76 466.5Z" stroke="#29B4B4"/>
          <path id="Rectangle 42" d="M77 466.5C76.7239 466.5 76.5 466.276 76.5 466L76.5 431.8L76.5 299.922L79 239.162L81.5 299.922L81.5 431.8L81.5 466C81.5 466.276 81.2761 466.5 81 466.5L77 466.5Z" stroke="#29B4B4"/>
          <path id="Ellipse 18" d="M94.5301 297.297C94.9038 297.193 95.1736 297.092 95.3497 297C95.1736 296.908 94.9038 296.807 94.5301 296.703C93.7066 296.474 92.4916 296.262 90.9624 296.082C87.9108 295.723 83.6812 295.5 79 295.5C74.3188 295.5 70.0892 295.723 67.0376 296.082C65.5084 296.262 64.2934 296.474 63.4699 296.703C63.0962 296.807 62.8264 296.908 62.6503 297C62.8264 297.092 63.0962 297.193 63.4699 297.297C64.2934 297.526 65.5084 297.738 67.0376 297.918C70.0892 298.277 74.3188 298.5 79 298.5C83.6812 298.5 87.9108 298.277 90.9624 297.918C92.4916 297.738 93.7066 297.526 94.5301 297.297Z" stroke="#29B4B4"/>
          <path id="Ellipse 21" opacity="0.9" d="M88.9102 267.889C88.9103 267.889 88.91 267.888 88.9091 267.886C88.9097 267.888 88.9101 267.889 88.9102 267.889ZM88.8515 267.897C88.868 267.881 88.88 267.868 88.8888 267.858C88.88 267.848 88.868 267.835 88.8515 267.819C88.7689 267.742 88.6193 267.643 88.3807 267.535C87.9066 267.319 87.189 267.113 86.2632 266.935C84.4197 266.58 81.8514 266.358 78.9998 266.358C76.1481 266.358 73.5798 266.58 71.7363 266.935C70.8105 267.113 70.0929 267.319 69.6188 267.535C69.3802 267.643 69.2306 267.742 69.148 267.819C69.1315 267.835 69.1195 267.848 69.1107 267.858C69.1195 267.868 69.1315 267.881 69.148 267.897C69.2306 267.974 69.3802 268.073 69.6188 268.181C70.0929 268.397 70.8105 268.603 71.7363 268.781C73.5798 269.135 76.1481 269.358 78.9998 269.358C81.8514 269.358 84.4197 269.135 86.2632 268.781C87.189 268.603 87.9066 268.397 88.3807 268.181C88.6193 268.073 88.7689 267.974 88.8515 267.897ZM69.0893 267.889C69.0894 267.889 69.0898 267.888 69.0904 267.886C69.0895 267.888 69.0892 267.889 69.0893 267.889ZM69.0893 267.827C69.0892 267.827 69.0895 267.828 69.0904 267.83C69.0898 267.828 69.0894 267.827 69.0893 267.827ZM88.9091 267.83C88.91 267.828 88.9103 267.827 88.9102 267.827C88.9101 267.827 88.9097 267.828 88.9091 267.83Z" stroke="#29B4B4"/>
          <path id="Ellipse 20" d="M94.5301 353.703C94.9038 353.807 95.1736 353.908 95.3497 354C95.1736 354.092 94.9038 354.193 94.5301 354.297C93.7066 354.526 92.4916 354.738 90.9624 354.918C87.9108 355.277 83.6812 355.5 79 355.5C74.3188 355.5 70.0892 355.277 67.0376 354.918C65.5084 354.738 64.2934 354.526 63.4699 354.297C63.0962 354.193 62.8264 354.092 62.6503 354C62.8264 353.908 63.0962 353.807 63.4699 353.703C64.2934 353.474 65.5084 353.262 67.0376 353.082C70.0892 352.723 74.3188 352.5 79 352.5C83.6812 352.5 87.9108 352.723 90.9624 353.082C92.4916 353.262 93.7066 353.474 94.5301 353.703Z" stroke="#29B4B4"/>
          <path id="Ellipse 28" d="M95.5056 324.463C95.5056 324.463 95.5054 324.464 95.505 324.464L95.5056 324.463ZM95.3628 324.402C95.4219 324.445 95.4572 324.477 95.4779 324.5C95.4572 324.523 95.4219 324.555 95.3628 324.598C95.1932 324.72 94.9112 324.858 94.4999 325.001C93.6835 325.285 92.4747 325.549 90.9481 325.773C87.9024 326.221 83.6779 326.5 79 326.5C74.3221 326.5 70.0976 326.221 67.0519 325.773C65.5253 325.549 64.3165 325.285 63.5001 325.001C63.0888 324.858 62.8068 324.72 62.6372 324.598C62.5781 324.555 62.5428 324.523 62.5221 324.5C62.5428 324.477 62.5781 324.445 62.6372 324.402C62.8068 324.28 63.0888 324.142 63.5001 323.999C64.3165 323.715 65.5253 323.451 67.0519 323.227C70.0976 322.779 74.3221 322.5 79 322.5C83.6779 322.5 87.9024 322.779 90.9481 323.227C92.4747 323.451 93.6835 323.715 94.4999 323.999C94.9112 324.142 95.1932 324.28 95.3628 324.402ZM62.4944 324.463C62.4945 324.463 62.4946 324.464 62.4949 324.464L62.4944 324.463ZM62.4944 324.537C62.4944 324.537 62.4946 324.536 62.4949 324.536L62.4944 324.537ZM95.505 324.536C95.5054 324.536 95.5056 324.537 95.5056 324.537L95.505 324.536Z" stroke="#29B4B4"/>
          <path id="Ellipse 24" d="M95.5056 412.463C95.5056 412.463 95.5054 412.464 95.505 412.464L95.5056 412.463ZM95.3628 412.402C95.4219 412.445 95.4572 412.477 95.4779 412.5C95.4572 412.523 95.4219 412.555 95.3628 412.598C95.1932 412.72 94.9112 412.858 94.4999 413.001C93.6835 413.285 92.4747 413.549 90.9481 413.773C87.9024 414.221 83.6779 414.5 79 414.5C74.3221 414.5 70.0976 414.221 67.0519 413.773C65.5253 413.549 64.3165 413.285 63.5001 413.001C63.0888 412.858 62.8068 412.72 62.6372 412.598C62.5781 412.555 62.5428 412.523 62.5221 412.5C62.5428 412.477 62.5781 412.445 62.6372 412.402C62.8068 412.28 63.0888 412.142 63.5001 411.999C64.3165 411.715 65.5253 411.451 67.0519 411.227C70.0976 410.779 74.3221 410.5 79 410.5C83.6779 410.5 87.9024 410.779 90.9481 411.227C92.4747 411.451 93.6835 411.715 94.4999 411.999C94.9112 412.142 95.1932 412.28 95.3628 412.402ZM62.4944 412.463C62.4945 412.463 62.4946 412.464 62.4949 412.464L62.4944 412.463ZM62.4944 412.537C62.4944 412.537 62.4946 412.536 62.4949 412.536L62.4944 412.537ZM95.505 412.536C95.5054 412.536 95.5056 412.537 95.5056 412.537L95.505 412.536Z" stroke="#29B4B4"/>
          <path id="Ellipse 27" d="M94.5301 442.297C94.9038 442.193 95.1736 442.092 95.3497 442C95.1736 441.908 94.9038 441.807 94.5301 441.703C93.7066 441.474 92.4916 441.262 90.9624 441.082C87.9108 440.723 83.6812 440.5 79 440.5C74.3188 440.5 70.0892 440.723 67.0376 441.082C65.5084 441.262 64.2934 441.474 63.4699 441.703C63.0962 441.807 62.8264 441.908 62.6503 442C62.8264 442.092 63.0962 442.193 63.4699 442.297C64.2934 442.526 65.5084 442.738 67.0376 442.918C70.0892 443.277 74.3188 443.5 79 443.5C83.6812 443.5 87.9108 443.277 90.9624 442.918C92.4916 442.738 93.7066 442.526 94.5301 442.297Z" stroke="#29B4B4"/>
          <path id="Ellipse 26" d="M94.5301 382.703C94.9038 382.807 95.1736 382.908 95.3497 383C95.1736 383.092 94.9038 383.193 94.5301 383.297C93.7066 383.526 92.4916 383.738 90.9624 383.918C87.9108 384.277 83.6812 384.5 79 384.5C74.3188 384.5 70.0892 384.277 67.0376 383.918C65.5084 383.738 64.2934 383.526 63.4699 383.297C63.0962 383.193 62.8264 383.092 62.6503 383C62.8264 382.908 63.0962 382.807 63.4699 382.703C64.2934 382.474 65.5084 382.262 67.0376 382.082C70.0892 381.723 74.3188 381.5 79 381.5C83.6812 381.5 87.9108 381.723 90.9624 382.082C92.4916 382.262 93.7066 382.474 94.5301 382.703Z" stroke="#29B4B4"/>
          </g>
          <g id="Rockets_left">
          <path id="Rectangle 35_2" d="M5 466.5C2.51472 466.5 0.5 464.485 0.5 462L0.499999 430.817L0.499997 298.605C0.499997 296.409 0.745115 294.22 1.2308 292.079L15.5372 229.007C15.8905 227.449 18.1095 227.449 18.4628 229.007L32.7692 292.079C33.2549 294.22 33.5 296.409 33.5 298.605L33.5 430.817L33.5 462C33.5 464.485 31.4853 466.5 29 466.5L5 466.5Z" fill="#29B4B4" fill-opacity="0.4" stroke="#29B4B4"/>
          <path id="Rectangle 40_2" d="M9 466.5C6.51472 466.5 4.5 464.485 4.5 462L4.5 430.48L4.5 296.205C4.5 294.53 4.64258 292.859 4.9262 291.208L15.5217 229.554C15.8072 227.893 18.1928 227.893 18.4783 229.554L29.0738 291.208C29.3574 292.859 29.5 294.53 29.5 296.205L29.5 430.48L29.5 462C29.5 464.485 27.4853 466.5 25 466.5L9 466.5Z" stroke="#29B4B4"/>
          <path id="Rectangle 41_2" d="M14 466.5C11.5147 466.5 9.5 464.485 9.5 462L9.5 429.16L9.5 287.405L15.5077 228.544C15.6912 226.747 18.3088 226.748 18.4922 228.544L24.5 287.405L24.5 429.16L24.5 462C24.5 464.485 22.4853 466.5 20 466.5L14 466.5Z" stroke="#29B4B4"/>
          <path id="Rectangle 42_2" d="M15 466.5C14.7239 466.5 14.5 466.276 14.5 466L14.5 431.8L14.5 299.922L17 239.162L19.5 299.922L19.5 431.8L19.5 466C19.5 466.276 19.2761 466.5 19 466.5L15 466.5Z" stroke="#29B4B4"/>
          <path id="Ellipse 18_2" d="M32.5301 297.297C32.9038 297.193 33.1736 297.092 33.3497 297C33.1736 296.908 32.9038 296.807 32.5301 296.703C31.7066 296.474 30.4916 296.262 28.9624 296.082C25.9108 295.723 21.6812 295.5 17 295.5C12.3188 295.5 8.08919 295.723 5.03761 296.082C3.50843 296.262 2.29335 296.474 1.46993 296.703C1.09622 296.807 0.826438 296.908 0.650288 297C0.826438 297.092 1.09622 297.193 1.46993 297.297C2.29335 297.526 3.50843 297.738 5.03761 297.918C8.08919 298.277 12.3188 298.5 17 298.5C21.6812 298.5 25.9108 298.277 28.9624 297.918C30.4916 297.738 31.7066 297.526 32.5301 297.297Z" stroke="#29B4B4"/>
          <path id="Ellipse 21_2" opacity="0.9" d="M26.9102 267.889C26.9103 267.889 26.91 267.888 26.9091 267.886C26.9097 267.888 26.9101 267.889 26.9102 267.889ZM26.8515 267.897C26.868 267.881 26.88 267.868 26.8888 267.858C26.88 267.848 26.868 267.835 26.8515 267.819C26.7689 267.742 26.6193 267.643 26.3807 267.535C25.9066 267.319 25.189 267.113 24.2632 266.935C22.4197 266.58 19.8514 266.358 16.9998 266.358C14.1481 266.358 11.5798 266.58 9.73632 266.935C8.81046 267.113 8.09292 267.319 7.61881 267.535C7.3802 267.643 7.23059 267.742 7.14796 267.819C7.13149 267.835 7.11945 267.848 7.11073 267.858C7.11945 267.868 7.13149 267.881 7.14796 267.897C7.23059 267.974 7.3802 268.073 7.61881 268.181C8.09292 268.397 8.81046 268.603 9.73632 268.781C11.5798 269.135 14.1481 269.358 16.9998 269.358C19.8514 269.358 22.4197 269.135 24.2632 268.781C25.189 268.603 25.9066 268.397 26.3807 268.181C26.6193 268.073 26.7689 267.974 26.8515 267.897ZM7.0893 267.889C7.08937 267.889 7.08982 267.888 7.09041 267.886C7.08952 267.888 7.08922 267.889 7.0893 267.889ZM7.0893 267.827C7.08922 267.827 7.08952 267.828 7.09041 267.83C7.08982 267.828 7.08937 267.827 7.0893 267.827ZM26.9091 267.83C26.91 267.828 26.9103 267.827 26.9102 267.827C26.9101 267.827 26.9097 267.828 26.9091 267.83Z" stroke="#29B4B4"/>
          <path id="Ellipse 20_2" d="M32.5301 353.703C32.9038 353.807 33.1736 353.908 33.3497 354C33.1736 354.092 32.9038 354.193 32.5301 354.297C31.7066 354.526 30.4916 354.738 28.9624 354.918C25.9108 355.277 21.6812 355.5 17 355.5C12.3188 355.5 8.08919 355.277 5.03761 354.918C3.50843 354.738 2.29335 354.526 1.46993 354.297C1.09622 354.193 0.826438 354.092 0.650288 354C0.826438 353.908 1.09622 353.807 1.46993 353.703C2.29335 353.474 3.50843 353.262 5.03761 353.082C8.08919 352.723 12.3188 352.5 17 352.5C21.6812 352.5 25.9108 352.723 28.9624 353.082C30.4916 353.262 31.7066 353.474 32.5301 353.703Z" stroke="#29B4B4"/>
          <path id="Ellipse 28_2" d="M33.5056 324.463C33.5056 324.463 33.5054 324.464 33.505 324.464L33.5056 324.463ZM33.3628 324.402C33.4219 324.445 33.4572 324.477 33.4779 324.5C33.4572 324.523 33.4219 324.555 33.3628 324.598C33.1932 324.72 32.9112 324.858 32.4999 325.001C31.6835 325.285 30.4747 325.549 28.9481 325.773C25.9024 326.221 21.6779 326.5 17 326.5C12.3221 326.5 8.09758 326.221 5.05193 325.773C3.52528 325.549 2.31651 325.285 1.50015 325.001C1.08881 324.858 0.806764 324.72 0.637173 324.598C0.578139 324.555 0.542811 324.523 0.522071 324.5C0.542811 324.477 0.578139 324.445 0.637173 324.402C0.806764 324.28 1.08881 324.142 1.50015 323.999C2.31651 323.715 3.52528 323.451 5.05193 323.227C8.09758 322.779 12.3221 322.5 17 322.5C21.6779 322.5 25.9024 322.779 28.9481 323.227C30.4747 323.451 31.6835 323.715 32.4999 323.999C32.9112 324.142 33.1932 324.28 33.3628 324.402ZM0.494438 324.463C0.494458 324.463 0.494644 324.464 0.494938 324.464L0.494438 324.463ZM0.494438 324.537C0.494418 324.537 0.494564 324.536 0.494937 324.536L0.494438 324.537ZM33.505 324.536C33.5054 324.536 33.5056 324.537 33.5056 324.537L33.505 324.536Z" stroke="#29B4B4"/>
          <path id="Ellipse 24_2" d="M33.5056 412.463C33.5056 412.463 33.5054 412.464 33.505 412.464L33.5056 412.463ZM33.3628 412.402C33.4219 412.445 33.4572 412.477 33.4779 412.5C33.4572 412.523 33.4219 412.555 33.3628 412.598C33.1932 412.72 32.9112 412.858 32.4999 413.001C31.6835 413.285 30.4747 413.549 28.9481 413.773C25.9024 414.221 21.6779 414.5 17 414.5C12.3221 414.5 8.09758 414.221 5.05193 413.773C3.52528 413.549 2.31651 413.285 1.50015 413.001C1.08881 412.858 0.806764 412.72 0.637173 412.598C0.578139 412.555 0.542811 412.523 0.522071 412.5C0.542811 412.477 0.578139 412.445 0.637173 412.402C0.806764 412.28 1.08881 412.142 1.50015 411.999C2.31651 411.715 3.52528 411.451 5.05193 411.227C8.09758 410.779 12.3221 410.5 17 410.5C21.6779 410.5 25.9024 410.779 28.9481 411.227C30.4747 411.451 31.6835 411.715 32.4999 411.999C32.9112 412.142 33.1932 412.28 33.3628 412.402ZM0.494438 412.463C0.494458 412.463 0.494644 412.464 0.494938 412.464L0.494438 412.463ZM0.494438 412.537C0.494418 412.537 0.494564 412.536 0.494937 412.536L0.494438 412.537ZM33.505 412.536C33.5054 412.536 33.5056 412.537 33.5056 412.537L33.505 412.536Z" stroke="#29B4B4"/>
          <path id="Ellipse 27_2" d="M32.5301 442.297C32.9038 442.193 33.1736 442.092 33.3497 442C33.1736 441.908 32.9038 441.807 32.5301 441.703C31.7066 441.474 30.4916 441.262 28.9624 441.082C25.9108 440.723 21.6812 440.5 17 440.5C12.3188 440.5 8.08919 440.723 5.03761 441.082C3.50843 441.262 2.29335 441.474 1.46993 441.703C1.09622 441.807 0.826438 441.908 0.650288 442C0.826438 442.092 1.09622 442.193 1.46993 442.297C2.29335 442.526 3.50843 442.738 5.03761 442.918C8.08919 443.277 12.3188 443.5 17 443.5C21.6812 443.5 25.9108 443.277 28.9624 442.918C30.4916 442.738 31.7066 442.526 32.5301 442.297Z" stroke="#29B4B4"/>
          <path id="Ellipse 26_2" d="M32.5301 382.703C32.9038 382.807 33.1736 382.908 33.3497 383C33.1736 383.092 32.9038 383.193 32.5301 383.297C31.7066 383.526 30.4916 383.738 28.9624 383.918C25.9108 384.277 21.6812 384.5 17 384.5C12.3188 384.5 8.08919 384.277 5.03761 383.918C3.50843 383.738 2.29335 383.526 1.46993 383.297C1.09622 383.193 0.826438 383.092 0.650288 383C0.826438 382.908 1.09622 382.807 1.46993 382.703C2.29335 382.474 3.50843 382.262 5.03761 382.082C8.08919 381.723 12.3188 381.5 17 381.5C21.6812 381.5 25.9108 381.723 28.9624 382.082C30.4916 382.262 31.7066 382.474 32.5301 382.703Z" stroke="#29B4B4"/>
          </g>
          <g id="1st_stage">
          <g id="Union">
          <mask id="path-30-inside-1_99_316" fill="white">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M69.5 172H26.5L33 190.133V445H63V190.133L69.5 172Z"/>
          </mask>
          <path d="M26.5 172V171H25.0792L25.5587 172.337L26.5 172ZM69.5 172L70.4413 172.337L70.9208 171H69.5V172ZM33 190.133H34V189.959L33.9413 189.795L33 190.133ZM33 445H32V446H33V445ZM63 445V446H64V445H63ZM63 190.133L62.0587 189.795L62 189.959V190.133H63ZM26.5 173H69.5V171H26.5V173ZM33.9413 189.795L27.4413 171.663L25.5587 172.337L32.0587 190.47L33.9413 189.795ZM34 445V190.133H32V445H34ZM63 444H33V446H63V444ZM62 190.133V445H64V190.133H62ZM68.5587 171.663L62.0587 189.795L63.9413 190.47L70.4413 172.337L68.5587 171.663Z" fill="#29B4B4" mask="url(#path-30-inside-1_99_316)"/>
          </g>
          <g id="Union_2">
          <mask id="path-32-inside-2_99_316" fill="white">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M63 172H33L37.5349 190.133V190.133V445H58.4651L58.4651 190.133L58.4651 190.133L63 172Z"/>
          </mask>
          <path d="M33 172V171H31.7191L32.0299 172.243L33 172ZM63 172L63.9701 172.243L64.2809 171H63V172ZM37.5349 190.133H38.5349V190.01L38.505 189.89L37.5349 190.133ZM37.5349 445H36.5349V446H37.5349V445ZM58.4651 445V446H59.4651V445H58.4651ZM58.4651 190.133L57.4673 190.066L57.4651 190.1V190.133H58.4651ZM58.4651 190.133L57.495 189.89L57.4733 189.977L57.4673 190.066L58.4651 190.133ZM33 173H63V171H33V173ZM38.505 189.89L33.9701 171.757L32.0299 172.243L36.5648 190.375L38.505 189.89ZM38.5349 190.133V190.133H36.5349V190.133H38.5349ZM38.5349 445V190.133H36.5349V445H38.5349ZM58.4651 444H37.5349V446H58.4651V444ZM57.4651 190.133L57.4651 445H59.4651L59.4651 190.133H57.4651ZM57.4673 190.066L57.4673 190.066L59.4629 190.199L59.4629 190.199L57.4673 190.066ZM62.0299 171.757L57.495 189.89L59.4352 190.375L63.9701 172.243L62.0299 171.757Z" fill="#29B4B4" mask="url(#path-32-inside-2_99_316)"/>
          </g>
          <g id="Union_3">
          <mask id="path-34-inside-3_99_316" fill="white">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M56 172H40L42.4186 190.133H42.4185V445H53.5813V190.133H53.5814L56 172Z"/>
          </mask>
          <path d="M40 172V171H38.8578L39.0088 172.132L40 172ZM56 172L56.9912 172.132L57.1422 171H56V172ZM42.4186 190.133V191.133H43.5608L43.4098 190.001L42.4186 190.133ZM42.4185 190.133V189.133H41.4185V190.133H42.4185ZM42.4185 445H41.4185V446H42.4185V445ZM53.5813 445V446H54.5813V445H53.5813ZM53.5813 190.133V189.133H52.5813V190.133H53.5813ZM53.5814 190.133V191.133H54.4569L54.5726 190.265L53.5814 190.133ZM40 173H56V171H40V173ZM43.4098 190.001L40.9912 171.868L39.0088 172.132L41.4274 190.265L43.4098 190.001ZM42.4185 191.133H42.4186V189.133H42.4185V191.133ZM43.4185 445V190.133H41.4185V445H43.4185ZM53.5813 444H42.4185V446H53.5813V444ZM52.5813 190.133V445H54.5813V190.133H52.5813ZM53.5814 189.133H53.5813V191.133H53.5814V189.133ZM55.0088 171.868L52.5902 190.001L54.5726 190.265L56.9912 172.132L55.0088 171.868Z" fill="#29B4B4" mask="url(#path-34-inside-3_99_316)"/>
          </g>
          <g id="Union_4">
          <mask id="path-36-inside-4_99_316" fill="white">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M52 172H44L45.2093 190.133H45.2093V445H50.7907V190.133H50.7907L52 172Z"/>
          </mask>
          <path d="M44 172V171H42.9311L43.0022 172.067L44 172ZM52 172L52.9978 172.067L53.0689 171H52V172ZM45.2093 190.133V191.133H46.2782L46.2071 190.066L45.2093 190.133ZM45.2093 190.133V189.133H44.2093V190.133H45.2093ZM45.2093 445H44.2093V446H45.2093V445ZM50.7907 445V446H51.7907V445H50.7907ZM50.7907 190.133V189.133H49.7907V190.133H50.7907ZM50.7907 190.133V191.133H51.7262L51.7885 190.199L50.7907 190.133ZM44 173H52V171H44V173ZM46.2071 190.066L44.9978 171.933L43.0022 172.067L44.2115 190.199L46.2071 190.066ZM45.2093 191.133H45.2093V189.133H45.2093V191.133ZM46.2093 445V190.133H44.2093V445H46.2093ZM50.7907 444H45.2093V446H50.7907V444ZM49.7907 190.133V445H51.7907V190.133H49.7907ZM50.7907 189.133H50.7907V191.133H50.7907V189.133ZM51.0022 171.933L49.7929 190.066L51.7885 190.199L52.9978 172.067L51.0022 171.933Z" fill="#29B4B4" mask="url(#path-36-inside-4_99_316)"/>
          </g>
          </g>
          <g id="nozzle">
          <path id="Vector 1" d="M35.6704 448.736L38.4523 445.399C38.9272 444.829 39.6307 444.5 40.3724 444.5H54.8734C55.5428 444.5 56.1843 444.768 56.6542 445.245L60.1037 448.746C60.868 449.522 61.0423 450.703 60.5345 451.666L51.915 468.021C51.3721 469.051 51.3771 470.284 51.9284 471.31L53.664 474.539C53.7681 474.733 53.8226 474.949 53.8226 475.169C53.8226 475.904 53.2267 476.5 52.4917 476.5H43.5083C42.7733 476.5 42.1774 475.904 42.1774 475.169C42.1774 474.949 42.2319 474.733 42.336 474.539L44.0716 471.31C44.6229 470.284 44.6279 469.051 44.085 468.021L35.3789 451.502C34.9066 450.606 35.0217 449.514 35.6704 448.736Z" stroke="#29B4B4"/>
          <path id="Vector 2" d="M41.8521 449.214L43.176 446.038C43.5642 445.107 44.4744 444.5 45.4835 444.5H50.1982C51.1504 444.5 52.02 445.041 52.4408 445.895L54.0559 449.173C54.3222 449.714 54.3843 450.333 54.2308 450.915L49.5264 468.767C49.3709 469.357 49.3724 469.978 49.5308 470.567L50.6091 474.58C50.6437 474.709 50.6613 474.842 50.6613 474.976C50.6613 475.818 49.9788 476.5 49.1369 476.5H46.8631C46.0212 476.5 45.3387 475.818 45.3387 474.976C45.3387 474.842 45.3563 474.709 45.3909 474.58L46.4692 470.567C46.6276 469.978 46.6291 469.357 46.4736 468.767L41.7422 450.813C41.6024 450.282 41.641 449.72 41.8521 449.214Z" stroke="#29B4B4"/>
          </g>
          </g>
          </svg>          
        <h3>Titan family</h3>
        <p class="launches"> Launches:</p><span id="titanLaunches"></span>       
      </div>
      <div class="atlas-info">
        <svg id="atlasRocket" width="47" height="350" viewBox="0 0 47 371" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="atlas">
          <g id="rocket_right">
          <path id="Rectangle 42" d="M46.5 345.337L46.5 257.337C46.5 251.154 41.6193 246.11 35.5 245.848L35.5 346.337C35.5 346.614 35.7239 346.837 36 346.837L45 346.837C45.8284 346.837 46.5 346.166 46.5 345.337Z" fill="#29B4B4" fill-opacity="0.4" stroke="#29B4B4"/>
          <path id="Rectangle 55" d="M40.5 345.337L40.5 251.337C40.5 248.468 38.3032 246.112 35.5 245.86L35.5 346.337C35.5 346.614 35.7239 346.837 36 346.837L39 346.837C39.8284 346.837 40.5 346.166 40.5 345.337Z" stroke="#29B4B4"/>
          </g>
          <g id="rocket_left">
          <path id="Vector" d="M0.5 345.337L0.5 257.337C0.5 251.154 5.38069 246.11 11.5 245.848L11.5 346.337C11.5 346.614 11.2761 346.837 11 346.837L2 346.837C1.17157 346.837 0.5 346.166 0.5 345.337Z" fill="#29B4B4" fill-opacity="0.5" stroke="#29B4B4"/>
          <path id="Rectangle 56" d="M5.5 345.337L5.5 252.337C5.5 248.916 8.14378 246.112 11.5 245.856L11.5 346.337C11.5 346.614 11.2761 346.837 11 346.837L7 346.837C6.17157 346.837 5.5 346.166 5.5 345.337Z" stroke="#29B4B4"/>
          </g>
          <g id="1st_stage">
          <g id="Union">
          <mask id="path-5-inside-1_110_105" fill="white">
          <path d="M11 139.337H36V347.337H11V139.337Z"/>
          </mask>
          <path d="M11 139.337V138.337H10V139.337H11ZM36 139.337H37V138.337H36V139.337ZM36 347.337V348.337H37V347.337H36ZM11 347.337H10V348.337H11V347.337ZM11 140.337H36V138.337H11V140.337ZM35 139.337V347.337H37V139.337H35ZM36 346.337H11V348.337H36V346.337ZM12 347.337V139.337H10V347.337H12Z" fill="#29B4B4" mask="url(#path-5-inside-1_110_105)"/>
          </g>
          <g id="Union_2">
          <mask id="path-7-inside-2_110_105" fill="white">
          <path d="M15 139.337H32V347.337H15V139.337Z"/>
          </mask>
          <path d="M15 139.337V138.337H14V139.337H15ZM32 139.337H33V138.337H32V139.337ZM32 347.337V348.337H33V347.337H32ZM15 347.337H14V348.337H15V347.337ZM15 140.337H32V138.337H15V140.337ZM31 139.337V347.337H33V139.337H31ZM32 346.337H15V348.337H32V346.337ZM16 347.337V139.337H14V347.337H16Z" fill="#29B4B4" mask="url(#path-7-inside-2_110_105)"/>
          </g>
          <g id="Union_3">
          <mask id="path-9-inside-3_110_105" fill="white">
          <path d="M18 139.337H29V347.337H18V139.337Z"/>
          </mask>
          <path d="M18 139.337V138.337H17V139.337H18ZM29 139.337H30V138.337H29V139.337ZM29 347.337V348.337H30V347.337H29ZM18 347.337H17V348.337H18V347.337ZM18 140.337H29V138.337H18V140.337ZM28 139.337V347.337H30V139.337H28ZM29 346.337H18V348.337H29V346.337ZM19 347.337V139.337H17V347.337H19Z" fill="#29B4B4" mask="url(#path-9-inside-3_110_105)"/>
          </g>
          <g id="Union_4">
          <mask id="path-11-inside-4_110_105" fill="white">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M23 139.337H21V347.337H23H25H26V139.337H25H23Z"/>
          </mask>
          <path d="M21 139.337V138.337H20V139.337H21ZM21 347.337H20V348.337H21V347.337ZM26 347.337V348.337H27V347.337H26ZM26 139.337H27V138.337H26V139.337ZM21 140.337H23V138.337H21V140.337ZM22 347.337V139.337H20V347.337H22ZM23 346.337H21V348.337H23V346.337ZM25 346.337H23V348.337H25V346.337ZM26 346.337H25V348.337H26V346.337ZM25 139.337V347.337H27V139.337H25ZM25 140.337H26V138.337H25V140.337ZM23 140.337H25V138.337H23V140.337Z" fill="#29B4B4" mask="url(#path-11-inside-4_110_105)"/>
          </g>
          </g>
          <g id="thruster_left">
          <path id="Vector_2" d="M1.04872 349.765L1.90129 348.163C2.33545 347.347 3.18413 346.837 4.10816 346.837H8.61712C9.47652 346.837 10.2757 347.279 10.7333 348.006L11.8189 349.732C12.2186 350.368 12.3116 351.149 12.0722 351.86L8.02858 363.878C7.78266 364.609 7.78502 365.401 8.0353 366.131L8.88523 368.608C8.9185 368.705 8.93548 368.806 8.93548 368.909C8.93548 369.422 8.51981 369.837 8.00705 369.837H4.99295C4.48019 369.837 4.06452 369.422 4.06452 368.909C4.06452 368.806 4.0815 368.705 4.11477 368.608L4.9647 366.131C5.21498 365.401 5.21734 364.609 4.97142 363.878L0.886109 351.736C0.666845 351.085 0.725661 350.372 1.04872 349.765Z" fill="#29B4B4" fill-opacity="0.5" stroke="#29B4B4"/>
          </g>
          <g id="thruster_right">
          <path id="Vector_3" d="M35.0487 349.765L35.9013 348.163C36.3354 347.347 37.1841 346.837 38.1082 346.837H42.6171C43.4765 346.837 44.2757 347.279 44.7333 348.006L45.8189 349.732C46.2186 350.368 46.3116 351.149 46.0722 351.86L42.0286 363.878C41.7827 364.609 41.785 365.401 42.0353 366.131L42.8852 368.608C42.9185 368.705 42.9355 368.806 42.9355 368.909C42.9355 369.422 42.5198 369.837 42.0071 369.837H38.9929C38.4802 369.837 38.0645 369.422 38.0645 368.909C38.0645 368.806 38.0815 368.705 38.1148 368.608L38.9647 366.131C39.215 365.401 39.2173 364.609 38.9714 363.878L34.8861 351.736C34.6668 351.085 34.7257 350.372 35.0487 349.765Z" fill="#29B4B4" fill-opacity="0.5" stroke="#29B4B4"/>
          </g>
          <g id="nozzle">
          <path id="Rectangle 57" d="M26.7038 369.837L20.2962 369.837C19.386 369.837 18.6855 369.033 18.8104 368.132L19.919 360.132C20.0218 359.39 20.6559 358.837 21.4048 358.837L25.5952 358.837C26.3441 358.837 26.9783 359.39 27.081 360.132L28.1896 368.132C28.3145 369.033 27.614 369.837 26.7038 369.837Z" stroke="#29B4B4"/>
          <rect id="Rectangle 58" x="13.5" y="346.837" width="20" height="12" rx="1.5" stroke="#29B4B4"/>
          <rect id="Rectangle 59" x="17.5" y="346.837" width="12" height="12" rx="1.5" stroke="#29B4B4"/>
          <rect id="Rectangle 60" x="21.5" y="346.837" width="4" height="12" rx="1.5" stroke="#29B4B4"/>
          </g>
          <g id="pod">
          <path id="Rectangle 47" d="M8.89386 126.837L38.1061 126.837C39.1551 126.837 39.8801 127.886 39.5093 128.868L35.7302 138.868C35.5097 139.451 34.9509 139.837 34.3271 139.837L12.6729 139.837C12.0491 139.837 11.4903 139.451 11.2698 138.868L7.49072 128.868C7.11991 127.886 7.84493 126.837 8.89386 126.837Z" stroke="#29B4B4"/>
          <path id="Rectangle 53" d="M13.6115 126.837L33.3885 126.837C34.376 126.837 35.0941 127.775 34.8367 128.728L32.1374 138.728C31.9607 139.383 31.3671 139.837 30.6892 139.837L16.3108 139.837C15.6329 139.837 15.0393 139.383 14.8626 138.728L12.1633 128.728C11.9059 127.775 12.624 126.837 13.6115 126.837Z" stroke="#29B4B4"/>
          <path id="Rectangle 50" d="M17.4005 126.837L29.5995 126.837C30.5364 126.837 31.244 127.687 31.0748 128.608L29.2393 138.608C29.1086 139.32 28.4879 139.837 27.7639 139.837L19.2361 139.837C18.5121 139.837 17.8914 139.32 17.7607 138.608L15.9252 128.608C15.756 127.687 16.4636 126.837 17.4005 126.837Z" stroke="#29B4B4"/>
          <path id="Rectangle 52" d="M22.1569 126.837L24.8431 126.837C25.7161 126.837 26.4047 127.58 26.3389 128.45L25.5831 138.45C25.5239 139.233 24.8719 139.837 24.0873 139.837L22.9127 139.837C22.1281 139.837 21.4761 139.233 21.4169 138.45L20.6611 128.45C20.5953 127.58 21.2839 126.837 22.1569 126.837Z" stroke="#29B4B4"/>
          <g id="Union_5">
          <mask id="path-23-inside-5_110_105" fill="white">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M25.2561 1.57223C24.4983 0.181653 22.5017 0.181651 21.7439 1.57223L6.58214 29.3928C6.49982 29.5438 6.43922 29.6986 6.39869 29.8544C6.14508 30.2946 6 30.8052 6 31.3498V124.35C6 126.007 7.34315 127.35 9 127.35H38C39.6569 127.35 41 126.007 41 124.35V31.3498C41 30.8052 40.8549 30.2946 40.6013 29.8544C40.5608 29.6986 40.5002 29.5438 40.4179 29.3928L25.2561 1.57223Z"/>
          </mask>
          <path d="M21.7439 1.57223L20.8658 1.0937L20.8658 1.0937L21.7439 1.57223ZM25.2561 1.57223L24.3781 2.05076L24.3781 2.05076L25.2561 1.57223ZM6.58214 29.3928L5.70407 28.9143L5.70407 28.9143L6.58214 29.3928ZM6.39869 29.8544L7.26518 30.3536L7.33249 30.2367L7.36646 30.1062L6.39869 29.8544ZM40.6013 29.8544L39.6335 30.1062L39.6675 30.2367L39.7348 30.3536L40.6013 29.8544ZM40.4179 29.3928L39.5398 29.8713L39.5398 29.8713L40.4179 29.3928ZM22.6219 2.05076C23.0009 1.35547 23.9992 1.35547 24.3781 2.05076L26.1342 1.0937C24.9975 -0.992169 22.0026 -0.992172 20.8658 1.0937L22.6219 2.05076ZM7.46021 29.8713L22.6219 2.05076L20.8658 1.0937L5.70407 28.9143L7.46021 29.8713ZM7.36646 30.1062C7.38638 30.0297 7.41679 29.951 7.46021 29.8713L5.70407 28.9143C5.58285 29.1367 5.49207 29.3676 5.43093 29.6025L7.36646 30.1062ZM7 31.3498C7 30.9851 7.0967 30.646 7.26518 30.3536L5.5322 29.3552C5.19345 29.9432 5 30.6254 5 31.3498H7ZM7 124.35V31.3498H5V124.35H7ZM9 126.35C7.89543 126.35 7 125.454 7 124.35H5C5 126.559 6.79086 128.35 9 128.35V126.35ZM38 126.35H9V128.35H38V126.35ZM40 124.35C40 125.454 39.1046 126.35 38 126.35V128.35C40.2091 128.35 42 126.559 42 124.35H40ZM40 31.3498V124.35H42V31.3498H40ZM39.7348 30.3536C39.9033 30.646 40 30.9851 40 31.3498H42C42 30.6254 41.8065 29.9432 41.4678 29.3552L39.7348 30.3536ZM39.5398 29.8713C39.5832 29.951 39.6136 30.0297 39.6335 30.1062L41.5691 29.6026C41.5079 29.3676 41.4172 29.1367 41.2959 28.9143L39.5398 29.8713ZM24.3781 2.05076L39.5398 29.8713L41.2959 28.9143L26.1342 1.0937L24.3781 2.05076Z" fill="#29B4B4" mask="url(#path-23-inside-5_110_105)"/>
          </g>
          <g id="Union_6">
          <mask id="path-25-inside-6_110_105" fill="white">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M25.3328 1.54673C24.6343 -0.0526843 22.3657 -0.0526879 21.6672 1.54673L10.3112 27.5495C10.117 27.9942 10.0979 28.4569 10.2129 28.875C10.1507 29.1155 10.1177 29.3678 10.1177 29.6278V124.35C10.1177 126.007 11.4608 127.35 13.1177 127.35H33.8824C35.5392 127.35 36.8824 126.007 36.8824 124.35V29.6278C36.8824 29.3677 36.8493 29.1155 36.7871 28.8749C36.9021 28.4568 36.883 27.9942 36.6888 27.5495L25.3328 1.54673Z"/>
          </mask>
          <path d="M21.6672 1.54673L20.7508 1.14651L20.7508 1.14651L21.6672 1.54673ZM25.3328 1.54673L24.4164 1.94695L24.4164 1.94695L25.3328 1.54673ZM10.3112 27.5495L9.39482 27.1492L9.39482 27.1492L10.3112 27.5495ZM10.2129 28.875L11.1811 29.1252L11.2479 28.8669L11.1771 28.6096L10.2129 28.875ZM36.7871 28.8749L35.8229 28.6096L35.7522 28.8668L35.8189 29.1251L36.7871 28.8749ZM36.6888 27.5495L35.7723 27.9497L35.7723 27.9497L36.6888 27.5495ZM22.5836 1.94695C22.9328 1.14724 24.0672 1.14724 24.4164 1.94695L26.2493 1.14651C25.2015 -1.25261 21.7985 -1.25262 20.7508 1.14651L22.5836 1.94695ZM11.2277 27.9497L22.5836 1.94695L20.7508 1.14651L9.39482 27.1492L11.2277 27.9497ZM11.1771 28.6096C11.1205 28.4041 11.1284 28.1769 11.2277 27.9497L9.39482 27.1492C9.10558 27.8116 9.07522 28.5097 9.24876 29.1403L11.1771 28.6096ZM11.1177 29.6278C11.1177 29.4529 11.1399 29.2847 11.1811 29.1252L9.24472 28.6248C9.16162 28.9464 9.11768 29.2827 9.11768 29.6278H11.1177ZM11.1177 124.35V29.6278H9.11768V124.35H11.1177ZM13.1177 126.35C12.0131 126.35 11.1177 125.454 11.1177 124.35H9.11768C9.11768 126.559 10.9085 128.35 13.1177 128.35V126.35ZM33.8824 126.35H13.1177V128.35H33.8824V126.35ZM35.8824 124.35C35.8824 125.454 34.987 126.35 33.8824 126.35V128.35C36.0915 128.35 37.8824 126.559 37.8824 124.35H35.8824ZM35.8824 29.6278V124.35H37.8824V29.6278H35.8824ZM35.8189 29.1251C35.8602 29.2847 35.8824 29.4529 35.8824 29.6278H37.8824C37.8824 29.2826 37.8384 28.9463 37.7553 28.6246L35.8189 29.1251ZM35.7723 27.9497C35.8716 28.1769 35.8795 28.404 35.8229 28.6096L37.7513 29.1401C37.9248 28.5096 37.8944 27.8115 37.6052 27.1492L35.7723 27.9497ZM24.4164 1.94695L35.7723 27.9497L37.6052 27.1492L26.2493 1.14651L24.4164 1.94695Z" fill="#29B4B4" mask="url(#path-25-inside-6_110_105)"/>
          </g>
          <g id="Union_7">
          <mask id="path-27-inside-7_110_105" fill="white">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M25.4255 1.59483C24.8793 -0.351272 22.1204 -0.351269 21.5743 1.59483L14.4032 27.1463C14.3396 27.3727 14.3176 27.5988 14.3317 27.8175C14.2688 28.0593 14.2354 28.313 14.2354 28.5745V124.349C14.2354 126.006 15.5785 127.349 17.2354 127.349H29.7648C31.4216 127.349 32.7648 126.006 32.7648 124.349V28.5745C32.7648 28.3126 32.7312 28.0585 32.6681 27.8163C32.6821 27.598 32.66 27.3723 32.5966 27.1463L25.4255 1.59483Z"/>
          </mask>
          <path d="M21.5743 1.59483L20.6115 1.32462L21.5743 1.59483ZM25.4255 1.59483L26.3883 1.32461L25.4255 1.59483ZM14.4032 27.1463L13.4404 26.8761L13.4404 26.8761L14.4032 27.1463ZM14.3317 27.8175L15.2995 28.0691L15.3399 27.9135L15.3296 27.7531L14.3317 27.8175ZM32.6681 27.8163L31.6702 27.7526L31.6599 27.9129L31.7004 28.0683L32.6681 27.8163ZM32.5966 27.1463L33.5594 26.8761L33.5594 26.8761L32.5966 27.1463ZM22.5371 1.86504C22.8102 0.891989 24.1896 0.891995 24.4627 1.86504L26.3883 1.32461C25.569 -1.59454 21.4307 -1.59453 20.6115 1.32462L22.5371 1.86504ZM15.366 27.4165L22.5371 1.86504L20.6115 1.32462L13.4404 26.8761L15.366 27.4165ZM15.3296 27.7531C15.3227 27.6462 15.3332 27.5333 15.366 27.4165L13.4404 26.8761C13.346 27.2122 13.3124 27.5514 13.3337 27.8819L15.3296 27.7531ZM15.2354 28.5745C15.2354 28.3986 15.2578 28.2295 15.2995 28.0691L13.3638 27.5659C13.2798 27.8892 13.2354 28.2274 13.2354 28.5745H15.2354ZM15.2354 124.349V28.5745H13.2354V124.349H15.2354ZM17.2354 126.349C16.1308 126.349 15.2354 125.454 15.2354 124.349H13.2354C13.2354 126.559 15.0262 128.349 17.2354 128.349V126.349ZM29.7648 126.349H17.2354V128.349H29.7648V126.349ZM31.7648 124.349C31.7648 125.454 30.8693 126.349 29.7648 126.349V128.349C31.9739 128.349 33.7648 126.559 33.7648 124.349H31.7648ZM31.7648 28.5745V124.349H33.7648V28.5745H31.7648ZM31.7004 28.0683C31.7422 28.2289 31.7648 28.3983 31.7648 28.5745H33.7648C33.7648 28.2268 33.7202 27.8881 33.6359 27.5643L31.7004 28.0683ZM31.6338 27.4165C31.6665 27.533 31.677 27.6458 31.6702 27.7526L33.6661 27.8801C33.6872 27.5502 33.6535 27.2116 33.5594 26.8761L31.6338 27.4165ZM24.4627 1.86504L31.6338 27.4165L33.5594 26.8761L26.3883 1.32461L24.4627 1.86504Z" fill="#29B4B4" mask="url(#path-27-inside-7_110_105)"/>
          </g>
          <g id="Union_8">
          <mask id="path-29-inside-8_110_105" fill="white">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M25.4866 1.76973C25.2132 -0.589916 21.7867 -0.589908 21.5132 1.76974L19.3986 20.0148C19.3797 20.1775 19.3809 20.3375 19.4 20.4924C19.3883 20.5999 19.3823 20.709 19.3823 20.8196V124.35C19.3823 126.007 20.7255 127.35 22.3823 127.35H24.6176C26.2745 127.35 27.6176 126.007 27.6176 124.35V20.8196C27.6176 20.7089 27.6116 20.5997 27.6 20.4922C27.619 20.3373 27.6202 20.1774 27.6013 20.0148L25.4866 1.76973Z"/>
          </mask>
          <path d="M21.5132 1.76974L20.5199 1.65461L20.5199 1.65461L21.5132 1.76974ZM25.4866 1.76973L24.4933 1.88486L24.4933 1.88486L25.4866 1.76973ZM19.3986 20.0148L18.4052 19.8997L18.4052 19.8997L19.3986 20.0148ZM19.4 20.4924L20.3941 20.6002L20.4066 20.4851L20.3924 20.3701L19.4 20.4924ZM27.6 20.4922L26.6074 20.37L26.5933 20.4849L26.6058 20.6001L27.6 20.4922ZM27.6013 20.0148L26.608 20.13L26.608 20.13L27.6013 20.0148ZM22.5066 1.88487C22.6433 0.705023 24.3565 0.705066 24.4933 1.88486L26.48 1.6546C26.0698 -1.8849 20.9301 -1.88484 20.5199 1.65461L22.5066 1.88487ZM20.3919 20.13L22.5066 1.88487L20.5199 1.65461L18.4052 19.8997L20.3919 20.13ZM20.3924 20.3701C20.383 20.2935 20.3823 20.2133 20.3919 20.13L18.4052 19.8997C18.3772 20.1418 18.3787 20.3814 18.4075 20.6147L20.3924 20.3701ZM20.3823 20.8196C20.3823 20.7451 20.3864 20.672 20.3941 20.6002L18.4058 20.3846C18.3903 20.5278 18.3823 20.6729 18.3823 20.8196H20.3823ZM20.3823 124.35V20.8196H18.3823V124.35H20.3823ZM22.3823 126.35C21.2778 126.35 20.3823 125.454 20.3823 124.35H18.3823C18.3823 126.559 20.1732 128.35 22.3823 128.35V126.35ZM24.6176 126.35H22.3823V128.35H24.6176V126.35ZM26.6176 124.35C26.6176 125.454 25.7222 126.35 24.6176 126.35V128.35C26.8268 128.35 28.6176 126.559 28.6176 124.35H26.6176ZM26.6176 20.8196V124.35H28.6176V20.8196H26.6176ZM26.6058 20.6001C26.6136 20.6718 26.6176 20.7451 26.6176 20.8196H28.6176C28.6176 20.6728 28.6097 20.5276 28.5941 20.3843L26.6058 20.6001ZM26.608 20.13C26.6176 20.2132 26.6169 20.2935 26.6074 20.37L28.5925 20.6143C28.6212 20.3812 28.6227 20.1416 28.5947 19.8997L26.608 20.13ZM24.4933 1.88486L26.608 20.13L28.5947 19.8997L26.48 1.6546L24.4933 1.88486Z" fill="#29B4B4" mask="url(#path-29-inside-8_110_105)"/>
          </g>
          <path id="Ellipse 18" d="M39.509 31.3111C39.7955 31.2429 40.0247 31.1756 40.1999 31.1117C40.0247 31.0478 39.7955 30.9806 39.509 30.9124C38.6557 30.7092 37.4001 30.5221 35.8243 30.3634C32.6787 30.0467 28.3212 29.8499 23.5 29.8499C18.6788 29.8499 14.3213 30.0467 11.1757 30.3634C9.5999 30.5221 8.34431 30.7092 7.49101 30.9124C7.20449 30.9806 6.97532 31.0478 6.80013 31.1117C6.97532 31.1756 7.20449 31.2429 7.49101 31.3111C8.34431 31.5142 9.5999 31.7014 11.1757 31.86C14.3213 32.1767 18.6788 32.3735 23.5 32.3735C28.3212 32.3735 32.6787 32.1767 35.8243 31.86C37.4001 31.7014 38.6557 31.5142 39.509 31.3111Z" stroke="#29B4B4"/>
          <path id="Ellipse 28" d="M39.509 66.9125C39.7955 66.9807 40.0247 67.048 40.1999 67.1119C40.0247 67.1758 39.7955 67.2431 39.509 67.3113C38.6557 67.5144 37.4001 67.7016 35.8243 67.8602C32.6787 68.1769 28.3212 68.3737 23.5 68.3737C18.6788 68.3737 14.3213 68.1769 11.1757 67.8602C9.5999 67.7016 8.34431 67.5144 7.49101 67.3113C7.20449 67.2431 6.97532 67.1758 6.80013 67.1119C6.97532 67.048 7.20449 66.9807 7.49101 66.9125C8.34431 66.7094 9.5999 66.5223 11.1757 66.3636C14.3213 66.0469 18.6788 65.8501 23.5 65.8501C28.3212 65.8501 32.6787 66.0469 35.8243 66.3636C37.4001 66.5223 38.6557 66.7094 39.509 66.9125Z" stroke="#29B4B4"/>
          <path id="Ellipse 26" d="M39.509 102.913C39.7955 102.981 40.0247 103.048 40.1999 103.112C40.0247 103.176 39.7955 103.243 39.509 103.311C38.6557 103.514 37.4001 103.702 35.8243 103.86C32.6787 104.177 28.3212 104.374 23.5 104.374C18.6788 104.374 14.3213 104.177 11.1757 103.86C9.5999 103.702 8.34431 103.514 7.49101 103.311C7.20449 103.243 6.97532 103.176 6.80013 103.112C6.97532 103.048 7.20449 102.981 7.49101 102.913C8.34431 102.709 9.5999 102.522 11.1757 102.364C14.3213 102.047 18.6788 101.85 23.5 101.85C28.3212 101.85 32.6787 102.047 35.8243 102.364C37.4001 102.522 38.6557 102.709 39.509 102.913Z" stroke="#29B4B4"/>
          </g>
          </g>
          </svg>          
        <h3>Atlas family</h3>
        <p class="launches">Launches:</p><span id="atlasLaunches"></span>   
      </div>  
    </div>
  </article> 
</div>

<style>
    .SVG {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      gap: 2.5em;
      z-index: 2;
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
      user-select: none;
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
      z-index: 100;
    }

    input[type="button"]:hover {
      background: rgba(137, 255, 255, 0.408);
      transition: 100ms linear;
    }

    input[type="button"]:active {
      background: rgba(137, 255, 255, 0.405);
      color: black;
      transition: 100ms ease-in-out;
    }

    input[type="button"]:focus {
      background: rgba(137, 255, 255, 0.9);
      color:  black;  
      transition: 100ms linear;
    }

    /* terug knop */
    .InformationUSA > input[type="button"] {
      position: absolute;
      top: 10%;
      right: 5%;
    }

    .InformationUSA {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(90deg, rgb(137 255 255 / 30%) 0%, rgb(255 255 255 / 0%) 100%);
        backdrop-filter: blur(47px);
        padding: 0 4em;
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        opacity: 0;
        z-index: -1;
        user-select: none;
        display: flex;
      }

    .infoContent{
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .rockets {
        display: flex;
        flex-direction: row;
        justify-content: center;
        width: 50%;
        gap: 2em;
      }

    #titanRocket, #atlasRocket {
      overflow: visible;
      margin-bottom: 1em;
    }

    .titan-info, .atlas-info {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        gap: .5em;
    }

    .launches{
        width: auto;
        margin: 0;
        padding: 0;
        color: #29B4B4;
    }

    h3 {
        font-family: 'Conthrax';
        font-size: .8em;
        color: white;
        margin: .5em 0;
    }

     span {
        font-family: 'Conthrax';
        font-size: 1em;
        color: #00FFFF;
        margin: 0;
    }

    strong {
        font-family: 'Conthrax';
        font-size: 1em;
        color: white;
        margin: 0;
    }

    @media only screen and (max-width: 600px) {
      #buttonHolder {
        display: grid;
      }

      #worldmap {
    width: 100%;
    overflow-x: auto;
    margin: 0 auto; /* Center the SVG if needed */
  }
}
</style>
