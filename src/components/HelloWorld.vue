<template>
  <div class="chat-container">
    <div class="chat-header">
      <h1>Conversando com um pirata</h1>
    </div>
    <div class="chat-box">
      <div class="chat-messages" id="chat-messages">
        <div v-for="(message, index) in messages" :key="index"
          :class="{ 'chat-message': true, 'user-message': message.role === 'user', 'bot-message': message.role === 'bot' }">
          <p>{{ message.text }}</p>
        </div>
      </div>
      <div class="chat-input">
        <textarea v-model="form.inputText" rows="3" placeholder="Insira sua entrada aqui"></textarea>
        <button @click="runIA">Enviar</button>
      </div>

    </div>
    <button type="button" @click="saveMongoDB">Salvar Histórico</button>
  </div>
</template>

<script>
import axios from 'axios';

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

HarmCategory;
HarmBlockThreshold;

const apiKey = "AIzaSyBtqYdgGBFF0nxYMZ6XT11n5RSAQ1fbiDs"; // Certifique-se de que essa chave é válida e tem as permissões necessárias
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 2,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

export default {
  name: 'HelloWorld',
  data() {
    return {
      form: {
        inputText: "",
      },
      messages: [],
    };
  },
  methods: {
    async saveMongoDB() {
      try {
        // Fazendo uma requisição para o backend para verificar a conexão com MongoDB
        const { status } = await axios.post('http://localhost:3000/api/saveHistory');

        if (status === 200 || status === 201) {
          console.log('Histórico salvo com sucesso.');
        } else {
          console.error('Falha ao tentar salvar o histórico. Status:', status);
        }
      } catch (error) {
        console.error('Erro ao tentar salvar o histórico:', error.message);
      }
    },

    // async conectarMongo(bot) {

    //   try {
    //     // Chamada HTTP para o backend
    //     const response = await axios.post('http://localhost:3000/api/chat', { message: bot });
    //     this.messages.push({ role: 'bot', text: response.data.reply });
    //   } catch (error) {
    //     console.error('Erro ao buscar resposta do servidor:', error);
    //     this.messages.push({ role: 'bot', text: 'Ocorreu um erro ao tentar gerar a resposta. Por favor, tente novamente.' });
    //   }
    // },

    async runIA() {
      if (this.form.inputText.trim() === '') return;

      const userMessage = { role: 'user', text: this.form.inputText };
      this.messages.push(userMessage);
      this.form.inputText = '';

      try {
        // Salvar a mensagem do usuário no MongoDB


        const chatSession = model.startChat({
          generationConfig,
          history: this.messages.map(message => ({
            role: message.role === 'user' ? 'user' : 'model',
            parts: [{ text: "Você é um pirata que fala português, do Brasil, você conta de suas histórias nos mares e de seus companheiros, de suas lutas sangrentas e de todas as batalhas que você fez. Você também falará das partes ruins e dos problemas de ser um pirata. Seu conhecimento sobre geografia é absurdo, porém, para outras coisas, você é bem mediano e talvez não saiba responder." }],
          })),
        });

        const result = await chatSession.sendMessage(userMessage.text);
        const botMessage = { role: 'bot', text: result.response.text() };
        this.messages.push(botMessage);

        // Salvar a mensagem do bot no MongoDB

        try {
          await fetch('http://localhost:3000/api/saveHistory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userMessage),
          });
        } catch (error) {
          console.log("Erro ao salvar prompt do usuário");
        }

        try {
          await fetch('http://localhost:3000/api/saveHistory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(botMessage),
          });
        } catch (error) {
          console.log("Erro ao salvar prompt do modelo");
        }

      } catch (error) {
        console.error('Error fetching response from Google Generative AI:', error);
        const errorMessage = { role: 'bot', text: 'Ocorreu um erro ao tentar gerar a resposta. Por favor, tente novamente.' };
        this.messages.push(errorMessage);

        // Opcional: Salvar a mensagem de erro no MongoDB
        await fetch('http://localhost:3000/api/saveHistory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorMessage),
        });
      }
    }

    // async runIA() {
    //   if (this.form.inputText.trim() === '') return;

    //   const userMessage = { role: 'user', text: this.form.inputText };
    //   this.form.inputText = '';
    //   this.messages.push(userMessage);

    //   try {
    //     // Salvar a mensagem do usuário no MongoDB
    //     await fetch('http://localhost:3000/api/saveHistory', {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify(userMessage),
    //     });

    //     // Simular uma resposta do bot
    //     const botMessage = { role: 'bot', text: 'Resposta simulada do bot' };
    //     this.messages.push(botMessage);

    //     // Salvar a mensagem do bot no MongoDB
    //     await fetch('http://localhost:5000/api/saveHistory', {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify(botMessage),
    //     });
    //   } catch (error) {
    //     console.error('Erro ao salvar mensagens:', error);
    //   }
    // }

  },
};
</script>

<style scoped>
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background-color: #f4f4f9;
  background-Image: url('@/assets/pirata.jpg'
    )
}

.chat-container {
  max-width: 600px;
  margin: 50px auto;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: auto;
}

.chat-header {
  background-color: #5e3212;
  color: #fff;
  padding: 20px;
  border-radius: 10px 10px 0 0;
  text-align: center;
}

.chat-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 10px;
  border: 1px solid #eee;
}

.chat-message {
  margin-bottom: 10px;
}

.user-message {
  text-align: right;
}

.user-message p {
  background-color: #5e3212;
  color: #fff;
  display: inline-block;
  padding: 10px;
  border-radius: 10px;
}

.bot-message p {
  background-color: #eee;
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
  background-color: #5e3212;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #46230d;
}
</style>
<!-- frontend/src/components/ChatPirata.vue -->
<!-- <template>
  <div class="chat-container">
    <div class="chat-header">
      <h1>Conversando com um pirata</h1>
    </div>
    <div class="chat-box">
      <div class="chat-messages" id="chat-messages">
        <div v-for="(message, index) in messages" :key="index"
          :class="{ 'chat-message': true, 'user-message': message.role === 'user', 'bot-message': message.role === 'bot' }">
          <p>{{ message.text }}</p>
        </div>
      </div>
      <div class="chat-input">
        <textarea v-model="form.inputText" rows="3" placeholder="Insira sua entrada aqui"></textarea>
        <button @click="runIA">Enviar</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ChatPirata',
  data() {
    return {
      form: {
        inputText: '',
      },
      messages: [],
    };
  },
  methods: {
    async runIA() {
      if (this.form.inputText.trim() === '') return;

      this.messages.push({ role: 'user', text: this.form.inputText });
      const userMessage = this.form.inputText;
      this.form.inputText = '';

      try {
        // Chamada HTTP para o backend
        const response = await axios.post('http://localhost:3000/api/chat', { message: userMessage });
        this.messages.push({ role: 'bot', text: response.data.reply });
      } catch (error) {
        console.error('Erro ao buscar resposta do servidor:', error);
        this.messages.push({ role: 'bot', text: 'Ocorreu um erro ao tentar gerar a resposta. Por favor, tente novamente.' });
      }
    },
  },
};
</script>

<style scoped>
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background-color: #f4f4f9;
  background-Image: url(
    '@/assets/pirata.jpg'
  )
}

.chat-container {
  max-width: 600px;
  margin: 50px auto;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: auto;
}

.chat-header {
  background-color: #5e3212;
  color: #fff;
  padding: 20px;
  border-radius: 10px 10px 0 0;
  text-align: center;
}

.chat-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 10px;
  border: 1px solid #eee;
}

.chat-message {
  margin-bottom: 10px;
}

.user-message {
  text-align: right;
}

.user-message p {
  background-color: #5e3212;
  color: #fff;
  display: inline-block;
  padding: 10px;
  border-radius: 10px;
}

.bot-message p {
  background-color: #eee;
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
  background-color: #5e3212;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #46230d;
}
</style> -->
