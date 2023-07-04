<template>
<div>
  <Header />
  <main>
    <div class="row w-100 h-100 m-0 p-3" id="mainroutesetting">
      <div class="col-lg-2 col-md-4 col-sm-12 p-2">
        <div class="tree w-100 h-100 shadow">
          <div class="ttop">
            <div class="row m-0 h-100 align-items-center justify-content-start pl-3">
              <i class="fa fa-folder fa-lg pr-2 text-warning" aria-hidden="true"></i>{{$t('txt_group')}}
            </div>
          </div>
          <div class="ttree cscrollbar">
            <div id="div_group_tree" class="p-2"></div>
          </div>
          <div class="tfooter">
            <div class="row m-0 h-100 align-items-center justify-content-end pr-3">
              <b-button v-if="IS_SADMIN" size="sm" class="rounded-1 btnPrimary outline mr-2" v-b-modal.modal-group-setting>
                <i class="fa fa-cog" aria-hidden="true"></i>
                {{$t('btn_group_setting')}}
              </b-button>
              <b-button v-if="IS_SADMIN" size="sm" class="rounded-1 outline ml-2" @click="setShowRouteSettingModel" v-b-modal.modal-route-setting>
                <i class="fa fa-cog" aria-hidden="true"></i>
                {{$t('btn_route_setting')}}
              </b-button>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-10 col-md-8 col-sm-12 p-2">
        <div class="contentlist w-100 h-100 shadow">
          <div class="ttop">
            <div class="row m-0 h-100 align-items-center justify-content-between pl-3 pr-3">
              <div class="col-6 d-flex">
                <span class="pr-2">{{$t('txt_total_count')}}</span>:<span class="pl-2">{{getTotalCount}}</span>&nbsp;{{$t('txt_unit')}}
              </div>
              <div class="col d-flex justify-content-end">
                <button v-if="IS_SADMIN" type="button" class="btn btn-sm btnPrimary rounded-1 b-minw mr-2" :disabled="isSingleSelected" @click="setVehicleClean">
                  <i class="fa fa-pencil-square-o pr-1" aria-hidden="true"></i>
                  <span>{{$t('ROUTE.btn_set_clean')}}</span>
                </button>
                <button v-if="IS_SADMIN" type="button" class="btn btn-sm btnPrimary rounded-1 b-minw mr-2" :disabled="isVehicleSelected" @click="setShowRouteModel" v-b-modal.modal_route_setting>
                  <i class="fa fa-pencil-square-o pr-1" aria-hidden="true"></i>
                  <span>{{$t('ROUTE.btn_register_route')}}</span>
                </button>
                <button v-if="IS_SADMIN" type="button" class="btn btn-sm btn-danger rounded-1 b-minw mr-2" @click="deleteRouteDetail" :disabled="isDDisabled">
                  <i class="fa fa-trash-o pr-1" aria-hidden="true"></i>
                  <span>{{$t('ROUTE.btn_delete_route')}}</span>
                </button>
              </div>
            </div>
          </div>
          <div class="row m-0">
            <el-table :columns="tbColumns" :tabledata="listdata" @selectCheckbox="selectCheckbox" />
          </div>
          <div class="tfooter" style="display:none">
            <div class="row m-0 h-100 align-items-center">
              <div class="col-12 p-2">
                <div style="position:absolute;left: 10px;">
                  <label for="dgroupSelCtrl">{{$t('txt_shown')}} : </label>
                  <select name="dgroupSelCtrl" style="padding:2px" v-model="perPageCount">
                    <template v-for="i in [10,30,50]">
                    <option :key="i" :value="i">{{i}}건 씩</option>
                    </template>
                  </select>
                </div>
                <pagination
                  :maxVisibleButtons="maxPageIdxs"
                  :total-pages="totalPages"
                  :total="getTotalCount"
                  :per-page="perPageCount"
                  :current-page="currentPage"
                  @pagechanged="onPageChange"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
  <route-modal v-if="showRouteModal" :group="vehicleGroup.Group" :vehicle="vehicleGroup.Vehicle" @closeRouteModal="closeRouteModal"/>
  <group-setting />
  <RouteSettingModal v-if="showRouteSettingModal" @closeRouteSettingModal="closeRouteSettingModal"/>
  <Footer />
</div>
</template>

<script>
const user = 'user'
const group = 'group'
import {TYPE} from '@/store/modules/user'
import {TYPE as GROUP_TYPE} from '@/store/modules/group'
import { mapActions, mapGetters } from 'vuex'
import "@/assets/jstree/themes/default/style.min.css"
import "@/assets/jstree/jstree.min.js"
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import Pagination from "@/components/Pagination.vue"
import RouteModal from '@/components/modals/RouteModal.vue'
import GroupSetting from '@/components/modals/GroupSettingModal.vue'
import RouteSettingModal from '@/components/modals/RouteSettingModal.vue'
import ElTable from '@/components/ElTable.vue'
export default {
  name: "RouteSetting",
  data(){
    return {
      showRouteModal: false,
      showRouteSettingModal: false,
      vehicleGroup: {},
      selectedNode: {},
      listdata: [],
      selectIds: [],
      totalPages: 0,
      maxPageIdxs: 6,
      perPageCount: 10,
      currentPage: 1,
      dialogType: 0,
      groupTreeData: [],
      treeObject: {},
      tbColumns: [],
    }
  },
  components: {
    Header,
    Footer,
    RouteModal,
    Pagination,
    GroupSetting,
    RouteSettingModal,
    ElTable
  },
  computed: {
    ...mapGetters(['getUILang']),
    ...mapGetters(user, [
      TYPE.GET.MY_INFO,
      TYPE.GET.IS_SADMIN,
      TYPE.GET.USER_TREE,      
    ]),
    ...mapGetters(group, [
      GROUP_TYPE.GET.GROUP_LIST,
      GROUP_TYPE.GET.GROUP_ROUTE_DETAIL,
    ]),
    getColSpan(){
      return _.size(this.tbcol)+1
    },
    isEmptyList() {
      return _.size(this.listdata) == 0
    },
    getTotalCount(){
      return _.size(this.listdata)
    },
    isSingleSelected(){
      return this.selectIds.length !== 1
    },
    isDDisabled(){
      return this.selectIds.length == 0
    },
    isVehicleSelected() {
      return _.isEmpty(this.vehicleGroup)
    }
  },
  watch:{
    selectIds(v){
      if(this.listdata.length == v.length){
        this.allSelected = true;
      }else {
        this.allSelected = false;
      }
    },
    perPageCount(){
      this.setTotalPageCount()
    },
    USER_TREE:{
      handler(data) {
        this.groupTreeData = _.cloneDeep(data, true)
      },
      deep: true
    },
    groupTreeData: {
      handler(data) {
        this.selectedNode = {}
        this.checkTreeObject()
        if(this.treeObject.html()!==''){
          this.refreshTree(data)
        }else{
          this.setTreeData(data)
        }
      },
      deep: true
    },
    GROUP_ROUTE_DETAIL:{
      handler(){
        this.renderTableData()
      },
      deep: true
    },
    GROUP_LIST:{
      handler(){
        this.GET_USER_CLEAN_ROUTE_TREE()
        this.GET_GROUP_ROUTE_DETAIL()
      },
      deep: true
    },
    selectedNode:{
      deep: true,
      handler(n) {
        this.renderTableData()
      }
    },
    getUILang(v) {
      this.tbColumns = this.getColumns()
    }
  },
  methods: {
    ...mapActions(user, [
      TYPE.AC.GET_USER_GROUP,
      TYPE.AC.GET_USER_CLEAN_ROUTE_TREE,
    ]),
    ...mapActions(group, [
      GROUP_TYPE.AC.GET_GROUP_LIST,
      GROUP_TYPE.AC.GET_GROUP_ROUTE_DETAIL,
      GROUP_TYPE.AC.DEL_GROUP_ROUTE_DETAIL,
    ]),
    onPageChange(page) {
      this.currentPage = page;
    },
    setTotalPageCount(){
      const ttCount = this.getTotalCount | 1
      const t1 = parseInt(ttCount / this.perPageCount);
      const t2 = (ttCount % this.perPageCount) == 0? 0 : 1
      this.totalPages = t1 + t2
      this.currentPage = 1;
    },
    setVehicleClean(){
      this.confirm(this.$i18n.t('ROUTE.txt_alert_set_clean_route'), (v)=>{
        if(v) {
          let list = this.GROUP_ROUTE_DETAIL.filter(r => this.selectIds.includes(r.id))
          if(_.size(list)) {
            this.setLoading(true)
            let data = []
            list.map(route => {
              data.push({id: route.id, vid: route.vid});
            })
            if(_.size(data)) {
              const payload = {route_id: data[0].id}
              const command = this.genData('command', code.cmd.set_clean_route, data[0].vid, payload)
              this.sendSocket(command)
              this.setLoading(false)
            }else {
              this.setLoading(false)
            }
            this.renderTableData()
          }else{
            this.renderTableData()
          }
        }
      });
    },
    selectCheckbox: function(data){
      this.selectIds = _.cloneDeep(data,true)
    },
    setShowRouteModel: function(){
      this.showRouteModal = true
    },
    closeRouteModal: function(){
      this.showRouteModal = false
    },
    setShowRouteSettingModel: function(){
      this.showRouteSettingModal = true
    },
    closeRouteSettingModal: function(){
      this.showRouteSettingModal = false
    },
    customMenu: function(node) {
      var items = {
        renameItem: {
          label: "Rename",
          action: function () {

          }
        },
        deleteItem: {
          label: "Delete",
          action: function () {
            
          }
        }
      };
      if ($(node).hasClass("folder")) {
        delete items.deleteItem;
      }
      return items;
    },
    checkTreeObject: function() {
      this.treeObject = $("#div_group_tree")
    },
    refreshTree: function(data) {
      this.checkTreeObject()
      this.treeObject.jstree(true).settings.core.data = data;
      this.treeObject.jstree("open_all");
      // setTimeout(() => {
      //   $('#div_group_tree').jstree(true).refresh(true, false)
      // }, 500);
    },
    setTreeData: function (data) {
      this.checkTreeObject()
      this.treeObject.jstree({ 
        "plugins": ["themes", "html_data", "ui", "contextmenu", /*"dnd"*/, 'sort',  /*"state",*/ 'types'],
        'core' : { 
          'multiple' : false,
          "animation" : 1,
          "check_callback" : true,
          "themes" : {
            "variant" : "large"
          },
          'data' : data
        },   
        contextmenu: {items: this.customMenu}     
      }).bind("loaded.jstree", (event, data) => {
        this.treeObject.jstree("open_all");
      }).bind("select_node.jstree", (event, data) => { 
        if(data && data.node) {
          const {type} = data.node.original
          if(type ==="vehicle") {
            this.vehicleGroup = _.cloneDeep(data.node.data, true)
          }else{
            this.vehicleGroup = {}
          }
          this.selectedNode = _.cloneDeep(data.node, true)
        }
      })      
    },
    renderTableData(){
      this.listdata = []
      let NodeType = -1
      if(!_.isEmpty(this.selectedNode)) {
        const {type} = this.selectedNode.original
        NodeType = type
      }
      let list = this.GROUP_ROUTE_DETAIL
      if(NodeType!==-1) {
        const {data} = this.selectedNode
        if(NodeType ==='group') {
          list = list.filter(i => i.CleanRoute.gid === data.id)
        }
        else if(NodeType ==='vehicle') {
          list = list.filter(i => i.vid === data.vid && i.CleanRoute.gid === data.gid)
        }
      }
      list.map(RouteDetail => {
        const row = {
          id: RouteDetail.id,
          data: {
            grName: '<p class="wrap_text">'+RouteDetail.CleanRoute.Group.name+'</p>',
            vName: '<p class="wrap_text">'+RouteDetail.Vehicle.name+'</p>',
            rName: '<p class="wrap_text">'+RouteDetail.CleanRoute.name+'</p>',
            cName: '<p class="wrap_text">'+(RouteDetail.ChargeStation?RouteDetail.ChargeStation.name : '<i class="fa fa-plug text-danger pr-1" aria-hidden="true"></i>?')+'</p>',
            ggName: '<p class="wrap_text">'+(RouteDetail.Garage?RouteDetail.Garage.name : '<i class="fa fa-share-square text-danger pr-1" aria-hidden="true"></i>?')+'</p>',
            setTime: '<p class="wrap_text">'+'N/A'+'</p>',
            estTime: '<p class="wrap_text">'+'N/A'+'</p>',
          }
        }
        this.listdata.push(row)
      })
    },
    deleteRouteDetail: async function(){
      this.confirm(this.$i18n.t('ROUTE.txt_alert_delete_msg'), (v)=>{
        if(v) {
          let list = this.GROUP_ROUTE_DETAIL.filter(r => this.selectIds.includes(r.id))
          if(_.size(list)) {
            this.setLoading(true)
            let data = []
            list.map(route => {
              data.push({id: route.id, vid: route.vid});
            })
            if(_.size(data)) {
              this.DEL_GROUP_ROUTE_DETAIL(data).then(res=>{
                this.setLoading(false)
                this.alert(res.message, ()=>{
                  this.selectIds = []
                  this.GET_GROUP_ROUTE_DETAIL()
                });
              }).catch(error =>{
                this.setLoading(false)
                const data = error && error.data
                if(data){
                  this.alert(data.message);
                }
              })
            }
          }else{
            this.selectIds = []
          }
        }
      }, {title:this.$i18n.t('txt_alert_warning'),})
    },
    getColumns(){
      return Array(
        {text: this.$i18n.t('ROUTE.table.group') },
        {text: this.$i18n.t('ROUTE.table.vh_name')},
        {text: this.$i18n.t('ROUTE.table.route_name')},
        {text: this.$i18n.t('ROUTE.table.garage_name')},
        {text: this.$i18n.t('ROUTE.table.charge_name')},
        {text: this.$i18n.t('ROUTE.table.reserved_time')},
        {text: this.$i18n.t('ROUTE.table.est_time')},
      )
    }
  },
  created(){
    this.tbColumns = this.getColumns()
    this.setTotalPageCount()
  },
  mounted(){      
    this.checkTreeObject()
    this.setLoading(true)
    if(this.MY_INFO.role === 1){
      this.GET_GROUP_LIST()
    }
    else{
      this.GET_USER_GROUP({userid: this.MY_INFO.id})
    }
    this.GET_GROUP_ROUTE_DETAIL()
    this.GET_USER_CLEAN_ROUTE_TREE()
    this.setLoading(false)
  }
}
</script>
<style scoped>
#mainroutesetting{
  background: #f8f9fa;
  background: linear-gradient(#e9ecef, #f9f9f9);
}
.contentlist,
.tree{
  border-radius: 0.7rem;
  font-size: 90% !important;
  background: #f8f9fa;
}
#usernode > .jstree-icon {
  display: none;
}
.ttop{
  height: 50px;
  text-align: left;
  background: #FFF;
  border-top-right-radius: 0.6rem;
  border-top-left-radius: 0.6rem;
  border-bottom: 1px solid #d6d8db;
}
.contentlist .row,
.tree .ttree{
  overflow: auto;
  height: calc(100% - 100px);
}
.tfooter{
  height: 50px;
  background: #FFF;
  border-top: 1px solid #d6d8db;
  border-bottom-right-radius: 0.6rem;
  border-bottom-left-radius: 0.6rem;
}
@media (min-width: 1800px){
  .contentlist,
  .tree{
    font-size: 100% !important;
  }
}
</style>
