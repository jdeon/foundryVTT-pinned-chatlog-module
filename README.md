# foundryVTT-pinned-chatlog-module
Module for Foundry VTT. It add another chatlog for pinned message to pinned some chat message in another chatlog in foundry VTT

![image](https://user-images.githubusercontent.com/18675690/176022808-fddf162a-aa87-4231-92a4-67145a842b4d.png)


By default, you can only pinned message that you owned if you're are not GM. But it can be change in the settings


## API
The expose 3 methode by api : game.modules.get('pinned-chat-message').api.methodXXX

### pinnedMessage
```game.modules.get('pinned-chat-message').api.pinnedMessage(inputChatMessage)```
Pinned the input message.
The input message can be a chat message or his id

### unpinnedMessage
```game.modules.get('pinned-chat-message').api.pinnedMessage(unpinnedMessage)```
Unpinned the input message.
The input message can be a chat message or his id

### togglePinnedMessage
```game.modules.get('pinned-chat-message').api.togglePinnedMessage(inputChatMessage)```
Pinned an unpinned input message and unpinned a pinned input message.
The input message can be a chat message or his id