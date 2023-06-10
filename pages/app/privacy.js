import {Container, Divider, Typography} from '@mui/material';

export default function PrivacyPage() {
  return (
    <Container maxWidth="xl" component="main">
      <Typography variant="h3" component="h3" sx={{ mt: 6 }}>
        Privacy Policy for F1Setup App
      </Typography>
      <Divider />
      <Typography variant="p" component="p" sx={{ color: "#777", my: 3 }}>
        This privacy policy is intended for the F1Setup App only, and is independent from the website version.
      </Typography>
      <Typography variant="p" component="p">
        Last Updated: June 10, 2023

        <h2>1. Scope of Policy</h2>
        <p>This Privacy Policy applies only to data collected through the F1Setup App. It does not apply to any other information collected by us through any other means.</p>

        <h2>2. Information We Collect</h2>
        <p>As of the date of this Privacy Policy, the F1Setup App collects no data. You can download, install, and use the F1Setup App without providing any personal information to us.</p>

        <h2>3. How We Use Your Information</h2>
        <p>Since the F1Setup App does not collect any data, there is no information to use or share.</p>

        <h2>4. Sharing and Disclosure of Your Information</h2>
        <p>We do not share or disclose any personal information because we do not collect any data.</p>

        <h2>5. Data Retention</h2>
        <p>Since we do not collect any data, we do not store or retain any information.</p>

        <h2>6. Your Choices and Rights</h2>
        <p>As we do not collect any data, there are no choices or rights to manage.</p>

        <h2>7. Changes to Our Privacy Policy</h2>
        <p>From time to time, we may make changes to this Privacy Policy. If we make any substantial changes to this Privacy Policy and the way in which we use your personal data, we will post these changes on this page and will do our best to notify you of any significant changes. Please check our Privacy Policy on a regular basis.</p>

        <h2>8. Contact Us</h2>
        <p>If you have any questions or comments about this Privacy Policy, please contact us at app&lt;at&gt;nekoko.ee.</p>

        <h2>9. Acceptance of this Privacy Policy</h2>
        <p>By using the F1Setup App, you consent to the terms of this Privacy Policy.</p>
        <p>This Privacy Policy is part of our Terms of Service and by using the F1Setup App, you agree to both.</p>

      </Typography>
    </Container>
  );
}
