
document.addEventListener('DOMContentLoaded', function () {
    getBalance(); // Call getBalance after the DOM is fully loaded
    fetchLoans();
    getRepayment();
});

//window.onload = getBalance();
function getBalance() {
    const token = localStorage.getItem('jwtToken');
    const lenderId = sessionStorage.getItem('userId');
    console.log("User ID: ", sessionStorage.getItem('userId')); 

    fetch(`/Lender/ApiLender/GetUserById?id=${lenderId}`, {
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
            const lenderElm = document.getElementById('lenderBalance');
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


async function fetchLoans() {
    const token = localStorage.getItem('jwtToken');
    const lenderId = sessionStorage.getItem('userId');
    var lenderBalance = 0;

    const balanceRes = await fetch(`/Lender/ApiLender/GetUserById?id=${lenderId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    if (!balanceRes.ok) {
        throw new Error('Failed to fetch user data');
    }

    const balanceData = await balanceRes.json();

    if (balanceData.success) {
        lenderBalance = balanceData.data.balance
    } else {
        alert('user not found or null');
    }

    const response = await fetch('/Lender/ApiLender/GetLoans', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });
    if (!response.ok) {
        alert('failed to fetch loans');
        return;
    }

    const jsonData = await response.json();
    if (jsonData.success) {
        const matchLoans = jsonData.data.filter(loan => loan.amount <= lenderBalance && loan.status !== "funded") 
        populateUserTable(matchLoans);
    } else {
        alert('No loans');
    }
}

function populateUserTable(loans) {
    const loanTable = document.querySelector('#loanTable tbody');
    loanTable.innerHTML = '';

    loans.forEach(loan => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${loan.borrowerName} </td>
        <td>${loan.amount} </td>
        <td>${loan.interestRate} </td>
        <td>${loan.duration} </td>
        <td>${loan.status} </td>
        <td>
            <button class="btn btn-primary btn-sm" onclick="updateStatusBalance('${loan.loanId}')">Accept</button>
        </td>
        `;
        loanTable.appendChild(row);
        //<button class="btn btn-danger btn-sm" onclick="rejectUser('${loan.Id}')">Reject</button>
    })
}

function balanceModal() {
    //document.getElementById('updatedBalance').innerHTML = getBalance();
    $('#udpateBalanceModal').modal('show');
}

async function updateBalance() {
    const token = localStorage.getItem('jwtToken');
    const lenderId = sessionStorage.getItem('userId');
    const balanceText = document.getElementById('updatedBalance').value;
    //const pastBalanceText = document.getElementById('lenderBalance').innerText;
    //const pastBalance = parseFloat(pastBalanceText)
    const balance = parseFloat(balanceText);
    console.log(balance);
    var userBalance = 0;

    const res = await fetch(`/Lender/ApiLender/GetUserById?id=${lenderId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    if (!res.ok) {
        throw new Error('Failed to fetch user data');
    }

    const jsonData = await res.json();

    if (jsonData.success) {
        userBalance = jsonData.data.balance
    } else {
        alert('user not found or null');
    }

    const ReqUpdateBalanceDto = {
        balance: balance + userBalance
    }

    console.log(ReqUpdateBalanceDto);

    const response = await fetch(`/Lender/ApiLender/UpdateUserBalance?id=${lenderId}`, {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(ReqUpdateBalanceDto),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update user balance')
            }
            return response.json();
        })
        .then(data => {
            alert('User balance updated successfully')
            $('#udpateBalanceModal').modal('hide');
            getBalance()
        })
        .catch(error => {
            alert('Error fetching used data: ' + error.message);
        });
}

async function updateStatusBalance(id) {
    const token = localStorage.getItem('jwtToken');
    const _lenderId = sessionStorage.getItem('userId');


    if (!id || !_lenderId) {
        console.log(id);
        console.log(_lenderId);

        alert('Missing loan ID or lender ID');
        return;
    }


    const ReqAccLoan = {
        loanId: id,
        lenderId: _lenderId
    };

    const response = await fetch('/Lender/ApiLender/AccFunded', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(ReqAccLoan),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to run accept funding')
            }
            return response.json();
        })
        .then(data => {
            alert('Sucess accepted funding')
        })
        .catch(error => {
            alert('Error accepting funding: ' + error.message);
        });

}

async function getRepayment() {
    const token = localStorage.getItem('jwtToken');
    const lenderId = sessionStorage.getItem('userId');
    //const status = 'on repay';

    const res = await fetch(`/Lender/ApiLender/RepaymentList?idLender=${lenderId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    if (!res.ok) {
        throw new Error('Failed to fetch repayment');
    }

    const data = await res.json();

    if (data.success) {
        console.log(data);
        populateHistoryTable(data.data)
    } else {
        alert('user not found or null');
    }

}
function populateHistoryTable(loans) {
    const loanTable = document.querySelector('#loanHistoryTable tbody');
    loanTable.innerHTML = '';

    loans.forEach(loan => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${loan.borrowerName} </td>
        <td>${loan.amount} </td>
        <td>${loan.repaidAmount} </td>
        <td>${loan.balanceAmount} </td>
        <td>${loan.repaidStatus} </td>
        <td>${loan.paidAt} </td>
        <td>
            <button class="btn btn-primary btn-sm" onclick="updateStatusBalance('${loan.loanId}')">Detail</button>
        </td>`;

        loanTable.appendChild(row);
    })
}
