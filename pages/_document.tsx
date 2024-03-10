import { Html, Head, Main, NextScript } from 'next/document'

export default function Document(pageProps: any) {
  return (
    <Html lang="en">
      <Head />
      <body className="
          transition-all
        bg-pagebg-light dark:bg-pagebg-dark
        text-text-light dark:text-text-dark
      ">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
