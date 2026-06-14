import GoogleAd from "./GoogleAd";
import { Container } from "./ui/Container";

export default function Footer() {
  return (
    <Container className="pt-4 pb-6">
      <hr className="border-line" />
      <div className="p-5">
        <GoogleAd
          style={{ display: "block" }}
          googleAdId="ca-pub-3253159471656308"
          format="autorelaxed"
          slot="1185564246"
        />
      </div>
      <p className="text-zinc-300">
        Another ieb Project &middot;{" "}
        GitHub: <a href="https://github.com/iebb/F1Manager-Calc">iebb/F1Manager-Calc</a> &middot;{" "}
        Contact: <a href="https://twitter.com/CyberHono">@CyberHono</a>
      </p>
      <p className="pt-3 text-xs text-zinc-500">
        This website is unofficial and is not associated in any way with the Formula 1 companies. F1, FORMULA ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX and related marks are trade marks of Formula One Licensing B.V.
      </p>
    </Container>
  );
}
