import { CLASS_HARD_HIDE, CLASS_CHAT_MESSAGE, CLASS_PINNED_MESSAGE, CLASS_PINNED_TAB_MESSAGE } from './utils.js'

export const DEFAULT_TAB_NAME = 'default';
export const PINNED_TAB_NAME = 'pinned';

let currentTabId = DEFAULT_TAB_NAME;
let buttonDefault
let buttonPinned

/**
 * Add chat subtabs
 * @param {*} html 
 * @param {*} chatLog 
 */
export function initTab (html, chatLog){
    buttonDefault = $(`<a class="item default" data-tab="default">${game.i18n.localize("PCM.TABS.Default")}</a>`);
    buttonDefault.on('click', (event) => selectDefaultTab(chatLog));

    buttonPinned = $(`<a class="item pinned" data-tab="pinned">${game.i18n.localize("PCM.TABS.Pinned")}</a>`);
    buttonPinned.on('click', (event) => selectPinnedTab(chatLog));

    let toPrepend = $('<nav class="pinnedchatlog tabs"></nav>');
    toPrepend.append(buttonDefault).append(buttonPinned);
    
    html.prepend(toPrepend);
}

export function getCurrentTabId(){
    return currentTabId
}

export function getCurrentTab(){
    if(currentTabId === PINNED_TAB_NAME){
        return buttonPinned
    } else {
        return buttonDefault
    }
}

function selectDefaultTab(chatLog){
    currentTabId = DEFAULT_TAB_NAME;
    buttonDefault.addClass('active');
    buttonPinned.removeClass('active');

    setClassVisibility(CLASS_CHAT_MESSAGE, true);

    $('.'+CLASS_PINNED_TAB_MESSAGE).remove();

    chatLog.scrollBottom(true)
};

async function selectPinnedTab(chatLog){
    currentTabId = PINNED_TAB_NAME;
    buttonPinned.addClass('active');
    buttonDefault.removeClass('active');

    setClassVisibility(CLASS_CHAT_MESSAGE, false);
    setClassVisibility(CLASS_PINNED_MESSAGE, true);

    let pinnedMessages = game.messages.contents.filter(entry => entry.flags?.pinnedChat?.pinned);

    const log = $("#chat-log");
    let htmlMessages = [];
    
    for ( let i=0; i<pinnedMessages.length; i++) {
        let pinnedMessage = pinnedMessages[i];
        if (!pinnedMessage.visible) continue;//isWisper or other hide message

        const htmlMessage = log.find(`.message[data-message-id="${pinnedMessage.id}"]`)
        if(htmlMessage.length) continue;//is already render

        pinnedMessage.logged = true;
        try {
            let messageHtml = await pinnedMessage.getHTML();
            messageHtml.addClass(CLASS_PINNED_TAB_MESSAGE)
            htmlMessages.push(messageHtml);
        } catch (err) {
          err.message = `Pinned message ${pinnedMessage.id} failed to render: ${err})`;
          console.error(err);
        }
      }

      // Prepend the HTML
      log.prepend(htmlMessages);
    
    chatLog.scrollBottom(true)
};


function setClassVisibility(cssClass, visible) {
    const element = $('.'+cssClass)

    if (visible) {
        element.removeClass(CLASS_HARD_HIDE);
        element.show();
    } else {
        element.hide();
    }
};