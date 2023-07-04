<template>
  <div>
    <div class="form-group">
      <label for="txtuserid">{{$t('txt_id')}}</label>
      <input type="text" class="form-control" autofocus name="txtuserid" v-model="data.userid" :placeholder="$t('txt_id_placeholder')">
    </div>
    <div class="form-group">
      <label for="txtusername">{{$t('txt_name')}}</label>
      <input type="text" class="form-control" name="txtusername" v-model="data.username" :placeholder="$t('txt_name_placeholder')">
    </div>
    <div class="form-group">
      <label for="txtuseremail">{{$t('txt_email')}}</label>
      <div class="position-relative">
        <input type="text" class="form-control" name="txtuseremail" v-model="data.email" :placeholder="$t('txt_email_placeholder')">
      </div>
    </div>
    <div class="form-group pt-4">
      <button type="button" class="btn btn-primary login-btn rounded-1" @click="findUserPwd">{{$t('findidpwd.txt_opt_pwd')}}</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "FindPwd",
  data(){
    return{
      data: {
        userid: '',
        username: '',
        email: ''
      }
    }
  },
  methods:{
    findUserPwd: function(){
      this.$emit('btnClick', this.data)
    }
  }
}
</script>
