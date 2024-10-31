var token = null;
var sector = null;
var dataInDom = null;

var days = null;
// Função para formatar a data no padrão 'DD/MM/YYYY'
function formatDateBR(date, addOne) {
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0"); // Adiciona 1 ao mês
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

document.addEventListener("DOMContentLoaded", function () {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 1);
  // Clona a data atual e ajusta para 30 dias atrás
  const lastThirty = new Date();
  lastThirty.setDate(currentDate.getDate() - 30);

  // Define o valor nos labels
  document.getElementById(
    "exibitionStartDay"
  ).textContent = `Começo: ${formatDateBR(lastThirty)}`;
  document.getElementById(
    "exibitionFinishDay"
  ).textContent = `Final: ${formatDateBR(currentDate)}`;

  // Atualiza os valores dos inputs ocultos para manter a sincronização
  document.getElementById(
    "startDay"
  ).value = `${lastThirty.getFullYear()}-${String(
    lastThirty.getMonth() + 1
  ).padStart(2, "0")}-${String(lastThirty.getDate()).padStart(2, "0")}`;
  document.getElementById(
    "finishDay"
  ).value = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
});

window.onload = loadInfo();

document
  .getElementById("buttonDowloadExcel")
  .addEventListener("click", downloadExcel);

document
  .getElementById("exibitionStartDay")
  .addEventListener("click", function () {
    document.getElementById("startDay").showPicker();
  });

document
  .getElementById("exibitionFinishDay")
  .addEventListener("click", function () {
    document.getElementById("finishDay").showPicker();
  });

document.getElementById("startDay").addEventListener("change", function () {
  const selectedDate = new Date(this.value);
  selectedDate.setDate(selectedDate.getDate() + 1);
  document.getElementById(
    "exibitionStartDay"
  ).textContent = `Começo: ${formatDateBR(selectedDate)}`;
});

document.getElementById("finishDay").addEventListener("change", function () {
  const selectedDate = new Date(this.value);
  selectedDate.setDate(selectedDate.getDate() + 1);
  document.getElementById(
    "exibitionFinishDay"
  ).textContent = `Final: ${formatDateBR(selectedDate)}`;
});

window.document
  .getElementById("updateToday")
  .addEventListener("click", async () => {
    window.document.getElementById("loginVerify").style.display = "flex";
    await axios
      .get("http://localhost:6100/dashboard/update", {
        headers: {
          "Access-Control-Request-Private-Network": true,
          "Access-Control-Allow-Credentials": true,
          authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        window.location.reload();
      })
      .catch((err) => {
        if (err.status == 401) {
          window.location.href = "login.html";
        }
        window.document.getElementById("loginVerify").style.display = "none";
      });
  });

window.document
  .getElementById("buttonConfirm")
  .addEventListener("click", async () => loadInfo());

export async function loadInfo() {
  if (
    !document.getElementById("commomCheck").checked &&
    !document.getElementById("prefCheck").checked
  ) {
    return alert("Selecione pelo menos um entre: Comum e preferencial");
  }

  // var userInfosCookie = getCookie('datauser')
  var userInfosCookie = await window.electronAPI.getLoginAuth();
  // console.log(userInfosCookie);
  if (!userInfosCookie) {
    return (window.location.href = "login.html");
  }
  token = JSON.parse(userInfosCookie).token;
  sector = JSON.parse(userInfosCookie).sector;
  console.log(userInfosCookie);

  await loadCharts();
}

async function loadCharts() {
  window.document.getElementById("loginVerify").style.display = "flex";
  await axios
    .post(
      "http://localhost:6100/dashboard",
      {},
      {
        headers: {
          "Access-Control-Request-Private-Network": true,
          "Access-Control-Allow-Credentials": true,
          authorization: `Bearer ${token}`,
        },
      }
    )
    .then((result) => {
      var inputStart = new Date(document.getElementById("startDay").value);
      var inputFinish = new Date(document.getElementById("finishDay").value);
      inputStart.setDate(inputStart.getDate() + 1);
      inputFinish.setDate(inputFinish.getDate() + 1);
      console.log(inputFinish);
      var startDate = new Date(
        inputStart.getFullYear(),
        inputStart.getMonth(),
        inputStart.getDate()
      );

      var finishDate = new Date(
        inputFinish.getFullYear(),
        inputFinish.getMonth(),
        inputFinish.getDate()
      );

      var sorted = null;
      if (document.getElementById("selectSector").value !== "todos") {
        sorted = result.data.result.filter(
          (v) => v.sector == document.getElementById("selectSector").value
        );
      } else sorted = result.data.result;
      sorted = sorted
        .filter((v) => {
          var itemDate = new Date(v.year, v.month - 1, v.day);
          /*console.log(
            itemDate,
            "-----",
            startDate,
            "--------",
            finishDate,
            "------"
          );
          console.log(itemDate >= startDate && itemDate <= finishDate); */
          if (itemDate >= startDate && itemDate <= finishDate) return v;
        })
        .sort(
          (a, b) =>
            new Date(a.year, a.month - 1, a.day) -
            new Date(b.year, b.month - 1, b.day)
        );

      var preferredTickets = 0;
      var commomTickets = 0;
      sorted.map((v) => {
        preferredTickets = preferredTickets + v.preferredRequests;
        commomTickets = commomTickets + v.normalRequests;
      });
      console.log(sorted);

      document.getElementById("chartContainer").innerHTML = `
                <canvas id="myChart30days" class="canvasChart barChart"></canvas>
                <div class="infosChart">
                    <p id="common30">Tickets comuns: ${commomTickets}</p>
                    <p id="pref30">Tickets Preferenciais: ${preferredTickets}</p>
                </div>
            `;

      dataInDom = sorted;

      new Chart(document.getElementById("myChart30days"), {
        type: "bar",
        data: {
          labels: sorted.map((v, i) => {
            return `${v.sector}-${v.day <= 9 ? `0${v.day}` : v.day}/${
              v.month <= 9 ? `0${v.month}` : v.month
            }/${v.year}`;
          }),
          datasets: [
            // {
            //     label: `Ultimos ${document.getElementById("selectDay").value} dias`,
            //     data: sorted.map((v, i) => { return v.normalRequests + v.preferredRequests }),
            //     borderWidth: 1,
            // },
            document.getElementById("commomCheck").checked == true
              ? {
                  label: `Tickets comuns`,
                  data: sorted.map((v, i) => {
                    return v.normalRequests;
                  }),
                  borderWidth: 1,
                }
              : {},
            document.getElementById("prefCheck").checked == true
              ? {
                  label: `Tickets Preferenciais`,
                  data: sorted.map((v, i) => {
                    return v.preferredRequests;
                  }),
                  borderWidth: 1,
                }
              : {},
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
            },
          },
        },
      });
      window.document.getElementById("loginVerify").style.display = "none";
    })
    .catch((err) => {
      if (err.status == 401) {
        window.location.href = "login.html";
      }
      window.document.getElementById("loginVerify").style.display = "none";
      console.log(err);
    });
}

function downloadExcel() {
  window.document.getElementById("loginVerify").style.display = "flex";
  var toExcelData = [
    ["id", "Setor", "Tickets Comuns", "Tickets Preferenciais", "data"],
  ];
  console.log(dataInDom);
  /* example of data
    [
      {
        id: "20/10/2024-Secretaria", day: 20, month: 10,
        year: 2024, sector: "Secretaria",
        normalRequests: 2, preferredRequests: 3,
        updated_at: "2024-10-30T22:39:46.526Z", created_at: "2024-10-30T22:39:46.526Z"}
    ]
  */
  dataInDom.map((v) => {
    toExcelData.push([
      v.id,
      v.sector,
      v.normalRequests,
      v.preferredRequests,
      v.id.split("-")[0],
    ]);
  });

  try {
    var workbook = XLSX.utils.book_new();
    workbook.SheetNames.push("Dados");
    workbook.Sheets["Dados"] = XLSX.utils.aoa_to_sheet(toExcelData);
    XLSX.writeFile(workbook, "dados_de_atendimento.xlsx");
  } catch (error) {
    console.log(error);
  }
  window.document.getElementById("loginVerify").style.display = "none";
}
