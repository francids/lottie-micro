import { createRouter, createWebHistory } from "vue-router";

import LandingView from "./views/LandingView.vue";
import AppView from "./views/AppView.vue";

const routes = [
  { path: "/", component: LandingView },
  { path: "/app", component: AppView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
