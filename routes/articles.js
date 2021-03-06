/**
 * dependencies
 */

var dbconfig = require('../config.js').dbconfig,
	Sequelize = require('sequelize');

// Initialize database connection
var sequelize = new Sequelize(dbconfig.database, dbconfig.username, dbconfig.password);

// Locale model
var Articles = sequelize.import(__dirname + "/../models/Article");

// Create the schema if necessary
// Articles.sync();

/**
 * takes an Array of records
 * and and Array of fields and returns 
 * a collection.
 *
 * 
 * @param {Array} recs
 * @param {Array} fields
 * @return {Array}
 * @api public
 */
function mapCollection(recs, fields){
	return recs.map(function(row){
		var result = {};
		fields.forEach(function(field){
			result[field] = row[field]
		});
		return result;
	});
};

/**
 * GET /articles
 */
exports.index = function(req, res){
	Articles.findAll().on('success', function(articles){

		switch(req.format){
			case 'json':
				var recs = mapCollection(articles, ['id', 'article_type', 'visible']);
				res.json({
					success: true,
					'data': recs
					}, 200);
				break;
			
			case 'xml':
				res.send('<articles>' + articles.map(function(a){
					return '<article>' + a.article_type + '</article>';
				}).join('') + '</articles>');
				break;

			default:
				res.render('articles', {
					locals: {
						title: 'Articles',
						data: articles
					}
				});	
		}
	}).on('failure', function(err){
		switch(req.format){
			case 'json':
				res.json({
					success: false,
					msg: err
				}, 500);

			// TODO: add xml res

			default:
				res.render('500', {
					locals: {
						title: '500 - Internal Server Error',
						desc: err
					},
					status: 500
				});
		};
	});
};

/**
 * GET /articles/new
 */
exports.new = function(req, res){
	res.render('articles_new', {
		locals: {
			title: 'New Article'
		}
	});
};


/**
 * POST /articles
 *
 * TODO: require admin here
 */
exports.create = function(req, res){
	var post = Articles.build({
		article_type: req.body.article_type
	});
	debugger;
	post.save().on('success', function(id){
		debugger;
		var rec = {
			'id': id.id,
			'article_type': id.article_type,
			'visible': id.visible
		};
		res.json({
			success: true,
			data: rec
		}, 200);
	}).on('failure', function(err){
		debugger;
		res.json({
			success: false,
			msg: err
		}, 500);
		// throw new Error(err);
	});
};

/**
 * GET /articles/:id
 */
exports.show = function(req, res){
	var articleId = parseInt(req.params.article);

	Articles.find(articleId).on('success', function(article){
		switch(req.format){
			case 'json':
				if(!article){
					res.json({
						success: false,
						msg: 'The requested resource could not be found'
					}, 404);
				} else {
					var rec = {
						'id': article.id,
						'article': article.article_type,
						'visible': article.visible
					};
					res.json({
						success: true,
						article: rec
					});
				}
				break;

			case 'xml':
				res.send('<article>' + article.article + '</article>');
				break;

			default:
				if(!article){
					res.render('404', {
						locals: {
							title: '404 - Not Found',
							desc: 'The requested resource could not be found'
						},
						status: 404
					});
				} else {
					res.render('article_show', {
						locals: {
							title: 'Display Article',
							data: {
								'article': article
							}
						}
					});
				}
		};
	}).on('failure', function(err){
		switch(req.format){
			case 'json':
				res.json({
					success: false,
					msg: err
				}, 500);

			// TODO: add xml res

			default:
				res.render('500', {
					locals: {
						title: '500 - Internal Server Error',
						desc: err
					},
					status: 500
				});
		};
	});
};


/**
 * GET /articles/:id/edit
 */
exports.edit = function(req, res){
	var articleId = parseInt(req.params.article);
	Articles.find(articleId).on('success', function(rec){
		res.render('article_edit', {
			id: rec.id,
			title: 'Edit article: ' + rec.article_type,
			type: rec.article_type
		});
	}).on('failure', function(err){
		res.render('500', {
			locals: {
				title: '500 - Internal Server Error',
				desc: err
			},
			status: 500
		});
	});
};

/**
 * PUT /articles/:id
 */
 exports.update = function(req, res){
 	if(req.body.article_type){
 		var articleId = parseInt(req.params.article);
 		Articles.find(articleId).on('success', function(rec){
 			rec.updateAttributes({
 				article_type: req.body.article_type
 			}).on('success', function(id){
 				res.json({
					success: true
				}, 200);
 			}).on('failure', function(err){
 				res.json({
					success: false,
					msg: err
				}, 500);
 			});
 		}).on('failure', function(err){
 			res.json({
				success: false,
				msg: err
			}, 500);
 		});
 	} else {
 		res.json({
			success: false,
			msg: 'Data not provided'
		}, 500);
 	}
 };

 /**
 * DELETE /articles/:id
 *
 * TODO: add authorization here
 */
exports.destroy = function(req, res){
	var articleId = parseInt(req.params.article);
	Articles.find(articleId).on('success', function(rec){
		rec.destroy().on('success', function(foo){
			res.json({
				success: true,
			}, 200);
		}).on('failure', function(err){
			res.json({
				success: false,
				msg: err
			}, 500);
		});
	}).on('failure', function(err){
		res.json({
			success: false,
			msg: err
		}, 500);
	});
};