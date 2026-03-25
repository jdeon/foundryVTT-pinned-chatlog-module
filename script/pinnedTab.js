import { CLASS_HARD_HIDE, CLASS_CHAT_MESSAGE, CLASS_PINNED_MESSAGE, CLASS_PINNED_TAB_MESSAGE, ENUM_IS_PINNED_VALUE, checkIsPinned } from './utils.js'

export const DEFAULT_TAB_NAME = 'default';
export const PINNED_TAB_NAME = 'pinned';

let currentTabId = DEFAULT_TAB_NAME;
let buttonDefault, buttonPinned, checkboxSelfPinned
/**
 * Add chat subtabs
 * @param {*} html 
 * @param {*} chatLog 
 */
export function initTab(html, chatLog) {
    // Bouton Default
    buttonDefault = document.createElement('a');
    buttonDefault.className = 'item default';
    buttonDefault.dataset.tab = 'default';
    buttonDefault.textContent = game.i18n.localize("PCM.TABS.Default");
    buttonDefault.addEventListener('click', () => selectDefaultTab(chatLog));

    // Bouton Pinned
    buttonPinned = document.createElement('a');
    buttonPinned.className = 'item pinned';
    buttonPinned.dataset.tab = 'pinned';
    buttonPinned.textContent = game.i18n.localize("PCM.TABS.Pinned");
    buttonPinned.addEventListener('click', () => selectPinnedTab(chatLog));

    // Div checkbox
    const divSelfPinned = document.createElement('div');
    divSelfPinned.style.flex = 'none';
    divSelfPinned.style.display = 'none';

    // Checkbox
    checkboxSelfPinned = document.createElement('input');
    checkboxSelfPinned.type = 'checkbox';
    checkboxSelfPinned.id = 'selfPinned';
    checkboxSelfPinned.name = 'selfPinned';
    checkboxSelfPinned.addEventListener('change', ({ target }) => {
        clickSelfPinnedCheckbox(target?.checked);
    });

    // Label
    const label = document.createElement('label');
    label.setAttribute('for', 'selfPinned');
    label.style.display = 'flex';
    label.style.alignItems = 'center';
    label.textContent = game.i18n.localize("PCM.TABS.SeflPinnedChekkbox");

    divSelfPinned.append(checkboxSelfPinned, label);

    // Nav container
    const buttonContainer = document.createElement('nav');
    buttonContainer.className = 'tabs chat-pinned';
    buttonContainer.append(buttonDefault, buttonPinned);

    // Module container
    const moduleContainer = document.createElement('div');
    moduleContainer.className = 'pinnedchatlog';
    moduleContainer.append(buttonContainer, divSelfPinned);

    // Insertion au début
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
    buttonDefault.classList.add('active');
    buttonPinned.classList.remove('active');
    checkboxSelfPinned.parentElement.style.display = 'none';

    setClassVisibility(CLASS_CHAT_MESSAGE, true);

    $('.' + CLASS_PINNED_TAB_MESSAGE).remove();

    chatLog.scrollBottom(true)
};

async function selectPinnedTab(chatLog) {
    currentTabId = PINNED_TAB_NAME;
    buttonPinned.classList.add('active');
    buttonDefault.classList.remove('active');
    checkboxSelfPinned.parentElement.style.display = 'flex';

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
        if (checkboxSelfPinned.checked && checkIsPinned(pinnedMessage) !== ENUM_IS_PINNED_VALUE.self) {
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
        const log = getChatLogs();

        for (let i = 0; i < pinnedMessagesToHide.length; i++) {
            let pinnedMessage = pinnedMessagesToHide[i];

            const htmlMessage = log.find(`.message[data-message-id="${pinnedMessage.id}"]`)
            if (htmlMessage.length) {
                htmlMessage.hide()
            }
        }
    }
}

function getChatLogs() {
    const chatById = $("#chat-log");

    if (chatById.length) return chatById

    const chatByClass = $(".chat-log");

    if (chatByClass.length) return chatByClass

    throw new Error('Unfined chatlog')
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