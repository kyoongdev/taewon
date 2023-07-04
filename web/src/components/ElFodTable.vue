<template>
  <div class="row m-0 cscrollbar h-100">
    <div class="table-box-wrap col-12" :style="cStyle">
      <div class="table-box h-100">
        <table class="table table-sm table-hover pb-0 mb-0">
          <colgroup>
              <col v-for="(col,index) in columns" :width="col.width" :key="index">
          </colgroup>
          <thead>
            <tr>
              <th v-for="(col,index) in columns" :width="col.width" :key="index" class="text-center">
                <span class="font-weight-bold">{{col.text}}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-if="getTotalCount">
              <tr v-for="item in tabledata" :key="item.id" class="tbRow">
                <td v-for="(prop,idxkey) in item.data" class="text-center" :key="idxkey">
                  <div v-if="idxkey==='image'">
                    <button v-if="prop!==''" type="button" class="btn btn-sm" @click="previewImage(item)"><i class="fa fa-camera" aria-hidden="true"></i></button>
                  </div>
                  <div v-if="idxkey==='video'">
                    <button v-if="prop!==''" type="button" class="btn btn-sm" @click="previewVideo(item)"><i class="fa fa-video-camera" aria-hidden="true"></i></button>
                  </div>
                  <div v-if="idxkey!=='image' && idxkey!=='video'" v-html="prop"></div>
                </td>
              </tr>
            </template>
            <template v-else>
              <tr class="noData">
                <td :colspan="getColSpan">
                  <div class='w-100 text-center'>{{$t('txt_no_data')}}</div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
        <preview-media v-if="showPreview" :modalShow="showPreview" @closePreview="closePreview" :type="previewType" :mediaSource="previewSrc"></preview-media>
      </div>
    </div>
  </div>
</template>
<script>
import PreviewMedia from './modals/PreviewMedia.vue'

export default {
  name: "ElFodTable",
  props: {
    columns: {
      type: Array,
      required: false,
      default: new Array()
    },
    tabledata: {
      type: Array,
      required: false,
      default: new Array()
    },
    cStyle:{
      type: String,
      required: false
    }
  },
  components:{
    PreviewMedia
  },
  data(){
    return {
      showPreview:false,
      previewType: '',
      previewSrc: ''
    }
  },
  computed: {
    getColSpan(){
      return _.size(this.columns)+1
    },
    getTotalCount(){
      return _.size(this.tabledata)
    },
  },
  methods: {
    previewVideo(item){
      console.log(item)
      this.previewSrc = item.data.video
      this.previewType = 'video'
      this.showPreview = true
    },
    previewImage(item) {
      console.log(item)
      this.previewSrc = item.data.image
      this.previewType = 'image'
      this.showPreview = true
    },
    closePreview(){
      this.showPreview = false
      this.previewType = ''
      this.previewSrc  = ''
      console.log("closePreview----->closed dialog");
    }
  },
  created(){    
  }
}
</script>
