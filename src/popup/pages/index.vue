<template>
    <div class="m-4">

        <pre>{{ options }}</pre>

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

            <template #title-2>Buy Now</template>
            <template #content-2>
                <text-input label="Buy Now Delay (ms)" v-model="options.buynow.buynow_delay" type="number" />
                <text-input label="Insta-Buy Delay (ms)" v-model="options.buynow.instabuy_delay" type="number" />
            </template>

            <template #title-3>Quick List</template>
            <template #content-3>
                <text-input label="Bid Price" v-model="options.listitem.bidprice" type="number" />
                <text-input label="Buy Now Price" v-model="options.listitem.buynowprice" type="number" />
            </template>
        </accordion>

        <div class="mt-6 text-end">
            <button class="btn" @click="loadOptions">
                Load
            </button>
            <button class="btn" @click="save">
                Save
                <i class="bi bi-check" v-if="saved"></i>
            </button>
            <RouterLink to="/about">About</RouterLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import Accordion from '@/components/Accordion.vue';
import TextInput from '@/components/TextInput.vue';
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
