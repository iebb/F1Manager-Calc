import {Container, Divider, Typography} from "@mui/material";
import GoogleAd from "./GoogleAd";

export default function Footer() {
  return (
    <Container  maxWidth="xl" component="main" sx={{ pt: 2, pb: 3 }}>
      <Divider variant="fullWidth" />
      <div style={{ padding: 20 }}>
        <GoogleAd
          style={{ display: 'block' }}
          googleAdId="ca-pub-3253159471656308"
          format="autorelaxed"
          slot="1185564246"
        />
      </div>
      <Typography>
        Another ieb Project &middot; {' '}
        GitHub: <a href="https://github.com/iebb/F1Manager-Calc">iebb/F1Manager-Calc</a> &middot; {' '}
        Contact: <a href="https://twitter.com/CyberHono">@CyberHono</a>
      </Typography>
    </Container>
  )
}