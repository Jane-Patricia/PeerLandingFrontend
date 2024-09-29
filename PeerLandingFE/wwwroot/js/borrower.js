document.addEventListener('DOMContentLoaded', function () {
    getBalance(); // Call getBalance after the DOM is fully loaded
    getLoanList();
    getLoanHistoryList();
});

window.onload = getBalance();
function getBalance() {
    const token = localStorage.getItem('jwtToken');
    const lenderId = sessionStorage.getItem('userId');
    console.log("User ID: ", sessionStorage.getItem('userId'));

    fetch(`/Borrower/ApiBorrower/GetUserById?id=${lenderId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })

        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch user data');

            }
            //console.log(response)
            return response.json();
        })
        .then(data => {
            const lenderElm = document.getElementById('borrowerBalance');
            if (data && !data.isNullOrEmpty) {
                const user = data.data;
                console.log(data);
                if (lenderElm) {
                    lenderElm.innerHTML = 'Rp ' + user.balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                    lenderElm.style.fontFamily = 'Arial, sans-serif';
                    lenderElm.style.fontSize = '22px';
                    lenderElm.style.color = '#2c3e50';
                }
                console.log(user.balance);
                return parseFloat(user.balance);
            }
            else {
                alert('user not found or null');
                return 0;
            }
        })
        .catch(error => {
            alert('Error fetching user data: ' + error.message);
            return 0;
        })
}

function showAddLoanModal() {
    //document.getElementById('updatedBalance').innerHTML = getBalance();
    $('#addLoanModal').modal('show');
}

async function addLoan() {
    const amount = parseFloat(document.getElementById("loanAmount").value);
    const interest = parseFloat(document.getElementById("interestRate").value);
    //const _amount = parseFloat(amount);
    //const _interest = parseFloat(interest);
    const borrowerId = sessionStorage.getItem('userId');
    const reqAddLoanDTO = {
        borrowerId: borrowerId,
        amount: amount,
        interestRate: interest
    }
    //console.log(reqAddLoanDTO);
    const token = localStorage.getItem('jwtToken');
    const response = await fetch('/Borrower/ApiBorrower/AddLoan', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqAddLoanDTO),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add loan')
            }
            return response.json();
        })
        .then(data => {
            alert('Loan added')
            $('#addLoanModal').modal('hide');
            getBalance();
            //nanti diganti tabel loan
        })
        .catch(error => {
            alert('Error adding loan: ' + error.message);
        });
}

async function getLoanList() {
    try {
        const token = localStorage.getItem('jwtToken');
        const borrowerId = sessionStorage.getItem('userId');
        const status = 'requested';
        const response = await fetch(`/Borrower/ApiBorrower/GetLoans?idBorrower=${borrowerId}&status=${status}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        const responseClone = response.clone();
        if (!response.ok) {
            let errorResponse;
            try {
                errorResponse = await responseClone.json();
            } catch (jsonError) {
                errorResponse = await responseClone.text();
            }
            alert(`Failed to fetch loans: ${response.status} - ${errorResponse}`);
            return;
        }

        const jsonData = await response.json();
        if (jsonData.success) {
            populateLoanTable(jsonData.data);
        } else {
            alert('No loans');
        }
    }
    catch (error) {
        //alert('An error occurred while fetching loan data: ' + error.message);
    }
    
}

function populateLoanTable(loans) {
    const loanTable = document.querySelector('#loanListTable tbody');
    loanTable.innerHTML = '';

    loans.forEach(loan => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${loan.amount} </td>
        <td>${loan.interestRate} </td>
        <td>${loan.duration} </td>
        <td>${loan.status} </td>
        `;
        loanTable.appendChild(row);
        //<button class="btn btn-danger btn-sm" onclick="rejectUser('${loan.Id}')">Reject</button>
    })
}

async function getLoanHistoryList() {
    try {
        const token = localStorage.getItem('jwtToken');
        const borrowerId = sessionStorage.getItem('userId');
        const response = await fetch(`/Borrower/ApiBorrower/GetLoans?idBorrower=${borrowerId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        const responseClone = response.clone();
        if (!response.ok) {
            let errorResponse;
            try {
                errorResponse = await responseClone.json();
            } catch (jsonError) {
                errorResponse = await responseClone.text();
            }
            alert(`Failed to fetch loans: ${response.status} - ${errorResponse}`);
            return;
        }

        const jsonData = await response.json();
        if (jsonData.success) {
            populateLoanHistoryTable(jsonData.data);
        } else {
            alert('No loans');
        }
    }
    catch (error) {
        //alert('An error occurred while fetching loan data: ' + error.message);
    }
}

function populateLoanHistoryTable(loans) {
    const loanTable = document.querySelector('#loanHistoryTable tbody');
    loanTable.innerHTML = '';

    loans.forEach(loan => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${loan.amount} </td>
        <td>${loan.interestRate} </td>
        <td>${loan.duration} </td>
        <td>${loan.createdAt} </td>
        <td>${loan.status} </td>
        <td>
            ${loan.status === 'funded' ? '' : '<button class="btn btn-primary btn-sm" onclick="">Detail</button>'}
            ${loan.status === 'funded' ? '<button class="btn btn-success btn-sm" onclick="">Pay</button>' : ''}
        </td>
        `;
        loanTable.appendChild(row);
        //<button class="btn btn-danger btn-sm" onclick="rejectUser('${loan.Id}')">Reject</button>
    })
}

//<td>
//    <button class="btn btn-primary btn-sm" onclick="('${loan.loanId}')">Pay</button>
//</td>