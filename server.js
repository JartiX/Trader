const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/save-results', (req, res) => {
    const { name, finalCapital, invested, profitOrLoss, mistakes } = req.body;

    console.log('Received data:', req.body);

    res.json({
        message: "Результаты сохранены успешно!",
        data: { name, finalCapital, invested, profitOrLoss, mistakes }
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
