<template>
  <div class="app-content">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  components: {
    // MultiControl
  },
  created() {
    document.title = 'DoKitStudio'
  },
}
</script>

<style lang="scss" scoped>
.app-content{
  width: 100%;
  height: 100%;
}
</style>
