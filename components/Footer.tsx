import {Container, Divider, Typography} from "@mui/material";
import GoogleAd from "./GoogleAd";

export default function Footer() {
  return (
    <Container  maxWidth="xl" component="main" sx={{ pt: 2, pb: 3 }}>
      <GoogleAd
        style={{ display: 'block' }}
        googleAdId="ca-pub-3253159471656308"
        format="autorelaxed"
        slot="1185564246"
      />
      <Divider variant="fullWidth" />
      <Typography>
        Another ieb Project &middot; {' '}
        GitHub: <a href="https://github.com/iebb/F1Manager-Calc">iebb/F1Manager-Calc</a> &middot; {' '}
        Contact: <a href="https://twitter.com/CyberHono">@CyberHono</a>
      </Typography>
    </Container>
  )
}