<template>
    <div
        :class="[
            inline ? '' : 'mb-4',
        ]"
    >
        <div 
            v-if="label"
            class="label"
        >
            <span class="label-text">
                {{ label }}
            </span>
        </div>

        <Listbox
            v-model="inputValue"
            v-bind="$attrs"
            class="group"
        >
            <div class="relative">
                <ListboxButton
                    class="
                        input
                        input-bordered
                        w-full
                        pr-10
                        text-left
                        group-focus-within:outline
                        group-focus-within:outline-2
                        group-focus-within:outline-offset-2
                        group-focus-within:outline-base-content/20
                        "
                    :class="[
                        errorMsg ? 'input-error' : '',
                    ]"
                >
                    <span class="block truncate">
                        {{ selectedLabel }}
                    </span>
                    <span
                        class="
                            pointer-events-none
                            absolute
                            inset-y-0
                            right-0
                            flex
                            items-center
                            pr-2
                            "
                    >
                        <i class="bi-chevron-expand" />
                    </span>
                </ListboxButton>

                <transition
                    leave-active-class="transition duration-100 ease-in"
                    leave-from-class="opacity-100"
                    leave-to-class="opacity-0"
                >
                    <ListboxOptions
                        class="
                            absolute
                            z-10
                            max-h-60
                            w-full
                            overflow-auto
                            rounded-md
                            bg-base-100
                            py-1
                            text-base
                            shadow-lg
                            ring-1
                            ring-base-300/50
                            focus:outline-none
                            sm:text-sm
                            "
                        :class="[
                            dropUp ? 'bottom-full mb-1' : 'top-full mt-1',
                        ]"
                    >
                        <ListboxOption
                            v-for="option in options"
                            v-slot="{ active, selected }"
                            :key="option?.value ?? option"
                            :value="option?.value ?? option"
                            as="template"
                        >
                            <li
                                :class="[
                                    active ? 'bg-base-200' : '',
                                    'relative cursor-default select-none py-2 pl-10 pr-4'
                                ]"
                            >
                                <span
                                    :class="[
                                        selected ? 'font-medium' : 'font-normal',
                                        'block truncate'
                                    ]"
                                >
                                    {{ option?.label ?? option }}
                                </span>
                                <span 
                                    v-if="selected"
                                    class="
                                        absolute
                                        inset-y-0
                                        left-0
                                        flex
                                        items-center
                                        pl-3
                                        "
                                >
                                    <i class="bi-check-lg" />
                                </span>
                            </li>
                        </ListboxOption>
                    </ListboxOptions>
                </transition>
            </div>
        </Listbox>

        <div 
            v-if="errorMsg"
            class="label"
        >
            <span class="label-text text-error">
                {{ errorMsg }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, toRefs, } from 'vue'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, } from '@headlessui/vue'

const props = defineProps({
    modelValue: {
        type: [ String, Number, ],
        default: '',
    },
    options: {
        type: Array,
        required: true,
    },
    placeholder: {
        type: String,
        default: 'Auswählen...',
    },
    label: {
        type: String,
        default: '',
    },
    errorMsg: {
        type: String,
        default: '',
    },
    inline: {
        type: Boolean,
        default: false,
    },
    dropUp: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits([ 'update:modelValue', ])
const {modelValue, options, placeholder,} = toRefs(props)

const inputValue = computed({
    get () {
        return modelValue.value
    },
    set (newValue) {
        emit('update:modelValue', newValue)
    },
})

const selectedLabel = computed(() => {
    let selected = options.value.find((option) => (option?.value ?? option) === inputValue.value)
    return selected ? selected?.label ?? selected : placeholder.value
})
</script>
