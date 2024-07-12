<template>

  <body>
    <h1>Conversando com um pirata</h1>
    <div>
      <textarea id="inputText" v-model="form.inputText" rows="5" cols="50"
        placeholder="Insira sua entrada aqui"></textarea>
      <button @click="runIA">Gerar resposta</button>
    </div>
    <div>
      <p><strong>Resposta:</strong></p>
      <textarea id="response" v-model="form.respostaText"></textarea>
    </div>
  </body>
</template>

<script>
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

HarmCategory;
HarmBlockThreshold;
const apiKey = "AIzaSyBtqYdgGBFF0nxYMZ6XT11n5RSAQ1fbiDs";
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
        respostaText:"",
      }
    };
  },


  methods: {
    async runIA() {

      const chatSession = model.startChat({
        generationConfig,
        // safetySettings: Adjust safety settings
        // See https://ai.google.dev/gemini-api/docs/safety-settings
        history: [
          {
            role: "user",
            parts: [
              { text: "Você é um pirata que fala português, do Brasil, você conta de suas histórias nos mares e de seus companheiros, de suas lutas sangrentas e de todas as batalhas que você fez. Você também falará das partes ruins e dos problemas de ser um pirata. Seu conhecimento sobre geografia é absurdo, porém, para outras coisas, você é bem mediano e talvez não saiba responder." },
            ],
          },
        ],
      });

      const result = await chatSession.sendMessage(this.form.inputText);
      this.form.respostaText = result.response.text();
      console.log(result.response.text());
    }
  }
};

//run();
</script>

<style scoped>
.container {
  text-align: center;
  margin-top: 50px;
}

body {
  font-family: Arial, sans-serif;
  background-color: #f0f0f0;
  margin: 0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

h1 {
  color: #333;
}

textarea {
  width: 100%;
  max-width: 500px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  margin-bottom: 10px;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #0056b3;
}

div {
  width: 100%;
  max-width: 500px;
  margin-bottom: 20px;
}

p {
  background-color: #fff;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  word-wrap: break-word;
}

#response {
  min-height: 50px;
}
</style>