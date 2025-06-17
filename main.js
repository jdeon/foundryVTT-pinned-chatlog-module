import { pinnedApi } from "./script/api.js";
import { addMigrationSettings, migrateModule } from "./script/migrationManager.js"
import { pinnedMessageUpdate, addPinnedButton, pinnedMessage } from "./script/pinnedMessage.js";
import { initTab, getCurrentTab, getCurrentTabId, PINNED_TAB_NAME } from "./script/pinnedTab.js";
import { s_MODULE_ID, s_EVENT_NAME, CLASS_PINNED_TAB_MESSAGE, CLASS_PINNED_MESSAGE, ENUM_IS_PINNED_VALUE, PINNED_FOR_ALL, checkIsPinned, allowToPinMessage } from "./script/utils.js"

let isChatTab = false;

/***********************************
 * HOOKS LISTENER
********************************/

Hooks.once('setup', function () {
    console.log(`${s_MODULE_ID} | setup to ${s_MODULE_ID}`);

    game.settings.register(s_MODULE_ID, 'minimalRoleToPinnedOther', {
        name: game.i18n.localize('PCM.settings.minimalRole.name'),
        hint: game.i18n.localize('PCM.settings.minimalRole.hint'),
        default: CONST.USER_ROLES.GAMEMASTER,
        choices: Object.entries(CONST.USER_ROLES).reduce(
            //Generate object of role with id for value
            (accumulator, [label, id]) => {
                const capLabel = label[0].toUpperCase() + label.slice(1).toLowerCase()
                const localizeLabel = game.i18n.localize(`USER.Role${capLabel}`)
                accumulator[id] = localizeLabel;
                return accumulator
            },
            {}
        ),
        type: String,
        scope: 'world',
        config: true,
        requiresReload: true,
    });

    game.settings.register(s_MODULE_ID, 'protectPinnedFromDeletion', {
        name: game.i18n.localize('PCM.settings.protectPinnedFromDeletion.name'),
        hint: game.i18n.localize('PCM.settings.protectPinnedFromDeletion.hint'),
        default: true,
        type: Boolean,
        scope: 'world',
        config: true,
    });

    game.settings.register(s_MODULE_ID, 'disablePinForAll', {
        name: game.i18n.localize('PCM.settings.disablePinForAll.name'),
        hint: game.i18n.localize('PCM.settings.disablePinForAll.hint'),
        default: false,
        type: Boolean,
        scope: 'world',
        config: true,
        requiresReload: true,
    });

    game.settings.register(s_MODULE_ID, 'disableSelfPin', {
        name: game.i18n.localize('PCM.settings.disableSelfPin.name'),
        hint: game.i18n.localize('PCM.settings.disableSelfPin.hint'),
        default: false,
        type: Boolean,
        scope: 'world',
        config: true,
        requiresReload: true,
    });

    addMigrationSettings()

    listenSocket()
})

Hooks.once('ready', function () {
    console.log(`${s_MODULE_ID} | ready to ${s_MODULE_ID}`);

    getCurrentTab().addClass('active')

    migrateModule()

    game.modules.get(s_MODULE_ID).api = pinnedApi
})

//Add chatlog type navigation
Hooks.on("renderChatLog", async function (chatLog, html, user) {
    if (chatLog instanceof foundry.applications.api.ApplicationV2) html = $(chatLog.element);

    initTab(html, chatLog)

    //Check the activation of chat tab
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            const currentClassState = mutation.target.classList.contains('active')
            if (!currentClassState) {
                isChatTab = false
            } else if (!isChatTab && currentClassState) {
                //If we active the chat Tab we add the activation class on sub class
                isChatTab = true
                getCurrentTab().addClass('active');
            }
        });
    });

    observer.observe(html[0], {
        attributes: true,
        attributeFilter: ['class']
    });
});

Hooks.on("renderChatMessage", (chatMessage, html, data) => {
    const buttonDisable = !game.user.isGM
        && game.settings.get(s_MODULE_ID, "disablePinForAll")
        && game.settings.get(s_MODULE_ID, "disableSelfPin")

    const allowMessageUpdate = chatMessage.canUserModify(Users.instance.current, 'update')
        || game.user.role >= game.settings.get(s_MODULE_ID, "minimalRoleToPinnedOther")

    if (!buttonDisable && allowMessageUpdate) {
        addPinnedButton(html, chatMessage);
    }

    if (checkIsPinned(chatMessage) !== ENUM_IS_PINNED_VALUE.none) {
        const htmlMessage = $("#chat-log").find(`.${CLASS_PINNED_TAB_MESSAGE}[data-message-id="${chatMessage.id}"]`)
        if (htmlMessage.length) {
            //Already generate message in pinned tab
            htmlMessage.remove()
        }

        html.addClass(CLASS_PINNED_MESSAGE)
    }

    if (getCurrentTabId() === PINNED_TAB_NAME && !html.hasClass(CLASS_PINNED_MESSAGE)) {
        html.hide();
    }
});

Hooks.on("preDeleteChatMessage", (chatMessage, option) => {
    //Check pinned message on the flush chat button
    if (game.user.isGM
        && game.settings.get(s_MODULE_ID, "protectPinnedFromDeletion")
        && chatMessage.flags?.pinnedChat?.pinned?.length > 0) {
        return false
    }
});

Hooks.on('getChatLogEntryContext', getChatMessageContextOptions); //v12 compatibility 

Hooks.on('getChatMessageContextOptions', getChatMessageContextOptions);

function getChatMessageContextOptions(_chatLogApp, entries) {
    const getmessage = (li) => game.messages.get(li.dataset?.messageId ?? li.data('messageId')) //li.data('messageId') is for v12 compatibility

    entries.unshift(
        {
            name: game.i18n.localize('PCM.allPin'),
            icon: '<i class="fas fa-map-pin"></i>',
            condition: (li) => {
                if (!game.user.isGM && game.settings.get(s_MODULE_ID, 'disablePinForAll')) return false

                const chatMessage = getmessage(li);
                return checkIsPinned(chatMessage) !== ENUM_IS_PINNED_VALUE.all && allowToPinMessage(chatMessage);
            },
            callback: async (li) => {
                const chatMessage = getmessage(li);
                pinnedMessage(chatMessage)
            }
        },
        {
            name: game.i18n.localize('PCM.selfPin'),
            icon: '<i class="fas fa-map-pin"></i>',
            condition: (li) => {
                if (!game.user.isGM && game.settings.get(s_MODULE_ID, 'disableSelfPin')) return false

                const chatMessage = getmessage(li);
                return checkIsPinned(chatMessage) !== ENUM_IS_PINNED_VALUE.self && allowToPinMessage(chatMessage);
            },
            callback: async (li) => {
                const chatMessage = getmessage(li);
                pinnedMessage(chatMessage, { target: game.user.id })
            },
        },
        {
            name: game.i18n.localize('PCM.unPin'),
            icon: '<i class="fas fa-map-pin"></i>',
            condition: (li) => {
                const chatMessage = getmessage(li);
                const pinnedStatus = checkIsPinned(chatMessage)

                const disablePin = !game.user.isGM
                    && (
                        (pinnedStatus === ENUM_IS_PINNED_VALUE.all && game.settings.get(s_MODULE_ID, 'disablePinForAll'))
                        || (pinnedStatus === ENUM_IS_PINNED_VALUE.self && game.settings.get(s_MODULE_ID, 'disableSelfPin'))
                    )

                return !disablePin && pinnedStatus !== ENUM_IS_PINNED_VALUE.none && allowToPinMessage(chatMessage);
            },
            callback: async (li) => {
                const chatMessage = getmessage(li);
                if (checkIsPinned(chatMessage) === ENUM_IS_PINNED_VALUE.self) {
                    pinnedMessage(chatMessage, { target: game.user.id, active: false })
                } else if (checkIsPinned(chatMessage) === ENUM_IS_PINNED_VALUE.all) {
                    pinnedMessage(chatMessage, { target: PINNED_FOR_ALL, active: false })
                }
            },
        }
    );
}

/**
* Provides the main incoming message registration and distribution of socket messages on the receiving side.
*/
function listenSocket() {
    game.socket.on(s_EVENT_NAME, (data) => {
        if (typeof data !== 'object') { return; }

        //Only GM must update the chatMessage
        if (!game.user.isGM) { return; }

        try {
            if (data.type === 'pinnedUnownedMessage' && data?.payload?.messageId) {
                const chatMessage = ChatMessage.get(data.payload.messageId)

                pinnedMessageUpdate(chatMessage, data?.payload?.pinnedFor)
            }
        }
        catch (err) {
            console.error(err);
        }
    });
}
