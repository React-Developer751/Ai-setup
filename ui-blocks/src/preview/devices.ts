export type Device = 'mobile' | 'tablet' | 'desktop'

/** the screen sizes of the preview (widths in CSS pixels, like a real phone, tablet and laptop) */
export const DEVICES: Record<Device, { label: string; width: number; height: number }> = {
  mobile: { label: 'Mobile', width: 390, height: 844 },
  tablet: { label: 'Tablet', width: 820, height: 1180 },
  desktop: { label: 'Desktop', width: 1280, height: 800 },
}
