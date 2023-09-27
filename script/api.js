export const pinnedApi = {
    pinnedMessage : (inputMessage) => {
        const message = getMessage(inputMessage)

        if(message){
            pinnedMessage(message, true)
        }
    },
    unpinnedMessage : (inputMessage) => {
        const message = getMessage(inputMessage)

        if(message){
            pinnedMessage(message, false)
        }
    },

    togglePinnedMessage : (inputMessage) => {
        const message = getMessage(inputMessage)

        if(message){
            pinnedMessage(message)
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