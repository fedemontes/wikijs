<template lang='pug'>
v-container(fluid, grid-list-lg)
    v-content(:class='$vuetify.theme.dark ? "grey darken-4" : "grey lighten-5"'  )
    v-layout(row wrap)
        .projects-header
          img.animated.fadeInUp(src='/_assets/svg/icon-checkmark.svg', alt='Create', style='width: 80px;')
          .projects-header-title
            .headline.primary--text.animated.fadeInLeft Crear proyectos mediante IA 
            .subheading.grey--text.animated.fadeInLeft
        v-spacer

        v-btn.animated.fadeInDown.wait-p3s(color='grey', icon, outlined, to='/projects')
            v-icon mdi-arrow-left

        v-dialog(v-model='generatingProjects', max-width='600' )
         v-card.white
          v-card-text.pa-4 Espere unos momentos. No cierre la ventana o podrían perderse los cambios
           v-progress-linear(
            indeterminate
            color="blue"
            class="mb-0"
           )

        v-dialog(v-model='generateProjectsRcmdDialog', max-width='600' )
           template(v-slot:activator='{ on }')
           v-card
               .dialog-header.is-blue Generando proyecto
               v-card-text.pa-4 Esta operación puede tardar un rato. ¿Está seguro de que desea continuar? 
               v-card-actions
                v-spacer
                v-btn(text, @click='generateProjectsRcmdDialog = false') Cancelar
                v-btn(color='blue', dark, @click='generateProjectsRcmd') Continuar 

        v-btn.animated.fadeInDown(style='margin-left:5px;', color='success', large, active,  @click='handleSubmit')
          v-icon(left) mdi-auto-fix
          span GENERAR PROYECTO 
    v-form.pt-1(ref='form', v-model='valid')

     v-layout(row,wrap)
         v-flex(lg4 xs5)
              v-card.wiki-form.animated.fadeInUp.teal.lighten-5
                v-toolbar(color='teal', dark, dense, flat)
                  v-toolbar-title.subtitle-1 Opciones 
                v-card-text
                  v-select(
                    class="select"
                    v-model='doblin'
                    outlined
                    :items='dataSheet.doblin'
                    prepend-icon='mdi-arrow-decision'
                    persistent-hint
                    hint='Doblin: ¿En qué parte del proceso quieres la innovación?'
                  )
                v-card-text
                  v-select(
                    class="select"
                    v-model='sector'
                    outlined
                    :items='dataSheet.sectores'
                    :rules="requiredRule"
                    prepend-icon='mdi-shape'
                    persistent-hint
                    hint='Sectores (*)'
                    required
                  )
                v-card-text
                  v-select(
                    outlined
                    v-model='perfil_alumnado'
                    :items='dataSheet.perfilestudiante'
                    prepend-icon='mdi-school'
                    persistent-hint
                    hint='Necesidades de atracción o talento'
                  )

                v-card-text
                  v-select(
                    outlined
                    v-model='perfil_ideal'
                    :items='dataSheet.empleos'
                    prepend-icon='mdi-account'
                    persistent-hint
                    hint='Experto trabajador ideal'
                  )

                v-card-text
                  v-select(
                    outlined
                    v-model='empleados'
                    :items='dataSheet.numempleados'
                    prepend-icon='mdi-counter'
                    persistent-hint
                    :rules="requiredRule"
                    hint='Número de empleados (*)'
                    required
                  )

                v-card-text
                  v-select(
                    outlined
                    v-model='tecnologias'
                    :items='dataSheet.tecnologias'
                    prepend-icon='mdi-robot-industrial'
                    persistent-hint
                    hint='Tecnologías'
                  )
                v-card-text
                  v-select(
                    outlined
                    v-model='sostenibilidad'
                    :items='dataSheet.areassostenibilidad'
                    prepend-icon='mdi-tree'
                    persistent-hint
                    hint='Áreas de sostenibilidad'
                  )
         v-flex
            v-card.wiki-form.animated.fadeInUp
                v-toolbar(color='primary', dark, dense, flat)
                    v-toolbar-title.subtitle-1 Campos de texto 
                v-text-field.pa-3(
                      outlined
                      label='Stakeholders'
                      :counter='500'
                      v-model='publico_objetivo'
                      prepend-icon='mdi-handshake-outline'
                      hint='Stakeholders: ¿Cuáles son proveedores, clientes, alianzas estratégicas...?'
                      persistent-hint
                     )
                v-divider
                v-text-field.pa-3(
                      outlined
                      label='Reto o necesidad'
                      required
                      :counter='500'
                      v-model='proyecto_objetivo'
                      prepend-icon='mdi-chevron-right-circle-outline'
                      hint='¿Cuál es tu principal reto o necesidad?'
                      persistent-hint
                     )
                v-divider
                v-text-field.pa-3(
                      outlined
                      label='Diferenciación y otros'
                      required
                      :counter='500'
                      v-model='extra'
                      prepend-icon='mdi-view-grid-plus-outline'
                      hint='Escribe información adicional, como la diferenciación con otras organizaciones'
                      persistent-hint
                     )



            //-  template(v-if='dataSheet.ProyectosTipo')
            //-     v-list
            //-     template(v-for='(value, key) of dataSheet.ProyectosTipo')
            //-       v-list-item-title {{ value[1][0] }}
            //-     v-divider

</template>


<script>

import axios from 'axios'

export default {
  data() {
    return {
      valid: false,
      generatingProjects: false,
      generateProjectsRcmdDialog: false,
      sector: '',
      empleados: '',
      tecnologias: '',
      sostenibilidad: '',
      perfil_alumnado: '',
      perfil_ideal: '',
      experiencia: '',
      publico_objetivo: '',
      proyecto_objetivo: '',
      doblin: '',
      extra: '',
      experiencia: false,
      dataSheet: {},
      errors: [],
      value: {},
      loading: false,
      requiredRule: [
         v => !!v || 'Campo obligatorio',
    ],
    }
  },      
  created () {
    axios.get('/r/create/data-sheet')
      .then(response => {
        this.dataSheet = response.data;
       for (const key of Object.keys(this.dataSheet)) {
          this.dataSheet[key].unshift ('');;
       }

      })
      .catch(e => {
        this.errors.push(e)
        console.log(e)
      })
  },
  methods: {
    handleSubmit() {
      this.$refs.form.validate();
      if(!this.valid) {
        return
      }
      this.generateProjectsRcmdDialog = true; 
    },
    async generateProjectsRcmd() {
      this.generateProjectsRcmdDialog = false
      this.generatingProjects = true 
      this.loading = true
      this.$store.commit(`loadingStart`, 'projectsRcmd-generate')
 
      const data = await axios.post(
           '/r/create/project',
           {
             sector: this.sector.toString(),
             empleados: this.empleados.toString(),
             tecnologias: this.tecnologias.toString(),
             sostenibilidad: this.sostenibilidad.toString(),
             perfil_alumnado: this.perfil_alumnado.toString(),
             perfil_ideal: this.perfil_ideal.toString(),
             experiencia: this.experiencia.toString(),
             publico_objetivo: this.publico_objetivo.toString(),
             doblin: this.doblin.toString(),
             extra: this.extra.toString(),
             proyecto_objetivo: this.proyecto_objetivo.toString()
           }        
        )
      this.loading = false;
      this.generatingProjects = false; 
      this.$store.commit(`loadingStop`, 'projectsRcmd-generate')

      if ( data.data.code == 200 ) { 
        this.$store.commit('showNotification', {
            style: 'success',
            message: 'Project has been created and saved successfully.',
            icon: 'check'
          })
       window.location.href = '/r/projects';
     } else {
        this.$store.commit('showNotification', {
            style: 'error',
            message: data.data.message,
            icon: 'alert'
          })
     }
     
    }
  }
}
</script>

<style>
 .projects-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 1px;
  }

    .truncate {
      max-width: 1px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

.v-card__text {
     padding: 2px;
   }

</style>






