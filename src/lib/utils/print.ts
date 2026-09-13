import { ReactElement } from "react"

/**
 * Renders a @react-pdf/renderer component to a Blob and opens it in a new window for printing.
 */
export async function printPDF(component: ReactElement) {
  try {
    // Dynamically import to avoid SSR issues
    const { pdf } = await import('@react-pdf/renderer')
    const blob = await pdf(component).toBlob()
    const url = URL.createObjectURL(blob)
    
    // Open in new window
    const printWindow = window.open(url)
    
    if (printWindow) {
      // Trigger print dialog after a short delay to ensure PDF is loaded
      setTimeout(() => {
        printWindow.print()
      }, 500)
    } else {
      console.error("Popup blocked. Could not open print window.")
      alert("Please allow popups to print receipts.")
    }
  } catch (error) {
    console.error("Error generating PDF:", error)
  }
}
