const Model = require('objection').Model

const _ = require('lodash')

/* global WIKI */

/**
 * Locales model
 */
module.exports = class projectsRcmd extends Model {
  static get tableName() { return 'projectsrcmd' }
  static get idColumn() { return 'id' }

    static get jsonSchema () {
    return {
      type: 'object',
      required: ['title'],

      properties: {
        id: {type: 'integer'},
        title: {type: 'string'},
        content: {type: 'string'},
        createdAt: {type: 'string'},
        updatedAt: {type: 'string'},
	authorId: {type: 'integer'},
	arguments: {type: 'JSON'},
      }
    }
  }

  static get relationMappings() {
    return {
      author: {
        relation: Model.BelongsToOneRelation,
        modelClass: require('./users'),
        join: {
          from: 'projectsrcmd.authorId',
          to: 'users.id'
        }
      }
    }
  }

  static get jsonAttributes() {
    return ['arguments']
  }

  $beforeUpdate() {
    this.updatedAt = new Date().toISOString()
  }
  $beforeInsert() {
    this.createdAt = new Date().toISOString()
    this.updatedAt = new Date().toISOString()
  }

  /**
   * Fetch an Existing Page from Cache if possible, from DB otherwise and save render to Cache
   *
   * @param {Object} opts Page Properties
   * @returns {Promise} Promise of the Page Model Instance
   */
  static async getProjectsRcmd (opts) {
    projects = await WIKI.models.projectsRcmd.getProjectsRcmdFromDb(opts)
    return projects 
  }

 static async insertProject(opts, user) {
 
  try {
    const queryMax = await WIKI.models.projectsRcmd.query().max('id'); 
    var max = queryMax[0].max;
    if (opts.descripcion) {
    let insertOptions = {
     id: max + 1,
     title: opts.descripcion.substr(0,100),
     content: opts.descripcion,
     arguments: opts.arguments,
     authorId: user.id,
     createdAt: Date.now().toString(),
     updatedAt: Date.now().toString(),
     isnew: true
     }
     const insert = await WIKI.models.projectsRcmd.query().insert(insertOptions);
     return insert;
    } 
   }
    catch (err) {
        WIKI.logger.warn(err)
      throw err
   }

 }

 static async updateProjectsRcmdFromDb(opts) {
    // -> Fetch original page
    const ogProject = await WIKI.models.projectsRcmd.query().findById(opts.id)
    if (!ogProject) {
      throw new Error('Invalid Project Id')
    }
   // -> Check for empty content
    if (!opts.content || _.trim(opts.content).length < 1) {
      throw new WIKI.Error.PageEmptyContent()
    }
   // -> Update project
   try {
    await WIKI.models.projectsRcmd.query().patch({
      title: opts.title,
      content: opts.content,
      updatedAt: opts.updatedAt,
      isnew: opts.isnew 
      })
     .where('id', ogProject.id)
   } 
    catch (err) {
        WIKI.logger.warn(err)
      throw err
   }
   
 }

  /**
   * Fetch an Existing ProjectsRcmd from the Database
   *
   * @param {Object} opts Page Properties
   * @returns {Promise} Promise of the Page Model Instance
   */

  static async getProjectsRcmdFromDb(opts) {
    try {
      return WIKI.models.projectsRcmd.query()
        .select([
          'projectsrcmd.id',
          'projectsrcmd.title',
          'projectsrcmd.content',
          'projectsrcmd.createdAt',
          'projectsrcmd.updatedAt',
          'projectsrcmd.authorId',
          'projectsrcmd.arguments',
          'projectsrcmd.isnew',
          {
            authorName: 'author.name',
            authorEmail: 'author.email',
          }
        ])
        .joinRelated('author')
        .where({'projectsrcmd.id': opts} )
	.orderBy('projectsrcmd.id')
	.first()
    } catch (err) {
        WIKI.logger.warn(err)
      throw err
    }

  }
                                          
  /**
   * Delete a ProjectRcmd 
   *
   * @param {*} id Project RCMD ID
   */
  static async deleteProjectsRcmdFromDb (opts) {
    const ogProject = await WIKI.models.projectsRcmd.query().findById(opts.id)
    if (!ogProject) {
      throw new Error('Invalid Project Id')
    }
   // -> Delete 
    try {
      await WIKI.models.projectsRcmd.query().delete().where('id', opts.id)
    } catch (err) {
       WIKI.logger.warn(err)
      throw err
    }
  }

}
