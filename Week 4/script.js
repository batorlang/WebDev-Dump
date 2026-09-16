const submitButton = document.getElementById("submit-data");



async function fetchData() {
    const inputText = document.getElementById("input-show").value;
    const apiResponse = await fetch(`https://api.tvmaze.com/search/shows?q=${inputText}`); //Might not work like this, this was the initial idea of mine
    const data = await apiResponse.json();
    
    //Here I need to create the elements according to the template and fill in the div with the fetched data.
    //TBC
    

    //The response gives back apparantly a huge array of data.
    //I will need show.name, show.image.medium(might be null), show.summary


};
