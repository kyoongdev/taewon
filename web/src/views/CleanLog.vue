<template>
  <div class="container-fluid overflow-hidden shadow">
    <div class="alert alert-success"><i class="fa fa-cog pr-2" aria-hidden="true"></i>경로 / 영상 관리</div>
    <div class="row first cscrollbar">
      <div class="col-md-7">
        <div class="wrapper bg-white h-100 p-2">
          <el-table :columns="tbColumns" :tabledata="tabledata" :h100="true"/>
        </div>
      </div>
      <div class="col-md-5">
        <div class="wrapper bg-white h-100 p-2">
          <div class="h-100 bg-dark rounded d-flex align-items-center justify-content-center text-white">
            No Map
          </div>
        </div>
      </div>
    </div>
    <div class="row second cscrollbar">
      <div class="col col-md-12">
        <div class="wrapper bg-white h-100 p-2">
          <div class="h-100 rounded d-flex align-items-center justify-content-center bg-light">
            No Graphic Data
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ElTable from '@/components/ElTable.vue'
export default {
  name: 'CleanLog',
  props:{
    sadmin:{
      type: Boolean,
      required: true,
      default: false
    },
    crud: {
      type: Object,
      required: true,
      default: () => {return { read: false, update: false, delete: false, create: false}}
    }
  },
  components:{
    ElTable
  },
  data() {
    return {
      tabledata: [],
      tbColumns: [
        {text: "날짜"},
        {text: "청소차"},
        {text: "충전소"},
        {text: "종료지점"},
        {text: "운행 거리"},
        {text: "총 운행시간"},
      ],
    }
  }
}
</script>
<style lang="scss" scoped>
.container-fluid.overflow-hidden {
  .row {
    margin: 0px;
    padding: 0.5rem 1rem;
    overflow: auto;
    &.first{
      height: 45%;
      > div{
        padding: 0.2rem 0.5rem;
      }
    }
    &.second{
      height: 43%;
      > div{
        padding: 0rem 0.5rem;
      }
    }
    div{
      div.wrapper{
        border-radius: 6px !important;
        border: 1px solid #e9ecef;
      }
    }
  }
}
</style>
