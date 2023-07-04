<template>
  <div id="nav">
    <div>Here are test menu:</div>
    <template v-for="link in url">
      <template v-if="!link.external && link.text.length>0 && link.name.length>0 && link.path!='*'">
        <router-link :key="link.name" :to="link.path">{{link.text}}</router-link> |
      </template>
    </template>
  </div>
</template>

<script>
import Links from '@/router/url'
export default {
  name: 'MenuTest',
  data(){
    return{
      url: Links
    }
  },
}
</script>