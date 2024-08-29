'use client'

import React, { useEffect, useRef } from 'react'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import 'pdfjs-dist/build/pdf.worker.entry' // Import worker for PDF.js
import { pdfjs } from 'react-pdf'

interface SinglePagePDFViewerProps {
  fileUrl: string // URL or path of the PDF file
  pageNumber: number // The page number to render (1-based)
}

const SinglePagePDFViewer: React.FC<SinglePagePDFViewerProps> = ({
  fileUrl,
  pageNumber,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const renderPDFPage = async () => {
      if (!canvasRef.current) return

      // Configure the worker
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

      try {
        // Load the PDF document
        const pdf = await getDocument(fileUrl).promise

        // Get the specified page
        const page = await pdf.getPage(pageNumber)
        const viewport = page.getViewport({ scale: 1.5 }) // Adjust scale for better resolution

        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        if (!context) return

        // Set canvas dimensions
        canvas.width = viewport.width
        canvas.height = viewport.height

        // Render the page onto the canvas
        await page.render({ canvasContext: context, viewport }).promise
      } catch (error) {
        console.error('Error rendering PDF page:', error)
      }
    }

    renderPDFPage()
  }, [fileUrl, pageNumber])

  return <canvas ref={canvasRef} style={{ border: '1px solid #ddd' }} />
}

export default SinglePagePDFViewer
