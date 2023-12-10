import { pinnedMessage } from './pinnedMessage.js'
import { s_MODULE_ID, PINNED_FOR_ALL } from './utils.js'

export const pinnedApi = {
    pinnedMessage : (inputMessage, userId) => {
        const message = getMessage(inputMessage)
        const pinnedFor = getPinnedFor(userId, true)
        const allowToPinMessage = isPinnedAllow(pinnedFor.target)

        if(!allowToPinMessage){
            console.warn('You are not allowed to pin a message')
        } else if(message){
            pinnedMessage(message, pinnedFor)
        }
    },
    unpinnedMessage : (inputMessage, userId) => {
        const message = getMessage(inputMessage)
        const pinnedFor = getPinnedFor(userId, false)
        const allowToPinMessage = isPinnedAllow(pinnedFor.target)

        if(!allowToPinMessage){
            console.warn('You are not allowed to pin a message')
        } else if(message){
            pinnedMessage(message, pinnedFor)
        }
    },

    togglePinnedMessage : (inputMessage, userId) => {
        const message = getMessage(inputMessage)
        const pinnedFor = getPinnedFor(userId)
        const allowToPinMessage = isPinnedAllow(pinnedFor.target)

        if(!allowToPinMessage){
            console.warn('You are not allowed to pin a message')
        } else if(message){
            pinnedMessage(message, pinnedFor)
        }
    }
  };

  function getMessage (inputMessage) {
    let message
    if(typeof inputMessage === 'string'){
        message = ChatMessage.get(inputMessage)
    } else if (inputMessage instanceof ChatMessage){
        message = inputMessage
    }

    return message
  }

  function getPinnedFor (userId, activePinned) {
    return {
        active : activePinned,
        target : userId !== undefined ? userId : PINNED_FOR_ALL
    }
  }

  function isPinnedAllow(pinTarget){
    return game.user.isGM
        || (pinTarget === PINNED_FOR_ALL && !game.settings.get(s_MODULE_ID, 'disablePinForAll'))
        || (pinTarget !== PINNED_FOR_ALL && !game.settings.get(s_MODULE_ID, 'disableSelfPin'))
  }