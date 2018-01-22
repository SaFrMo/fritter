/* globals app */

const yo = require('yo-yo')
const renderAvatar = require('./avatar')
const renderMentions = require('./mentions')

// exported api
// =

module.exports = function renderNewPostForm () {
  const isEditingPost = app.isEditingPost || app.postDraftText.length
  var editingCls = isEditingPost ? 'editing' : ''
  return yo`
    <form class="new-post-form ${editingCls}" onsubmit=${onSubmitPost}>
      <div class="inputs">
        ${renderAvatar(app.currentUserProfile, 'small')}

        <textarea
          placeholder="Write a post"
          style="border-color: ${app.getAppColor('border')}; height: ${isEditingPost ? '60px' : '35px'};"
          onfocus=${onToggleNewPostForm}
          onblur=${onToggleNewPostForm}
          onkeyup=${onChangePostDraft}>${app.postDraftText}</textarea>

        ${app.possibleMentions ? yo`<ul class="mention-wrap">${ renderMentions(rerender) }</ul>` : ''}
      </div>

      <div class="actions ${editingCls}">
        <span class="char-count">${app.postDraftText.length || ''}</span>
        ${isEditingPost ? yo`<button disabled=${!app.postDraftText.length} class="btn new-post" type="submit">Submit post</button>` : ''}
      </div>
    </form>`

  function rerender () {
    yo.update(document.querySelector('.new-post-form'), renderNewPostForm())
  }

  function onChangePostDraft (e) {
    app.postDraftText = e.target.value

    // does the draft contain an @?
    const matchText = app.postDraftText.match(/@([^@]*)$/)
    if( matchText && matchText[1].length ){
      const searchText = matchText[1]
      // does the text following the @ match any followed profile names?
      const followed = app.currentUserProfile.follows
      const matches = followed.filter(single => single.name.includes(searchText))
      // save possible mentions
      app.possibleMentions = matches
    } else {
      app.possibleMentions = null
    }

    rerender()
  }

  async function onSubmitPost (e) {
    e.preventDefault()
    await app.libfritter.feed.post(app.currentUser, {text: app.postDraftText})
    app.postDraftText = ''
    app.posts = await app.loadFeedPosts()
    app.render()
  }

  async function onToggleNewPostForm () {
    app.isEditingPost = !app.isEditingPost
    rerender()
  }
}
