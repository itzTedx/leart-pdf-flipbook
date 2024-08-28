'use client'

import { useResizeObserver } from '@wojtekmaj/react-hooks'
import {
  ForwardedRef,
  forwardRef,
  ReactNode,
  useCallback,
  useState,
} from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import '../../polyfills.mjs'

import type { PDFDocumentProxy } from 'pdfjs-dist'
import HTMLFlipBook from 'react-pageflip'

// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   'pdfjs-dist/build/pdf.worker.min.mjs',
//   import.meta.url
// ).toString()

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
}

const resizeObserverOptions = {}

const maxWidth = 750

type PDFFile = string | File | null

interface PagesProps {
  children: ReactNode
}

const Pages = forwardRef<HTMLDivElement, PagesProps>(
  ({ children }, ref: ForwardedRef<HTMLDivElement>) => {
    return (
      <div className="bg-white" ref={ref}>
        {children}
      </div>
    )
  }
)

Pages.displayName = 'Pages'

export default function FlipBook() {
  const [file, setFile] = useState<PDFFile>('./leart.pdf')
  const [numPages, setNumPages] = useState<number>()
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null)
  const [containerWidth, setContainerWidth] = useState<number>()

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries

    if (entry) {
      setContainerWidth(entry.contentRect.width)
    }
  }, [])

  useResizeObserver(containerRef, resizeObserverOptions, onResize)

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void {
    setNumPages(nextNumPages)
  }

  return (
    <div
      className="flex flex-col items-center justify-center h-screen overflow-hidden bg-stone-950 md:justify-center scroll-mx-2"
      ref={setContainerRef}
    >
      {/* @ts-expect-error ignore HTMLFlipBook types */}
      <HTMLFlipBook
        width={750}
        height={418}
        className="z-50"
        showCover={true}
        showPageCorners
        maxShadowOpacity={0.35}
      >
        {Array.from(new Array(numPages), (_el, index) => (
          <Pages key={`page_${index + 1}`}>
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              options={options}
              loading={null}
            >
              <Page
                pageNumber={index + 1}
                width={
                  containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth
                }
              />
            </Document>
          </Pages>
        ))}
      </HTMLFlipBook>
      <div className="mt-9">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          options={options}
          loading={null}
          className="flex gap-2"
        >
          {Array.from(new Array(numPages), (_el, index) => (
            <Page key={`page_${index + 1}`} pageNumber={index + 1} width={55} />
          ))}
        </Document>
      </div>
    </div>
  )
}
