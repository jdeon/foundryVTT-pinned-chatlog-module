import { pinnedMessage } from './pinnedMessage.js'
import { PINNED_FOR_ALL } from './utils.js'

export const pinnedApi = {
    pinnedMessage : (inputMessage, userId) => {
        const message = getMessage(inputMessage)
        const pinnedFor = getPinnedFor(userId, true)

        if(message){
            pinnedMessage(message, pinnedFor)
        }
    },
    unpinnedMessage : (inputMessage, userId) => {
        const message = getMessage(inputMessage)
        const pinnedFor = getPinnedFor(userId, false)

        if(message){
            pinnedMessage(message, pinnedFor)
        }
    },

    togglePinnedMessage : (inputMessage, userId) => {
        const message = getMessage(inputMessage)
        const pinnedFor = getPinnedFor(userId)

        if(message){
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