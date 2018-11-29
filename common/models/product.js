'use strict';
const slugify = require('slugify')
const opt = {
  replacement: '-',    // replace spaces with replacement
  remove: null,        // regex to remove characters
  lower: true          // result in lower case
}


module.exports = function(Product) {
  // console.log('dsfdf');
  // // console.log(Product.sharedClass._methods);
  // for (var i = 0; i < Product.sharedClass._methods.length; i++) {
  //   console.log(Product.sharedClass._methods[i].name,
  //   Product.sharedClass._methods[i].http)
  // }
  //
  // Product.disableRemoteMethodByName('findById', true);
  // Product.disableRemoteMethodByName('patchOrCreate', false);
  // Product.disableRemoteMethodByName('prototype.patchAttributes', false);

  Product.observe('before save', function(ctx, next) {

    if (ctx.isNewInstance) {
      ctx.instance.url = slugify(ctx.instance.name, opt)
      ctx.instance.ownerId = ctx.options.accessToken.userId
    } else {
      ctx.data.url = slugify(ctx.data.name || ctx.currentInstance.name, opt)
    }

    next();
  });
  // Product.observe('after save', function(ctx, next) {
  //   if (ctx.isNewInstance && ctx.instance.categoryId) {
  //     Product.app.models.Category.findById(ctx.instance.categoryId)
  //       .then(category => {
  //         let tag = {tag: category.name}
  //         Product.app.models.Tag.upsertWithWhere(tag, tag)
  //           .then(tag => {
  //             ctx.instance.tags.add(tag.id)
  //             next()
  //           })
  //           .catch(next)
  //       })
  //       .catch(next)
  //   } else {
  //     next()
  //   }
  // });
};
