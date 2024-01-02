<template lang='pug'>
  v-app(:dark='$vuetify.theme.dark').rcmd
    nav-header(hide-search)
    v-navigation-drawer.pb-0(v-model='rcmdDrawerShown', app, fixed, clipped, left, permanent)
      v-list(dense, nav)
        v-list-item(href='/', class='blue lighten-2')
          v-list-item-action: v-icon mdi-home
          v-list-item-content
            v-list-item-title VOLVER A LA HOME 
        v-list-item(to='/projects', color='primary')
          v-list-item-action: v-icon mdi-text
          v-list-item-content
            v-list-item-title LISTA DE PROYECTOS 
        v-list-item(to='/create', color='primary')
          v-list-item-action: v-icon mdi-auto-fix
          v-list-item-content
            v-list-item-title CREAR PROYECTOS 

    v-content.pt-1(:class='$vuetify.theme.dark ? "grey darken-4" : "grey lighten-5"')
      transition(name='rcmd-router')
        router-view

    nav-footer
    notify
    search-results
</template>

<script>
import VueRouter from 'vue-router'

/* global WIKI */

const router = new VueRouter({
  mode: 'history',
  base: '/r',
  routes: [
    { path: '/', redirect: '/projects' },
    { path: '/projects', component: () => import(/* webpackChunkName: "profile" */ './rcmd/projects.vue') },
    { path: '/projects/:id(\\d+)', component: () => import(/* webpackChunkName: "profile" */ './rcmd/projects-edit.vue') },
    { path: '/create', component: () => import(/* webpackChunkName: "profile" */ './rcmd/create.vue') }
  ]
})

router.beforeEach((to, from, next) => {
  WIKI.$store.commit('loadingStart', 'rcmd')
  next()
})

router.afterEach((to, from) => {
  WIKI.$store.commit('loadingStop', 'rcmd')
})

export default {
//-  i18nOptions: { namespaces: 'rcmd' },
  data() {
    return {
      rcmdDrawerShown: true
    }
  },
  router,
  created() {
    this.$store.commit('page/SET_MODE', 'rcmd')
  }
}
</script>

<style lang='scss'>

.rcmd-router {
  &-enter-active, &-leave-active {
    transition: opacity .25s ease;
    opacity: 1;
  }
  &-enter-active {
    transition-delay: .25s;
  }
  &-enter, &-leave-to {
    opacity: 0;
  }
}

.rcmd-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;

  &-title {
    margin-left: 1rem;
  }
}

</style>
