let capital = 1000;
let round = 1;
let totalInvested = 0;
const maxRounds = 10;
let playerName = "";
const stockData = {
    A: { probability: 70, growth: 10, loss: -5 },
    B: { probability: 50, growth: 20, loss: -20 },
    C: { probability: 30, growth: 40, loss: -10 }
};

let rounds = document.querySelector('.rounds');
let investments = document.querySelector('.investments');
function startGame() {
    playerName = document.getElementById('playerName').value.trim();

    if (!playerName) {
        alert('Пожалуйста, введите ваше имя!');
        return;
    }

    document.querySelector('.controls').style.display = 'none';
    document.getElementById('gameSection').style.display = 'block';
}

function playRound() {
    if (round > maxRounds) {
        alert('Вы достигли максимального количества раундов!');
        document.querySelectorAll('.button')[0].disabled = true;
        summarizeGame();
        return;
    }

    const stock = document.getElementById('stock').value;
    const investment = parseFloat(document.getElementById('investment').value);

    if (isNaN(investment)) {
        alert('Неверно введена сумма инвестиций!');
        return;
    }
    if (investment > capital) {
        alert('У вас недостаточно средств для такой инвестиции!');
        return;
    }

    if (totalInvested + investment > 1000) {
        alert('Вы превысите общий лимит инвестиций в $1000!');
        return;
    }

    const { probability, growth, loss } = stockData[stock];
    const random = Math.random() * 100;
    const isGrowth = random <= probability;
    const change = isGrowth ? growth : loss;
    const result = investment * (1 + change / 100);

    capital = capital - investment + result;
    totalInvested += investment;

    const resultsTable = document.getElementById('results');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${round}</td>
        <td>${stock}</td>
        <td>${investment.toFixed(2)}</td>
        <td>${isGrowth ? 'Рост' : 'Падение'}</td>
        <td>${change}%</td>
        <td>${capital.toFixed(2)}</td>
    `;
    resultsTable.appendChild(newRow);

    rounds.innerHTML = maxRounds - round;
    investments.innerHTML = `${1000-totalInvested}$`

    round++;

    if (capital <= 0 || totalInvested >= 1000) {
        alert('Вы исчерпали свой лимит капитала или инвестиций! Игра окончена.');
        document.querySelectorAll('.button')[0].disabled = true;
        summarizeGame();
    }
}

function summarizeGame() {
    const resultRows = document.querySelectorAll('#results tr');
    let badDecisions = 0;

    resultRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const result = cells[3].innerText;
        if (result === 'Падение') {
            badDecisions++;
        }
    });

    const profitOrLoss = capital - 1000;
    const advice = badDecisions > 0 ? `Вы сделали ${badDecisions} ошибочных решений. Возможно, стоило выбирать акции с большей вероятностью роста.` : 'Ваши инвестиции были успешными!';

    const summaryText = `
        Игрок: ${playerName}<br>
        Итоговый капитал: $${capital.toFixed(2)}<br>
        Всего инвестировано: $${totalInvested.toFixed(2)}<br>
        ${profitOrLoss >= 0 ? `Вы заработали $${profitOrLoss.toFixed(2)}.` : `Вы потеряли $${Math.abs(profitOrLoss).toFixed(2)}.`}<br>
        ${advice}
    `;
    document.getElementById('summary').innerHTML = summaryText;
    document.getElementById('summary').style.opacity = '1';
    sendResultsToServer(playerName, capital, totalInvested, profitOrLoss, badDecisions);
}

function sendResultsToServer(name, finalCapital, invested, profitOrLoss, mistakes) {
    const data = {
        name, finalCapital, invested, profitOrLoss, mistakes
    };

    fetch('https://trader-3fku.onrender.com/save-results', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => {
        if (response.ok) {
            console.log('Результаты успешно отправлены!');
        } else {
            console.error('Ошибка при отправке данных.');
        }
    }).catch(error => {
        console.error('Ошибка сети:', error);
    });
}

function restartGame() {
    capital = 1000;
    round = 1;
    totalInvested = 0;
    document.getElementById('results').innerHTML = '';
    document.querySelectorAll('.button')[0].disabled = false;
    document.getElementById('summary').innerText = '';
    document.getElementById('summary').style.opacity = '0';
    rounds.innerHTML = maxRounds;
    investments.innerHTML = `${1000}$`
}
