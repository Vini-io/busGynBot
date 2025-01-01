
const express = require('express')
const { Telegraf } = require('telegraf');
const app = express();
require('dotenv').config()
app.use(express.json());

const axios = require('axios');
const makeRequest = async () => {
    try {
        const response = await axios.get(process.env.URL); // Substitua pela sua URL
        console.log(`Status: ${response.status}`);
        console.log(`Data:`, response.data);
    } catch (error) {
        console.error('Erro ao fazer o GET:', error.message);
    }
};
// Executa a função a cada 14 minutos (14 * 60 * 1000 ms)
const interval = 14 * 60 * 1000;
setInterval(makeRequest, interval);

app.get('/', (req, res) => {
    res.json({ message: 'BOT' });
});

const bot = new Telegraf(process.env.TOKEN_BOT);

bot.start((ctx) => ctx.reply('Digite o número do ponto 🚩'))

bot.on('text', async (ctx) => {
    const mensagem = ctx.message.text;
    try {
        const response = await axios.post(`${process.env.URL}/linha`, {
            ponto: mensagem
        });
        const ponto = response.data;
        console.log(ponto)
        if (ponto && ponto.trim()) {
            ctx.reply(ponto);
        } else {
            ctx.reply('Resposta não disponível.');
        }
    } catch (error) {
        console.error('Erro ao obter ponto:', error);
        ctx.reply('Ocorreu um erro ao processar sua mensagem.');
    }
});
bot.launch();

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta: ${PORT}`);
});

