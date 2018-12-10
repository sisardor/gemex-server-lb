'use strict';
const slugify = require('slugify')
const async = require('async')
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
      // ctx.instance.id = ctx.instance.slug
    } else {
      ctx.data.slug = slugify(ctx.data.name || ctx.currentInstance.name, opt)
    }
    next();
  });

  Category.observe('before save', function(ctx, next) {
    if (ctx.isNewInstance) {
      if (!ctx.instance.parent_id) {
        ctx.instance.parent_id = ''
        ctx.instance.path = ctx.instance.slug
        return next();
      } else {
        Category.findById(ctx.instance.parent_id)
          .then(parentCategory => {
            ctx.instance.level = parentCategory.level + 1
            ctx.instance.path = parentCategory.path + '.' + ctx.instance.slug
            ctx.instance.parent = parentCategory.path
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
        ctx.instance.children_ids = []
      }
    }
    next();
  });

  Category.observe('after save', function(ctx, next) {
    if (ctx.isNewInstance && !ctx.instance.parent_id) {
      // ctx.instance.full_path_taxonomy_ids = [ctx.instance.id]
      ctx.instance.updateAttribute('full_path_taxonomy_ids', [ctx.instance.id])
      return next();
    } else if(ctx.isNewInstance) {
      Category.findById(ctx.instance.parent_id)
        .then(parentCategory => {
          let parent_t = parentCategory.full_path_taxonomy_ids.concat(ctx.instance.id)
          let children_ids = parentCategory.children_ids.concat(ctx.instance.id)
          parentCategory.updateAttribute('children_ids', children_ids)
          ctx.instance.updateAttribute('full_path_taxonomy_ids', parent_t)
          return next()
        })
        .catch(next)
    } else {
      return next()
    }
  })

  Category.greet = async function(msg) {
      return 'Greetings... ' + msg;
  }

  Category.remoteMethod('greet', {
        accepts: {arg: 'msg', type: 'string'},
        returns: {arg: 'greeting', type: 'string'}
  });


  Category.remoteMethod('getProductByPath', {
    description: [
      'A custom endpoint to get Products by Cat path'
    ],
    accepts: [
      {
        arg: 'path', type: 'any',
        description: 'Model path', required: true,
        http: { source: 'path' }
      }, {
        arg: 'filter',
        type: 'object',
        description: 'Query filter',
        required: false,
        http: { source: 'query' }
      }
    ],
    returns: { arg: 'data', type: 'object', root: true },
    http: { verb: 'get', path: '/:path/products' }
  })
  Category.disableRemoteMethodByName('prototype.__get__products', false)
  Category.getProductByPath = function (path, filter, callback) {
    Category.findOne({where:{path:path}})
      .then(category => {
        if (!filter) {
          filter = {}
        }
        filter.where = Object.assign({}, filter.where, {category_path: category.name})
        Category.app.models.Product.find(filter, callback)

      })
      .catch(callback)
  }


  Category.remoteMethod('getBreadcrumbs', {
    description: [
      'A custom endpoint to get breadcrumbs by Cat path'
    ],
    accepts: [
      {
        arg: 'path', type: 'any',
        description: 'Model path', required: true,
        http: { source: 'path' }
      }
    ],
    returns: { arg: 'data', type: 'object', root: true },
    http: { verb: 'get', path: '/:path/breadcrumbs' }
  })

  //Home > Accessories > Hair Accessories > Fascinators & Mini Hats
  Category.getBreadcrumbs = function (path, callback) {
    Category.findOne({where: { path }})
      .then(category => {
        if (!category) return callback(null, {})
        
        async.parallel({
          breadcrumbs: function(cb) {
            Category
            .find({where: { id: { inq: category.full_path_taxonomy_ids}}}, cb)
          },
          product_count: function(cb) {
            Category.app.models.Product
            .count({category_path: category.name}, cb)
          }
        }, callback);
      })
      .catch(callback)
  }
};
