var token = null;
var sector = null;
var days = null;

window.onload = loadInfo();

window.document.getElementById("updateToday").addEventListener("click", async () => {
    window.document.getElementById("loginVerify").style.display = "flex"
    await axios.get("http://localhost:6100/dashboard/update", {
        headers: {
            "Access-Control-Request-Private-Network": true,
            "Access-Control-Allow-Credentials": true,
            "authorization": `Bearer ${token}`
        }
    }).then(() => {
        window.location.reload()
    }).catch(err => {
        if (err.status == 401) {
            window.location.href = "login.html"
        }
        window.document.getElementById("loginVerify").style.display = "none"
    })
})

window.document.getElementById("buttonConfirm").addEventListener("click", async () => loadInfo());

export async function loadInfo() {
    if (!document.getElementById("commomCheck").checked && !document.getElementById("prefCheck").checked) {
        return alert("Selecione pelo menos um entre: Comum e preferêncial")
    }
    // var userInfosCookie = getCookie('datauser')
    var userInfosCookie = await window.electronAPI.getLoginAuth();
    // console.log(userInfosCookie);
    if (!userInfosCookie) {
        return window.location.href = "login.html";
    }
    token = JSON.parse(userInfosCookie).token;
    sector = JSON.parse(userInfosCookie).sector;
    console.log(userInfosCookie)

    await loadCharts();
}

async function loadCharts() {
    await axios.post("http://localhost:6100/dashboard", {

    }, {
        headers: {
            "Access-Control-Request-Private-Network": true,
            "Access-Control-Allow-Credentials": true,
            "authorization": `Bearer ${token}`
        }
    })
        .then((result) => {
            var selectedDayAgo = new Date().setDate(new Date().getDate() - document.getElementById("selectDay").value);
            console.log(new Date(result.data.result[0].year, result.data.result[0].month - 1, result.data.result[0].day))
            console.log(result.data.result[0])
            var sorted = result.data.result.filter(v => v.sector == sector)
            sorted = sorted.filter(v => new Date(v.year, v.month - 1, v.day) >= selectedDayAgo).sort((a, b) => new Date(a.year, a.month - 1, a.day) - new Date(b.year, b.month - 1, b.day))

            document.getElementById("chartContainer").innerHTML = `
                <canvas id="myChart30days" class="canvasChart barChart"></canvas>
                <div class="infosChart">
                    <p id="common30">Tickets comuns: 15</p>
                    <p id="pref30">Tickets preferênciais: 15</p>
                </div>
            `

            new Chart(document.getElementById("myChart30days"), {
                type: "bar",
                data: {
                    labels: sorted.map((v, i) => {
                        return `${v.day <= 9 ? `0${v.day}` : v.day}/${v.month <= 9 ? `0${v.month}` : v.month}/${v.year}`
                    }),
                    datasets: [
                        // {
                        //     label: `Ultimos ${document.getElementById("selectDay").value} dias`,
                        //     data: sorted.map((v, i) => { return v.normalRequests + v.preferredRequests }),
                        //     borderWidth: 1,
                        // },
                        document.getElementById("commomCheck").checked == true ? {
                            label: `Tickets preferênciais dos últimos ${document.getElementById("selectDay").value} dias`,
                            data: sorted.map((v, i) => { return v.normalRequests }),
                            borderWidth: 1,
                        } : {},
                        document.getElementById("prefCheck").checked == true ? {
                            label: `Tickets preferênciais dos últimos ${document.getElementById("selectDay").value} dias`,
                            data: sorted.map((v, i) => { return v.preferredRequests }),
                            borderWidth: 1,
                        } : {},
                    ],
                },
                options: {
                    animation: true,
                    plugins: {
                        legend: {
                            display: true,
                        },
                        tooltip: {
                            enabled: true,
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            stacked: true
                        },
                        x: {
                            stacked: true
                        }
                    },
                },
            });
            /*new Chart(ctx60days, {
                type: "bar",
                data: {
                    // labels: data.map(row => row.year),
                    labels: dataExample.sixty.map((v, i) => `${v}/${i}`),
                    datasets: [
                        {
                            label: "Ultimos 30 dias",
                            //   data: data.map(row => row.count)
                            data: dataExample.sixty.map((v) => v),
                            borderWidth: 1,
                        },
                    ],
                },
                options: options,
            });
            new Chart(ctx90days, {
                type: "bar",
                data: {
                    // labels: data.map(row => row.year),
                    labels: dataExample.ninety.map((v, i) => `${v}/${i}`),
                    datasets: [
                        {
                            label: "Ultimos 30 dias",
                            //   data: data.map(row => row.count)
                            data: dataExample.ninety.map((v) => v),
                            borderWidth: 1,
                        },
                    ],
                },
                options: options,
            });
            new Chart(ctx180days, {
                type: "bar",
                data: {
                    // labels: data.map(row => row.year),
                    labels: dataExample.hungredeighteen.map((v, i) => `${v}/${i}`),
                    datasets: [
                        {
                            label: "Ultimos 30 dias",
                            //   data: data.map(row => row.count)
                            data: dataExample.hungredeighteen.map((v) => v),
                            borderWidth: 1,
                        },
                    ],
                },
                options: options,
            });
            new Chart(ctx365days, {
                type: "bar",
                data: {
                    // labels: data.map(row => row.year),
                    labels: dataExample.year.map((v, i) => `${v}/${i}`),
                    datasets: [
                        {
                            label: "Ultimos 30 dias",
                            //   data: data.map(row => row.count)
                            data: dataExample.year.map((v) => v),
                            borderWidth: 1,
                        },
                    ],
                },
                options: options,
            }); */
        })
        .catch((err) => {
            if (err.status == 401) {
                window.location.href = "login.html"
            }
            console.log(err)
        });
}

export function openDashboard() {
    window.location.href = "/dasboard.html"
}