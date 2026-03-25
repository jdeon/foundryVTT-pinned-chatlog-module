import { CLASS_CHAT_MESSAGE, CLASS_PINNED_MESSAGE, CLASS_PINNED_TAB_MESSAGE, ENUM_IS_PINNED_VALUE, checkIsPinned } from './utils.js'

export const DEFAULT_TAB_NAME = 'default';
export const PINNED_TAB_NAME = 'pinned';

let currentTabId = DEFAULT_TAB_NAME;
let buttonDefault, buttonPinned, buttonSelfPinned
/**
 * Add chat subtabs
 * @param {*} html 
 * @param {*} chatLog 
 */
export function initTab(html, chatLog) {
    // Bouton Default
    buttonDefault = document.createElement('button');
    buttonDefault.className = 'item default';
    buttonDefault.dataset.tab = 'default';
    buttonDefault.textContent = game.i18n.localize("PCM.TABS.Default");
    buttonDefault.addEventListener('click', () => selectDefaultTab(chatLog));

    // Bouton Pinned
    buttonPinned = document.createElement('button');
    buttonPinned.className = 'item pinned';
    buttonPinned.dataset.tab = 'pinned';
    buttonPinned.textContent = game.i18n.localize("PCM.TABS.Pinned");
    buttonPinned.addEventListener('click', () => selectPinnedTab(chatLog));

    // Checkbox
    buttonSelfPinned = document.createElement('button');;
    buttonSelfPinned.className = 'item selfPinned';
    buttonSelfPinned.dataset.tab = 'selfPinned';
    buttonSelfPinned.textContent = game.i18n.localize("PCM.TABS.SeflPinnedChekkbox");
    buttonSelfPinned.addEventListener('click', () => clickSelfPinnedCheckbox());

    // buttons container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'tabs chat-pinned';
    buttonContainer.append(buttonDefault, buttonPinned, buttonSelfPinned);

    // Module container
    const moduleContainer = document.createElement('div');
    moduleContainer.className = 'pinnedchatlog';
    moduleContainer.append(buttonContainer);

    // Insertion au début
    html.prepend(moduleContainer);
}

export function getCurrentTabId() {
    return currentTabId
}

function selectDefaultTab(chatLog) {
    currentTabId = DEFAULT_TAB_NAME;

    setClassVisibility(CLASS_CHAT_MESSAGE, true);

    document.querySelectorAll(`.${CLASS_PINNED_TAB_MESSAGE}`).forEach(element => element.remove());

    chatLog.scrollBottom(true)
};

async function selectPinnedTab(chatLog) {
    currentTabId = PINNED_TAB_NAME;

    setClassVisibility(CLASS_CHAT_MESSAGE, false);
    setClassVisibility(CLASS_PINNED_MESSAGE, true);

    let pinnedMessages = game.messages.contents.filter(entry => checkIsPinned(entry) !== ENUM_IS_PINNED_VALUE.none);

    const log = document.querySelector(".chat-log");
    if (!log) return;

    const htmlMessages = [];

    for (const pinnedMessage of pinnedMessages) {
        if (!pinnedMessage.visible) continue;//isWisper or other hide message

        const htmlMessage = log.querySelector(
            `.message[data-message-id="${pinnedMessage.id}"]`
        );

        if (htmlMessage) continue;//is already render

        pinnedMessage.logged = true;

        try {
            const messageHtml = await pinnedMessage.renderHTML();

            // Foundry v12 returns HTMLElement
            messageHtml.classList.add(CLASS_PINNED_TAB_MESSAGE);

            htmlMessages.push(messageHtml);

        } catch (err) {
            err.message = `Pinned message ${pinnedMessage.id} failed to render: ${err}`;
            console.error(err);
        }
    }

    // Prepend rendered messages
    if (htmlMessages.length) {
        log.prepend(...htmlMessages);
    }

    chatLog.scrollBottom(true)
};

function clickSelfPinnedCheckbox() {
    setClassVisibility(CLASS_PINNED_MESSAGE, true);

    //Hide not self pinned message
    const pinnedMessagesToHide = game.messages.contents.filter(entry => checkIsPinned(entry) !== ENUM_IS_PINNED_VALUE.self);
    const chatLogs = document.querySelectorAll(".chat-log");

    for (let i = 0; i < pinnedMessagesToHide.length; i++) {
        let pinnedMessage = pinnedMessagesToHide[i];

        const htmlMessages = chatLogs.values().flatMap((log) => log.querySelectorAll(`.message[data-message-id="${pinnedMessage._id}"]`))
        htmlMessages.forEach((htmlElement) => htmlElement.style.display = "none")
    }
}

function setClassVisibility(cssClass, visible) {
    const elements = document.querySelectorAll(`.${cssClass}`)

    elements.forEach((element) => {
        if (visible) {
            element.style.display = "";
        } else {
            element.style.display = "none";
        }   
    })
};