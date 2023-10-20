
var selectedTicketNumber = [];
var buttonStart = document.getElementById('start');
var tickets = [];
var isReloading = false;
var inTreatment = false;

function loadInfo() {
    const dataAttendant = JSON.parse(getCookie('datauser'));
    console.log(dataAttendant);
    var attName = document.getElementById('attendantName')
    attName.innerText = `${dataAttendant.name}`
    var secName = document.getElementById('sectorName')
    secName.innerText = `${dataAttendant.sector}`
}

window.onload = loadInfo();

function reloadPage() {
    window.location.reload();
}

function selectTicket(ticketNumber) {
    if (inTreatment) {
        return;
    }
    selectedTicketNumber = ticketNumber;
    buttonStart.innerText = `Iniciar atendimento ${ticketNumber[0]}`
    document.getElementById('tip2').style.display = 'block'
}

async function startTreatment() {
    if (!selectedTicketNumber) {
        alert('Selecione algum ticket para começar o atendimento.');
        return;
    }
    inTreatment = true;
    document.getElementById('tip2').style.display = 'none';
    buttonStart.style.display = 'none';
    document.getElementById('starting').style.display = 'block';
    console.log(selectedTicketNumber);
    await axios.post('http://localhost:5400/treatment/start', {
        ticket: selectedTicketNumber[0],
        id: selectedTicketNumber[1]
    })
        .then(res => {
            console.log(res.data.response_data);
            document.getElementById('started').style.display = 'block';
            document.getElementById('started').innerText = `Atendimento iniciado: ${res.data.response_data.value}`
            document.getElementById('finish').style.display = 'block';
            document.getElementById('finish').innerText = `Finalizar atendimento ${res.data.response_data.value}`;
            document.getElementById('starting').style.display = 'none';
            document.getElementById('started').style.display = 'none';
            inTreatment = true;
        }).catch(err => {
            console.warn(err);
            alert('Ocorreu um erro... Por favor, atualize o seu sistema.');
            inTreatment = false;
        });

}

async function finishTreatment() {
    await axios.post('http://localhost:5400/treatment/finish', {
        ticket: selectedTicketNumber[0],
        id: selectedTicketNumber[1]
    })
        .then(res => {
            console.log(res.data.response_data);
            selectedTicketNumber = [];
            document.getElementById('start').style.display = 'block';
            document.getElementById('start').innerText = 'Selecione um ticket';
            document.getElementById('starting').style.display = 'none';
            document.getElementById('started').style.display = 'none';
            document.getElementById('finish').style.display = 'none';
            inTreatment = false;
            autoReload();
        }).catch(err => {
            autoReload();
            console.warn(err);
            alert('Ocorreu um erro... Por favor, atualize o seu sistema agora.');
            document.getElementById('start').style.display = 'block';
            document.getElementById('start').innerText = 'Selecione um ticket';
            document.getElementById('starting').style.display = 'none';
            document.getElementById('started').style.display = 'none';
            document.getElementById('finish').style.display = 'none';
        });
}

// Tickets Table

// // Reload each 10 seconds
async function autoReload() {
    if (isReloading) {
        return;
    }
    isReloading = true;
    await axios.get('http://localhost:5400/ticket/all')
        .then(res => {
            tickets = res.data.response_data.filter(ticket => ticket.isFinished === false && ticket.isWaiting === true);
            createTicketDivs();
        }).catch(err => {
            isReloading = false;
            alert('Ocorreu um erro ao carregar os tickets...');
            console.warn(err);
        })
}
function createTicketDivs() {
    const container = document.getElementById('container');

    // Limpa o conteúdo do contêiner
    container.innerHTML = `
        <div class="content2Info" onclick="autoReload()">
            <a id="reloadTickets"> Recarregar tickets <img src="./images/refresh-cw.svg" class="reloadImg"/> </a>
        </div>
    `;
    if (!tickets || tickets.length == 0) {
        const buttonDiv = document.createElement('div');
        buttonDiv.innerHTML = `
            <p>Não foram encontrados nenhum ticket.</p>
        `;
        container.appendChild(buttonDiv);
        isReloading = false;
        return;
    }

    tickets.forEach(ticket => {
        const buttonDiv = document.createElement('div');
        const preferentialText = ticket.isPreferred ? 'Preferencial *' : 'Não Preferencial';
        const ticketNumber = ticket.value;

        buttonDiv.innerHTML = `
            <button class="tickets" onclick="selectTicket([${ticket.value}, '${ticket.id}'])">
                <p class="ticketsText">${preferentialText}</p>
                <div>
                    <p>${ticketNumber}</p>
                </div>
            </button>
        `;

        container.appendChild(buttonDiv);
    });
    isReloading = false;
}

setInterval(autoReload(), 10000);

setInterval(() => {
    if (inTreatment === true) {
        const container = document.getElementById('container');
        container.style.borderColor = '#f00';
    } else {
        const container = document.getElementById('container');
        container.style.borderColor = '#008000';
    }
}, 500);

// // Mostrar tickets


function getCookie(name) {
    // Add the = sign
    name = name + '=';
    // Get the decoded cookie
    var decodedCookie = decodeURIComponent(document.cookie);
    // Get all cookies, split on ; sign
    var cookies = decodedCookie.split(';');
    // Loop over the cookies
    for (var i = 0; i < cookies.length; i++) {
        // Define the single cookie, and remove whitespace
        var cookie = cookies[i].trim();
        // If this cookie has the name of what we are searching
        if (cookie.indexOf(name) == 0) {
            // Return everything after the cookies name
            return cookie.substring(name.length, cookie.length);
        }
    }
}
