// /* globals app */
//
// const yo = require('yo-yo')
//
// module.exports = function renderComposer () {
//     return yo`
//       <div
//         id="composer"
//         class="composer"
//         style="border-color: ${app.getAppColor('border')}; height: ${isEditingPost ? '60px' : '35px'};"
//         contenteditable="true"
//         onkeyup=${onChangePostDraft}>${renderPostDraft()}</div>
//     `
//
//     function renderPostDraft () {
//       let html = app.postDraftText
//
//       // find and wrap all mentions
//       app.draftMentions.map(mention => {
//         html = html.replace(new RegExp(`@${mention.name}`),
//           `<span class="mention" contenteditable="false">` +
//             `<span class="hidden">@</span><span class="name">${mention.name}</span>` +
//           `</span> `)
//       })
//
//       const container = document.createElement('span')
//       container.innerHTML = html
//
//       return yo`${container}`
//     }
//
//     function onChangePostDraft (e) {
//
//       const composer = document.getElementById('composer')
//       app.postDraftText = e.target.textContent
//
//       // does the draft contain an @?
//       const matchText = app.postDraftText.match(/@([^@]*)$/)
//       if( matchText && matchText[1].length ){
//         const searchText = matchText[1]
//         // does the text following the @ match any followed profile names?
//         const followed = app.currentUserProfile.follows
//         const matches = followed.filter(single => single.name.toLowerCase().includes(searchText.toLowerCase()))
//         // save possible mentions
//         app.possibleMentions = matches
//       } else {
//         app.possibleMentions = []
//       }
//
//       yo.update(document.querySelector('.possible-mentions'), renderMentions())
//       yo.update(document.querySelector('.char-count'), yo`<span class="char-count">${ e.target.textContent.length }</span>`)
//     }
// }
