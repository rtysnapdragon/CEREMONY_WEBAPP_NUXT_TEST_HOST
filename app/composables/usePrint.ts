// composables/usePrint.ts

import type { LetterData } from '~/composables/useLetterData'
import {
  printLetter as printLetterUtil,
  downloadLetterHtml,
  buildHtml
} from '~/utils/printLetter'

export const usePrint = () => {

  const printLetter = (letter: LetterData, title?: string) => {
    printLetterUtil(letter, title)
  }

  const downloadLetter = (letter: LetterData, filename?: string) => {
    downloadLetterHtml(letter, filename)
  }
  
  const buildHtml = (letter: LetterData, filename?: string) => {
    buildHtml(letter, filename)
  }

  return {
    printLetter,
    downloadLetter,
    buildHtml
  }
}