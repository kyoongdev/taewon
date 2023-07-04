<template>
  <div class="row m-0 cscrollbar" :class="{'h-100': h100}">
    <div class="table-box-wrap col-12" :style="cStyle">
      <div class="table-box h-100">
        <table class="table table-sm table-hover pb-0 mb-0">
          <colgroup>
              <col width="5%" v-if="showcheckbox">
              <template v-for="(col,index) in columns">
              <col v-if="col.width" :width="col.width" :key="index" >
              <col v-else :key="index" >
              </template>
          </colgroup>
          <thead>
            <tr>
              <th width="5%" class="text-center" v-if="showcheckbox">
                <div class="form-check">
                  <input type="checkbox" :class="tableid" class="form-control checkallbox" :disabled="isEmptyList" v-model="allSelected" @click="selectAll" style="width:15px;height:15px;">
                </div>
              </th>
              <template v-for="(col,index) in columns">
              <th v-if="col.width" :width="col.width" :key="index" class="text-center">
                <span class="font-weight-bold">{{col.text}}</span>
              </th>
              <th v-else :key="index" class="text-center">
                <span class="font-weight-bold">{{col.text}}</span>
              </th>
              </template>
            </tr>
          </thead>
          <tbody>
            <template v-if="getTotalCount">
              <tr v-for="item in tabledata" :key="item.id" :class="tableid" class="tbRow" @click="setSelectedRow" :data-itemid="item.id">
                <template v-if="showcheckbox">
                  <td class="text-center">
                    <div class="form-check">
                      <input type="checkbox" v-model="selectIds" class="form-control ckbox" :value="item.id" style="width:15px;height: 15px;">
                    </div>
                  </td>
                </template>
                <td v-for="(prop,idxkey) in item.data" class="text-center" :key="idxkey">
                  <span v-html="prop"></span>
                </td>
              </tr>
            </template>
            <template v-else>
              <tr class="noData">
                <td :colspan="getColSpan">
                  <img v-if="noDataImage" :src="noDataImage" width="200" class="mt-2"/>
                  <div class='w-100 text-center'>{{$t('txt_no_data')}}</div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script>

export default {
  name: "ElTable",
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
    h100:{
      type: Boolean,
      required: false,
      default: false
    },
    showcheckbox:{
      type: Boolean,
      required: false,
      default: true
    },
    cStyle:{
      type: String,
      required: false
    },
    noDataImage:{
      type: String,
      required: false
    },
    singleSelection:{
      type: Boolean,
      required: false,
      default: false
    },
    noSelectRow:{
      type: Boolean,
      required: false,
      default: false
    }
  },
  data(){
    return {
      tableid: '',
      selectIds: [],
      allSelected: false,
    }
  },
  computed: {
    getColSpan(){
      return _.size(this.columns)+1
    },
    isEmptyList() {
      const ret = _.size(this.tabledata)==0?true : false
      if(ret) {
        this.selectIds = []
        this.allSelected = false
      }
      return ret
    },
    getTotalCount(){
      return _.size(this.tabledata)
    },
    isDDisabled(){
      return _.size(this.selectIds)==0?true : false
    }
  },
  watch:{
    selectIds(ids){      
      this.$emit('selectCheckbox', ids);
      if(_.size(ids) !== this.getTotalCount) {
        this.allSelected = false
      }else if(this.getTotalCount){
        this.allSelected = true
      }
    },
    tabledata(){
      this.selectIds = []
      this.allSelected = false
      $('.tbRow'+'.'+this.tableid).removeClass("selectRow")
    }
  },
  methods: {
  // generate random string
    generateString() {
      let text = '';
      const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (let i = 0; i < 6; i += 1) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    },
    
    selectAll: function(e){
      this.selectIds = [];
      if (e.currentTarget.checked) {
        $('.tbRow'+'.'+this.tableid).addClass("selectRow")
        this.tabledata.map(item => {
          this.selectIds.push(item.id)
        })
      }else{
        $('.tbRow'+'.'+this.tableid).removeClass("selectRow")
      }
    },
    setSelectedRow: function(e){
      const tr = $(e.currentTarget)
      if(this.singleSelection) {
        if(tr.hasClass('selectRow')) {
          this.selectIds =[]
          tr.removeClass('selectRow')
        }else{
          $('.tbRow'+'.'+this.tableid).removeClass("selectRow")
          tr.addClass('selectRow')
          const id = tr.data('itemid')
          this.selectIds = [id];
        }
      }else{
        tr.toggleClass('selectRow')
        const id = tr.data('itemid')
        if(tr.hasClass('selectRow')) {
          this.selectIds.push(id)
        }else{
          this.selectIds = this.selectIds.filter(i => i!==id)
        }
      }
      if(this.noSelectRow) {
        tr.removeClass('selectRow')
      }
    }
  },
  created(){
    this.tableid = this.generateString()
  }
}
</script>
