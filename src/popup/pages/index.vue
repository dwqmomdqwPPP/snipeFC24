<template>
    <div class="m-4">
        <h1 class="text-3xl font-bolder mb-4 text-center border-b pb-2">snipeFC24</h1>

        <accordion :number-of-disclosures="3" class="flex flex-col gap-y-4">
            <template #title-1>
                Key Bindings
            </template>
            <template #content-1>
                <pre>u/i: min bid
o/p: max bid
z/x: min buy now
c/v: max buy now
s: search
q: search & insta buy
y: go back
l: list on transfer market
k: enter prices & list on transfer market
g: buy now</pre>
            </template>

            <template #title-2>Settings</template>
            <template #content-2>
                <h2 class="text-xl font-medium">General</h2>
                <text-input label="Action Loop Interval (ms)" v-model="options.general.loop_interval" type="number" />
                <check-input label="Autoselect Newest Result" v-model="options.general.select_last" />

                <h2 class="text-xl font-medium mt-4">Quick List</h2>
                <text-input label="Bid Price" v-model="options.listitem.bidprice" type="number" />
                <text-input label="Buy Now Price" v-model="options.listitem.buynowprice" type="number" />
            </template>

            <template #title-3>Debug Info</template>
            <template #content-3>
                <pre>{{ options }}</pre>
            </template>
        </accordion>

        <div class="mt-6">
            <button class="btn btn-block" @click="save">
                Save
                <i class="bi bi-check" v-if="saved"></i>
            </button>
        </div>
        <div class="mt-6 text-end">
            <RouterLink to="/about">About</RouterLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import Accordion from '@/components/Accordion.vue';
import TextInput from '@/components/TextInput.vue';
import CheckInput from '@/components/CheckInput.vue';
import {storage, defaultStorage} from '@/storage';

const options = ref(defaultStorage)

const saved = refAutoReset(false, 3000)

const save = async () => {
    await storage.set(options.value)
    saved.value = true
}

const loadOptions = async () => {
    const data = await storage.get()
    options.value = data
}

onMounted(async () => {
    await loadOptions()
})

chrome.runtime.onInstalled.addListener(async (opt) => {
    if (opt.reason === 'install') {
        await loadOptions()
    }
})

chrome.storage.onChanged.addListener(async (changes, area) => {
    if (area === 'sync') {
        await loadOptions()
    }
})
</script>
