<template>
<nav aria-label="Page navigation">
  <ul class="pagination pagination-sm justify-content-center m-0">
    <li class="page-item" :class="{ disabled : isInFirstPage}" @click="onClickFirstPage">
      <a class="page-link" href="#" tabindex="-1" aria-disabled="true"><i class="fa fa-step-backward"></i></a>
    </li>
    <li class="page-item" :class="{ disabled : isInFirstPage}" @click="onClickPreviousPage">
      <a class="page-link" href="#" tabindex="-1" aria-disabled="true"><i class="fa fa-backward"></i></a>
    </li>
    <li v-for="(page,idx) in pages" :key="idx" class="page-item" :class="{ disabled: page.isDisabled, active: isPageActive(page.name)}" @click="onClickPage(page.name)">
      <a class="page-link" href="#">{{ page.name }}</a>
    </li>
    <li class="page-item" :class="{ disabled : isInLastPage}" @click="onClickNextPage">
      <a class="page-link" href="#"><i class="fa fa-forward"></i></a>
    </li>
    <li class="page-item" :class="{ disabled : isInLastPage}" @click="onClickLastPage">
      <a class="page-link" href="#" tabindex="-1" aria-disabled="true"><i class="fa fa-step-forward"></i></a>
    </li>
  </ul>
</nav>
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    maxVisibleButtons: {
      type: Number,
      required: false,
      default: 5
    },
    totalPages: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    perPage: {
      type: Number,
      required: true
    },
    currentPage: {
      type: Number,
      required: true
    },
  },
  computed: {
    startPage() {
      if (this.currentPage <= 1) {
        return 1;
      }
      if (this.currentPage === this.totalPages) { 
        if(this.totalPages >= this.maxVisibleButtons)
          return this.totalPages - this.maxVisibleButtons + 1;
        else return 1
      }
      return this.currentPage - 1;
    },
    endPage() {      
      return Math.min(this.startPage + (this.maxVisibleButtons - 1), this.totalPages);
    },
    pages() {
      const range = [];
      for (let i = this.startPage; i <= this.endPage; i+= 1 ) {
        range.push({
          name: i,
          isDisabled: i === this.currentPage 
        });
      }
      return range;
    },
    isInFirstPage() {
      return this.currentPage === 1;
    },
    isInLastPage() {
      return this.currentPage === this.totalPages;
    },
  },
  methods: {
    onClickFirstPage() {
      if(this.isInFirstPage) return;
      this.$emit('pagechanged', 1);
    },
    onClickPreviousPage() {
      if(this.isInFirstPage) return;
      this.$emit('pagechanged', this.currentPage - 1);
    },
    onClickPage(page) {
      this.$emit('pagechanged', page);
    },
    onClickNextPage() {
      if(this.isInLastPage) return;
      this.$emit('pagechanged', this.currentPage + 1);
    },
    onClickLastPage() {
      if(this.isInLastPage) return;
      this.$emit('pagechanged', this.totalPages);    
    },
    isPageActive(page) {
      return this.currentPage === page;
    },
  }
}
</script>

<style>

</style>