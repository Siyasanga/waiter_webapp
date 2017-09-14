document.querySelector("#loader").addEventListener("click", function() {
  console.log("Done offload!");
  setTimeout(function() {
    document.querySelector("#loader").style.display = "none";
    document.querySelector("#feedback").style.display = "block";
  }, 1000)});
