const _ = require('lodash')
const graphHelper = require('../../helpers/graph')
const { ref } = require('objection');


/* global WIKI */

module.exports = {
  Query: {
    async projectsRcmds() { return {} }
  },
  Mutation: {
    async projectsRcmds() { return {} }
  },
  projectsRcmdQuery: {
    /* 
     * LIST PROJECTSRCMD 
     */
    async list (obj, args, context, info) {
     let results = await WIKI.models.projectsRcmd.query().column([
        'projectsrcmd.id',
        'projectsrcmd.title',
        'projectsrcmd.content',
        'projectsrcmd.createdAt',
        'projectsrcmd.updatedAt',
        'projectsrcmd.authorId',
	{
            authorName: 'users.name',
            authorEmail: 'users.email',
         },
        'projectsrcmd.arguments',
        'projectsrcmd.isnew',
      ])
       .join('users', 'authorId', '=', 'users.id')
       .modify(queryBuilder => {
	  if ( args.sector != '' )
	      queryBuilder.where(ref('arguments:sector').castText(), args.sector)
	  if ( args.trabajo != '' )
	      queryBuilder.where(ref('arguments:trabajo').castText(), args.trabajo)
	  if ( args.perfil_alumnado != '' )
	      queryBuilder.where(ref('arguments:perfil_alumnado').castText(), args.perfil_alumnado)
       
          const orderDir = 'desc'
          switch (args.orderBy) {
            case 'CREATED':
              queryBuilder.orderBy('projectsrcmd.createdAt', orderDir)
              break
            case 'UPDATED':
              queryBuilder.orderBy('projectsrcmd.updatedAt', orderDir)
              break
            default:
              queryBuilder.orderBy('projectsrcmd.id', orderDir)
              break
          }
        })
     if (WIKI.auth.checkAccess(context.req.user, ['manage:pages', 'delete:pages']) )
       {
          return results 
          
       }
    },
    async single(obj, args, context, info) {
      let project = await WIKI.models.projectsRcmd.getProjectsRcmdFromDb(args.id)
      if (project) {
        if (WIKI.auth.checkAccess(context.req.user, ['manage:pages', 'delete:pages'], {
        })) {
          return {
            ...project,
          }
        } else {
          throw new WIKI.Error.PageViewForbidden()
        }
      } else {
        throw new WIKI.Error.PageNotFound()
      }
    }
    
},
projectsRcmdMutation: {
   /**
     * UPDATE PROJECT
     */
    async update(obj, args, context) {
      try {
        const project = await WIKI.models.projectsRcmd.updateProjectsRcmdFromDb({
          ...args,
        })
        return {
          responseResult: graphHelper.generateSuccess('Project has been updated.'),
          project
        }
      } catch (err) {
        return graphHelper.generateError(err)
      }
    },
   /**
     * DELETE PROJECT
     */
    async delete(obj, args, context) {
      try {
        const project = await WIKI.models.projectsRcmd.deleteProjectsRcmdFromDb({
          ...args,
        })
        return {
          responseResult: graphHelper.generateSuccess('Project has been removed.'),
          project
        }
      } catch (err) {
        return graphHelper.generateError(err)
      }
    },

}
}

