import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  // Img,
  // Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

type VerificationEmailProps = {
  username: string;
  verificationCode: string;
};

export default function VerificationEmailTemplate({
  username = "harry",
  verificationCode = "hgru3y",
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Clanci Email Verification</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={coverSection}>
            {/* <Section style={imageSection}>
              <Img
                src={`${baseUrl}/static/clanci-logo.png`}
                width="75"
                height="45"
                alt="AWS's Logo"
              />
            </Section> */}
            <Section style={upperSection}>
              <Heading style={h1}>Verify your email address</Heading>
              <Text style={mainText}>
                Hi {username}, Thanks for creating a new account in Clanci. We
                want to make sure it's really you. Please enter the following
                verification code when prompted. If you don&apos;t want to
                create an account, you can ignore this message.
              </Text>
              <Section style={verificationSection}>
                <Text style={verifyText}>Verification code</Text>

                <Text style={codeText}>{verificationCode}</Text>
                <Text style={validityText}>
                  (This code is valid for 1 hours)
                </Text>
              </Section>
            </Section>
            <Hr />
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#fff",
  color: "#212121",
};

const container = {
  padding: "20px",
  margin: "0 auto",
  backgroundColor: "#eee",
};

const h1 = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "20px",
  fontWeight: "bold",
  marginBottom: "15px",
};

// const link = {
//   color: "#2754C5",
//   fontFamily:
//     "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
//   fontSize: "14px",
//   textDecoration: "underline",
// };

const text = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  margin: "24px 0",
};

// const imageSection = {
//   backgroundColor: "#252f3d",
//   display: "flex",
//   padding: "20px 0",
//   alignItems: "center",
//   justifyContent: "center",
// };

const coverSection = { backgroundColor: "#fff" };

const upperSection = { padding: "25px 35px" };

const verifyText = {
  ...text,
  margin: 0,
  fontWeight: "bold",
  textAlign: "center" as const,
};

const codeText = {
  ...text,
  fontWeight: "bold",
  fontSize: "36px",
  margin: "10px 0",
  textAlign: "center" as const,
};

const validityText = {
  ...text,
  margin: "0px",
  textAlign: "center" as const,
};

const verificationSection = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const mainText = { ...text, marginBottom: "14px" };
