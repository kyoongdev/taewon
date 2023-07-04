<template>
  <b-dropdown class="locale-switcher" :text="selected ? selected.src : 'Please select some item'">
    <b-dropdown-item
      :disabled="option.disabled"
      @click="select(option)"
      v-for="option in options"
      :key="option.value"
    >
      <div>
        <img :src="option.src">
        {{option.text}}
      </div>
    </b-dropdown-item>>
  </b-dropdown>
</template>

<script>
export default {
  name: "LanguageSwitcher",
  props:{
    lang: {
      type: String,
      required: true,
      default: "ko"
    }
  },
  data() {
    return {
      options: [
        {
          value: "en",
          text: "English",
          src: "https://mdn.mozillademos.org/files/7693/catfront.png"
        },
        {
          value: "ko",
          text: "Korean",
          src: "https://mdn.mozillademos.org/files/7693/catfront.png"
        },
      ]
    };
  },
  methods: {
    select(option) {
      this.$emit('set_lang', option);
    }
  },
  created(){
    this.options.map(i => {
      console.log(i, this.lang)
      if(i.value == this.lang) {
        this.selected = i
      }
    })
  }
};
</script>

<style lang="scss">
.locale-switcher{
  .dropdown-menu{
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
  }
}
</style>