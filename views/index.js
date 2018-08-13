var html = require('nanohtml')

module.exports.error = function (msg) {
  return html`<body>${msg}</body>`
}

module.exports.overview = function (posts) {
  return html`<body>
    <a href="/discuss/new">New discussion</a>
    ${posts.map((data, i) => post(data, i))}
  </body>`
}

module.exports.discuss = function () {
  return html`<body>
    <form action="/" method="POST">
      <input type="hidden" name="type" value="post">
      <div>
        <label for="displayName">Name:</label>
        <input type="text" name="name" id="displayName">
      </div>
      <div>
        <textarea name="msg"></textarea>
      </div>
      <button type="submit">Send</button>
    </form>
  </body>`
}

function post (data, postId) {
  return html`<article>
    <header>${data.name}</header>
    <p>${data.msg}</p>
    <ul>${data.reactions.map((data, i) => html`<li>${reaction(data, postId, i)}</li>`)}</ul>
    <form method="POST">
      <input type="hidden" name="type" value="reaction">
      <input type="hidden" name="postId" value=${postId}>
      <input type="text" name="msg" placeholder="Add reaction">
      <input type="checkbox" name="vote" id="vote" checked>
      <label for="vote">+1</label>
      <button type="submit">Send</button>
    </form>
  </article>`
}

function reaction (data, postId, reactionId) {
  return html`<form method="POST">
    ${data.msg} (${data.votes})
    <input type="hidden" name="type" value="vote">
    <input type="hidden" name="postId" value=${postId}>
    <input type="hidden" name="reactionId" value=${reactionId}>
    <button type="submit">+1</button>
  </form>`
}
