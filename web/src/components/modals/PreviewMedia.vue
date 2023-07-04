<template>
  <b-modal centered :title="getTitle" size="md" footer-class="justify-content-end" @hide="closeModal" v-model="modalShow">
    <div class="row">
      <div class="col-auto" v-if="type==='image'">
        <b-img thumbnail fluid :src="getImageMeida"  class="w-100" alt="Image 1"></b-img>
      </div>
      <div class="col-auto" v-if="type==='video'">
        <video id="preview-player_html5_api" class="w-100" controls preload="auto" crossorigin="anonymous" autoplay :src="getVideoMedia"></video>
      </div>
    </div>
    <template #modal-footer="{ ok, cancel, hide}">
    <b-button class="rounded-1" size="sm" @click="hide('forget')">닫기</b-button>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: 'PreviewMedia',
  props:{
    type:{
      type: String,
      required: true
    },
    mediaSource:{
      type: String,
      required: true
    },
    modalShow:{
      type: Boolean,
      required: true
    }
  },
  data(){
    return {      
    }
  },  
  computed:{
    getTitle(){
      //Video
      if(this.type === "video") {
        return "비디오 미리보기"
      }else{
        //Image
        return "이미지 미리보기"
      }
    },
    getImageMeida(){
      return this.mediaSource
    },
    getVideoMedia(){
      return process.env.VUE_APP_BASE_API_URL+"/resources/"+this.mediaSource
    }    
  },
  methods:{
    closeModal: function(){
      this.$emit('closePreview')
      this.modalShow = false
    },
  },
  mounted(){
    console.log("----->dialog mounted"); 
  }
}
</script>