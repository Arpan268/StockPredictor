import { GoogleGenerativeAI } from '@google/generative-ai';
import { dates } from './dates.js';
const stockapikey = import.meta.env.VITE_STOCK_API_KEY;
const geminiapikey = import.meta.env.VITE_GEMINI_API_KEY;
const label = document.querySelector('#label');
label.textContent = `Add upto 3 stocks below to get a super accurate stock predictions report`;
const stockArr = []
const generate = document.querySelector('#getReport');
generate.disabled = true;
generate.addEventListener('click', fetchStockData);
document.querySelector('#stock-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const stock = document.querySelector('#stock');
    if (stockArr.length >= 3) {
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
        generate.disabled = false;
        stockArr.push(stock.value.toUpperCase());
        stock.value = '';
        label.style.color = 'black';
        label.textContent = `Add upto 3 stocks below to get a super accurate stock predictions report`;
        renderStocks();
    }
})

function renderStocks() {
    const stockList = document.querySelector('#stockList');
    stockList.textContent = 'Stocks: ' + stockArr.join(', ');
}

async function fetchStockData() {
    let success = 0;
    document.querySelector('#loadingImg').style.display = 'flex';
    document.querySelector('#apimessage').style.display = 'block';
    document.querySelector('#content').style.display = 'none';
    document.querySelector('#loadingImg').innerHTML = '';
    document.querySelector('#apimessage').textContent = 'Fetching stock data...';
    try {
        const stockData = await Promise.all(stockArr.map(async (stock) => {
            const response = await fetch(`https://api.polygon.io/v2/aggs/ticker/${stock}/range/1/day/${dates.startDate}/${dates.endDate}?apiKey=${stockapikey}`);
            const parsedData = await response.json();
            const status = response.status;
            if (status === 200 && parsedData.resultsCount > 0) {
                success++;
                return JSON.stringify(parsedData);
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
            await geminiRequest(stockData.join(''));
        }
    }
    catch (error) {
        console.error(error);
        document.querySelector('#loadingImg').style.display = 'none';
        document.querySelector('#apimessage').textContent = 'Error fetching stock data';
    }
}

async function geminiRequest(data) {
    try {
        const genAI = new GoogleGenerativeAI(geminiapikey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstructions: "You are a bold, decisive stock market analyst.",
            temperature: 0.5
        })
        const prompt = `
Strictly follow these rules:
1. Give a very brief summary of the Open, Close, High, Low, and Volume.
2. DO NOT include JSON metadata, status codes, or request IDs.
3. You MUST end your report with a definitive BUY, SELL, or HOLD recommendation for each stock.
4. Provide a 2-sentence justification for your recommendation.

EXAMPLE INPUT:
{"ticker":"MOCK", "results":[{"o": 100, "c": 110, "h": 115, "l": 95, "v": 5000}]}

EXAMPLE OUTPUT:
MOCK Stock Report

MOCK opened at $100.00, reached a high of $115.00, a low of $95.00, and closed at $110.00. The trading volume was 5,000 shares.

Recommendation: BUY
MOCK showed steady growth throughout the day, closing significantly higher than its open. This upward momentum indicates strong investor confidence.

ACTUAL INPUT TO ANALYZE:
${data}`;
        const result = await model.generateContent(prompt);
        renderReport(result.response.text());
    }
    catch (error) {
        console.error(error);
        document.querySelector('#loadingImg').style.display = 'none';
        document.querySelector('#apimessage').textContent = 'Error generating report. Please wait some time for the API to reset and try again.';
    }
}

function renderReport(report) {
    document.querySelector('#loadingImg').style.display = 'none';
    document.querySelector('#apimessage').style.display = 'none';
    const content = document.querySelector('#content');
    content.style.display = 'block';
    let formattedReport = report.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedReport = formattedReport.replace(/\*/g, '');
    formattedReport = formattedReport.replace(/\n{2,}/g, '<br><br>');
    formattedReport = formattedReport.replace(/\n/g, '<br>');
    content.innerHTML = formattedReport;
}