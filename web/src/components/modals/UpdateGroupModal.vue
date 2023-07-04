<template>
  <b-modal id="modal_update_group" centered title="그룹 수정" size="md" footer-class="justify-content-end"  @hide="closeModal" >
    <b-row class="m-2 border rounded bg-light">
      <b-col md="12" class="text-left ">
        <div class="p-3">
          <b-form>
            <label for="gname">그룹이름</label>
            <b-form-input
              name="gname"
              class="mb-2"
              placeholder="비밀번호 입력하세요"
              size="sm"
              type="text"
              v-model="group.name"
            ></b-form-input>

            <label for="npwd">그룹 설명</label>
            <b-form-input
              name="npwd"
              class="mb-2"
              placeholder="비밀번호 입력하세요"
              size="sm"
              type="text"
              v-model="group.desc"
            ></b-form-input>       
          </b-form>
        </div>
      </b-col>
    </b-row>
    <template #modal-footer="{ ok, cancel, hide}">
    <b-button class="rounded-1" size="sm" @click="hide('forget')">취소</b-button>
    <b-button class="rounded-1 btnPrimary" size="sm" @click="applyClick" :disabled="checkDisabled">변경</b-button>
    </template>
  </b-modal>
</template>

<script>
const group = 'group'
import {TYPE} from '@/store/modules/group'
import { mapActions, mapGetters } from 'vuex'
export default {
  name: "UpdateGroupModal",
  props:{
    group: {
      type: Object,
      required: true
    }
  },
  computed:{
    checkDisabled(){
      return _.isEmpty(this.group.name) && _.isEmpty(this.group.desc)
    }
  },
  methods:{
    ...mapActions(group, [
      TYPE.AC.UPDATE_GROUP
    ]),
    closeModal: function(){
      this.$emit('closeGroupUpdate')
    },
    applyClick: function(){
      this.UPDATE_GROUP(this.group).then((res) => {
        const msg = res.message
        if(msg) {
          this.alert(msg, (ok) => {
            if(ok) {
              this.closeModal()
            }
          })
        }
      }).catch((error) => {
        const msg = error.data.message
        if(msg) {
          this.alert(msg)
        }
      });
    }
  }
}
</script>