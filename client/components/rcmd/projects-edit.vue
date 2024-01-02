<template lang='pug'>
 v-container(fluid, grid-list-lg)
    v-content(:class='$vuetify.theme.dark ? "grey darken-4" : "grey lighten-5"' style='padding-top: 65px !important;' )
    v-layout(row,wrap)
         img.animated.fadeInUp(src='/_assets/svg/icon-process.svg', alt='Projects', style='width: 80px;')
         .projects-header
            .headline.blue--text.text--darken-2.animated.fadeInLeft Editar proyecto 
            .subtitle-1.grey--text.animated.fadeInLeft.wait-p2s

         v-spacer
         v-btn.animated.fadeInDown.wait-p3s(color='grey', icon, outlined, to='/projects')
          v-icon mdi-arrow-left

         v-dialog(v-model='deleteProjectsRcmdDialog', max-width='500')
            template(v-slot:activator='{ on }')
              v-btn.ml-3(color='red', icon, outlined, v-on='on')
                v-icon(color='red') mdi-trash-can-outline
            v-card
              .dialog-header.is-red Delete Project?
              v-card-text.pa-4 Are you sure you want to delete project #[strong {{ projectsRcmds.title }} ]? Operation can't be back 
              v-card-actions
                v-spacer
                v-btn(text, @click='deleteProjectsRcmdDialog = false') Cancel
                v-btn(color='red', dark, @click='deleteProjectsRcmd') Delete

         v-btn.animated.fadeInDown(style='margin-left:5px;', color='success', large, active,  @click='handleSubmit')
          v-icon(left) mdi-check
          span Save Changes
        
    v-layout(row,wrap)
     v-flex(lg4 xs5)
        v-card
          v-toolbar(color='primary', dense, dark, flat)
            v-icon.mr-2 mdi-text-subject
            span Properties ID {{ projectsRcmds.id }}
          v-list(dense,nav)

            template(v-for='(value, key) of projectsRcmds.arguments')
             v-list-item-title: .overline.grey--text {{ key }} 
             v-list-item-subtitle.body-2(:class='$vuetify.theme.dark ? `grey--text text--lighten-2` : `grey--text text--darken-3`') {{ value }}
            v-divider
     v-flex
        v-card
          v-toolbar(color='primary', dense, dark, flat)
            v-icon.mr-2 mdi-text-box
            span Fields 
           
          v-form.pt-3(ref='form',v-model='valid')
             .px-3.pb-3
                v-row
                 v-col 
                  v-switch.pa-1(
                    v-model='projectsRcmds.isnew'
                    prepend-icon='mdi-bookmark-multiple'
                    label='Bookmark'
                    color='primary'
                    persistent-hint
                    hint='Los nuevos proyectos vienen por defecto marcados'
                  )
                 v-col.pa-7.text-right.overline Copiar content
                  v-btn.pa-1.ml-3(color='teal',icon, outlined, @click='copy')
                   v-icon(color='teal') mdi-content-copy
                v-spacer
                v-text-field(
                      outlined
                      label='Title'
                      required
                      :counter='500'
                      :rules="requiredRule"
                      v-model='projectsRcmds.title'
                      prepend-icon='mdi-text-short'
                      hint='Modifica título'
                      persistent-hint
                     )
                v-spacer
                v-textarea.is-monospaced.mt-3(
                      outlined
                      label='Content'
                      required
                      :rules="requiredRule"
                      v-model='projectsRcmds.content'
                      prepend-icon='mdi-text-shadow'
                      hint='Modifica contenido'
                      persistent-hint
                      auto-grow 
                      ref='clone'
                      v-on:focus="$event.target.select()" 
                     )
                v-divider
                v-list(dense,nav)
                  v-list-item-title: .overline.grey--text CreatedAt 
                  v-list-item-subtitle.body-2(:class='$vuetify.theme.dark ? `grey--text text--lighten-2` : `grey--text text--darken-3`') {{ projectsRcmds.createdAt | moment('calendar') }}
                  v-list-item-title: .overline.grey--text UpdatedAt 
                  v-list-item-subtitle.body-2(:class='$vuetify.theme.dark ? `grey--text text--lighten-2` : `grey--text text--darken-3`') {{ projectsRcmds.updatedAt | moment('calendar') }}



</template>

<script>
import _ from 'lodash'
import { StatusIndicator } from 'vue-status-indicator'
import { sync } from 'vuex-pathify'
import projectsRcmdQuery from 'gql/projectsRcmd/projectsRcmd-single-query.gql'
import projectsRcmdUpdateMutation from 'gql/projectsRcmd/projectsRcmd-update-mutation.gql'
import projectsRcmdDeleteMutation from 'gql/projectsRcmd/projectsRcmd-delete-mutation.gql'

export default {
  props: {
  }, 
  components: {
    StatusIndicator
  },
  data() {
    return {
      valid: false,
      deleteProjectsRcmdDialog: false,
      projectsRcmds: {},
      loading: false,
      requiredRule: [
         v => !!v || 'Campo obligatorio',
    ],
    }
  },
  methods: {
    copy() {
     this.$refs.clone.focus();
     document.execCommand('copy');
     window.scrollTo(0,this.$refs.xcopy);
    },
    handleSubmit() {
      this.$refs.form.validate();
      if(!this.valid) {
        return
      }
      console.log(this.valid);
      this.saveProjectsRcmd()
    },
   async saveProjectsRcmd () {
      const id = _.get(this.projectsRcmds, 'id', '');
      const title = _.get(this.projectsRcmds, 'title', '');
      const content = _.get(this.projectsRcmds, 'content', '')
      const updatedAt = new Date()
      const isnew = _.get(this.projectsRcmds, 'isnew', true)

      try {
        await this.$apollo.mutate({
          mutation: projectsRcmdUpdateMutation,
          variables: {
             id: id,
             title: title, 
             content: content,
             updatedAt: updatedAt,
             isnew: isnew 
          },
        })
        this.$store.commit('showNotification', {
            style: 'success',
            message: 'Project has been saved successfully.',
            icon: 'check'
          })
      } catch (err) {
        this.$store.commit('pushGraphError', err)
      }
   },
   async deleteProjectsRcmd() {
      this.deleteProjectsRcmdDialog = false
      this.loading = true
      this.$store.commit(`loadingStart`, 'projectsRcmd-delete')
      try {
        const resp = await this.$apollo.mutate({
          mutation: projectsRcmdDeleteMutation,
          variables: {
            id: this.projectsRcmds.id
          }
        })
        this.$store.commit('showNotification', {
         style: 'green',
         message: `Project deleted successfully.`,
         icon: 'check'
        })
          this.$router.replace('/projects')
      } catch (err) {
        this.$store.commit(`loadingStop`, 'projectsRcmd-delete')
        this.$store.commit('pushGraphError', err)
      }
     this.$store.commit(`loadingStop`, 'projectsRcmd-delete')
    },
  },

  apollo: {
    projectsRcmds: {
      query: projectsRcmdQuery,
      variables() {
        return {
          id: _.toSafeInteger(this.$route.params.id)
        }
      },
      fetchPolicy: 'network-only',
      update: (data) => data.projectsRcmds.single,
      watchLoading (isLoading) {
        this.$store.commit(`loading${isLoading ? 'Start' : 'Stop'}`, 'admin-pages-refresh')
      }
    }
  }
}
</script>

<style lang='scss'>

 .projects-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 1px;
  }

.v-textarea.is-monospaced textarea {
  font-family: 'Roboto Mono', 'Courier New', Courier, monospace;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
}


</style>
