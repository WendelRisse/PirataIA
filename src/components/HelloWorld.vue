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
      <button type="button" :disabled="saving" @click="saveMongoDB">
        {{ saving ? 'Salvando...' : 'Salvar Histórico' }}
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

HarmCategory;
HarmBlockThreshold;

const apiKey = "AIzaSyBtqYdgGBFF0nxYMZ6XT11n5RSAQ1fbiDs";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    async handleEnter(event) {
      if (!event.shiftKey) {
        event.preventDefault(); // Evita a quebra de linha
        this.runIA(); // Envia a mensagem
      }
    },

    async saveMongoDB() {
      try {
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

    async runIA() {
      if (this.form.inputText.trim() === '') return;

      const userMessage = { role: 'user', text: this.form.inputText };
      this.messages.push(userMessage);
      this.form.inputText = '';

      this.$nextTick(() => {
        this.scrollToBottom(); // Rola o chat para o final após enviar a mensagem
      });

      try {
        const chatSession = model.startChat({
          generationConfig,
          history: this.messages.map(message => ({
            role: message.role === 'user' ? 'user' : 'model',
            parts: [{
              text: "Você é um pirata que fala português, que fala pouco, só fala muito quando te pedem para contar histórias. Você fala português, você conta de suas histórias nos mares e de seus companheiros. Você também falará das partes ruins e dos problemas de ser um pirata. Seu conhecimento sobre geografia é absurdo, porém, para outras coisas, você é bem mediano e talvez não saiba responder."
            }]
          }))
        });

        const result = await chatSession.sendMessage(userMessage.text);
        const botMessage = { role: 'bot', text: result.response.text() };
        this.messages.push(botMessage);

        this.$nextTick(() => {
          this.scrollToBottom(); // Rola o chat para o final após receber a resposta do bot
        });

      } catch (error) {
        console.error('Error fetching response from Google Generative AI:', error);
        const errorMessage = { role: 'bot', text: 'Ocorreu um erro ao tentar gerar a resposta. Por favor, tente novamente.' };
        this.messages.push(errorMessage);

        this.$nextTick(() => {
          this.scrollToBottom(); // Rola o chat para o final após exibir o erro
        });
      }
    },

    // Função para formatar o texto
    formattedMessage(text) {
      return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // Negrito
        .replace(/\*(.+?)\*/g, '<em>$1</em>'); // Itálico
    },

    scrollToBottom() {
      const chatMessages = document.getElementById('chat-messages');
      chatMessages.scrollTop = chatMessages.scrollHeight; // Garante que o chat vai parar no final
    }
  },
};
</script>

<style scoped>

/* Smartphones */
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

/* Tablets */
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

/* Desktops */
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