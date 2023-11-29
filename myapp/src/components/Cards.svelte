<script>
  export let header = "";
  export let plaintext = "";
  export let image_url = "";
  export let alt_text = "";
</script>

<style>
  article {
    background: linear-gradient(90deg, rgba(137, 255, 255, 0.218) 0%, rgba(255, 255, 255, 0.234) 60%);
    border-radius: 25px;
    border: 1px solid rgba(137, 255, 255, 0.153);
    width: 100%;
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    max-width: 350px;
    gap: 1em;
  }

  .image-holder{
    padding-left: 0.5em;
  }

  .image-holder img {
    object-fit: cover;
    width: 6em;
    height: 6em;
    border-radius: 50%;
  }

  .text-holder{
    padding: 1em 0.5em;
    height: 7.5em;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
  }

  h3 {
    margin: 0;
  }

  p {
    color: white;
    width: 100%;
    font-size: 0.55em;
    line-height: 13px;
  }

</style>

<article>
  <div class="image-holder">
    <img src={image_url} alt={alt_text}>
  </div>
  <div class="text-holder">
    <h3>
      {header}
    </h3>
    <p>
      {plaintext}
    </p>
  </div>

</article>
