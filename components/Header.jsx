import {Container, Divider, Typography} from "@mui/material";
import LogIn from "./LogIn";
import KofiButton from "./Kofi/Kofi";

export default function Header() {
  return (
    <Container maxWidth="xl" component="main" sx={{ pt: 2, pb: 3 }}>
      <div style={{ display: "flex" }}>
        <div style={{ flex: "1 1 0" }} >
          <Typography variant="h3" component="h3">
            F1 Manager Setup Calculator
          </Typography>
        </div>
        <div style={{ flex: "0 1 250px", textAlign: "right" }} >
          <LogIn />
        </div>
      </div>
      <Divider variant="fullWidth" sx={{ mt: 2, mb: 2 }}/>
      <div style={{ display: "flex" }}>
        <div style={{ flex: "1 1 0" }} >
          <Typography sx={{ mt: 1, fontSize: 18 }}>
            Tutorial / Give award / Favourite: <a href="https://steamcommunity.com/sharedfiles/filedetails/?id=2855732906">Steam Guide</a>
          </Typography>
          <Typography sx={{ mt: 1, fontSize: 18 }}>
            Feedbacks / Bug Report: <a href="https://discord.gg/u46QWWaNfV">Discord</a>
          </Typography>
        </div>
        <div style={{ flex: "0 1 200px", textAlign: "right" }} >
          <KofiButton kofiID='A0A8ERCTF' title="Support on Ko-fi" color='#29abe0' />
        </div>
      </div>
      <Divider variant="fullWidth" sx={{ mt: 2 }} />
    </Container>
  )
}