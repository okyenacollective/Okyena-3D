// Utility functions for parsing iframe embed codes

export function extractSupersplatUrl(input: string): string {
  // If it's already a URL, return it
  if (input.startsWith("http")) {
    return input
  }

  // Try to extract src from iframe
  const iframeRegex = /<iframe[^>]*src=["']([^"']*superspl\.at[^"']*)["'][^>]*>/i
  const match = input.match(iframeRegex)

  if (match && match[1]) {
    return match[1]
  }

  // If no match found, return the original input
  return input
}

export function isValidSupersplatUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname === "superspl.at"
  } catch {
    return false
  }
}

export function formatSupersplatEmbed(url: string): string {
  // Ensure the URL is properly formatted for embedding
  if (!url.includes("superspl.at")) {
    return url
  }

  // If it's a direct superspl.at URL, make sure it's embeddable
  if (url.includes("superspl.at/s?id=")) {
    return url
  }

  return url
}
