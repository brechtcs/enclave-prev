var MemoryStore = require('passwordless-memorystore')
var app = require('./app')
var bodyParser = require('body-parser')
var dedent = require('dedent')
var express = require('express')
var passwordless = require('passwordless')
var pathname = require('pathname-match')
var sendmail = require('sendmail')()
var session = require('express-session')
var views = require('./views/server')

app.impl(function (app) {
  app.keep('logger', {
    error: console.error,
    info: console.info,
    warn: console.warn
  })

  var server = express()
  server.use(bodyParser.urlencoded())
  server.use(session({secret: 'blah', saveUninitialized: false, resave: false}))

  passwordless.init(new MemoryStore())
  passwordless.addDelivery(mailToken)

  server.use(passwordless.sessionSupport())
  server.use(passwordless.acceptToken({successRedirect: '/'}))

  server.get('/login', function (req, res) {
    createViewMethod(res)(views.login())
  })

  server.post('/login', passwordless.requestToken(function (user, delivery, cb) {
    cb(null, 42)
  }), function (req, res) {
    createViewMethod(res)('<body>Sent!</body>')
  })

  server.use(passwordless.restricted({failureRedirect: '/login'}))

  server.use(async function (req, res) {
    app.clean()

    app.set('view', createViewMethod(res))
    app.state.data = req.body
    app.state.method = req.method
    app.state.url = req.url
    app.state.pathname = pathname(req.url)

    app.match(app.state.pathname)
  })

  server.listen(7004, function (err) {
    if (err) app.logger.error(err)
    else app.logger.info('Listening at localhost:7004')
  })
})

function createViewMethod (res) {
  return function (body, status) {
    res.setHeader('Content-Type', 'text/html')
    res.writeHead(status || 200)
    res.end(`
      <!doctype html>
      <html>
        <head>
          <title>Enclave</title>
        </head>
        ${body}
      </html>
    `)
  }
}

function mailToken (token, uid, recipient, cb, req) {
  var msg = dedent`
    Hello human,

    Login to http://${req.headers.host}?token=${token}&uid=${encodeURIComponent(uid)}

    Cheers,

    Enclave
  `

  console.log(msg)
  cb()
}
