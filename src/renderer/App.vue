<template>
  <MultiControl/>
</template>

<script>
import MultiControl from './components/multiControl/index.vue'

export default {
  name: 'App',
  components: {
    MultiControl
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.dokit-logo{
  width: 300px;
}
</style>
