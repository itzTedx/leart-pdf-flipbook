'use client'

import React, { useCallback, useEffect, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { Document, Page as PDFPage, pdfjs } from 'react-pdf'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import { useResizeObserver } from '@wojtekmaj/react-hooks'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

const Page = React.forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode
    pageNumber: number
    isActive: boolean
    isMobile: boolean
    isCover?: boolean
  }
>(({ pageNumber, isActive, isMobile, isCover, children }, ref) => {
  return (
    <div ref={ref} className={`page shadow-2xl  ${isCover ? 'cover' : ''}`}>
      {children}
    </div>
  )
})

Page.displayName = 'Page'

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
}

const resizeObserverOptions = {}

const maxWidth = 750

export default function FlipBook() {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [pdfLoaded, setPdfLoaded] = useState(false)
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null)
  const [containerWidth, setContainerWidth] = useState<number>()
  const [activePages, setActivePages] = useState<number[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [isCentered, setIsCentered] = useState(true)
  const book = React.useRef<any>(null)

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries

    if (entry) {
      setContainerWidth(entry.contentRect.width)
    }
  }, [])

  useResizeObserver(containerRef, resizeObserverOptions, onResize)

  const updateActivePages = useCallback(() => {
    const newActivePages = [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
      currentPage + 3,
    ].filter((page) => page >= 0 && page < (numPages || 0))
    setActivePages(newActivePages)
  }, [currentPage, numPages])

  useEffect(() => {
    updateActivePages()
    setIsCentered(currentPage === 0)
  }, [currentPage, numPages, updateActivePages])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setPdfLoaded(true)
  }

  const onPage = (e: { data: number }) => {
    setCurrentPage(e.data)
  }

  function handleScroll(event: WheelEvent) {
    if (event.deltaY < 0) {
      // Scrolled up, flip to the next page
      book.current.pageFlip().flipPrev()
    } else if (event.deltaY > 0) {
      book.current.pageFlip().flipPrev()
    }
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-4 overflow-hidden"
      ref={setContainerRef}
    >
      <Card className="w-full bg-transparent shadow-none">
        <div className="relative">
          <Document
            options={options}
            className="rounded-md"
            file="/leart.pdf" // Replace with your PDF file path
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex justify-center items-center h-[733px] md:h-[550px]">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
              </div>
            }
          >
            {pdfLoaded ? (
              <AnimatePresence>
                <motion.div
                  initial={{ x: 0 }}
                  animate={{ x: isCentered ? '-25%' : 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative"
                >
                  {/* @ts-expect-error ignore HTMLFlipBook types */}
                  <HTMLFlipBook
                    width={isMobile ? window.innerWidth - 32 : 836}
                    height={isMobile ? 271 : 467}
                    size="stretch"
                    maxShadowOpacity={0.35}
                    showCover={true}
                    mobileScrollSupport={true}
                    onFlip={onPage}
                    className="mx-auto"
                    ref={book}
                    flippingTime={500}
                    startPage={0}
                    drawShadow={true}
                    useMouseEvents={true}
                  >
                    {Array.from(new Array(numPages), (el, index) => (
                      <Page
                        key={`page_${index}`}
                        pageNumber={index + 1}
                        isActive={activePages.includes(index)}
                        isMobile={isMobile}
                        isCover={index === 0}
                      >
                        {activePages.includes(index) && (
                          <PDFPage
                            pageNumber={index + 1}
                            width={
                              containerWidth
                                ? Math.min(containerWidth, maxWidth)
                                : maxWidth
                            }
                            loading={
                              <div className="flex justify-center items-center h-full">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                              </div>
                            }
                          />
                        )}
                      </Page>
                    ))}
                  </HTMLFlipBook>
                </motion.div>
              </AnimatePresence>
            ) : (
              <Skeleton className="h-[420px] w-[751px]" />
            )}
          </Document>
        </div>
        <div className="mt-9 flex items-center justify-center">
          {pdfLoaded && (
            <Document
              file={'./leart.pdf'}
              onLoadSuccess={onDocumentLoadSuccess}
              options={options}
              loading={null}
              className="flex gap-2"
            >
              {Array.from(new Array(numPages), (_el, index) => (
                <Page
                  key={`page_${index}`}
                  pageNumber={index + 1}
                  isActive={activePages.includes(index)}
                  isMobile={isMobile}
                  isCover={index === 0}
                >
                  <PDFPage
                    pageNumber={index + 1}
                    // className={cn(
                    //   index == currentPage && 'scale-110',
                    //   index === currentPage - 1 && 'scale-110'
                    // )}
                    width={55}
                    onClick={() => book.current.pageFlip().flip(index)}
                    loading={
                      <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full size-4 border-b-2 border-primary" />
                      </div>
                    }
                  />
                </Page>
              ))}
            </Document>
          )}
        </div>
        {pdfLoaded && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
            <Button
              onClick={() => book.current.pageFlip().flip(0)}
              disabled={currentPage === 0}
              variant="outline"
              size="icon"
              className="border-muted-foreground rounded-full"
            >
              <ChevronLeft className="size-5" />
              <ChevronLeft className="size-5 -ml-3.5" />
            </Button>
            <Button
              onClick={() => book.current.pageFlip().flipPrev()}
              disabled={currentPage === 0}
              variant="outline"
              size="icon"
              className="border-muted-foreground rounded-full"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <div className="h-10 w-10 inline-flex items-center justify-center pointer-events-none">
              {currentPage === 0 || currentPage === (numPages as number) - 1
                ? ''
                : currentPage + ','}
              {currentPage + 1}
            </div>
            <Button
              onClick={() => book.current.pageFlip().flipNext()}
              disabled={currentPage === (numPages as number) - 1}
              variant="outline"
              size="icon"
              className="border-muted-foreground rounded-full"
            >
              <ChevronRight className="size-5" />
            </Button>
            <Button
              onClick={() =>
                book.current.pageFlip().flip((numPages as number) - 1)
              }
              disabled={currentPage === (numPages as number) - 1}
              variant="outline"
              size="icon"
              className="border-muted-foreground rounded-full"
            >
              <ChevronRight className="size-5" />
              <ChevronRight className="size-5 -ml-3.5" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

// return (
//   <div className="flex flex-col items-center justify-center min-h-screen bg-stone-950 p-4 overflow-hidden">
//     <Card className="w-full">
//       <div className="relative">
//         <Document
//           options={options}
//           file="/leart.pdf" // Replace with your PDF file path
//           onLoadSuccess={onDocumentLoadSuccess}
//           loading={
//             <div className="flex justify-center items-center h-[733px]">
//               <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
//             </div>
//           }
//         >
//           {pdfLoaded && (
//             <AnimatePresence>
//               <motion.div
//                 initial={{ x: 0 }}
//                 animate={{ x: isCentered ? '25%' : 0 }}
//                 transition={{ duration: 0.5 }}
//                 className="relative"
//               >
//                 {/* @ts-expect-error ignore HTMLFlipBook types */}
//                 <HTMLFlipBook
//                   width={isMobile ? window.innerWidth - 32 : 836}
//                   height={isMobile ? 733 : 470}
//                   size="stretch"
//                   maxShadowOpacity={0.4}
//                   minWidth={750}
//                   maxWidth={1920}
//                   minHeight={420}
//                   maxHeight={1080}
//                   showCover={true}
//                   mobileScrollSupport={true}
//                   onFlip={onPage}
//                   className="mx-auto"
//                   ref={book}
//                   flippingTime={1000}
//                   usePortrait={isMobile}
//                   startPage={0}
//                   drawShadow={true}
//                   useMouseEvents={true}
//                 >
//                   {Array.from(new Array(numPages), (el, index) => (
//                     <Page
//                       key={`page_${index + 1}`}
//                       pageNumber={index + 1}
//                       isActive={activePages.includes(index)}
//                       isMobile={isMobile}
//                     />
//                   ))}
//                 </HTMLFlipBook>
//               </motion.div>
//             </AnimatePresence>
//           )}
//         </Document>
//       </div>
//       {pdfLoaded && (
//         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
//           <Button
//             onClick={() => book.current.pageFlip().flipPrev()}
//             disabled={currentPage === 0}
//             className="bg-primary hover:bg-primary/90"
//           >
//             <ChevronLeft className="mr-2 h-4 w-4" /> Previous
//           </Button>
//           <Button
//             onClick={() => book.current.pageFlip().flipNext()}
//             disabled={currentPage === (numPages as number) - 1}
//             className="bg-primary hover:bg-primary/90"
//           >
//             Next <ChevronRight className="ml-2 h-4 w-4" />
//           </Button>
//         </div>
//       )}
//     </Card>
//   </div>
// )
