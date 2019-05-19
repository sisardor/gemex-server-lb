'use strict';
const slugify = require('slugify')
// const async = require('async')
const opt = {
  replacement: '-',    // replace spaces with replacement
  remove: null,        // regex to remove characters
  lower: true          // result in lower case
}

module.exports = function(Shop) {

  Shop.observe('before save', function(ctx, next) {
    if (ctx.isNewInstance) {
      ctx.instance.shop_id = slugify(ctx.instance.shopName, opt)
      // ctx.instance.id = ctx.instance.shop_id
    }
    next();
  });
};
