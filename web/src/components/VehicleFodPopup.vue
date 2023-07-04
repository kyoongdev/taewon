<template>
  <div class="img_card p-1 mb-2 mt-1 d-flex justify-content-center align-items-center">
    <div class="w-100 h-100">
      <div class="card">
        <div class="card-header">
          <div class="card-text font-weight-bold">{{data.label}}</div>
          <div class="card-text">{{getDateTime(data.create_dt)}}</div>
        </div>
        <div class="card-body text-center">
          <img v-bind:src="data.image" v-if="data.image!==''"/>
          <div class="h-100 w-100" v-if="data.image===''">No Image</div>
        </div>
      </div>
      
      
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  name: "VehicleFodPopup",
  data(){
    return{
    }
  },
  computed:{    
  },
  watch:{
  },
  methods: {
    getDateTime(Datetime) {
      return this.moment(Datetime,'YYYY-MM-DD hh:mm:ss').format('YYYY-MM-DD A hh:mm:ss')
    }
  },
  created(){
  },
  mounted(){
  }
}
</script>

<style lang="scss" scoped>
.img_card {
  overflow: auto;
  border-radius: 3px;
  min-width: 200px;
  max-width: 400px;

  min-height: 200px;
  max-height: 400px;
  img {
    width: 60% !important;
  }
}
</style>
