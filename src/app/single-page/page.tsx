import SinglePagePDFViewer from './single-page-pdf-viewer'

const App = () => {
  return (
    <div>
      <h1>Single Page PDF Viewer</h1>
      {/* Render the first page of the PDF */}
      <SinglePagePDFViewer fileUrl="./leart.pdf" pageNumber={1} />
    </div>
  )
}

export default App
