/* globals app */

const yo = require('yo-yo')

module.exports = function renderMentions (rerender) {
  return yo`
      <ul class="possible-mentions">
        ${app.possibleMentions.map(renderMention)}
      </ul>
  `
}

function renderMention (user) {
  return yo`
    <li>
      <button onclick="${e => onMentionClicked(e, user)}">${user.name}</span>
    </li>
  `
}

function onMentionClicked (e, user) {
  e.stopPropagation()
  e.preventDefault()

  // Fill out the user's name
  app.postDraftText = app.postDraftText.replace(/@[^@]*$/, `@${user.name}`)
  app.possibleMentions = []

  // Save user to list of mentions
  app.draftMentions.push({
      name: user.name,
      url: user.url
  })

  app.render()

  // Refocus text entry
  setEndOfContenteditable(document.querySelector('.composer'))
}

function setEndOfContenteditable (contentEditableElement) {
  var range,selection
  range = document.createRange()
  range.selectNodeContents(contentEditableElement)
  range.collapse(false)
  selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(range)
}
