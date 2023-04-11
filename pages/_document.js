
import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
        <div dangerouslySetInnerHTML={{ __html: `<script defer data-domain="f1setup.it" src="https://analytics.nekoko.it/js/script.js"></script>` }} />
        <Main />
        <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument