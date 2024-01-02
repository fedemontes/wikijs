<template lang='pug'>
v-container(fluid, grid-list-lg)
    v-content(:class='$vuetify.theme.dark ? "grey darken-4" : "grey lighten-5"' style='padding: 1px !important' )
    v-layout(row wrap)
        .projects-header
          img.animated.fadeInUp(src='/_assets/svg/icon-table.svg', alt='Projects', style='width: 80px;')
          .projects-header-title
            .headline.primary--text.animated.fadeInLeft Lista de proyectos recomendados por IA
            .subheading.grey--text.animated.fadeInLeft
    v-row
            v-col 
                  v-select(
                    class="select"
                    outlined
                    v-model='sector'
                    :items='dataSheet.sectores'
                    prepend-icon='mdi-shape'
                    persistent-hint
                    hint='Sectores'
                    style='width:350px;'
                  )


    v-container(fluid,grid-list-lg)
          v-card.mt-3.animated.fadeInUp(:class='$vuetify.theme.dark ? `grey darken-3-d5` : `grey lighten-2`')
           v-row.pa-2
            .pa-3.d-flex.align-center(:class='$vuetify.theme.dark ? `grey darken-3-d5` : `grey lighten-2`')
             v-col
              v-text-field(
              solo
              flat
              v-model='search'
              prepend-inner-icon='mdi-file-search-outline'
              label='Buscar proyectos...'
              hide-details
              dense
              style='width: 500px;'
              )
             v-col.text-right(cols=11)
              v-btn(color='success', large, active, @click='exportDataToCsv')
               v-icon(left) mdi-file-delimited-outline
               span CSV
          v-divider
          v-data-table(
            :items='filteredProjects'
            :headers='headers'
            :search='search'
            :page.sync='pagination'
            :items-per-page='15'
            :loading='loading'
            must-sort,
            sort-desc,
            hide-default-footer
            @page-count="pageTotal = $event"
          )

           template(slot='item', slot-scope='props')
            tr.is-clickable(:active='props.selected', @click='$router.push(`/projects/` + props.item.id)', :class='props.item.isnew ? `green lighten-5` : ``')
                td.text-xs-right {{ "[ " + props.item.id + " ] " }}
                  status-indicator(v-if='props.item.isnew', positive, pulse) 
                td
                  .body-2: strong {{ props.item.title }}
                td.truncate
                   div.content {{ props.item.content }}
                td {{ props.item.authorName }}
                td {{ props.item.createdAt | moment('calendar') }}
                td {{ props.item.updatedAt | moment('calendar') }}
                td.truncate-options
                  div.options
                   v-chip.mt-1(color='secondary',v-for='(value, key) of props.item.arguments')
                    span {{ key +":"+ value }}
               
                 

           template(slot='no-data')
              v-alert.ma-3(icon='mdi-alert', :value='true', outlined) No hay proyectos que cumplan los criterios.

          .text-center.py-2.animated.fadeInDown(v-if='this.pageTotal > 0')
          v-pagination(v-model='pagination', :length='pageTotal')

</template>

<script>
import _ from 'lodash'
import { StatusIndicator } from 'vue-status-indicator'
import projectsRcmdQuery from 'gql/projectsRcmd/projectsRcmd-query-list.gql'
import axios from 'axios'


export default {
  components: {
    StatusIndicator
  },
  props: {
     arguments: {
      type: String,
      default: '' 
    },
    description: {
      type: String,
      default: ''
    },
    effectivePermissions: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      sector: '',
      trabajo: '',
      perfil_alumnado: '',
      selectedProject: {},
      pagination: 1,
      pageTotal: 0,
      dataSheet: {},
      projectsRcmds: [],
      errors: [],
      headers: [
        { text: 'ID', value: 'id', width: 80, sortable: true },
        { text: 'Title', value: 'title', width: 100, sortable: true },
        { text: 'Content', value: 'content', width: 300, sortable: true  },
        { text: 'Autor', value: 'authorName', width: 100, sortable: true },
        { text: 'Created', value: 'createdAt', width: 50, sortable: true },
        { text: 'Last Updated', value: 'updatedAt', width: 50, sortable: true },
        { text: 'Options', value: 'arguments', width: 100 }
      ],
      search: '',
      loading: false
    }
  },
  computed: {
    filteredProjects () {
      return _.filter(this.projectsRcmds)

   }, 
  },
  created () {
   axios.get('/r/create/data-sheet-project')
      .then(response => {
        this.dataSheet = response.data;
        this.dataSheet.sectores.unshift("");
        this.dataSheet.perfilestudiante.unshift("");
      })
      .catch(e => {
        this.errors.push(e)
        console.log(e)
      })

    if (this.effectivePermissions) {
      this.$store.set('page/effectivePermissions', JSON.parse(Buffer.from(this.effectivePermissions, 'base64').toString()))
    }
  },
 methods: {
    exportDataToCsv() {
      const csvContent = this.convertToCSV(this.filteredProjects);
      const blob       = new Blob([csvContent], {type:'text/csv;charset=utf-8'} );
      const url        = URL.createObjectURL(blob);
      const link       = document.createElement('a');
      link.href        = url;
      link.setAttribute('download','export_data_'+ Date.now().toString() + '.csv');
      link.click();
    },
    arrayToCsv(data){
     return data.map(row =>
      row
       .map( v => JSON.stringify(v) )
       .map(v => v.replaceAll('"', '""')) 
       .map(v => `"${v}"`)  
       .join(',') 
    )
   },
   convertToCSV(data) {
       const headers = Object.keys(data[0]);
       const rows    = data.map(obj => headers.map(header => obj[header]));
       const headerRow = headers.join(',');
       const csvRows   = [headerRow, this.arrayToCsv(rows)];
       return csvRows.join('\n');
    },
    async refresh() {
      await this.$apollo.queries.projectsRcmds.refetch()
      this.$store.commit('showNotification', {
        message: 'Page list has been refreshed.',
        style: 'success',
        icon: 'cached'
      })
    },
    newpage() {
      this.pageSelectorShown = true
    },
    recyclebin () { }
  },
 apollo: {
   projectsRcmds: {
      query: projectsRcmdQuery,
      variables () {
       return { 
         sector: this.sector.toString(),
         trabajo: '',
         perfil_alumnado: '' 
        } 
       },
      fetchPolicy: 'network-only',
      watchLoading (isLoading) {
        this.loading = isLoading;
      },
      update: data => data.projectsRcmds.list
    }
  },
}
</script>

<style>
 .projects-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 1px;
  }
  &-title {
    margin-left: 1rem;
  }

  .truncate {
      max-width: 200px;
      overflow-y: auto;
      overflow-x: hidden;
  }

  .truncate-options {
      max-width: 200px;
      max-height: 100px;
      overflow-y: auto;
      overflow-x: hidden;
  }

  .content {
    height:100px;
    overflow: auto;
  }
  .options {
    width: 100%;
    height:100px;
    overflow: auto;
  }
</style>


//- function arrayToCsv(data){
//-  return data.map(row =>
//-    row
//-    .map( (v) => {
//-        if (v.typeof==='object') {
//-          return v.toString();
//-        }
//-     })  
//-    .map(v => v.replaceAll('"', '""')) 
//-    .map(v => `"${v}"`)  
//-    .join(',') 
//-  )
//. }





