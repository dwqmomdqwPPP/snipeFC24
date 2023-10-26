<template>
    <RadioGroup v-model="selected">
        <RadioGroupLabel class="sr-only">
            Server size
        </RadioGroupLabel>
        <div class="space-y-2">
            <RadioGroupOption
                v-for="(item, index) in items"
                :key="index"
                v-slot="{ active, checked }"
                as="template"
                :value="item"
            >
                <slot
                    name="options"
                    :item="item"
                    :active="active"
                    :checked="checked"
                >
                    <div
                        :class="[
                            active
                                ? 'ring-2 ring-primary/60 ring-offset-2 ring-offset-base-100'
                                : '',
                            checked ? 'bg-primary/75 text-white ' : 'bg-base-300 ',
                        ]"
                        class="
                            relative
                            flex
                            cursor-pointer
                            rounded-lg
                            px-5
                            py-4
                            shadow-md
                            transition-all
                            duration-200
                            focus:outline-none
                            active:scale-95
                            "
                    >
                        <div class="flex w-full items-center justify-between">
                            <div class="flex items-center">
                                <div class="text-sm">
                                    <RadioGroupLabel
                                        as="p"
                                        :class="checked ? 'text-white' : 'text-base-content'"
                                        class="font-medium"
                                    >
                                        {{ item.title }}
                                    </RadioGroupLabel>
                                    <RadioGroupDescription
                                        as="span"
                                        :class="checked ? 'text-white' : 'text-base-content/70'"
                                        class="inline"
                                    >
                                        {{ item.description }}
                                    </RadioGroupDescription>
                                </div>
                            </div>
                            <div
                                v-show="checked"
                                class="shrink-0 text-white"
                            >
                                <i class="bi-check-lg" />
                            </div>
                        </div>
                    </div>
                </slot>
            </RadioGroupOption>
        </div>
    </RadioGroup>
</template>

<script setup lang="ts">
import { RadioGroup, RadioGroupDescription, RadioGroupLabel, RadioGroupOption, } from '@headlessui/vue'
import {computed, toRefs,} from 'vue'

const props = defineProps({
    items: {
        type: Array,
        required: true,
    },
    modelValue: {
        type: Object,
        default: () => {},
    },
})

const emit = defineEmits([ 'update:modelValue', ])
const {modelValue,} = toRefs(props)

const selected = computed({
    get () {
        return modelValue.value
    },
    set (newValue) {
        emit('update:modelValue', newValue)
    },
})
</script>
