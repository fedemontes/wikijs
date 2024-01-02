const graphHelper = require('../../helpers/graph')
const _ = require('lodash')

/* global WIKI */

module.exports = {
  Query: {
    async rcmd() { return {} }
  },
  Mutation: {
    async rcmd() { return {} }
  },
  rcmdQuery: {
  async config(obj, args, context, info) {
      return {
        credits: WIKI.config.rcmd.credits,
        spreadSheetId: WIKI.config.rcmd.spreadSheetId,
        jwt: WIKI.config.rcmd.jwt,
	url: WIKI.config.rcmd.url
      }
   }
  },
  rcmdMutation: {
    async setConfig(obj, args, context, info) {
      try {
        WIKI.config.rcmd = {
          ...WIKI.config.rcmd,
          credits: args.credits,
          spreadSheetId: args.spreadSheetId,
          jwt: args.jwt,
	  url: args.url
        }

        await WIKI.configSvc.saveToDb(['rcmd'])

        return {
          responseResult: graphHelper.generateSuccess('Projects AI config updated')
        }
      } catch (err) {
        return graphHelper.generateError(err)
      }
    }
  }
}
