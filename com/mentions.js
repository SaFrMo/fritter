/* globals app */

const yo = require('yo-yo')

module.exports = function renderMentions(rerender){
  return yo`
      <ul class="possible-mentions">
        ${app.possibleMentions.map(renderMention)}
      </ul>
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
  app.postDraftText = app.postDraftText.replace(/@[^@]*$/, `@${user.name}`)
  //document.getElementById('composer').innerHTML = yo`<span data-url="${user.url}" data-name="${user.name}">${user.name}</span>`
  // app.postDraft.push({ type: 'mention', user })
  // app.postDraft.push('')
  app.possibleMentions = []

  // Save user to list of mentions
  app.draftMentions.push({
      name: user.name,
      url: user.url
  })

  app.render()

  // Refocus text entry
  document.querySelector('.composer').focus()
}
