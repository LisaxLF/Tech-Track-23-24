<script>
    import LabelsAbove from '../components/labels.svelte';
    import BarChart from '../components/barChart.svelte';
    import Card from '../components/Cards.svelte';
    

</script>
  
  <main>
    <section class="main-page-content">
		<img class="spaceman" src="src/images/spaceman.png" alt="astronaut">
        <!-- Content for the home section -->
        <LabelsAbove labelText="Lisa Lotte Fokkinga | 50079162"/>
        <h1>
          _SPACE <br>
          <span>MISSIONS</span>
        </h1>
        <p>
          "In the exciting years of the '80s and early '90s, as the Cold War was ending and the Berlin Wall fell, some countries got really into exploring space. In my story, I'll focus on the two countries that spent the most on space missions during that time."          </p>
      </section>

    <section class="main-page-content">
        <h2>
          _SPACE <br>
          <span>ASSIGNMENT</span>
        </h2>
        <LabelsAbove labelText="MISSION INFORMATION"/>
        <p>
          <span>Mission Title:</span> Operation Investigate Space Endeavors <br>
          <span>Mission Duration:</span> 1947 - 1991 <br>
          <span>Location:</span> Global, with focus on key space agencies <br>
        </p>
        <p>
          Mission Objectives:
        </p>
          <ul>
            <li>
              Look at what different countries spent on space stuff during 1947 to 1991, when things were tense during the Cold War and after the Berlin Wall fell.</li>
            <li>
              Find out which three countries used the most money on space missions.
            </li>
            <li>
              Study how many times these countries sent stuff into space, how much they spent, and what kind of rockets they used.</li>
            <li>
              Understand why these countries spent a lot and what rockets they picked, considering the Cold War and what happened after the Berlin Wall fell.</li>
          </ul>

        <section class='cards-holder'>
            <Card alt_text="none" image_url="src/images/war.jpg" header="Timezone" plaintext="Its 1989 the coldwar begun, everyone is scared the world is going to blow up in pieces"/>
            <Card alt_text="none" image_url="src/images/earth.jpg" header="Countries" plaintext="The big countries USA and Russia are the ones with the most money which one will find the most habited place first"/>
            <Card alt_text="none" image_url="src/images/rocket.jpg" header="Rockets" plaintext="We find to find out how much each country invested in money and how many lauches each country has"/>
        </section>
      </section>

    <section class="main-page-content">
        <img class="spacebal" src="src/images/spacebal.png" alt="astronaut">
        <h2>
            _SPACE <br>
            <span>DATAVISUALISATION</span>
          </h2>
          <p>
            gebruikte raketten in deze missies. Ik zal begrijpen welke landen het meest hebben geïnvesteerd in de opgegeven periodes, welke raketten werden ingezet voor deze missies en hoe deze investeringen en keuzes verband houden met de historische context van de Koude Oorlog en de nasleep van de val van 
            de Berlijnse Muur.
          </p>
          <LabelsAbove labelText="All the launches during coldwar"/>
          <div>
            <BarChart/>
          </div>
  
      </section>
  </main>
  
  <style>
    main {
      width: 100vw;
      height: 100vh;
      padding: 0;
      margin: 0;
      box-sizing: border-box;
      /* display: flex;
      overflow: hidden; */
    }
  
    h1 {
      color: white;
      font-family: 'Sutherla';
      font-size: 4.5em;
      letter-spacing: 8px;
      line-height: 108%;
      padding: 0;
      margin: 0 0 0.5em 0;
      font-weight: normal;
    }
  
    h1 span, span {
      color: #89FFFF;
      font-weight: bold;
    }

    li {
    color: rgba(255, 255, 255, 0.80);
    line-height: 15px;
    letter-spacing: 1px;
    width: 50em;
    font-family: "Conthrax";
    font-size: .6em;
    font-weight: normal;
    }

    ul {
    margin: 0;
    padding: 0;
    list-style-type: none;
    }
  
    .main-page-content {
        height: 100vh;
        width: 100vw;
        box-sizing: border-box;
        padding: 0 4em;
        display: flex;
        justify-content: center;
        flex-direction: column;
        margin-bottom: 4em;
    }

    .main-page-content:nth-of-type(1) {
        position: relative;
    }

    .main-page-content:nth-of-type(2) {
        height: fit-content;
        width: 100vw;
    }

    .main-page-content:nth-of-type(3) {
        position: relative;
    }

    .spacebal {
        position: absolute;
        z-index: -10;
        left: -30%;
        height: 100%;
        object-fit: contain;
    }

    .cards-holder{
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        justify-content: space-between;
        margin: 2em 0;
    }
  </style>
  