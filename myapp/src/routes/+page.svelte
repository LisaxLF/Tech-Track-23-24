<script>
    import LabelsAbove from '../components/labels.svelte';
    import BarChart from '../components/barChart.svelte';
    import Card from '../components/Cards.svelte';
    import '../global.css'
</script>

<main>
  <section class="main-page-content">
    <img class="spaceman" src="/images/spaceman.png" alt="astronaut">
    <LabelsAbove labelText="Lisa Lotte Fokkinga | 50079162"/>
    <h1>
      _SPACE <br>
      <span>MISSIONS</span>
    </h1>
    <p>
      Welcome to our website dedicated to exploring the rockets launched by countries during the Cold War era. Delve into an interactive visualization that maps out the significant achievements in space exploration by different nations during this historic period. Discover and explore the standout rockets launched by various countries, showcasing the most prominent advancements in space technology.
    </p>
  </section>
  <section class="main-page-content">
    <article>
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
        <li>Dive into an interactive visualization showcasing rockets launched by countries during the Cold War era.</li>
        <li>Explore the major time periods in space exploration by different nations during this historic period.</li>
        <li>Discover the standout rocket family's launched by various countries, highlighting the amount of launches in this cold war.</li>
      </ul>
    </article>
    <section class='cards-holder'>
      <Card alt_text="none" image_url="/images/war.jpg" header="Timezone" plaintext="Its 1989 the cold war begun, everyone is scared the world is going to blow up in pieces"/>
      <Card alt_text="none" image_url="/images/earth.jpg" header="Countries" plaintext="The big countries USA and Russia are the ones with the most money which one will find the most habited place first"/>
      <Card alt_text="none" image_url="/images/rocket.jpg" header="Rockets" plaintext="We find to find out how much each country invested in money and how many lauches each country has"/>
    </section>
  </section>
  <section class="main-page-content">
    <img class="spacebal" src="/images/spacebal.png" alt="astronaut">
    <h2>
      _SPACE <br>
      <span>DATAVISUALISATION</span>
    </h2>
    <p>
      Explore our interactive world map visualization showcasing space missions during the Cold War era. Dive into historical data and filter missions by time periods. Click on the United States for detailed information about American missions, unveiling crucial insights and significant contributions made during this iconic period of space exploration    </p>
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
    width:85%;
    }

    ul {
    margin: 0;
    padding: 0;
    list-style-type: none;
    }
  
    .main-page-content {
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
        height: 100vh;
    }

    .main-page-content:nth-of-type(2) {
        height: 100vh;
        width: 100vw;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 1.5em;
    }

    .main-page-content:nth-of-type(3) {
      position: relative;
      height: fit-content;
      align-items: center;
      gap: 0.5em;
    }

    .main-page-content:nth-of-type(3) > p {
      text-align: center;
    }

    .main-page-content:nth-of-type(3) > h2 {
      text-align: center;
    }

    .spacebal {
        z-index: -10;
        position: absolute;
        left: -50%;
        top: 0;
    }

    .cards-holder{
      display: flex;
      flex-wrap: wrap;
      flex-direction: column;
      justify-content: space-between;
      margin: 2em 0;
      height: fit-content;
      width: 100%;
      gap: 1em;
      align-items: center;
    }

  </style>
  <slot />