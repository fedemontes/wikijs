<template lang='pug'>
  v-container(fluid, grid-list-lg)
    v-layout(row wrap)
      v-flex(xs12)
        .admin-header
          img.animated.fadeInUp(src='/_assets/svg/icon-tune.svg', alt='Theme', style='width: 80px;')
          .admin-header-title
            .headline.primary--text.animated.fadeInLeft Recomendador 
            .subtitle-1.grey--text.animated.fadeInLeft.wait-p2s Modifica los parámetros del recomendador 
          v-spacer
          v-btn.animated.fadeInRight(color='success', depressed, @click='save', large, :loading='loading')
            v-icon(left) mdi-check
            span {{$t('common:actions.apply')}}
        v-form.pt-3
          v-layout(row wrap)
            v-flex(lg6 xs12)
              v-card.animated.fadeInUp
                v-toolbar(color='primary', dark, dense, flat)
                  v-toolbar-title.subtitle-1 Google SpreadSheets 
                v-text-field.pa-3(
                      outlined
                      v-model='config.spreadSheetId'
                      label='SpreadSheetID'
                      required
                      :counter='500'
                      prepend-icon='mdi-google-spreadsheet'
                      persistent-hint
                     )
                v-card-text
                  v-textarea.is-monospaced(
                    v-model='config.credits'
                    label='Créditos de la cuenta de servicio (JSON)'
                    prepend-icon='mdi-account-lock'
                    outlined
                    color='primary'
                    auto-grow
                    required
                    )
            v-flex(lg6 xs12)
              //- v-card.animated.fadeInUp.wait-p2s
              //-   v-toolbar(color='teal', dark, dense, flat)
              //-     v-toolbar-title.subtitle-1 {{$t('admin:theme.downloadThemes')}}
              //-     v-spacer
              //-     v-chip(label, color='white', small).teal--text coming soon
              //-   v-data-table(
              //-     :headers='headers',
              //-     :items='themes',
              //-     hide-default-footer,
              //-     item-key='value',
              //-     :items-per-page='1000'
              //-   )
              //-     template(v-slot:item='thm')
              //-       td
              //-         strong {{thm.item.text}}
              //-       td
              //-         span {{ thm.item.author }}
              //-       td.text-xs-center
              //-         v-progress-circular(v-if='thm.item.isDownloading', indeterminate, color='blue', size='20', :width='2')
              //-         v-btn(v-else-if='thm.item.isInstalled && thm.item.installDate &lt thm.item.updatedAt', icon)
              //-           v-icon.blue--text mdi-cached
              //-         v-btn(v-else-if='thm.item.isInstalled', icon)
              //-           v-icon.green--text mdi-check-bold
              //-         v-btn(v-else, icon)
              //-           v-icon.grey--text mdi-cloud-download

              v-card.animated.fadeInUp.wait-p2s
                v-toolbar(color='primary', dark, dense, flat)
                  v-toolbar-title.subtitle-1 API Módulo recomendador 
                v-text-field.pa-3(
                      outlined
                      v-model='config.url'
                      label='URL de la API'
                      required
                      :counter='500'
                      prepend-icon='mdi-web'
                      persistent-hint
                     )
                v-card-text
                  v-textarea.is-monospaced(
                    v-model='config.jwt'
                    label='JWT'
                    outlined
                    color='primary'
                    auto-grow
                    required
                    )
</template>

<script>
import _ from 'lodash'
import { sync } from 'vuex-pathify'

import rcmdConfigQuery from 'gql/admin/rcmd/rcmd-query-config.gql'
import rcmdSaveMutation from 'gql/admin/rcmd/rcmd-mutation-save.gql'

export default {
  data() {
    return {
      loading: false,
      config: {
        credits: '',
        spreadSheetId: '',
        jwt: '',
        url: ''
      },
    }
  },
  methods: {
    async save () {
      this.loading = true
      this.$store.commit(`loadingStart`, 'admin-rcmd-save')
      try {
        const respRaw = await this.$apollo.mutate({
          mutation: rcmdSaveMutation,
          variables: {
            credits: this.config.credits,
            spreadSheetId: this.config.spreadSheetId,
            jwt: this.config.jwt,
            url: this.config.url
          }
        })
        const resp = _.get(respRaw, 'data.rcmd.setConfig.responseResult', {})
        if (resp.succeeded) {
          this.$store.commit('showNotification', {
            message: 'Campos guardados satisfactoriamente',
            style: 'success',
            icon: 'check'
          })
        } else {
          this.loading = false
          throw new Error(resp.message)
        }
      } catch (err) {
        this.$store.commit('pushGraphError', err)
      }
      this.$store.commit(`loadingStop`, 'admin-rcmd-save')
      this.loading = false
    }
  },
  apollo: {
    config: {
      query: rcmdConfigQuery,
      fetchPolicy: 'network-only',
      update: (data) => data.rcmd.config,
      watchLoading (isLoading) {
        this.$store.commit(`loading${isLoading ? 'Start' : 'Stop'}`, 'rcmd-theme-refresh')
      }
    }
  }
}
</script>

<style lang='scss'>
.v-textarea.is-monospaced textarea {
  font-family: 'Roboto Mono', 'Courier New', Courier, monospace;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
}
</style>
