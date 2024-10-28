window.onload = loadCharts();

async function loadCharts() {
  const dataExample = await fetch("./scripts/example.json")
    .then((result) => result.json())
    .catch((err) => console.log(err));

  const ctx30days = document.getElementById("myChart30days");
  const ctx60days = document.getElementById("myChart60days");
  const ctx90days = document.getElementById("myChart90days");
  const ctx180days = document.getElementById("myChart180days");
  const ctx365days = document.getElementById("myChart365days");
  const options = {
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
  };

  new Chart(ctx30days, {
    type: "bar",
    data: {
      // labels: data.map(row => row.year),
      labels: dataExample.thirty.map((v, i) => `${v}/${i}`),
      datasets: [
        {
          label: "Ultimos 30 dias",
          //   data: data.map(row => row.count)
          data: dataExample.thirty.map((v) => v),
          borderWidth: 1,
        },
      ],
    },
    options: options,
  });
  new Chart(ctx60days, {
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
  });
}
