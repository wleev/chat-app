<template>
  <main class="h-full w-full flex justify-center items-center">
    <div v-if="!chatStore.user" class="">
      <label
        for="username"
        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >Enter your username</label
      >
      <input
        id="username"
        v-model="username"
        type="text"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5"
        placeholder="Your nickname"
        required
        @keyup.enter="onSubmit"
      />
    </div>
    <div v-else class="flex flex-col w-4/5 py-12 h-full gap-4">
      <div>
        <label
          for="chatroom"
          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >Add chatroom</label
        >
        <input
          id="chatroom"
          v-model="newRoom"
          type="text"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5"
          placeholder="New chat room"
          required
          @keyup.enter="createChatRoom"
        />
      </div>
      <div class="flex flex-row grow">
        <div
          class="w-48 text-sm font-medium text-gray-900 bg-transparent border border-gray-200 rounded-lg"
        >
          <button
            v-for="room in chatStore.rooms"
            :key="room.id"
            aria-current="true"
            type="button"
            class="w-full px-4 py-2 font-medium text-left text-white bg-blue-700 border-b border-gray-200 rounded-t-lg cursor-pointer"
            @click="goToRoom(room)"
          >
            {{ room.name }} ({{ room.members.length }})
          </button>
        </div>
        <div
          v-if="selectedRoom"
          class="h-full grow flex flex-col overflow-y-auto"
        >
          <div class="grow bg-white">
            <div
              v-for="(message, idx) in chatStore.getMessages(selectedRoom.name)"
              :key="message.id"
              class="justify-start p-2 text-black"
            >
              <button
                v-if="
                  message.sender == chatStore.user.nickname &&
                  idx === chatStore.messages[selectedRoom.name].length - 1
                "
                class="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
                @click="enableEdit(message.id, message.content)"
              >
                Edit
              </button>
              <span v-if="editMessageId !== message.id">
                [{{ message.timestamp }}] {{ message.sender }}:
                {{ message.content }}
              </span>
              <input
                v-if="editMessageId === message.id"
                v-model="editMessageContent"
                type="text"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 w-full"
                placeholder="Edit your message here"
                required
                :disabled="!selectedRoom"
                @keyup.enter="editMessage(message.id, editMessageContent)"
                @keyup.esc="cancelEdit"
              />
            </div>
          </div>
          <div class="">
            <input
              id="message"
              v-model="newMessage"
              type="text"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 w-full"
              placeholder="type your message here"
              required
              :disabled="!selectedRoom"
              @keyup.enter="sendMessage(newMessage)"
            />
          </div>
        </div>
        <div class="bg-white border-l border-l-black px-4 py-2">
          <div v-for="member in selectedRoom?.members" :key="member.id">
            <p
              class="text-gray-500"
              :class="{ 'text-green-500': member.online }"
            >
              {{ member.nickname }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import type ChatRoom from "@/models/chatroom"
import { useChatStore } from "@/stores/chat"
import { ref } from "vue"

const chatStore = useChatStore()
const username = ref("")
const newRoom = ref("")
const newMessage = ref("")
const selectedRoom = ref<ChatRoom>()
const editMessageId = ref("")
const editMessageContent = ref("")

async function onSubmit() {
  console.log("username", username.value)
  await chatStore.loginUser(username.value)
  await chatStore.getChatrooms()
}

async function createChatRoom() {
  await chatStore.createChatRoom(newRoom.value)
  newRoom.value = ""
}

async function goToRoom(room: ChatRoom) {
  console.log("room", room)
  selectedRoom.value = room
  await chatStore.joinChatRoom(room)
}

async function sendMessage(msg: string) {
  console.log("msg", msg)
  await chatStore.sendMessage(msg, selectedRoom.value!.name)
  newMessage.value = ""
}

async function editMessage(msgId: string, msgContent: string) {
  console.log("msgId", msgId)
  console.log("msgContent", msgContent)
  await chatStore.editMessage(msgContent, msgId, selectedRoom.value!.name)
  editMessageId.value = ""
  editMessageContent.value = ""
}

async function cancelEdit() {
  editMessageId.value = ""
  editMessageContent.value = ""
}

async function enableEdit(msgId: string, msgContent: string) {
  editMessageId.value = msgId
  editMessageContent.value = msgContent
}
</script>
