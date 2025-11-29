import './globals.css' // Yahan hum apki CSS load kar rahe hain

export const metadata = {
  title: 'Niti.ai',
  description: 'Indian Government Scheme Assistant',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}