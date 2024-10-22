const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());


// Conectar ao MongoDB Atlas
const uri = 'mongodb+srv://Wendel:1234@wendel.9eamttz.mongodb.net/?retryWrites=true&w=majority&appName=Wendel';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado ao MongoDB Atlas'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Definir o Schema e o Model para o histórico
const historySchema = new mongoose.Schema({
    role: String,
    text: String,
    ip: String,
    timestamp: { type: Date, default: Date.now }
});

const History = mongoose.model('History', historySchema);


// Endpoint para salvar histórico
app.post('/api/saveHistory', async (req, res) => {
    const { role, text } = req.body;
    const ip = req.ip; // Capturar o IP do usuário
    const historyEntry = new History({ role, text, ip });

    try {
        await historyEntry.save();
        res.status(201).send({ message: 'Histórico salvo com sucesso!' });
    } catch (error) {
        res.status(500).send({ error: 'Erro ao salvar histórico.' });
    }
});

// Endpoint para recuperar o histórico completo
app.get('/api/getHistory', async (req, res) => {
    try {
        const history = await History.find();
        res.status(200).send(history);
    } catch (error) {
        res.status(500).send({ error: 'Erro ao recuperar histórico.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
