import Vue from "vue";
import VueRouter from "vue-router";
import Links from "./url";
import AuthService from "@/api/auth.service";
import _ from "lodash";

//include jquery
global.jQuery = require("jquery");
var $ = global.jQuery;
window.$ = $;

Vue.prototype.$url = Links;
Vue.use(VueRouter);

const routes = [];
$.map(Links, function (link) {
  const component = _.isEmpty(link.component) ? "NotFound" : link.component;
  routes.push({
    path: link.path,
    name: link.name,
    component: () => import("@/views/" + component + ".vue"),
    meta: {
      requiresAuth: link.requiresAuth,
    },
  });
});

const router = new VueRouter({
  mode: "history",
  // base: process.env.BASE_URL,
  routes,
});
router.beforeEach((to, from, next) => {
  const authUser = AuthService.getAuthToken();
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!authUser) {
      return next(Links.LOGIN.path);
    }
  }
  next();
});

export default router;
