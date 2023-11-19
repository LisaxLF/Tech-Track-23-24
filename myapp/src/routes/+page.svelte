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
            Tijdens die meeslepende jaren '80 en begin '90, toen de Koude Oorlog op z'n eind liep en de Berlijnse Muur als een kaartenhuis instortte, waren er een paar landen die zich volop stortten op ruimteverkenning. In mijn verhaal duik ik in de twee landen die toen het meest spendeerden aan ruimtemissies. 
          </p>
      </section>

    <section class="main-page-content">
        <h2>
          _SPACE <br>
          <span>ASSIGNMENT</span>
        </h2>
        <LabelsAbove labelText="MISSION INFORMATION"/>
        <p>
            Ik wil een verhaal vertellen die gaat over de jaren 1989 (tijdens de Koude Oorlog) en 1991 (na de val van de Berlijnse Muur) welke drie landen het hoogste bedrag hebben uitgegeven aan ruimtemissies. Ik zal het aantal lanceringen in die jaren voor elk van deze landen analyseren, evenals de specifieke uitgavenbedragen en de gebruikte raketten in deze missies. Ik zal begrijpen welke landen het meest hebben geïnvesteerd in de opgegeven periodes, welke raketten werden ingezet voor deze missies en hoe deze investeringen en keuzes verband houden met de historische context van de Koude Oorlog en de nasleep van de val van 
de Berlijnse Muur.
        </p>

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
  
    h1 span {
      color: #89FFFF;
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
  