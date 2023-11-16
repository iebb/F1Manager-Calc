import {Container, Divider, Typography} from "@mui/material";
import LogIn from "./LogIn";
import KofiButton from "./Kofi/Kofi";
import Image from "next/image";

export default function Header() {
  return (
    <Container maxWidth="xl" component="main" sx={{ pt: 2, pb: 3 }}>
      <div className="header-container">
        <div className="header-title" >
          <Typography variant="h3" component="h3">
            F1 Manager Setup Calculator
          </Typography>
        </div>
        <div className="header-user">
          <LogIn />
          <KofiButton kofiID='A0A8ERCTF' title="Support on Ko-fi" color='#29abe0' />
        </div>
      </div>
      <Divider variant="fullWidth" sx={{ mt: 1, mb: 1 }}/>
      <div style={{ display: "flex", flexWrap: 'wrap' }}>
        <div className="header-flex-description">
          <Typography className="header-description">
            Tutorial: <a href="https://steamcommunity.com/sharedfiles/filedetails/?id=2855732906">Steam Guide</a>
            <br />
            Bug & Feedbacks: <a href="https://discord.gg/u46QWWaNfV">Discord</a>
            <br />
            New: <a href="https://save.f1setup.it/">Save Viewer</a> - directly get optimal setups from your savefiles, which might ruin your gaming experiences.
          </Typography>
        </div>
        <div className="header-flex-app-store" >
          <div>
            <a href="https://redirect.badasstemple.eu/f1mcios">
              <Image alt="App Store" src={require(`../assets/AppStore.svg`)} className="inline-block" height={48} />
            </a>
            <a
              href='https://redirect.badasstemple.eu/f1mcandroid'>
              <Image alt='Get it on Google Play' className="inline-block" height={48}
                     src={require(`../assets/en_badge_web_generic.png`)}/>
            </a>
          </div>
          <p style={{ color: "#777", fontSize: 13, lineHeight: 1, margin: 0 }}>we have an app now :)</p>
        </div>
      </div>
      <Divider variant="fullWidth" sx={{ mt: 1 }} />
    </Container>
  )
}