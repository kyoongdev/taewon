<template>
  <div class="p-1 pb-3 bg-light">
    <div class="col-12">
      <div class="dvfooter">
        <!-- <span>{{$t('app_title')}}</span><br/> -->
        <span>{{copyright_text}}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Footer",
  computed: {
    copyright_text() {
      return this.$t('copyright').replace('#year', new Date().getFullYear())
    }
  }
}
</script>

<style>
.dvfooter{
  font-size:0.7rem;color:#c0c0c0;text-align:center;
}
</style>