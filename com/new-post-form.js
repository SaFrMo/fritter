/* globals app */

const yo = require('yo-yo')
const renderAvatar = require('./avatar')
const renderMentions = require('./mentions')
const {buildPost} = require('../lib/util')

// exported api
// =

module.exports = function renderNewPostForm (opts = {}) {

  // default functions if not specified
  const onSubmit = opts.onSubmit || onSubmitPost
  const onKeyUp = opts.onKeyUp || onChangePostDraft

  // default source if not specified
  const source = opts.source || 'postDraftText'

  return yo`
    <form class="new-post-form editing" onsubmit=${onSubmit}>
      <div class="inputs">
        ${renderAvatar(app.currentUserProfile, 'small')}

        <div
          id="composer"
          class="composer"
          style="border-color: ${app.getAppColor('border')}; height: 60px;"
          contenteditable="true"
          onkeyup=${onKeyUp}>${renderPostDraft()}</div>

      </div>

      <div class="actions editing">

        <ul class="possible-mentions"></ul>

        <span class="char-count">${app[source].length || ''}</span>
        <button disabled=${!app[source].length} class="btn new-post" type="submit">Submit post</button>
      </div>
    </form>`

  function rerender () {
    yo.update(document.querySelector('.new-post-form'), renderNewPostForm())
  }

  function onChangePostDraft (e) {

    const composer = document.getElementById('composer')
    app[source] = e.target.textContent

    // does the draft contain an @?
    const matchText = app[source].match(/@([^@]*)$/)
    if( matchText && matchText[1].length ){
      const searchText = matchText[1]
      // does the text following the @ match any followed profile names?
      const followed = app.currentUserProfile.follows
      const matches = followed.filter(single => single.name.toLowerCase().includes(searchText.toLowerCase()))
      // save possible mentions
      app.possibleMentions = matches
    } else {
      app.possibleMentions = []
    }

    yo.update(document.querySelector('.possible-mentions'), renderMentions(source))
    yo.update(document.querySelector('.char-count'), yo`<span class="char-count">${ e.target.textContent.length }</span>`)
  }

  function renderPostDraft () {
    let html = app[source]

    // find and wrap all mentions
    app.draftMentions.map(mention => {
      html = html.replace(new RegExp(`@${mention.name}`),
        `<span class="mention" contenteditable="false">` +
          `<span class="hidden">@</span><span class="name">${mention.name}</span>` +
        `</span>&nbsp;`)
    })

    const container = document.createElement('span')
    container.innerHTML = html

    return yo`${container}`
  }

  async function onSubmitPost (e) {
    e.preventDefault()

    await app.libfritter.feed.post(app.currentUser, buildPost({ text: app[source] }))

    // reset draft
    app[source] = ''
    app.mentions = []

    // go to feed
    app.posts = await app.loadFeedPosts()
    app.render()
  }

  async function onToggleNewPostForm () {
    app.isEditingPost = !app.isEditingPost
    rerender()
  }
}
