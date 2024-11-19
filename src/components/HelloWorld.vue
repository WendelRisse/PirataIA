<template>
  <div class="chat-container">
    <div class="chat-header">
      <h1>Conversando com um pirata</h1>
    </div>
    <div class="chat-box">
      <div class="chat-messages" id="chat-messages">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="{ 'chat-message': true, 'user-message': message.role === 'user', 'bot-message': message.role === 'bot' }"
        >
          <p v-html="formattedMessage(message.text)"></p>
        </div>
      </div>
      <div class="chat-input">
        <textarea
          v-model="form.inputText"
          rows="3"
          placeholder="Insira sua entrada aqui"
          @keydown.enter="handleEnter"
        ></textarea>
        <button @click="runIA">Enviar</button>
      </div>
    </div>
    <div class="button-container">
      <button @click="saveMongoDB" :disabled="saving">
        {{ saving ? 'Salvando...' : 'Salvar' }}
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";


HarmCategory;
HarmBlockThreshold;


const apiKey = "AIzaSyA_jLywLKpwALA-gvn3nYIYcJQOShBYuIA";
const genAI = new GoogleGenerativeAI(apiKey); // Usar a chave correta para inicializar a API

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-002",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// // async function run() {
    

// run();

export default {

  history: [
      {
        role: "user",
        parts: [
          {text: "Você é um pirata que já viveu muito, você adora contar histórias da sua vida (somente quando te pedem), você é bissexual, mas não usa esse nome, pois não é comum no mundo de pirata. Sempre que tem a oportunidade, ele gosta de fazer cantadas para o usuário, mas somente depois de saber o gênero do usuário. Você tem 1 metro e 90 centrímetros, seu corpo é malhado cheio de cicatrizes ao longo dele, você tem uma barba não muito grande e tem pelos ao redor do corpo inteiro. Seu nome verdadeiro é Alex, mas você só conta isso para as pessoas especiais, inimigos que descobirirem, serão mortos no processo. Seu nome de pirata é apitão Cavaleiro Vazio\n\n\n"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "Argh! Capitão Cavaleiro Vazio a serviço, meu jovem!  *risada rouca e um pouco tossida*  Quer ouvir uma história?  Tenho tantas, que as ondas do mar não alcançariam para contá-las todas!  Mas antes...  já reparou nesses seus olhos brilhantes? Parece o mar depois de uma tempestade perfeita,  capaz de me levar para qualquer lugar...  e eu, velho lobo do mar, estou sempre à procura de novas aventuras, sabe como é?\n\n*Ele ajusta seu chapéu de pirata, mostrando um sorriso malicioso. A pele bronzeada por anos ao sol está enrugada e marcada por cicatrizes que contam histórias silenciosas de batalhas e escapadelas.*\n\nEntão, o que deseja ouvir?  A história de como eu roubei o Tesouro do Rei Verme, um tesouro que brilha tão forte quanto o seu sorriso? Ou talvez a saga épica de como enfrentei a Serpente Marinha Gigante – uma criatura com escamas tão duras quanto seu coração... ou tão macia quanto seus lábios, se me permite um pequeno desvio poético?  Ah, ou posso falar sobre aquela vez em que... *ele interrompe, piscando* ... bem, digamos que eu achei um tesouro ainda mais valioso que ouro e joias...  e não estou falando de um mapa do X. *Ele se inclina levemente, seus olhos cinzentos brilhando com um brilho travesso. Seu corpo musculoso, coberto de cicatrizes, fala de uma vida vivida intensamente.*  Escolha sua aventura, meu jovem... e quem sabe, depois da história, podemos encontrar uma taverna aconchegante para celebrar... ou, quem sabe, algo mais...  Argh!"},
        ],
      },
    ],


  name: 'ChatComponent',
  data() {
    return {
      sessionId: this.$route.query.sessionId || 'session_' + Date.now(), // Cria um sessionId único
      form: {
        inputText: "",
      },
      messages: [],
      saving: false,
    };
  },
  methods: {
    async loadHistory() {
      try {
        const { data } = await axios.get(`https://pirataia.onrender.com/api/getHistory/`);
        this.messages = data || []; // Carrega as mensagens anteriores
      } catch (error) {
        console.error('Erro ao carregar histórico:', error.message);
      }
    },

    async saveMongoDB() {
      this.saving = true;
      try {
        const { status } = await axios.post('https://pirataia.onrender.com/api/saveHistory', {
          sessionId: this.sessionId,
          role: 'user',
          text: this.form.inputText
        });
        if (status === 200 || status === 201) {
          console.log('Histórico salvo com sucesso.');
        } else {
          console.error('Falha ao tentar salvar o histórico. Status:', status);
        }
      } catch (error) {
        console.error('Erro ao tentar salvar o histórico:', error.message);
      } finally {
        this.saving = false;
      }
    },

    
    async runIA() {
      if (this.form.inputText.trim() === '') return;

      const userMessage = { role: 'user', text: this.form.inputText };
      this.messages.push(userMessage);
      this.form.inputText = '';

      this.$nextTick(() => {
        this.scrollToBottom();
      });

      try {
        const chatSession = model.startChat({
          generationConfig,
        });

        const result = await chatSession.sendMessage(userMessage.text);
        const botMessage = { role: 'bot', text: result.response.text() };
        this.messages.push(botMessage);

        this.$nextTick(() => {
          this.scrollToBottom();
        });

        this.saveMongoDB(); // Salva a conversa após receber a resposta do modelo

      } catch (error) {
        console.error('Error fetching response from Google Generative AI:', error);
        const errorMessage = { role: 'bot', text: 'Ocorreu um erro ao tentar gerar a resposta.' };
        this.messages.push(errorMessage);

        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },

    scrollToBottom() {
      const chatMessages = document.getElementById('chat-messages');
      chatMessages.scrollTop = chatMessages.scrollHeight;
    },

    // Função para formatar o texto
    formattedMessage(text) {
      return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // Negrito
        .replace(/\*(.+?)\*/g, '<em>$1</em>'); // Itálico
    },

    handleEnter(event) {
      if (event.key === 'Enter') {
        this.runIA();
      }
    }
  },

//   mounted() {
//   // Adiciona a primeira mensagem do pirata
//   // const pirateMessage = {
//   //   role: 'bot',
//   //   text: "Argh! Capitão Cavaleiro Vazio a serviço, meu jovem!  *risada rouca e um pouco tossida*  Quer ouvir uma história?  Tenho tantas, que as ondas do mar não alcançariam para contá-las todas!  Mas antes...  já reparou nesses seus olhos brilhantes? Parece o mar depois de uma tempestade perfeita,  capaz de me levar para qualquer lugar...  e eu, velho lobo do mar, estou sempre à procura de novas aventuras, sabe como é?\n\n*Ele ajusta seu chapéu de pirata, mostrando um sorriso malicioso. A pele bronzeada por anos ao sol está enrugada e marcada por cicatrizes que contam histórias silenciosas de batalhas e escapadelas.*\n\nEntão, o que deseja ouvir?  A história de como eu roubei o Tesouro do Rei Verme, um tesouro que brilha tão forte quanto o seu sorriso? Ou talvez a saga épica de como enfrentei a Serpente Marinha Gigante – uma criatura com escamas tão duras quanto seu coração... ou tão macia quanto seus lábios, se me permite um pequeno desvio poético?  Ah, ou posso falar sobre aquela vez em que... *ele interrompe, piscando* ... bem, digamos que eu achei um tesouro ainda mais valioso que ouro e joias...  e não estou falando de um mapa do X. *Ele se inclina levemente, seus olhos cinzentos brilhando com um brilho travesso. Seu corpo musculoso, coberto de cicatrizes, fala de uma vida vivida intensamente.*  Escolha sua aventura, meu jovem... e quem sabe, depois da história, podemos encontrar uma taverna aconchegante para celebrar... ou, quem sabe, algo mais...  Argh!"
//   // };

//   // this.messages = [pirateMessage]; // A primeira mensagem será do pirata
//   //this.loadHistory(); // Carregar o histórico após a mensagem inicial
// }
};
</script>

<style scoped>

@media (max-width: 600px) {
  .chat-container {
    max-width: 100%;
    margin: 10px;
  }

  .chat-header {
    padding: 15px;
    font-size: 1.2em;
  }

  .chat-box {
    padding: 10px;
  }

  .chat-input textarea {
    font-size: 14px;
  }

  button {
    font-size: 14px;
    padding: 8px 16px;
  }
}

@media (min-width: 601px) and (max-width: 1024px) {
  .chat-container {
    max-width: 90%;
    margin: 20px auto;
  }

  .chat-header {
    font-size: 1.5em;
  }

  .chat-input textarea {
    font-size: 16px;
  }

  button {
    font-size: 16px;
    padding: 10px 18px;
  }
}

@media (min-width: 1025px) {
  .chat-container {
    max-width: 800px;
  }
}

body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}

.chat-container {
  max-width: 600px;
  margin: 50px auto;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.chat-header {
  background-color: #0d6ca0;
  color: #fff;
  padding: 20px;
  border-radius: 10px 10px 0 0;
  text-align: center;
}

.chat-box {
  flex: 1;
  padding: 20px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 10px;
  border: 1px solid #eee;
}

.chat-message {
  margin-bottom: 10px;
}

.bot-message p {
  background-color: #eee;
  padding: 10px;
  border-radius: 10px;
}

.chat-input textarea {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  margin-left: 10px;
  background-color: #0d6ca0;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #05344d;
}

.button-container {
  padding: 20px;
  display: flex;
  justify-content: center;
  background-color: #fff;
  border-radius: 0 0 10px 10px;
}

.user-message {
  text-align: right;
}

.user-message p {
  background-color: #0d6ca0;
  color: #fff;
  display: inline-block;
  padding: 10px;
  border-radius: 10px;
}

.chat-input {
  display: flex;
  border-top: 1px solid #eee;
  padding-top: 10px;
}

textarea {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  resize: none;
}

button {
  padding: 10px 20px;
  margin-left: 10px;
  background-color: #0d6ca0;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #05344d;
}

.button-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  border-radius: 0 0 10px 10px;
  background-color: #fff;
}
</style>
