'use strict';

module.exports = function(Base) {
  // Computed Defaults.
  Base.definition.rawProperties.creation_ts.default =
    Base.definition.properties.creation_ts.default = function () {
      return Math.round(new Date().getTime()/1000.0)
    }

  // Base.definition.rawProperties.original_creation_ts.default =
  //   Base.definition.properties.original_creation_ts.default = function () {
  //     return Math.round(new Date().getTime()/1000.0)
  //   }

  /**
   * Entity update hook, this is triggered on PUT request
   * This hook updates `updatedAt`
   */
  Base.observe('before save', function (ctx, next) {
    if (!ctx.isNewInstance) { // HTTP PUT
      if (ctx.data) {
        ctx.data.updated_ts = Math.round(new Date().getTime()/1000.0)
      } else {
        ctx.instance.updated_ts = Math.round(new Date().getTime()/1000.0)
      }
    }
    next()
  })
};
