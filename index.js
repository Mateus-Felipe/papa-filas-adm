var selectedTicketNumber = [];
var buttonStart = document.getElementById('start');
var tickets = [];
var ticketsNotFinished = [];
var isReloading = false;
var inTreatment = false;
var sequencePreferred = 0;

async function loadInfo() {
    // var userInfosCookie = getCookie('datauser')
    var userInfosCookie = await window.electronAPI.getLoginAuth();
    // console.log(userInfosCookie);
    if (!userInfosCookie) {
        return window.location.href = "login.html";
    }
    const dataAttendant = JSON.parse(userInfosCookie);
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
    if (selectedTicketNumber.length == 0) {
        alert('Selecione algum ticket para começar o atendimento.');
        return;
    }
    inTreatment = true;
    document.getElementById('tip2').style.display = 'none';
    buttonStart.style.display = 'none';
    document.getElementById('starting').style.display = 'block';
    await axios.post('http://localhost:6100/treatment/start', {
        ticket_id: selectedTicketNumber[1],
        sector: selectedTicketNumber[2],
        isPreferred: selectedTicketNumber[3]
    }, {
        "Access-Control-Request-Private-Network": true,
        "Access-Control-Allow-Credentials": true,
    })
        .then(async res => {
            if (res.data.err) {
                selectedTicketNumber = [];
                document.getElementById('start').style.display = 'block';
                document.getElementById('start').innerText = 'Selecione um ticket';
                document.getElementById('starting').style.display = 'none';
                document.getElementById("finish").style.display = "none"
                document.getElementById('infoTicket').style.display = 'none'
                inTreatment = false;
                alert('Usuário já está sendo atendido! Sempre atualize seus tickets antes de chamar');
                autoReload();
                return;
            }
            document.getElementById('finish').innerText = `Finalizar atendimento ${res.data.response_data.value}`;
            document.getElementById('finish').style.display = 'block';
            document.getElementById('starting').style.display = 'none';
            var newDate = new Date(res.data.response_data.created_at);
            document.getElementById('infoTicket').innerHTML = `
                <h3>Numero: ${res.data.response_data.value}</h3>
                <h3>Preferêncial: ${res.data.response_data.isPreferred ? 'Sim' : 'Não'}</h3>
                <h3>Setor: ${res.data.response_data.sectorName}</h3>
                <h3>Data: ${newDate.getDate() + '/' + (newDate.getMonth() + 1) + '/' + newDate.getFullYear()}</h3>
                <h3>Hora: ${newDate.getHours() + ':' + newDate.getMinutes()}</h3>
            `
            inTreatment = true;
            document.getElementById('infoTicket').style.display = 'block'
            sequencePreferred = await sequencePreferred == 2 ? 0 : sequencePreferred + 1;
        }).catch(err => {
            document.getElementById('infoTicket').style.display = 'none'
            console.warn(err);
            alert('Ocorreu um erro... Por favor, atualize o seu sistema.');
            inTreatment = false;
        })

}

async function finishTreatment(dataTicketOld) {
    // console.log(dataTicketOld[4]);
    // console.log(selectTicket[1]);
    if (dataTicketOld && dataTicketOld[3]) {
        if (!window.confirm(`Tem certeza que deseja finalizar o Ticket ${dataTicketOld[0]} que já foi chamado ? `)) {
            return;
        }
    }
    await axios.post('http://localhost:6100/treatment/finish', {
        ticket_id: dataTicketOld && dataTicketOld[3] ? dataTicketOld[1] : selectedTicketNumber[1],
        sector: dataTicketOld && dataTicketOld[3] ? dataTicketOld[2] : selectedTicketNumber[2],
        isPreferred: dataTicketOld && dataTicketOld[3] ? dataTicketOld[4] : selectedTicketNumber[3]
    }, {
        "Access-Control-Request-Private-Network": true,
        "Access-Control-Allow-Credentials": true,
    })
        .then(() => {
            var finish = document.getElementById('finish');
            selectedTicketNumber = [];
            document.getElementById('start').style.display = 'block';
            document.getElementById('start').innerText = 'Selecione um ticket';
            document.getElementById('starting').style.display = 'none';
            // document.getElementById('started').style.display = 'none';
            finish.style.display = "none";
            document.getElementById('infoTicket').style.display = 'none';
            inTreatment = false;
            // window.location.reload();
            autoReload();
        }).catch(err => {
            console.warn(err);
            selectedTicketNumber = [];
            document.getElementById('start').style.display = 'block';
            document.getElementById('start').innerText = 'Selecione um ticket';
            document.getElementById('starting').style.display = 'none';
            // document.getElementById('started').style.display = 'none';
            finish.style.display = "none";
            document.getElementById('infoTicket').style.display = 'none';
            inTreatment = false;
            autoReload();
        });
    inTreatment = false;
}

// Tickets Table

// // Reload each 10 seconds
async function autoReload() {
    if (isReloading) {
        return;
    }
    isReloading = true;
    await axios.get('http://localhost:6100/ticket/all', {
        headers: {
            "ngrok-skip-browser-warning": 4,
            "Access-Control-Request-Private-Network": true,
            "Access-Control-Allow-Credentials": true,
        }
    })
        .then(async res => {
            // console.log(res.data.response_data);
            // var userInfosCookie = JSON.parse(getCookie('datauser'));
            var userInfosCookie = await window.electronAPI.getLoginAuth();

            var ticketsTempData = res.data.response_data.filter(ticket => ticket.isFinished === false && ticket.isWaiting === true && ticket.sectorName == JSON.parse(userInfosCookie).sector);
            var tempDataNotFinished = res.data.response_data.filter(ticket => ticket.isFinished === false && ticket.isWaiting === false && ticket.sectorName == JSON.parse(userInfosCookie).sector);

            /*console.log(JSON.stringify(tickets[0]))
            console.log(JSON.stringify(ticketsTempData[0]))
            console.log(JSON.stringify(tickets[0]) != JSON.stringify(ticketsTempData[0])); */

            if (JSON.stringify(tickets[0]) != JSON.stringify(ticketsTempData[0])) {
                // if (!inTreatment) {
                await window.electronAPI.blinkTaskbar([true, 'all']);
                // }
            } else if (JSON.stringify(tickets[0]) == JSON.stringify(ticketsTempData[0]) && ticketsTempData.length > 0 && !inTreatment) {
                await window.electronAPI.blinkTaskbar([true, 'minimal']);
            }

            tickets = ticketsTempData
            ticketsNotFinished = tempDataNotFinished;
            createTicketDivs();
            isReloading = false;
        }).catch(err => {
            isReloading = false;
            alert('Ocorreu um erro ao carregar os tickets...');
            console.warn(err);
        })
}
async function createTicketDivs() {

    //
    const container = document.getElementById('container');
    const container2 = document.getElementById('container2');

    // Limpa o conteúdo do contêiner
    container.innerHTML = `
                <div class="content2Info" onclick="autoReload()" >
                    <a id="reloadTickets"> Recarregar tickets <img src="./images/refresh-cw.svg" class="reloadImg"/> </a>
                    <p style="font-weight: normal; text-align: center;" id="nextTicket" >Próximo Ticket:</p>
                </div>
                `;
    container2.innerHTML = `
                <div class="content2Info" style="cursor: default">
                    <a> Tickets já chamados e não finalizados</a>
                </div>
                `;
    if (!tickets || tickets.length == 0) {
        const buttonDiv = document.createElement('div');
        buttonDiv.innerHTML = `
                <p> Não foram encontrados nenhum ticket.</p>
                    `;
        container.appendChild(buttonDiv);
        isReloading = false;
    } else {
        // chama 2 preferênciais, depois chama dois comuns
        tickets.sort((a, b) => ((a.value - b.value)));
        if (sequencePreferred < 2) {
            tickets.sort((a, b) => ((b.isPreferred - a.isPreferred)));
        } else {
            tickets.sort((a, b) => ((a.isPreferred - b.isPreferred)));
        }
        console.log(tickets);
        console.log(sequencePreferred);
        const buttonDivOne = document.createElement('div');
        const preferentialTextOne = tickets[0].isPreferred ? 'Ticket Preferencial*' : 'Não Preferencial';
        const ticketNumberTwo = tickets[0].value;
        // colocar um único ticket clicável
        buttonDivOne.innerHTML = `
                    <button style="background-color: green;" class="tickets" onclick="selectTicket([${tickets[0].value}, '${tickets[0].id}', '${tickets[0].sectorName}', ${tickets[0].isPreferred}])" >
                        <p class="ticketsText firstTicketToCall">${preferentialTextOne}</p>
                        <div>
                            <p class="firstTicketToCall">${ticketNumberTwo}</p>
                        </div>
                    </button>
                `;
        container.appendChild(buttonDivOne);
        tickets.forEach(ticket => {
            if (ticket.value === tickets[0].value) {
                return;
            }
            const buttonDiv = document.createElement('div');
            const preferentialText = ticket.isPreferred ? 'Ticket Preferencial*' : 'Não Preferencial';
            const ticketNumberTwo = tickets[0].value;
            const ticketNumber = ticket.value;

            buttonDiv.innerHTML = `
                <button style="border-color: red;" class="tickets">
                    <p class="ticketsText">${preferentialText}</p>
                    <div>
                        <p>${ticketNumber}</p>
                    </div>
                </button>
                `;

            container.appendChild(buttonDiv);
        });

    }
    if (ticketsNotFinished && ticketsNotFinished.length > 0) {
        //? Segunda barra
        //* Tickets iniciados e não finalizados
        ticketsNotFinished.sort((a, b) => (a.value - b.value));
        ticketsNotFinished.forEach(ticket => {
            // console.log(ticket);

            const buttonDiv = document.createElement('div');
            const preferentialText = ticket.isPreferred ? 'Ticket Preferencial*' : 'Não Preferencial';
            const ticketNumber = ticket.value;
            // inTreatment
            buttonDiv.innerHTML = `
                <button style="border-color: yellow;" class="tickets" onclick="finishTreatment([${ticket.value}, '${ticket.id}', '${ticket.sectorName}', true, ${ticket.isPreferred}])" >
                <p class="ticketsText">${preferentialText}</p>
                <div>
                    <p>${ticketNumber}</p>
                </div>
            </button>
                `;

            container2.appendChild(buttonDiv);
        });
        isReloading = false;
    } else {
        isReloading = false;
        return;
    }
}

setInterval(autoReload, 10000);

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
