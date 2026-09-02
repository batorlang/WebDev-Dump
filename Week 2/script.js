//Here I initialize the same rows as given on the moodle page example
const userData = [
    {username: "Webmaster", email: "example@email.com", isAdmin: true},
    {username: "User123", email: "example@email.com", isAdmin: false},
    {username: "AnotherUser222", email: "example@email.com", isAdmin: false}
];

function tablePopulation(data) {
    const tableBody = document.getElementById('tou-body');

    tableBody.innerHTML = ''; //This line is needed for task 2 because the initial rows were being added every time I have added a new user row

    data.forEach(user =>{
        const rows = document.createElement('tr'); //Need to create a new row for each and every user
        //With the rows added now I need cells for the data in the rows
        const usernameCells = document.createElement('td');
        usernameCells.textContent = user.username; //This puts the data insisde the cell as the content of td
        rows.appendChild(usernameCells); //and this will add the username cell filled with the text into the row

        //Now the exact same with all the other rows
        const emailCells = document.createElement('td');
        emailCells.textContent = user.email;
        rows.appendChild(emailCells);

        const adminCells = document.createElement('td');
        if (user.isAdmin === true){
            adminCells.textContent = 'X';
        } else {
            adminCells.textContent = '-';
        }
        rows.appendChild(adminCells);

        const imageCells = document.createElement('td');
        if (user.image) {
            const imageElement = document.createElement('img');
            imageElement.src = user.image;
            imageElement.width = 64; //turns out I dont have to specify the pixel as px as I should be in css
            imageElement.height = 64;
            imageCells.appendChild(imageElement);
        } else {
            imageCells.textContent = 'No image found';
        }
        rows.appendChild(imageCells);

        //Then this finished row of cells are getting appended to the table itself
        tableBody.appendChild(rows);
    });
}

tablePopulation(userData);

const addButton = document.getElementById('addButton');


const clearButton = document.getElementById('empty-table');

clearButton.addEventListener('click', function() {
    //I just set the len of the userData to 0 
    userData.length = 0;
    //with 0 length I just populate the table again and it will be an empty table
    tablePopulation(userData);
});

addButton.addEventListener('click', function(event){

    event.preventDefault();

    const newUsername = document.getElementById('input-username').value;
    const newEmail = document.getElementById('input-email').value;
    const newIsAdmin = document.getElementById('input-admin').checked;

    const imageInput = document.getElementById('input-image');
    let newImageURL = null;
    newImageURL = URL.createObjectURL(imageInput.files[0]);



    //this works as a flag for found user
    let userExists = false;
    for (let i = 0; i < userData.length; i++) {
        if (userData[i].username === newUsername) {
            userData[i].email = newEmail;
            userData[i].isAdmin = newIsAdmin;
            if (newImageURL !== null) {
                userData[i].image = newImageUrl;
            }
            userExists = true;
            break;
        }
    }
    if (userExists === false) {
        const newUser = {
            username: newUsername,
            email: newEmail,
            isAdmin: newIsAdmin,
            image: newImageURL
        };
        userData.push(newUser);
    }
    tablePopulation(userData);
    document.getElementById('input-username').value = '';
    document.getElementById('input-email').value = '';
    document.getElementById('input-admin').checked = false;
    document.getElementById('input-image').value = '';
});