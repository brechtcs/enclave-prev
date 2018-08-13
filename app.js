var Router = require('abstract-router')
var views = require('./views')

var app = Router.create()
var posts = [{
  msg: 'Something blah',
  name: 'Someone',
  reactions: []
}]

app.on('/', handle(function (state, app) {
  app.view(views.overview(posts))
}))

app.on('/discuss/new', handle(function (state, app) {
  app.view(views.discuss())
}))

app.on('*', function (state, app) {
  app.view(views.error('Not found'), 404)
  app.logger.info(404, state.method, state.url)
})

function handle (handler) {
  return function (state, app) {
    try {
      if (state.method === 'POST') persist(state.data, app)
      handler(state, app)
      app.logger.info('200', state.method, state.url)
    } catch (err) {
      app.view(views.error('Internal error'), 500)
      app.logger.info('500', state.method, state.url)
      app.logger.error(err)
    }
  }
}

function persist (data, app) {
  switch (data.type) {
    case 'post':
      posts.push({msg: data.msg, name: data.name, reactions: []})
      break
    case 'reaction':
      posts[data.postId].reactions.push({msg: data.msg, votes: data.vote ? 1 : 0})
      break
    case 'vote':
      posts[data.postId].reactions[data.reactionId].votes++
      break
    default:
      app.logger.error('Unknown data type: ' + data.type)
  }
}

module.exports = app
