//This part of code does the button logic for task 2 and 3
const button = document.getElementById("my-button");
const h1 = document.getElementById("h1");
button.addEventListener('click', function() { //on click function
    console.log('hello world'); //Task 2
    h1.innerHTML = "Moi maailma"; //Task 3

});

//Button logic for task 4 (addig list elements to the unordered list)
const mylist = document.getElementById("my-list");
const listButton = document.getElementById("add-data");
const input = document.getElementById("input"); //Task 5
listButton.addEventListener('click', function(){
    const newItem = document.createElement('li'); //Creates the new list item to be added to the ul
    newItem.innerText = input.value;
    mylist.appendChild(newItem); 
});


