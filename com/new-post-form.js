/* globals app */

const yo = require('yo-yo')
const renderAvatar = require('./avatar')
const renderMentions = require('./mentions')

// exported api
// =

module.exports = function renderNewPostForm () {
  const isEditingPost = app.isEditingPost || app.postDraft.length
  var editingCls = isEditingPost ? 'editing' : ''
  return yo`
    <form class="new-post-form ${editingCls}" onsubmit=${onSubmitPost}>
      <div class="inputs">
        ${renderAvatar(app.currentUserProfile, 'small')}

        <textarea
          placeholder="Write a post"
          style="display:none; border-color: ${app.getAppColor('border')}; height: ${isEditingPost ? '60px' : '35px'};"
          onfocus=${onToggleNewPostForm}
          onblur=${onToggleNewPostForm}
          onkeyup=${onChangePostDraft}>${app.postDraft}</textarea>

        <div
          id="composer"
          class="composer"
          style="border-color: ${app.getAppColor('border')}; height: ${isEditingPost ? '60px' : '35px'};"
          contenteditable="true"
          onkeyup=${onChangePostDraft}>

          ${renderPostDraft()}

        </div>

        <ul class="possible-mentions"></ul>
      </div>

      <div class="actions ${editingCls}">
        <span class="char-count">${app.postDraft.length || ''}</span>
        ${isEditingPost ? yo`<button disabled=${!app.postDraft.length} class="btn new-post" type="submit">Submit post</button>` : ''}
      </div>
    </form>`

  function rerender () {
    yo.update(document.querySelector('.new-post-form'), renderNewPostForm())
  }

  function onChangePostDraft (e) {

    const composer = document.getElementById('composer')
    app.postDraftText = e.target.textContent.trim()
    // const currentInput = document.querySelector('.composer .text:focus')
    // const inputIndex = [...document.getElementById('composer').children].indexOf(currentInput)
    // app.postDraft[inputIndex] = e.target.textContent

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
  }

  function renderPostDraft () {
    let html = app.postDraftText

    // find and wrap all mentions
    app.draftMentions.map(mention => {
      html = html.replace(new RegExp(`@${mention.name}X?`), `
          <span class="mention" contenteditable="false">
            <span class="hidden">@</span><span class="name">${mention.name}</span><span class="cancel">X</span>
          </span>`)
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
    if( app.draftMentions ){
      payload.mentions = app.draftMentions
    }
    await app.libfritter.feed.post(app.currentUser, payload)
    app.postDraft = ['']
    app.mentions = []
    app.posts = await app.loadFeedPosts()
    app.render()
  }

  async function onToggleNewPostForm () {
    app.isEditingPost = !app.isEditingPost
    rerender()
  }
}
