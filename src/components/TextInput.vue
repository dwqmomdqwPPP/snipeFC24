<template>
    <div
        class="form-control w-full"
        :class="{
            'mb-2': !inline,
        }"
    >
        <label
            v-if="label"
            :for="`input-${uid}`"
            class="label"
        >
            <span class="label-text">
                <slot>
                    {{ label }}
                </slot>
            </span>
        </label>

        <textarea
            v-if="type == 'textarea'"
            :id="`input-${uid}`"
            ref="textarea"
            v-model="inputValue"
            class="textarea textarea-bordered w-full resize-none"
            :class="{'textarea-error':errorMsg}"
            :aria-describedby="`input-${uid}`"
            :placeholder="placeholder"
            :name="name ? name : undefined"
            @blur="emit('blur', $event)"
            @focus="selectOnFocus && $event.target.select()"
        />
        <input
            v-else
            :id="`input-${uid}`"
            v-model="inputValue"
            :type="type"
            class="input input-bordered w-full"
            :class="{'input-error':errorMsg}"
            :aria-describedby="`input-${uid}`"
            :placeholder="placeholder"
            :name="name ? name : undefined"
            @blur="emit('blur', $event)"
            @focus="selectOnFocus && $event.target.select()"
        >
        <label
            v-if="errorMsg"
            :for="`input-${uid}`"
            class="label"
        >
            <span
                class="label-text text-error"
                :class="{
                    'absolute w-auto': inline
                }"
            >
                {{ errorMsg }}
            </span>
        </label>
    </div>
</template>

<script lang="ts" setup>
import {useTextareaAutosize,} from '@vueuse/core'
import {computed, getCurrentInstance, ref, toRefs,} from 'vue'

let {uid,} = getCurrentInstance()
const props = defineProps({
    modelValue: {
        type: [ String, Number, ],
        default: '',
    },
    label: {
        type: String,
        default: '',
    },
    type: {
        type: String,
        default: 'text',
    },
    errorMsg: {
        type: String,
        default: '',
    },
    inline: {
        type: Boolean,
        default: false,
    },
    placeholder: {
        type: String,
        default: '',
    },
    name: {
        type: String,
        default: '',
    },
    selectOnFocus: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits([ 'update:modelValue', 'blur', ])
const {modelValue,label,errorMsg,type,inline,placeholder,name,} = toRefs(props)

const inputValue = computed({
    get () {
        return modelValue.value
    },
    set (newValue) {
        emit('update:modelValue',newValue)
    },
})
const textarea = ref<HTMLTextAreaElement>()
useTextareaAutosize({ element: textarea, input: inputValue, })
</script>
