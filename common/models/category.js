'use strict';
const slugify = require('slugify')
const opt = {
  replacement: '-',    // replace spaces with replacement
  remove: null,        // regex to remove characters
  lower: true          // result in lower case
}
const categoryUrl = 'cat'

module.exports = function(Category) {
  Category.validatesUniquenessOf('name')

  Category.observe('before save', function(ctx, next) {
    if (ctx.isNewInstance) {
      ctx.instance.slug = slugify(ctx.instance.name, opt)
      ctx.instance.url = '/' + categoryUrl + '/' + ctx.instance.slug
    } else {
      ctx.data.slug = slugify(ctx.data.name || ctx.currentInstance.name, opt)
      ctx.data.url = '/' + categoryUrl + '/' + ctx.data.slug
    }

    next();
  });
};
