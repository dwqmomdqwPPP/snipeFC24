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

                <div class="label">
                    <div class="label-text">Autoselect cards</div>
                </div>
                <radio-group v-model="autoselect" :items="autoselectItems" />

                <h2 class="text-xl font-medium mt-4">Quick List</h2>
                <text-input label="Bid Price" v-model="options.listitem.bidprice" type="number" />
                <text-input label="Buy Now Price" v-model="options.listitem.buynowprice" type="number" />

                <h2 class="text-xl font-medium mt-4">Auto-sniping</h2>
                <text-input label="Minimal Wait Time (ms)" v-model="options.autosniping.wait1" type="number" />
                <text-input label="Maximal Wait Time (ms)" v-model="options.autosniping.wait2" type="number" />
                <p>
                    <span class="font-medium">Note:</span> The actual wait time is a random number between the two
                    values. After each action, we wait a bit to not get banned.
                </p>
                <text-input label="Lowest Bid" v-model="options.autosniping.bidlow" type="number" />
                <text-input label="Highest Bid" v-model="options.autosniping.bidhigh" type="number" />
                <select-input label="Auto-Action" v-model="options.autosniping.autoAction" :options="autoActionOptions" />
                <text-input label="Stop After X Cards" v-model="options.autosniping.max_cards" type="number" />
            </template>

            <template #title-3>Stats</template>
            <template #content-3>
                <h3 class="text-lg font-medium text-emerald-300">Current Session</h3>
                <table class="table mb-4">
                    <tr>
                        <th>Coins spent</th>
                        <td>{{ curStats.currentSession.coinsSpent }}</td>
                    </tr>
                    <tr>
                        <th>Searches</th>
                        <td>{{ curStats.currentSession.searches }}</td>
                    </tr>
                    <tr>
                        <th>Sniped cards</th>
                        <td>{{ curStats.currentSession.snipedCards }}</td>
                    </tr>
                    <tr>
                        <th>Failed snipes</th>
                        <td>{{ curStats.currentSession.failedSnipes }}</td>
                    </tr>
                </table>

                <h3 class="text-lg font-medium text-emerald-300">All time stats</h3>
                <table class="table">
                    <tr>
                        <th>Coins spent</th>
                        <td>{{ curStats.total.coinsSpent }}</td>
                    </tr>
                    <tr>
                        <th>Searches</th>
                        <td>{{ curStats.total.searches }}</td>
                    </tr>
                    <tr>
                        <th>Sniped cards</th>
                        <td>{{ curStats.total.snipedCards }}</td>
                    </tr>
                    <tr>
                        <th>Failed snipes</th>
                        <td>{{ curStats.total.failedSnipes }}</td>
                    </tr>
                </table>
            </template>
        </accordion>

        <div class="mt-6">
            <button class="btn btn-block" @click="toggleAutoSniping"
                :class="[options.autosniping.enabled ? 'btn-error' : 'btn-success']">
                <i class="bi bi-crosshair"></i>
                <span v-if="options.autosniping.enabled">Disable</span>
                <span v-else>Enable</span>
                Auto-Sniping
            </button>
        </div>

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
import SelectInput from '@/components/SelectInput.vue';
import {storage, defaultStorage} from '@/storage';
import {stats, defaultStats} from '@/stats';
import RadioGroup from '@/components/RadioGroup.vue';

const options = ref(defaultStorage)
const curStats = ref(defaultStats)

const saved = refAutoReset(false, 3000)
const autoselect = ref(0)
const autoselectItems = ref([
    {
        title: 'None',
        description: 'The first card will be selected (default)'
    },
    {
        title: 'Newest',
        description: 'The newest (= last) card will be selected',
    },
    {
        title: 'Cheapest',
        description: 'The cheapest card will be selected',
    }
])
const autoActionOptions = [
    {value: 0, label: 'Send To Club', },
    {value: 1, label: 'List On Transfer Market', },
    {value: 2, label: 'Send To Transfer List', },
]

watch(autoselect, (val) => {
    options.value.general.select_card = autoselectItems.value.indexOf(val)
})

const toggleAutoSniping = async () => {
    options.value.autosniping.enabled = !options.value.autosniping.enabled
    await save()
}

const save = async () => {
    await storage.set(options.value)
    saved.value = true
}

const loadOptions = async () => {
    const data = await storage.get()
    options.value = data
    autoselect.value = autoselectItems.value[data.general.select_card]
}

const loadStats = async () => {
    const data = await stats.get()
    curStats.value = data
}

onMounted(async () => {
    await loadOptions()
    await loadStats()
})

chrome.runtime.onInstalled.addListener(async (opt) => {
    if (opt.reason === 'install') {
        await loadOptions()
        await loadStats()
    }
})

chrome.storage.onChanged.addListener(async (changes, area) => {
    if (area === 'sync') {
        await loadOptions()
        await loadStats()
    }
})
</script>
