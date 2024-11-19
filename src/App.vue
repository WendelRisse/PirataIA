<template>
  <router-view />
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
body {
  background-image: url('@/assets/fundopiratanaufragio.jpg');
  background-size: cover;
  background-repeat: no-repeat; 
  background-position: center; 
  background-attachment: fixed; 
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
