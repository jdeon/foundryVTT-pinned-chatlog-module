import { CLASS_HARD_HIDE, CLASS_CHAT_MESSAGE, CLASS_PINNED_MESSAGE, CLASS_PINNED_TAB_MESSAGE, ENUM_IS_PINNED_VALUE, checkIsPinned } from './utils.js'

export const DEFAULT_TAB_NAME = 'default';
export const PINNED_TAB_NAME = 'pinned';

let currentTabId = DEFAULT_TAB_NAME;
let buttonDefault
let buttonPinned
let checkboxSelfPinned

/**
 * Add chat subtabs
 * @param {*} html 
 * @param {*} chatLog 
 */
export function initTab(html, chatLog) {
    buttonDefault = $(`<a class="item default" data-tab="default">${game.i18n.localize("PCM.TABS.Default")}</a>`);
    buttonDefault.on('click', (event) => selectDefaultTab(chatLog));

    buttonPinned = $(`<a class="item pinned" data-tab="pinned">${game.i18n.localize("PCM.TABS.Pinned")}</a>`);
    buttonPinned.on('click', (event) => selectPinnedTab(chatLog));

    let divSelfPinned = $(`<div style="flex: none;display: none;"></div>`);

    checkboxSelfPinned = $(`<input type="checkbox" id="selfPinned" name="selfPinned">`);
    checkboxSelfPinned.on('change', ({ target }) => clickSelfPinnedCheckbox(target?.checked));

    divSelfPinned.append(checkboxSelfPinned).append(`<label for="selfPinned" style="display: flex;align-items: center;">${game.i18n.localize("PCM.TABS.SeflPinnedChekkbox")}</label>`);

    let buttonContainer = $('<nav class="tabs chat-pinned"></nav>');
    buttonContainer.append(buttonDefault).append(buttonPinned);

    let moduleContainer = $('<div class="pinnedchatlog "></div>')
    moduleContainer.append(buttonContainer).append(divSelfPinned);
    html.prepend(moduleContainer);
}

export function getCurrentTabId() {
    return currentTabId
}

export function getCurrentTab() {
    if (currentTabId === PINNED_TAB_NAME) {
        return buttonPinned
    } else {
        return buttonDefault
    }
}

function selectDefaultTab(chatLog) {
    currentTabId = DEFAULT_TAB_NAME;
    buttonDefault.addClass('active');
    buttonPinned.removeClass('active');
    checkboxSelfPinned.parent().css("display", "none")

    setClassVisibility(CLASS_CHAT_MESSAGE, true);

    $('.' + CLASS_PINNED_TAB_MESSAGE).remove();

    chatLog.scrollBottom(true)
};

async function selectPinnedTab(chatLog) {
    currentTabId = PINNED_TAB_NAME;
    buttonPinned.addClass('active');
    buttonDefault.removeClass('active');
    checkboxSelfPinned.parent().css("display", "flex")

    setClassVisibility(CLASS_CHAT_MESSAGE, false);
    setClassVisibility(CLASS_PINNED_MESSAGE, true);

    let pinnedMessages = game.messages.contents.filter(entry => checkIsPinned(entry) !== ENUM_IS_PINNED_VALUE.none);

    const log = $("#chat-log");
    let htmlMessages = [];

    for (let i = 0; i < pinnedMessages.length; i++) {
        let pinnedMessage = pinnedMessages[i];
        if (!pinnedMessage.visible) continue;//isWisper or other hide message

        const htmlMessage = log.find(`.message[data-message-id="${pinnedMessage.id}"]`)

        //Hide not self pinned message
        if (checkboxSelfPinned.is(":checked") && checkIsPinned(pinnedMessage) !== ENUM_IS_PINNED_VALUE.self) {
            if (htmlMessage.length) {
                htmlMessage.hide()
            }

            continue;
        }

        if (htmlMessage.length) continue;//is already render

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

function clickSelfPinnedCheckbox(isCheck) {
    setClassVisibility(CLASS_PINNED_MESSAGE, true);

    if (isCheck) {
        //Hide not self pinned message
        const pinnedMessagesToHide = game.messages.contents.filter(entry => checkIsPinned(entry) !== ENUM_IS_PINNED_VALUE.self);
        const log = $("#chat-log");

        for (let i = 0; i < pinnedMessagesToHide.length; i++) {
            let pinnedMessage = pinnedMessagesToHide[i];

            const htmlMessage = log.find(`.message[data-message-id="${pinnedMessage.id}"]`)
            if (htmlMessage.length) {
                htmlMessage.hide()
            }
        }
    }
}


function setClassVisibility(cssClass, visible) {
    const element = $('.' + cssClass)

    if (visible) {
        element.removeClass(CLASS_HARD_HIDE);
        element.show();
    } else {
        element.hide();
    }
};