'use strict';
const slugify = require('slugify')
const opt = {
  replacement: '-',    // replace spaces with replacement
  remove: null,        // regex to remove characters
  lower: true          // result in lower case
}
const categoryUrl = 'cat'

// db.categories.insert( { _id: "MongoDB", ancestors: [ "Books", "Programming", "Databases" ], parent: "Databases" } )
// db.categories.insert( { _id: "dbm", ancestors: [ "Books", "Programming", "Databases" ], parent: "Databases" } )
// db.categories.insert( { _id: "Databases", ancestors: [ "Books", "Programming" ], parent: "Programming" } )
// db.categories.insert( { _id: "Languages", ancestors: [ "Books", "Programming" ], parent: "Programming" } )
// db.categories.insert( { _id: "Programming", ancestors: [ "Books" ], parent: "Books" } )
// db.categories.insert( { _id: "Books", ancestors: [ ], parent: null } )
module.exports = function(Category) {
  Category.validatesUniquenessOf('name')
  Category.observe('before save', function(ctx, next) {
    if (ctx.isNewInstance) {
      ctx.instance.slug = slugify(ctx.instance.name, opt)
      ctx.instance.id = ctx.instance.name
    } else {
      ctx.data.slug = slugify(ctx.data.name || ctx.currentInstance.name, opt)
    }
    next();
  });

  Category.observe('before save', function(ctx, next) {
    if (ctx.isNewInstance) {
      if (!ctx.instance.parent_id) {
        ctx.instance.parent_id = ''
        ctx.instance.path = '/' + ctx.instance.slug
        return next();
      } else {
        Category.findById(ctx.instance.parent_id)
          .then(parentCategory => {
            ctx.instance.level = parentCategory.level + 1
            ctx.instance.children_ids = parentCategory.children_ids.concat(ctx.instance.parent_id)
            ctx.instance.path = parentCategory.path + '/' + ctx.instance.slug
            return next();
          })
          .catch(next);
      }
    } else {
      return next();
    }
    // for (let i = 0; i < d.results.length; i++) {
    //   console.log(d.results[i].path)
    //   for (let j = 0; j < d.results[i].children.length; j++) {
    //     console.log('   ' + d.results[i].children[j].path)
    //   }
    //   console.log();
    // }
  });
  Category.observe('before save', function(ctx, next) {
    if (ctx.isNewInstance) {
      if (!ctx.instance.children_ids || !ctx.instance.children_ids.length) {
        ctx.instance.level = 0
        ctx.instance.children_ids = []
      }
    }
    next();
  });

};
