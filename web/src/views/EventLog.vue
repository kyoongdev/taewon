<template>
  <div class="container-fluid overflow-hidden shadow">
    <div class="alert alert-success"><i class="fa fa-cog pr-2" aria-hidden="true"></i>이벤트 관리</div>
    <div class="row cscrollbar">
      <div class="col-md-8">
        <div class="wrapper bg-white h-100 cscrollbar">
          <el-table :columns="tbColumns" :tabledata="tabledata" :h100="true"/>
        </div>
      </div>
      <div class="col-md-4">
        <div class="wrapper bg-white h-100 p-2 overflow-auto cscrollbar">
          <div class="m-2 bg-dark rounded d-flex align-items-center justify-content-center text-white" style="height:47%">
            No Video
          </div>
          <div class="m-2 bg-dark rounded d-flex align-items-center justify-content-center text-white" style="height:47%">
            No Map
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ElTable from '@/components/ElTable.vue'
export default {
  name: 'EventLog',
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
        {text: "시간"},
        {text: "이벤트"},
        {text: "위치"},
        {text: "영상"},
      ],
    }
  },
}
</script>
<style lang="scss" scoped>
.container-fluid.overflow-hidden {
  .row {
    margin: 0px;
    padding: 0.5rem 1rem;
    overflow: auto;
    height: calc(100% - 60px);
    > div{
      padding: 0.2rem 0.5rem;
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
