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
        <div class="h-full grow flex flex-col overflow-y-auto">
          <div class="grow bg-white">
            <div
              v-for="message in chatStore.getMessages(selectedRoom)"
              :key="message.id"
              class="justify-start p-2 text-black"
            >
              [{{ message.timestamp }}] {{ message.sender }}:
              {{ message.content }}
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
              @keyup.enter="sendMessage(newMessage)"
            />
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
const selectedRoom = ref("")

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
  console.log("room", room.name)
  selectedRoom.value = room.name
  await chatStore.joinChatRoom(room.name)
}

async function sendMessage(msg: string) {
  console.log("msg", msg)
  await chatStore.sendMessage(msg, selectedRoom.value)
  newMessage.value = ""
}
</script>
