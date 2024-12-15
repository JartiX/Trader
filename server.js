const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


let savedResults = [];
let ipRequestTimes = {};
const requestInterval = 20 * 1000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/save-results', (req, res) => {
    const ip = req.ip;
    const currentTime = Date.now();

    console.log('User ip: ', ip);
    if (ipRequestTimes[ip] && currentTime - ipRequestTimes[ip] < requestInterval) {
        return res.status(429).json({ message: "Слишком частые запросы с вашего IP. Пожалуйста, подождите минуту." });
    }

    ipRequestTimes[ip] = currentTime;

    const { name, finalCapital, invested, profitOrLoss, mistakes } = req.body;

    console.log('Received data:', req.body);

    if (!savedResults[name]) {
        savedResults[name] = [];
    }
    const existingRecordIndex = savedResults[name].findIndex(entry => entry.ip === ip);
    if (existingRecordIndex !== -1) {
        console.log("Finded ip", savedResults[name][existingRecordIndex].ip);
        savedResults[name][existingRecordIndex] = {
            ip,
            finalCapital,
            invested,
            profitOrLoss,
            mistakes
        };

        return res.json({
            message: "Результаты обновлены успешно!",
            data: { name, finalCapital, invested, profitOrLoss, mistakes }
        });
    } else {
        savedResults[name].push({
            ip,
            finalCapital,
            invested,
            profitOrLoss,
            mistakes
        });

        return res.json({
            message: "Результаты сохранены успешно!",
            data: { name, finalCapital, invested, profitOrLoss, mistakes }
        });
    }
});

app.get('/get-results', (req, res) => {
    const allResults = Object.keys(savedResults).map(name => ({
        name,
        results: savedResults[name].map(({ ip, ...result }) => result)
    }));
    res.json(allResults);
});

app.get('/analyze-results', (req, res) => {
    const allResults = Object.values(savedResults).flat();

    if (allResults.length === 0) {
        return res.json({ message: "Нет сохранённых данных для анализа." });
    }

    let totalProfitOrLoss = 0;
    let highestEarningPerson = null;

    allResults.forEach(result => {
        totalProfitOrLoss += result.profitOrLoss;

        if (highestEarningPerson === null || result.profitOrLoss > highestEarningPerson.profitOrLoss) {
            highestEarningPerson = result;
        }
    });

    const averageProfitOrLoss = totalProfitOrLoss / savedResults.length;

    res.json({
        averageProfitOrLoss,
        totalResults: allResults.length,
        highestEarningPerson: highestEarningPerson ? {
            name: highestEarningPerson.name,
            profitOrLoss: highestEarningPerson.profitOrLoss
        } : null
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
