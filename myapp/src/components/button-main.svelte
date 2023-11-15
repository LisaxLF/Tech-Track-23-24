<script>
  export let buttonText = "";
</script>

<style>
  :root {
    --button-main-color: #89FFFF;
  }

  button {
    padding: 12px 16px;
    font-size: 12px;
    font-family: 'Conthrax', sans-serif;
    cursor: pointer;
    color: white;
    border-radius: 25px;
    background: linear-gradient(142deg, rgba(137, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 80%);
    border: 1px solid #ffffff29;
    margin-bottom: 1em;
  }

  button:hover {
    background: rgba(137, 255, 255, 0.408);
    transition: 500ms linear;
  }
</style>

<div>
  <button>{buttonText}</button>
</div>
