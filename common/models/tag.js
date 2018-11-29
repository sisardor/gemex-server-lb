'use strict';
const slugify = require('slugify')
const opt = {
  replacement: '-',    // replace spaces with replacement
  remove: null,        // regex to remove characters
  lower: true          // result in lower case
}
const marketUrl = 'market'

module.exports = function(Tag) {
  Tag.validatesUniquenessOf('tag')

  Tag.observe('before save', function(ctx, next) {
    if (ctx.isNewInstance) {
      ctx.instance.slug = slugify(ctx.instance.tag, opt)
      ctx.instance.url = '/' + marketUrl + '/' + ctx.instance.slug
    } else {
      ctx.data.slug = slugify(ctx.data.tag || ctx.currentInstance.tag, opt)
      ctx.data.url = '/' + marketUrl + '/' + ctx.data.slug
    }

    next();
  });
};
