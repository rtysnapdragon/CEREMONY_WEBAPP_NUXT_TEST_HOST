// composables/usePrintPreview.ts

export const usePrintPreview = () => {

  const visible = useState<boolean>(
    'print-preview-visible',
    () => false
  )

  const html = useState<string>(
    'print-preview-html',
    () => ''
  )

  const openPreview = (content: string) => {
    html.value = content
    visible.value = true
  }

  const closePreview = () => {
    visible.value = false
  }

  return {
    visible,
    html,
    openPreview,
    closePreview,
  }
}