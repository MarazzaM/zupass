import { requestVerifyToken } from "@pcd/passport-interface";
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { appConfig } from "../../src/appConfig";
import { useDispatch, useQuery, useSelf } from "../../src/appHooks";
import { validateEmail } from "../../src/util";
import {
  BackgroundGlow,
  CenterColumn,
  H1,
  HR,
  Spacer,
  TextCenter
} from "../core";
import { LinkButton } from "../core/Button";
import { AppContainer } from "../shared/AppContainer";
import { NewPasswordForm } from "../shared/NewPasswordForm";

export function CreatePasswordScreen() {
  const dispatch = useDispatch();
  const self = useSelf();
  const query = useQuery();
  const email = query?.get("email");
  const token = query?.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revealPassword, setRevealPassword] = useState(false);

  const redirectToLoginPageWithError = useCallback((e: Error | string) => {
    console.error(e);
    window.location.hash = "#/login";
    window.location.reload();
  }, []);

  const checkIfShouldRedirect = useCallback(async () => {
    if (!email || !validateEmail(email) || !token) {
      return redirectToLoginPageWithError(
        "Invalid email or token, redirecting to login"
      );
    }

    const verifyTokenResult = await requestVerifyToken(
      appConfig.passportServer,
      email,
      token
    );

    if (!verifyTokenResult.success) {
      return redirectToLoginPageWithError(
        "Invalid email or token, redirecting to login"
      );
    }
  }, [email, redirectToLoginPageWithError, token]);

  useEffect(() => {
    checkIfShouldRedirect();
  }, [checkIfShouldRedirect]);

  useEffect(() => {
    // Redirect to home if already logged in
    if (self != null) {
      window.location.hash = "#/";
    }
  }, [self]);

  return (
    <AppContainer bg="primary">
      <BackgroundGlow
        y={224}
        from="var(--bg-lite-primary)"
        to="var(--bg-dark-primary)"
      >
        <Spacer h={64} />
        <Header />
        <Spacer h={24} />

        <CenterColumn w={280}>
          <NewPasswordForm
            email={email}
            password={password}
            confirmPassword={confirmPassword}
            setPassword={setPassword}
            setConfirmPassword={setConfirmPassword}
            revealPassword={revealPassword}
            setRevealPassword={setRevealPassword}
            submitButtonText="Continue"
            onSuccess={() =>
              dispatch({
                type: "login",
                email,
                token,
                password
              })
            }
          />
        </CenterColumn>
        <Spacer h={24} />
        <HR />
        <Spacer h={24} />
        <CenterColumn w={280}>
          <LinkButton to={"/"}>Cancel</LinkButton>
        </CenterColumn>
      </BackgroundGlow>
      <Spacer h={64} />
    </AppContainer>
  );
}

function Header() {
  return (
    <TextCenter>
      <H1>PCDPASS</H1>
      <Spacer h={24} />
      <Description>
        Choose a secure, unique password. This password will be used to generate
        your key to secure your data.
      </Description>
    </TextCenter>
  );
}

const Description = styled.p`
  font-weight: 300;
  width: 220px;
  margin: 0 auto;
`;
