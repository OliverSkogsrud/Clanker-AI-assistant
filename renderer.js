const sendButton = document.querySelector(".SendButton")
const answerArea = document.querySelector(".answerArea")
const messageInput = document.querySelector(".textbox")
const modelSelection = document.querySelector("#modelDropdown")

const popup = document.querySelector('.newChatPopup')
const submitButton = document.querySelector('.NewChatSubmit')
const newChat = document.querySelector('.NewChat')
const newChatInput = document.querySelector('.NewChatInput')
const chatsSection = document.querySelector('.Chats')
let chatLabel = document.querySelector('.ChatLabel')
const deleteChat = document.querySelector('.DeleteChat')

const chats = []

let activeChatId = null

////Chat manager functions

function createNewChat(name) {
  const chat = {
    id: crypto.randomUUID(),
    name,
    messages: [],
    Element
  }
  const newChatButton = document.createElement('button');

  newChatButton.classList.add('chatSessionButton');
  newChatButton.textContent = name;
  newChatButton.addEventListener('click', () => switchChat(chat.id));

  chat.Element = newChatButton;

  chatsSection.appendChild(newChatButton);
  chats.push(chat);
  switchChat(chat.id);
}

function getActiveChat() {
  return chats.find(chat => chat.id === activeChatId)
}

function renderActiveChat() {
  const activeChat = getActiveChat()
  answerArea.textContent = activeChat
    ? activeChat.messages.map(message => message.content).join('')
    : ''
}

function switchChat(chatId) {
  if (chatId === activeChatId) {
    return;
  }

  const previousChat = getActiveChat();

  if (previousChat) {
    previousChat.Element.style.boxShadow = "0 0 0 rgb(245, 245, 245)";
  }

  activeChatId = chatId;

  const newActiveChat = getActiveChat();

  if (newActiveChat) {
    newActiveChat.Element.style.boxShadow = "0 0 12px rgb(111, 255, 0)"; 
  }
 

  renderActiveChat()
}

createNewChat('Default');

/////clanker

sendButton.addEventListener("click", async () => {
  const message = messageInput.value.trim()
  if (!message) return

  const activeChat = getActiveChat()
  if (!activeChat) {
    answerArea.textContent += 'Error: No active chat.\n'
    return
  }

  const sentMessage = `You: ${message}\n \n`
  activeChat.messages.push({role: "User", content: sentMessage})
  renderActiveChat()
  messageInput.value = ""
  sendButton.disabled = true

  try {
    answerArea.textContent += 'Thinking... \n \n'
    const answer = await window.openRouter.ask(message)
    const fullAnswer = `${modelSelection.selectedOptions[0].textContent.trim()}: ${answer}\n \n`
    activeChat.messages.push({role: "assistant", content: fullAnswer})
    if (activeChat.id === activeChatId) {
      renderActiveChat()
    }

  } catch (error) {
    answerArea.textContent += `Error: ${error.message}\n`
  } finally {
    sendButton.disabled = false
    answerArea.scrollTop = answerArea.scrollHeight
  }
})

modelSelection.addEventListener("change", async() => {
  selectedModelOption = modelSelection.value

  try{
    await window.openRouter.setModel(selectedModelOption)
  } catch (error)
  {
    answerArea.textContent += `Error setting model! ${error.message} \n \n`
  }
  
})

///create new chats

newChat.addEventListener('click', () => {
  popup.style.display = 'flex';
})

submitButton.addEventListener('click', () => {

  const chatname = newChatInput.value.trim();

  if (!chatname)
  {
    popup.style.display = 'none';
    return;
  }

  popup.style.display = 'none';
  
  createNewChat(chatname);

  newChatInput.value = ''

})

deleteChat.addEventListener('click', () => {
  const activeChat = getActiveChat();

  const activeChatInChats = chats.indexOf(activeChat);

  chats.splice(activeChatInChats, 1)

  switchChat(chats[0])

  activeChat.Element.remove();
})
