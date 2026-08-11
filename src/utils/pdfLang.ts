import type jsPDF from 'jspdf'
import { NOTO_SANS_TAMIL_BASE64, NOTO_SANS_DEVANAGARI_BASE64 } from './pdfFonts'

export type PdfLang = 'en' | 'ta' | 'hi'

/**
 * jsPDF's built-in fonts (Helvetica/Times/Courier) only contain Latin
 * glyphs. Without registering a Unicode font first, any Tamil or Hindi
 * text passed to doc.text() renders as missing-glyph boxes or the wrong
 * symbols. Call this once per document, then switch fonts per language
 * with setPdfLangFont() before writing each block of text.
 */
export function registerPdfFonts(doc: jsPDF) {
  doc.addFileToVFS('NotoSansTamil.ttf', NOTO_SANS_TAMIL_BASE64)
  doc.addFont('NotoSansTamil.ttf', 'NotoSansTamil', 'normal')

  doc.addFileToVFS('NotoSansDevanagari.ttf', NOTO_SANS_DEVANAGARI_BASE64)
  doc.addFont('NotoSansDevanagari.ttf', 'NotoSansDevanagari', 'normal')
}

export function setPdfLangFont(doc: jsPDF, lang: PdfLang) {
  if (lang === 'ta') doc.setFont('NotoSansTamil', 'normal')
  else if (lang === 'hi') doc.setFont('NotoSansDevanagari', 'normal')
  else doc.setFont('helvetica', 'normal')
}
