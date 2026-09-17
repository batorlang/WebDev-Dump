const submitButton = document.getElementById("submit-data");



async function fetchData() {
    const inputText = document.getElementById("input-show").value;
    const apiResponse = await fetch(`https://api.tvmaze.com/search/shows?q=${inputText}`); //Might not work like this, this was the initial idea of mine
    const data = await apiResponse.json();
    
    //Here I will use the first result of the fetch, assuming that the user uses this program perfectly
    const show = data[0]?.show;

    //In case there is no show found with the input
    if (!show) {
        console.log("Show not found!");
        return;
    }
    //Each element is created here with corresponding content
    const showData = document.createElement("div");
    showData.className = "show-data";

    const img = document.createElement("img");
    img.src = show.image.medium;

    const showInfo = document.createElement("div");
    showInfo.className = "show-info";

    const title = document.createElement("h1");
    title.textContent = show.name;

    const summary = document.createElement("p");
    summary.innerHTML = show.summary;

    //Nesting the elements
    showInfo.appendChild(title);
    showInfo.appendChild(summary);
    showData.appendChild(img);
    showData.appendChild(showInfo);

    //After structuring the div contents for one fetch, I append it into the container
    const showContainer = document.querySelector(".show-container");
    showContainer.appendChild(showData);

};

//Give the button the functionality to fetch data and append the show data into the "list"
submitButton.addEventListener("click", fetchData);
