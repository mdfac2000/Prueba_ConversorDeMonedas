const urlAPI = "https://mindicador.cl/api/";
const clpInput = document.getElementById('clp-amount');
const currencySelect = document.getElementById('currency');
const resultSpan = document.getElementById('conversion-result');
const convertBtn = document.getElementById('convert-btn');

async function getCurrenciesAndPopulate() {
    try {
        const response = await fetch(urlAPI);
        const data = await response.json();

        for (let key in data) {
            if (data[key].codigo && data[key].nombre) {
                const option = document.createElement('option');
                option.value = data[key].codigo;
                option.textContent = data[key].nombre;
                currencySelect.appendChild(option);
            }
        }
    } catch (error) {
        alert("Error no se obtiene informacion de monedas: " + error);
    }
}

async function calculateAndDisplayResult() {
    const amount = parseFloat(clpInput.value);
    const selectedCurrency = currencySelect.value;

    if (isNaN(amount)) {
        alert("Por favor, ingrese un monto válido.");
        return;
    }

    try {
        const response = await fetch(urlAPI);
        const data = await response.json();

        if (data[selectedCurrency] && data[selectedCurrency].valor) {
            const exchangeRate = data[selectedCurrency].valor;
            const result = amount / exchangeRate;
            resultSpan.textContent = result.toFixed(6) + " " + selectedCurrency;
            await renderGrafica(selectedCurrency);
        } else {
            alert("No se pudo obtener el valor de la moneda seleccionada.");
        }
    } catch (error) {
        alert("Error al calcular el resultado: " + error);
    }
}

async function getHistoricalData(currency) {
    try {
        const response = await fetch(`${urlAPI}${currency}`);
        const data = await response.json();
        return data.serie.slice(0, 10).reverse();
    } catch (error) {
        console.error("Error fetching historical data:", error);
        return [];
    }
}

function prepararConfiguracionParaLaGrafica(historicalData) {
    const labels = historicalData.map(item => item.fecha.split('T')[0]);
    const valores = historicalData.map(item => item.valor);

    const config = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Valor histórico',
                backgroundColor: 'rgb(75, 192, 192)',
                borderColor: 'black',
                data: valores,
                fill: false,
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    };

    return config;
}

async function renderGrafica(currency) {
    const historicalData = await getHistoricalData(currency);
    const config = prepararConfiguracionParaLaGrafica(historicalData);
    const chartDOM = document.getElementById("myChart");
    
    if (window.currencyChart instanceof Chart) {
        window.currencyChart.destroy();
    }
    
    window.currencyChart = new Chart(chartDOM, config);
}

convertBtn.addEventListener('click', calculateAndDisplayResult);

// Initial population of currencies
getCurrenciesAndPopulate();
