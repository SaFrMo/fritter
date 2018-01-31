/* globals app */

const yo = require('yo-yo')
const renderAvatar = require('./avatar')
const renderMentions = require('./mentions')

// exported api
// =

module.exports = function renderNewPostForm () {
  const isEditingPost = true //app.isEditingPost
  var editingCls = isEditingPost ? 'editing' : ''
  return yo`
    <form class="new-post-form ${editingCls}" onsubmit=${onSubmitPost}>
      <div class="inputs">
        ${renderAvatar(app.currentUserProfile, 'small')}

        <div
          id="composer"
          class="composer"
          style="border-color: ${app.getAppColor('border')}; height: ${isEditingPost ? '60px' : '35px'};"
          contenteditable="true"
          onkeyup=${onChangePostDraft}>${renderPostDraft()}</div>

      </div>

      <div class="actions ${editingCls}">

        <ul class="possible-mentions"></ul>

        <span class="char-count">${app.postDraftText.length || ''}</span>
        ${isEditingPost ? yo`<button disabled=${!app.postDraftText.length} class="btn new-post" type="submit">Submit post</button>` : ''}
      </div>
    </form>`

  function rerender () {
    yo.update(document.querySelector('.new-post-form'), renderNewPostForm())
  }

  function onChangePostDraft (e) {

    const composer = document.getElementById('composer')
    app.postDraftText = e.target.textContent

    // does the draft contain an @?
    const matchText = app.postDraftText.match(/@([^@]*)$/)
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

    yo.update(document.querySelector('.possible-mentions'), renderMentions())
    yo.update(document.querySelector('.char-count'), yo`<span class="char-count">${ e.target.textContent.length }</span>`)
  }

  function renderPostDraft () {
    let html = app.postDraftText

    // find and wrap all mentions
    app.draftMentions.map(mention => {
      html = html.replace(new RegExp(`@${mention.name}`),
        `<span class="mention" contenteditable="false">` +
          `<span class="hidden">@</span><span class="name">${mention.name}</span>` +
        `</span>`)
    })

    const container = document.createElement('span')
    container.innerHTML = html

    return yo`${container}`
  }

  async function onSubmitPost (e) {
    e.preventDefault()

    const payload = {
      text: app.postDraftText
    }
    if (app.draftMentions) {
      // Remove duplicates
      const uniqueMentions = []
      app.draftMentions.map((mention, i) => {
        if (!uniqueMentions.find(x => x.url == mention.url)){
          uniqueMentions.push(mention)
        }
      })
      // Filter out unused mentions
      const filteredMentions = uniqueMentions.filter(mention => payload.text.includes(`@${ mention.name }`))

      if (filteredMentions.length) {
        payload.mentions = filteredMentions
      }
    }

    await app.libfritter.feed.post(app.currentUser, payload)

    // reset draft
    app.postDraftText = ''
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
