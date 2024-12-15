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

    if (ipRequestTimes[ip] && currentTime - ipRequestTimes[ip] < requestInterval) {
        return res.status(429).json({ message: "Слишком частые запросы с вашего IP. Пожалуйста, подождите минуту." });
    }

    ipRequestTimes[ip] = currentTime;

    const { name, finalCapital, invested, profitOrLoss, mistakes } = req.body;

    console.log('Received data:', req.body);

    if (!savedResults[name]) {
        savedResults[name] = [];
    }

    if (savedResults[name].some(entry => entry.ip === ip)) {
        return res.status(400).json({ message: "Результаты с этого IP уже были сохранены для данного имени." });
    }
    savedResults[name].push({
        ip,
        finalCapital,
        invested,
        profitOrLoss,
        mistakes
    });    
    res.json({
        message: "Результаты сохранены успешно!",
        data: { name, finalCapital, invested, profitOrLoss, mistakes }
    });
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
