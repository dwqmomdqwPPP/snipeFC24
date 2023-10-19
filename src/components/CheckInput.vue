<template>
    <div
        class="form-control w-full"
        :class="{
            'mb-2':!inline, 
        }"
    >
        <label class="label cursor-pointer justify-normal">
            <input
                :id="`input-${uid}`"
                v-model="inputValue"
                type="checkbox"
                :class="{
                    'ring-2 ring-error': errorMsg,
                    'toggle': asSwitch,
                    'checkbox': !asSwitch,
                }"
                :role="asSwitch ? 'switch' : undefined"
                :disabled="disabled"
            >

            <span class="label-text ms-3">
                <slot>
                    {{ label }}
                </slot>
            </span>
        </label>
        <div
            v-if="errorMsg"
            class="text-sm text-error"
        >
            {{ errorMsg }}
        </div>
    </div>
</template>

<script lang="ts" setup>
import {computed, getCurrentInstance, toRefs,} from 'vue'

let {uid,} = getCurrentInstance()
const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    label: {
        type: String,
        default: '',
    },
    errorMsg: {
        type: String,
        default: '',
    },
    asSwitch: {
        type: Boolean,
        default: false,
    },
    inline: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits([ 'update:modelValue', ])
const {modelValue,label,errorMsg,inline,} = toRefs(props)

const inputValue = computed({
    get () {
        return modelValue.value
    },
    set (newValue) {
        emit('update:modelValue',newValue)
    },
})
</script>
