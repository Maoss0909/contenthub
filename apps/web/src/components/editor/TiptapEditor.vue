<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { Table as TableExtension } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import CharacterCount from '@tiptap/extension-character-count'
import { watch, onBeforeUnmount } from 'vue'
import { useUpload } from '@/composables/useUpload'
import EditorToolbar from './EditorToolbar.vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    editable?: boolean
  }>(),
  {
    modelValue: '',
    placeholder: '开始编写内容...',
    editable: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { uploadImage } = useUpload()

const editor = useEditor({
  content: props.modelValue,
  editable: props.editable,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
    }),
    Image.configure({
      inline: false,
      allowBase64: true,
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        rel: 'noopener noreferrer',
        target: '_blank',
      },
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Underline,
    TableExtension.configure({
      resizable: true,
    }),
    TableRow,
    TableCell,
    TableHeader,
    CharacterCount,
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
  editorProps: {
    handleDrop: (view, event, _slice, moved) => {
      if (moved) return false

      const files = Array.from(event.dataTransfer?.files || [])
      const imageFiles = files.filter((f) => f.type.startsWith('image/'))

      if (imageFiles.length > 0) {
        event.preventDefault()
        imageFiles.forEach(async (file) => {
          const result = await uploadImage(file)
          if (result) {
            const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
            if (pos) {
              const node = view.state.schema.nodes.image.create({ src: result.url })
              const tr = view.state.tr.insert(pos.pos, node)
              view.dispatch(tr)
            }
          }
        })
        return true
      }

      return false
    },
    handlePaste: (view, event) => {
      const items = Array.from(event.clipboardData?.items || [])
      const imageItems = items.filter((item) => item.type.startsWith('image/'))

      if (imageItems.length > 0) {
        event.preventDefault()
        imageItems.forEach(async (item) => {
          const file = item.getAsFile()
          if (!file) return

          const result = await uploadImage(file)
          if (result) {
            const node = view.state.schema.nodes.image.create({ src: result.url })
            const tr = view.state.tr.replaceSelectionWith(node)
            view.dispatch(tr)
          }
        })
        return true
      }

      return false
    },
  },
})

watch(
  () => props.modelValue,
  (value) => {
    if (editor.value && value !== editor.value.getHTML()) {
      editor.value.commands.setContent(value, { emitUpdate: false })
    }
  },
)

watch(
  () => props.editable,
  (value) => {
    if (editor.value) {
      editor.value.setEditable(value)
    }
  },
)

watch(
  () => props.placeholder,
  (value) => {
    if (editor.value) {
      editor.value.setOptions({
        editorProps: {
          attributes: {
            'data-placeholder': value,
          },
        },
      })
    }
  },
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})

defineExpose({
  editor,
})
</script>

<template>
  <div class="rounded-lg border border-border bg-card overflow-hidden">
    <EditorToolbar v-if="editor" :editor="editor" />
    <EditorContent :editor="editor" class="tiptap-wrapper" />
    <div v-if="editor" class="character-count">
      {{ editor.storage.characterCount.characters() }} 字
    </div>
  </div>
</template>

<style scoped>
.tiptap-wrapper :deep(.tiptap) {
  min-height: 400px;
  padding: 1rem;
  outline: none;
}
</style>
