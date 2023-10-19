<template>
    <div>
        <div v-for="idx in numberOfDisclosures" :key="idx">
            <Disclosure v-slot="{open}" as="div">
                <DisclosureButton as="template">
                    <slot :name="`button-${idx}`" :open="open">
                        <button class="
                                flex
                                w-full
                                justify-between
                                rounded-lg
                                bg-base-300
                                px-4
                                py-2
                                text-left
                                text-sm
                                font-medium
                                text-base-content
                                transition-all
                                hover:bg-base-300
                                focus:outline-none
                                focus-visible:ring
                                focus-visible:ring-primary/75
                                active:scale-95
                                " @click="(e) => openAccordion(idx, e)" @keydown="(e) => openAccordion(idx, e)">
                            <div>
                                <slot :name="`title-${idx}`">
                                    Title
                                </slot>
                            </div>
                            <i :class="open ? 'rotate-180 transform' : ''"
                                class="bi-chevron-up text-primary transition-transform" />
                        </button>
                    </slot>
                </DisclosureButton>

                <DisclosurePanel v-slot="{close}">
                    <slot :name="`panel-${idx}`">
                        <div class="px-4 pb-2 pt-4 text-start">
                            <slot :name="`content-${idx}`">
                                Content
                            </slot>
                        </div>
                    </slot>
                    <disclosure-button ref="closeButtonRef" class="hidden" :data-accordion-id="idx"
                        @click="close(srcButton)" />
                </DisclosurePanel>
            </Disclosure>
        </div>
    </div>
</template>

<script setup lang="ts">
import {Disclosure, DisclosureButton, DisclosurePanel, } from '@headlessui/vue'
import {ref, } from 'vue'

defineProps({
    numberOfDisclosures: {
        type: Number,
        required: true,
    },
})

const srcButton = ref(null)
const closeButtonRef = ref(null)

let openedAccordion = 0
const openAccordion = (accordionId: number, e = null) => {
    if (e && e.key && e.key !== 'Enter' && e.key !== ' ') {
        return
    }

    srcButton.value = e?.target

    if (accordionId === openedAccordion) {
        openedAccordion = 0
    } else {
        openedAccordion = accordionId
    }

    if (closeButtonRef.value && closeButtonRef.value.length > 0) {
        for (const button of closeButtonRef.value as HTMLButtonElement[]) {
            if (button.el.dataset?.accordionId != accordionId) {
                button.el.click()
            }
        }
    }
}
</script>
