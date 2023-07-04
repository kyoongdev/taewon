<template>
<div>
  <Header :show-menu="false" />  
  <div class="d-flex justify-content-center align-items-center main_container">
    <div class="text-center">
      <div class="h4 text">404</div>
      <div class="h6 text-secondary">Oop! Something went wrong!</div>
      <div class="h5 text-secondary">{{currentCount}} sec</div>
    </div>
  </div>
  <Footer />  
</div>
</template>

<script>
const auth = 'auth'
import {TYPE} from '@/store/modules/auth'
import { mapGetters } from 'vuex'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
export default {
  name: "NotFound",
  components: {
    Header,
    Footer
  },
  data(){
    return{
      currentCount: 10
    }
  },
  computed:{
    ...mapGetters(auth, [
      TYPE.GET.LOGIN_STATUS
    ])
  },
  watch:{
    currentCount(v){
      if(v<=1) {
        if(this.LOGIN_STATUS)
          this.$router.push(this.$url.DASHBOARD);
        else
          this.$router.push(this.$url.LOGIN);
      }
    }
  },
  mounted(){
    setInterval(()=>{
      this.currentCount--
    }, 1000)
  }
}
</script>

<style lang="scss" scoped>
.main_container{
  overflow: auto;
  height: calc(100vh - 110px);
  background: #f8f9fa;
}
</style>