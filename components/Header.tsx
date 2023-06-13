import {Container, Divider, Typography} from "@mui/material";
import LogIn from "./LogIn";
import KofiButton from "./Kofi/Kofi";
import Image from "next/image";
import styles from './Header.module.css'

export default function Header() {
  return (
    <Container maxWidth="xl" component="main" sx={{ pt: 2, pb: 3 }}>
      <div className={styles.headerContainer}>
        <div className={styles.headerTitle} >
          <Typography variant="h3" component="h3">
            F1 Manager Setup Calculator
          </Typography>
        </div>
        <div className={styles.headerUser}>
          <LogIn />
          <KofiButton kofiID='A0A8ERCTF' title="Support on Ko-fi" color='#29abe0' />
        </div>
      </div>
      <Divider variant="fullWidth" sx={{ mt: 1, mb: 1 }}/>
      <div style={{ display: "flex", flexWrap: 'wrap' }}>
        <div style={{ flex: "1 1 0" }} >
          <Typography className={styles.description}>
            Tutorial: <a href="https://steamcommunity.com/sharedfiles/filedetails/?id=2855732906">Steam Guide</a>
            <br />
            Feedbacks / Bug Report: <a href="https://discord.gg/u46QWWaNfV">Discord</a>
            <br />
            <span className={styles.wideScreenOnly} style={{ color: "#777" }}>
               F1 Manager 2023 Support: unknown (pre-purchased, check after pre-release)
            </span>
          </Typography>
        </div>
        <div style={{ flex: "0 1 160px", textAlign: "right" }} >
          <a href="https://apps.apple.com/jp/app/f1m-setup-calculator/id6449542649?l=en">
            <Image alt="App Store" src={require(`../assets/AppStore.svg`)} style={{ display: 'inline-block' }} height={48} />
          </a>
          <p style={{ color: "#777", fontSize: 13, lineHeight: 1, margin: 0 }}>we have an iOS app now :)</p>
        </div>
      </div>
      <Divider variant="fullWidth" sx={{ mt: 1 }} />
    </Container>
  )
}