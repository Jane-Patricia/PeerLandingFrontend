async function fetchUsers() {
    const token = localStorage.getItem('jwtToken');
    const response = await fetch('/Admin/ApiMstUser/GetAllUsers', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });
    if (!response.ok) {
        alert('failed to fetch users');
        return;
    }

    const jsonData = await response.json();
    if (jsonData.success) {
        populateUserTable(jsonData.data);
    } else {
        alert('No users')
    }
}

function populateUserTable(users) {
    const userTableBody = document.querySelector('#userTable tbody');
    userTableBody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${user.name} </td>
        <td>${user.email} </td>
        <td>${user.role} </td>
        <td>${user.balance} </td>
        <td>
            <button class="btn btn-primary btn-sm" onclick="editUser('${user.id}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteUser('${user.id}')">Delete</button>
        </td>
        `;
        userTableBody.appendChild(row);
    })
}

window.onload = fetchUsers;

function editUser(id) {
    const token = localStorage.getItem('jwtToken');

    fetch(`/Admin/ApiMstUser/GetUserById?id=${id}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })

        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
                
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                const user = data.data;

                document.getElementById('userName').value = user.name;
                document.getElementById('userRole').value = user.role;
                document.getElementById('userBalance').value = user.balance;

                //Id user
                document.getElementById('userId').value = id;

                $('#editUserModal').modal('show');
            }
            else {
                alert('user not found');
            }
        })
        .catch(error => {
            alert('Error fetching user data: ' + error.message);
        })
}

function updateUser() {
    const id = document.getElementById('userId').value;
    const name = document.getElementById('userName').value;
    const role = document.getElementById('userRole').value;
    const balance = document.getElementById('userBalance').value;

    const reqMstUserDto = {
        name: name,
        role: role,
        balance: parseFloat(balance)
    }

    console.log(reqMstUserDto);

    const token = localStorage.getItem('jwtToken');

    const response = fetch(`/Admin/ApiMstUser/updateUser?id=${ id }`, {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(reqMstUserDto),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update user')
            }
            return response.json();
        })
        .then(data => {
            alert('User updated successfully')
            $('#editUserModal').modal('hide');
            fetchUsers();
        })
        .catch(error => {
            alert('Error fetching used data: ' + error.message);
        });

}

function deleteUser(id) {
    var confirmation = confirm('Are you sure you want to delete the data?');
    if (!confirmation) {
        return;
    }
    const token = localStorage.getItem('jwtToken');

    const response = fetch(`/Admin/ApiMstUser/deleteUser?id=${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token,
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete user')
            }
            return response.json();
        })
        .then(data => {
            alert("User Deleted");
            fetchUsers();
        })
        .catch(error => {
            alert('Error fetching used data: ' + error.message);
        });
}

function showAddUserModal() {
    document.getElementById('newUserName').value = '';
    document.getElementById('newUserEmail').value = '';
    document.getElementById('newUserRole').value = 'lender';

    $('#addUserModal').modal('show');
}

function addUser() {
    const name = document.getElementById('newUserName').value;
    const email = document.getElementById('newUserEmail').value;
    const role = document.getElementById('newUserRole').value;

    const reqAddUserDto = {
        name: name, 
        email: email,
        password: 'Password1',
        role: role,
        balance: 0
    }

    const token = localStorage.getItem('jwtToken');

    const response = fetch('/Admin/ApiMstUser/RegisterUser', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqAddUserDto),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to register user')
            }
            return response.json();
        })
        .then(data => {
            alert('User registered')
            $('#addUserModal').modal('hide');
            fetchUsers();
        })
        .catch(error => {
            alert('Error registered user: ' + error.message);
        });
}