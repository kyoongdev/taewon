module.exports = (Vue) => { 
  Vue.directive('auto-scroll-bottom', { 
    update: (el) => { 
      const h = el.scrollHeight 
      el.scrollTop = h
      $(el).stop().animate({scrollTop:h}, 1000, 'swing', function() { 
      // $(el).stop().animate({scrollTop:0}, 1000, 'swing', function() { 
      });
    } 
  }) 
}