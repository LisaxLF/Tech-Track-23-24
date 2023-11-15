<script>
      export let labelText = "";
</script>
  
  <style>

    :root {
        --button-main-color: #89FFFF;
    }
    /* Your button styles go here */
    
    div {
        color: white;
        width: fit-content;
        font-family: "conthrax";
        font-size: .5em;
        background: rgb(137,255,255);
        background: linear-gradient(142deg, rgba(137,255,255,0.2) 0%, rgba(255,255,255,0) 80%);
        border-top-left-radius : 25px;
        border-bottom-left-radius : 25px;
        padding: 12px 20px;

        margin-bottom: 2em;
    }

</style>
  
<div>{labelText}</div>
