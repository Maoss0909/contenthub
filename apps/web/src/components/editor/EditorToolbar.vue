<script setup lang="ts">
import { ref } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Link,
  ImageIcon,
  Table,
  Undo2,
  Redo2,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  ChevronDown,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import ImageUpload from './ImageUpload.vue'

const props = defineProps<{
  editor: Editor
}>()

const linkUrl = ref('')
const showLinkDialog = ref(false)
const showTableMenu = ref(false)
const showHeadingMenu = ref(false)

function setLink() {
  if (!linkUrl.value) return

  if (linkUrl.value === '') {
    props.editor.chain().focus().extendMarkRange('link').unsetLink().run()
  } else {
    props.editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: linkUrl.value })
      .run()
  }

  showLinkDialog.value = false
  linkUrl.value = ''
}

function openLinkDialog() {
  const prev = props.editor.getAttributes('link').href
  linkUrl.value = prev || ''
  showLinkDialog.value = true
}

function removeLink() {
  props.editor.chain().focus().extendMarkRange('link').unsetLink().run()
  showLinkDialog.value = false
  linkUrl.value = ''
}

function insertTable() {
  props.editor
    .chain()
    .focus()
    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
    .run()
  showTableMenu.value = false
}

function addTableRow() {
  props.editor.chain().focus().addRowAfter().run()
  showTableMenu.value = false
}

function addTableColumn() {
  props.editor.chain().focus().addColumnAfter().run()
  showTableMenu.value = false
}

function deleteTable() {
  props.editor.chain().focus().deleteTable().run()
  showTableMenu.value = false
}

function handleImageUploaded(url: string) {
  props.editor.chain().focus().setImage({ src: url }).run()
}

function isActive(type: string, attrs?: Record<string, any>): boolean {
  return props.editor.isActive(type, attrs)
}

function closeMenusOnOutsideClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.heading-menu')) showHeadingMenu.value = false
  if (!target.closest('.table-menu')) showTableMenu.value = false
}
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 px-2 py-1.5"
    @click="closeMenusOnOutsideClick"
  >
    <!-- Undo / Redo -->
    <Button
      variant="ghost"
      size="icon-sm"
      class="cursor-pointer"
      :disabled="!editor.can().undo()"
      @click="editor.chain().focus().undo().run()"
    >
      <Undo2 class="size-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon-sm"
      class="cursor-pointer"
      :disabled="!editor.can().redo()"
      @click="editor.chain().focus().redo().run()"
    >
      <Redo2 class="size-4" />
    </Button>

    <div class="mx-1 h-5 w-px bg-border" />

    <!-- Heading Dropdown -->
    <div class="relative heading-menu">
      <Button
        variant="ghost"
        size="sm"
        class="cursor-pointer gap-1"
        @click.stop="showHeadingMenu = !showHeadingMenu"
      >
        <Pilcrow class="size-4" />
        <ChevronDown class="size-3" />
      </Button>
      <div
        v-if="showHeadingMenu"
        class="absolute left-0 top-full z-50 mt-1 min-w-[140px] rounded-md border border-border bg-popover p-1 shadow-md"
      >
        <button
          class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
          :class="{ 'bg-accent': isActive('paragraph') }"
          @click="editor.chain().focus().setParagraph().run(); showHeadingMenu = false"
        >
          <Pilcrow class="size-4" />
          正文
        </button>
        <button
          class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
          :class="{ 'bg-accent': isActive('heading', { level: 1 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run(); showHeadingMenu = false"
        >
          <Heading1 class="size-4" />
          标题 1
        </button>
        <button
          class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
          :class="{ 'bg-accent': isActive('heading', { level: 2 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run(); showHeadingMenu = false"
        >
          <Heading2 class="size-4" />
          标题 2
        </button>
        <button
          class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
          :class="{ 'bg-accent': isActive('heading', { level: 3 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run(); showHeadingMenu = false"
        >
          <Heading3 class="size-4" />
          标题 3
        </button>
      </div>
    </div>

    <div class="mx-1 h-5 w-px bg-border" />

    <!-- Text Formatting -->
    <Button
      variant="ghost"
      size="icon-sm"
      class="cursor-pointer"
      :class="{ 'bg-accent': isActive('bold') }"
      @click="editor.chain().focus().toggleBold().run()"
    >
      <Bold class="size-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon-sm"
      class="cursor-pointer"
      :class="{ 'bg-accent': isActive('italic') }"
      @click="editor.chain().focus().toggleItalic().run()"
    >
      <Italic class="size-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon-sm"
      class="cursor-pointer"
      :class="{ 'bg-accent': isActive('underline') }"
      @click="editor.chain().focus().toggleUnderline().run()"
    >
      <Underline class="size-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon-sm"
      class="cursor-pointer"
      :class="{ 'bg-accent': isActive('strike') }"
      @click="editor.chain().focus().toggleStrike().run()"
    >
      <Strikethrough class="size-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon-sm"
      class="cursor-pointer"
      :class="{ 'bg-accent': isActive('code') }"
      @click="editor.chain().focus().toggleCode().run()"
    >
      <Code class="size-4" />
    </Button>

    <div class="mx-1 h-5 w-px bg-border" />

    <!-- Text Alignment -->
    <Button
      variant="ghost"
      size="icon-sm"
      class="cursor-pointer"
      :class="{ 'bg-accent': isActive('textAlign', { textAlign: 'left' }) }"
      @click="editor.chain().focus().setTextAlign('left').run()"
    >
      <AlignLeft class="size-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon-sm"
      class="cursor-pointer"
      :class="{ 'bg-accent': isActive('textAlign', { textAlign: 'center' }) }"
      @click="editor.chain().focus().setTextAlign('center').run()"
    >
      <AlignCenter class="size-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon-sm"
      class="cursor-pointer"
      :class="{ 'bg-accent': isActive('textAlign', { textAlign: 'right' }) }"
      @click="editor.chain().focus().setTextAlign('right').run()"
    >
      <AlignRight class="size-4" />
    </Button>

    <div class="mx-1 h-5 w-px bg-border" />

    <!-- Lists -->
    <Button
      variant="ghost"
      size="icon-sm"
      class="cursor-pointer"
      :class="{ 'bg-accent': isActive('bulletList') }"
      @click="editor.chain().focus().toggleBulletList().run()"
    >
      <List class="size-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon-sm"
      class="cursor-pointer"
      :class="{ 'bg-accent': isActive('orderedList') }"
      @click="editor.chain().focus().toggleOrderedList().run()"
    >
      <ListOrdered class="size-4" />
    </Button>

    <!-- Blockquote -->
    <Button
      variant="ghost"
      size="icon-sm"
      class="cursor-pointer"
      :class="{ 'bg-accent': isActive('blockquote') }"
      @click="editor.chain().focus().toggleBlockquote().run()"
    >
      <Quote class="size-4" />
    </Button>

    <div class="mx-1 h-5 w-px bg-border" />

    <!-- Link -->
    <Button
      variant="ghost"
      size="icon-sm"
      class="cursor-pointer"
      :class="{ 'bg-accent': isActive('link') }"
      @click="openLinkDialog"
    >
      <Link class="size-4" />
    </Button>

    <!-- Image -->
    <ImageUpload @uploaded="handleImageUploaded">
      <template #trigger="{ loading }">
        <Button variant="ghost" size="icon-sm" class="cursor-pointer" :disabled="loading">
          <ImageIcon class="size-4" />
        </Button>
      </template>
    </ImageUpload>

    <!-- Table Dropdown -->
    <div class="relative table-menu">
      <Button
        variant="ghost"
        size="icon-sm"
        class="cursor-pointer"
        :class="{ 'bg-accent': isActive('table') }"
        @click.stop="showTableMenu = !showTableMenu"
      >
        <Table class="size-4" />
      </Button>
      <div
        v-if="showTableMenu"
        class="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-md border border-border bg-popover p-1 shadow-md"
      >
        <button
          class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
          @click="insertTable"
        >
          <Table class="size-4" />
          插入表格
        </button>
        <template v-if="isActive('table')">
          <button
            class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
            @click="addTableRow"
          >
            添加行
          </button>
          <button
            class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
            @click="addTableColumn"
          >
            添加列
          </button>
          <button
            class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 cursor-pointer"
            @click="deleteTable"
          >
            删除表格
          </button>
        </template>
      </div>
    </div>
  </div>

  <!-- Link Dialog -->
  <Teleport to="body">
    <div
      v-if="showLinkDialog"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
      @click.self="showLinkDialog = false"
    >
      <div class="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <h3 class="mb-4 text-lg font-semibold text-foreground">插入链接</h3>
        <input
          v-model="linkUrl"
          type="url"
          placeholder="https://example.com"
          class="mb-4 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          @keydown.enter="setLink"
        />
        <div class="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            class="cursor-pointer"
            @click="showLinkDialog = false"
          >
            取消
          </Button>
          <Button
            v-if="isActive('link')"
            variant="destructive"
            size="sm"
            class="cursor-pointer"
            @click="removeLink"
          >
            移除链接
          </Button>
          <Button
            size="sm"
            class="cursor-pointer"
            @click="setLink"
          >
            确定
          </Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
