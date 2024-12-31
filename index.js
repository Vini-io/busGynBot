const puppeteer = require('puppeteer');
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
    res.json({ message: 'Resposta do servidor!' });
});

// app.post('/linha', (req, res) => {
//     const { ponto } = req.body;
//     console.log("requisição da linha: ", ponto);
//     if (!ponto) return res.status(400).json({ error: 'Informe a linha!' });

//     try {
//         (async () => {
//             const browser = await puppeteer.launch({ headless: true });
//             const page_1 = await browser.newPage();

//             await page_1.goto('https://m.rmtcgoiania.com.br/');

//             const elements = await page_1.$$('.action-icon');
//             await elements[1].click();

//             /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//             const currentPage_2 = await browser.pages();
//             const page_2 = currentPage_2[currentPage_2.length - 1];

//             // Criando o timeout de 10 segundos
//             const navigationPromise = page_2.waitForNavigation({ waitUntil: 'domcontentloaded' });
//             const timeoutPromise = new Promise((_, reject) =>
//                 setTimeout(() => reject(new Error('Timeout: Não foi possível acessar a linha')), 3500)
//             );

//             try {
//                 await Promise.race([navigationPromise, timeoutPromise]);
//             } catch (error) {
//                 console.error('Erro ao navegar para a segunda página:', error);
//                 return res.status(500).json({ error: error.message });
//             }

//             await page_2.type('#txtNumeroPonto', ponto);

//             await page_2.waitForSelector('[name="btnPesquisarPedLinha"]');
//             await page_2.click('[name="btnPesquisarPedLinha"]');

//             /////////////////////////////////////////////////////////////////////////////////////////////////////////////

//             const currentPage_3 = await browser.pages();
//             const page_3 = currentPage_3[currentPage_3.length - 1];

//             try {
//                 const navigationPromise2 = page_3.waitForNavigation({ waitUntil: 'domcontentloaded' });
//                 await Promise.race([navigationPromise2, timeoutPromise]);
//             } catch (error) {
//                 console.error('Erro ao navegar para a terceira página:', error);
//                 return res.status(500).json({ error: 'Ponto não encontrado' }); a
//             }

//             const divTexts = await page_3.evaluate(() => {
//                 return Array.from(document.querySelectorAll('td')).map(td => td.textContent.trim());
//             });

//             let endl = 0;
//             let linhas = [];
//             let linha = {
//                 Linha: '',
//                 Destino: '',
//                 Proximo: '',
//                 Segundo: ''
//             };

//             for (let index = 3; index < divTexts.length; index++) {
//                 if (endl === 0) {
//                     endl++;
//                     linha.Linha = divTexts[index];
//                 } else if (endl === 1) {
//                     endl++;
//                     linha.Destino = divTexts[index];
//                 } else if (endl === 2) {
//                     endl++;
//                     linha.Proximo = divTexts[index];
//                 } else if (endl === 3) {
//                     endl = 0;
//                     linha.Segundo = divTexts[index];
//                     linhas.push({ ...linha });
//                 }
//             }

//             if (linhas.length === 0) {
//                 return res.status(404).json({ error: 'Linhas não encontrada' });
//             }

//             console.log(linhas);
//             res.json(linhas);
//             await browser.close();
//         })();
//     } catch (error) {
//         console.error("Erro ao processar a requisição:", error);
//         res.status(500).json({ error: 'Erro interno ao processar a requisição' });
//     }
// });


async function GetPonto(ponto) {

    if (!ponto || !(/^[0-9]+$/.test(ponto))) return 'Informe o ponto correto.'
    let tabelaFormatada = ''

    try {

        const browser = await puppeteer.launch({ headless: true });
        const page_1 = await browser.newPage();

        await page_1.goto('https://m.rmtcgoiania.com.br/');

        const elements = await page_1.$$('.action-icon');
        await elements[1].click();

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const currentPage_2 = await browser.pages();
        const page_2 = currentPage_2[currentPage_2.length - 1];

        // Criando o timeout de 10 segundos
        const navigationPromise = page_2.waitForNavigation({ waitUntil: 'domcontentloaded' });
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout: Não foi possível acessar a linha')), 3500)
        );

        try {
            await Promise.race([navigationPromise, timeoutPromise]);
        } catch (error) {
            await browser.close();
            return '❌Ponto não encontrado'
        }

        await page_2.type('#txtNumeroPonto', ponto);

        await page_2.waitForSelector('[name="btnPesquisarPedLinha"]');
        await page_2.click('[name="btnPesquisarPedLinha"]');

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const currentPage_3 = await browser.pages();
        const page_3 = currentPage_3[currentPage_3.length - 1];

        try {
            const navigationPromise2 = page_3.waitForNavigation({ waitUntil: 'domcontentloaded' });
            await Promise.race([navigationPromise2, timeoutPromise]);
        } catch (error) {
            await browser.close();
            return '❌Ponto não encontrado'
        }

        const divTexts = await page_3.evaluate(() => {
            return Array.from(document.querySelectorAll('td')).map(td => td.textContent.trim());
        });

        let endl = 0;
        let linhas = [];
        let linha = {
            Linha: '',
            Destino: '',
            Proximo: '',
            Segundo: ''
        };



        for (let index = 3; index < divTexts.length; index++) {
            if (endl === 0) {
                endl++;
                linha.Linha = divTexts[index];
            } else if (endl === 1) {
                endl++;
                linha.Destino = divTexts[index];
            } else if (endl === 2) {
                endl++;
                linha.Proximo = divTexts[index];
            } else if (endl === 3) {
                endl = 0;
                linha.Segundo = divTexts[index];
                linhas.push({ ...linha });
            }
        }
        await browser.close();

        if (linhas.length === 0) {
            return '❌Linhas não encontrada'
        }

        // Criar corpo formatado
        const corpo = linhas.map(linha =>
            `🚌Linha: ${linha.Linha}\n🚩Destino: ${linha.Destino}\n⏳Proximo: ${linha.Proximo}\n🔁Segundo: ${linha.Segundo}\n`
        ).join('\n');


        tabelaFormatada = corpo;


    } catch (error) {
        console.error("Erro ao processar a requisição:", error);
        return 'Erro interno ao processar a requisição';
    }
    return tabelaFormatada
}

const bot = new Telegraf(process.env.TOKEN_BOT);

bot.start((ctx) => ctx.reply('Digite o número do ponto 🚩'))


bot.on('text', async (ctx) => {
    const mensagem = ctx.message.text;
    try {
        const ponto = await GetPonto(mensagem);  // Aguarda o resultado de GetPonto
        if (ponto && ponto.trim()) {
            ctx.reply(ponto);
        } else {
            ctx.reply('Resposta não disponível.');
        }
    } catch (error) {
        console.error('Erro ao obter ponto:', error);
        ctx.reply('Ocorreu um erro ao processar sua mensagem.');
    }
}) // esculta o usuario
bot.launch();

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta: ${PORT}`);
});

