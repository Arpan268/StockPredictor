import { dates } from './dates.js';
const apikey = '7UwcxnKE5spYkAuOf46vHO6j9E9ymlti';
const label = document.querySelector('#label');
label.textContent = `Add upto 3 stocks below to get a super accurate stock predictions report`;
const stockArr = []
const generate = document.querySelector('#getReport');
generate.disabled = true;
generate.addEventListener('click', fetchStockData);
document.querySelector('#stock-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const stock = document.querySelector('#stock');
    if (stock.value.length > 2 && stockArr.length < 3) {
        generate.disabled = false;
        stockArr.push(stock.value.toUpperCase());
        stock.value = '';
        label.style.color = 'black';
        label.textContent = `Add upto 3 stocks below to get a super accurate stock predictions report`;
        renderStocks();
    }
    else if (stockArr.length >= 3) {
        label.style.color = 'red';
        label.textContent = 'You can only add upto 3 stocks!';
    }
    else if (stock.value.length <= 2) {
        label.style.color = 'red';
        label.textContent = 'Please enter a valid stock ticker with atleast 3 characters!';
    }
    else if (stockArr.includes(stock.value.toUpperCase())) {
        label.style.color = 'red';
        label.textContent = 'This stock is already added!';
    }
    else {
        label.style.color = 'red';
        label.textContent = 'An unknown error occurred. Please try again!';
    }
})

function renderStocks() {
    const stockList = document.querySelector('#stockList');
    stockList.textContent = 'Stocks: ' + stockArr.join(', ');
}

async function fetchStockData() {
    let success = 0;
    document.querySelector('#content').style.display = 'none';
    document.querySelector('#loadingImg').innerHTML = '';
    document.querySelector('#apimessage').textContent = 'Fetching stock data...';
    try {
        const stockData = await Promise.all(stockArr.map(async (stock) => {
            const response = await fetch(`https://api.polygon.io/v2/aggs/ticker/${stock}/range/1/day/${dates.startDate}/${dates.endDate}?apiKey=${apikey}`);
            const data = await response.text();
            const status = await response.status;
            if (status === 200) {
                success++;
                return data;
            }
            else {
                document.querySelector('#apimessage').textContent = 'Error fetching stock data! Please check the stock ticker and try again.';
            }
        }))
        if (success === stockArr.length) {
            const img = new Image();
            img.src = 'loading-image.gif';
            document.querySelector('#loadingImg').appendChild(img);
            document.querySelector('#apimessage').textContent = 'Creating report...';
        }
    }
    catch (error) {
        document.querySelector('#loadingImg').style.display = 'none';
        document.querySelector('#apimessage').textContent = 'Error fetching stock data';
    }
}