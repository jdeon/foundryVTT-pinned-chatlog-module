import { pinnedApi } from "./script/api.js";
import { addMigrationSettings, migrateModule } from "./script/migrationManager.js"
import { pinnedMessageUpdate, addPinnedButton, pinnedMessage } from "./script/pinnedMessage.js";
import { initTab, getCurrentTab, getCurrentTabId, PINNED_TAB_NAME } from "./script/pinnedTab.js";
import { s_MODULE_ID, s_EVENT_NAME, CLASS_PINNED_TAB_MESSAGE, CLASS_PINNED_MESSAGE, ENUM_IS_PINNED_VALUE, checkIsPinned, allowToPinMessage } from "./script/utils.js"

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
    initTab(html, chatLog)

    //Check the activation of chat tab
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            const currentClassState = mutation.target.classList.contains('active')
            if(!currentClassState){
                isChatTab = false
            } else if(!isChatTab && currentClassState){
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
    if(chatMessage.canUserModify(Users.instance.current,'update') 
    || game.user.role >= game.settings.get(s_MODULE_ID, "minimalRoleToPinnedOther")){
        addPinnedButton(html, chatMessage);
    }

    if(checkIsPinned(chatMessage) !== ENUM_IS_PINNED_VALUE.none){
        const htmlMessage = $("#chat-log").find(`.${CLASS_PINNED_TAB_MESSAGE}[data-message-id="${chatMessage.id}"]`)
        if(htmlMessage.length){
            //Already generate message in pinned tab
            htmlMessage.remove()
        }

        html.addClass(CLASS_PINNED_MESSAGE)
    }

    if (getCurrentTabId() === PINNED_TAB_NAME && !html.hasClass(CLASS_PINNED_MESSAGE)) {
        html.hide();
    }
});

Hooks.on('getChatLogEntryContext', (_chatLogApp, entries) => {
    const getmessage = (li) => game.messages.get(li.data('messageId'))
  
    entries.unshift(
      {
        name:  game.i18n.localize('PCM.allPin'),
        icon: '<i class="fas fa-map-pin"></i>',
        condition: (li) => {
          const chatMessage = getmessage(li);
          return checkIsPinned(chatMessage) !== ENUM_IS_PINNED_VALUE.all && allowToPinMessage(chatMessage);
        },
        callback: async (li) => {
          const chatMessage = getmessage(li);
          pinnedMessage(chatMessage)
        }
      }
    );
  });
  
  /**
  * Provides the main incoming message registration and distribution of socket messages on the receiving side.
  */
  function listenSocket()
  {
     game.socket.on(s_EVENT_NAME, (data) =>
     {
        if (typeof data !== 'object') { return; }
  
        //Only GM must update the chatMessage
        if(!game.user.isGM){ return; }
  
        try
        {
           if (data.type === 'pinnedUnownedMessage' && data?.payload?.messageId) {
            const chatMessage = ChatMessage.get(data.payload.messageId)

            pinnedMessageUpdate(chatMessage, data?.payload?.pinnedFor)
           }
        }
        catch (err)
        {
           console.error(err);
        }
     });
  }
