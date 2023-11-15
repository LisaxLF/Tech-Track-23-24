<script>
  import { onMount } from 'svelte';

  let Missies = []; // Initialiseer de variabele voor de JSON-data
  let filteredBy = []; // Initialiseer de variabele voor de gefilterde data

  onMount(async () => {
    try {
      // Haal de JSON-data op met een fetch-verzoek
      const data = await fetch('../src/data.json');

      if (data.ok) {
        Missies = await data.json(); // Wijs de JSON-data toe aan 'Missies'

        // Filter de data op basis van locatie "USA" en datum "2020"
        filteredBy = Missies.filter(missie => {
          // Controleer of zowel Location als Datum eigenschappen aanwezig zijn en de gewenste waarden bevatten
          return missie.Location.includes("China") || missie.Location.includes("USA") || missie.Location.includes("Russia") || missie.Date.includes("1989");
        });

      } else {
        console.error('Fout bij het ophalen van de data:', data.statusText);
      }
    } catch (error) {
      console.error('Fout bij het ophalen van de data:', error);
    }
  });
</script>

<!-- Gebruik de 'filteredBy' variabele in je component -->
<ul>
  {#each filteredBy as missie (missie.id)}
    <li>
      <strong>Bedrijf:</strong> {missie.CompanyName}<br>
      <strong>Locatie missie:</strong> {missie.Location}<br>
      <strong>Datum missie:</strong> {missie.Date}<br>
      <strong>Details:</strong> {missie.RocketName}<br>
      <strong>Raketstatus:</strong> {missie.Status}<br>
      <strong>Missie Costs:</strong> {#if missie.Costs === "id"}
        unknown
      {:else}
        {missie.Costs}
      {/if}<br>      
      <strong>Missie status:</strong> {missie.StatusMission}<br>
    </li>
  {/each}
</ul>

<style>
  li {
    margin-top: 1em;
  }
</style>