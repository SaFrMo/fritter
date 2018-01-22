/* globals app */

const yo = require('yo-yo')

module.exports = function renderMentions(rerender){
  return yo`
      ${app.possibleMentions.map(renderMention)}
  `
}

function renderMention(user){
  return yo`
    <li>
      <button onclick="${e => onMentionClicked(e, user)}">${user.name}</span>
    </li>
  `
}

function onMentionClicked(e, user){
  e.stopPropagation()
  e.preventDefault()

  // Fill out the user's name
  app.postDraftText = app.postDraftText.replace(/@[^@]*$/, `@${ user.name }`)
  app.possibleMentions = null

  // Save user to list of mentions

  // Refocus text entry
  document.querySelector('textarea').focus()
}
