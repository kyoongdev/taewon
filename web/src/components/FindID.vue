<template>
  <div>
    <div class="form-group">
      <label for="txtusername">{{$t('txt_name')}}</label>
      <input type="text" class="form-control" autofocus name="txtusername" v-model="data.username" :placeholder="$t('txt_name_placeholder')">
    </div>
    <div class="form-group">
      <label for="txtuseremail">{{$t('txt_email')}}</label>
      <div class="position-relative">
        <input type="text" class="form-control" v-model="data.email" name="txtuseremail" :placeholder="$t('txt_email_placeholder')">
      </div>
    </div>
    <div class="form-group pt-4">
      <button type="button" class="btn btn-primary login-btn rounded-1" @click="findUserID">{{$t('findidpwd.txt_opt_id')}}</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "FindID",
  data(){
    return{
      data: {
        username: '',
        email: ''
      }
    }
  },
  methods: {
    findUserID: function(){
      this.$emit('btnClick', this.data)
    }
  }
}
</script>
