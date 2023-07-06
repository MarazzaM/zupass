import { DateRange, User, ZuzaluUserRole } from "@pcd/passport-interface";
import { SemaphoreSignaturePCDPackage } from "@pcd/semaphore-signature-pcd";
import { useCallback, useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { appConfig } from "../../src/appConfig";
import { createQRProof } from "../../src/createQRProof";
import { DispatchContext } from "../../src/dispatch";
import { encodeQRPayload, makeEncodedVerifyLink } from "../../src/qr";
import { getVisitorStatus, VisitorStatus } from "../../src/user";
import { H3, InfoLine, Spacer, TextCenter } from "../core";
import { icons } from "../icons";
import { QR } from "./QR";

export function MainIdentityCard({
  showQrCode,
  user,
}: {
  showQrCode?: boolean;
  user?: User;
}) {
  const [state, _] = useContext(DispatchContext);
  const actualUser = user ?? state.self;
  const visitorStatus = getVisitorStatus(actualUser);

  return (
    <CardBody>
      {showQrCode &&
        !(
          visitorStatus.isVisitor &&
          visitorStatus.status !== VisitorStatus.Current
        ) && (
          <>
            <Spacer h={32} />
            <IdentityQR />
          </>
        )}
      <Spacer h={24} />
      <TextCenter>
        <H3 col="var(--primary-dark)">{actualUser.name}</H3>
        <InfoLine>{actualUser.email}</InfoLine>
        <VisitorDateSection user={actualUser} />
      </TextCenter>
      <Spacer h={24} />
      {appConfig.isZuzalu && (
        <Footer
          role={actualUser.role}
          notCurrent={
            visitorStatus &&
            visitorStatus.isVisitor &&
            visitorStatus.status !== VisitorStatus.Current
          }
        >
          ZUZALU {actualUser.role.toUpperCase()}
        </Footer>
      )}
    </CardBody>
  );
}

function VisitorDateSection({ user }: { user?: User }) {
  if (!user) return null;
  if (user.role !== ZuzaluUserRole.Visitor) return null;
  if (!user.visitor_date_ranges) return null;

  return (
    <>
      <InfoLine>
        <b>Visitor Dates:</b>
      </InfoLine>
      {user.visitor_date_ranges.map((range, i) => (
        <InfoLine key={i}>
          <DateRangeText range={range} />
        </InfoLine>
      ))}
    </>
  );
}

function DateRangeText({ range }: { range: DateRange }) {
  return (
    <span>
      {new Date(range.date_from).toDateString()} -{" "}
      {new Date(range.date_to).toDateString()}
    </span>
  );
}

const CardBody = styled.div`
  background: var(--white);
  color: var(--primary-dark);
  border-radius: 0 0 12px 12px;
`;

const Footer = styled.div<{ role: string; notCurrent: boolean }>`
  font-size: 20px;
  letter-spacing: 1px;
  background: ${(p) => {
    if (p.notCurrent) {
      return "var(--danger)";
    }

    return highlight(p.role) ? "var(--accent-lite)" : "var(--primary-dark)";
  }};
  color: ${(p) => (highlight(p.role) ? "var(--primary-dark)" : "var(--white)")};
  /* Must be slightly lower than the card's border-radius to nest correctly. */
  border-radius: 0 0 10px 10px;
  padding: 8px;
  text-align: center;
`;

function highlight(role: string) {
  return role === "resident" || role === "organizer";
}

/**
 * Generate a fresh identity-revealing proof every n ms. We regenerate before
 * the proof expires to allow for a few minutes of clock skew between prover
 * and verifier.
 */
const regenerateAfterMs = (appConfig.maxProofAge * 2) / 3;

interface QRPayload {
  timestamp: number;
  qrPCD: string;
}

function IdentityQR() {
  const [state] = useContext(DispatchContext);
  const { identity, self } = state;
  const { uuid } = self;

  const [qrPayload, setQRPayload] = useState<QRPayload>(() => {
    const { timestamp, qrPCD } = JSON.parse(localStorage["zuzaluQR"] || "{}");
    if (timestamp != null && Date.now() - timestamp < appConfig.maxProofAge) {
      console.log(`[QR] from localStorage, timestamp ${timestamp}`);
      return { timestamp, qrPCD };
    }
  });

  const maybeGenerateQR = useCallback(
    async function () {
      const timestamp = Date.now();
      if (qrPayload && timestamp - qrPayload.timestamp < regenerateAfterMs) {
        console.log(`[QR] not regenerating, timestamp ${timestamp}`);
        return;
      }

      console.log(`[QR] generating proof, timestamp ${timestamp}`);
      const pcd = await createQRProof(identity, uuid, timestamp);
      const serialized = await SemaphoreSignaturePCDPackage.serialize(pcd);
      const stringified = JSON.stringify(serialized);
      console.log(`[QR] generated proof, length ${stringified.length}`);

      const qrPCD = encodeQRPayload(stringified);
      localStorage["zuzaluQR"] = JSON.stringify({ timestamp, qrPCD });
      setQRPayload({ timestamp, qrPCD });
    },
    [identity, qrPayload, uuid]
  );

  // Load or generate QR code on mount, then regenerate periodically
  useEffect(() => {
    maybeGenerateQR();
    const interval = setInterval(maybeGenerateQR, appConfig.maxProofAge / 10);
    return () => clearInterval(interval);
  }, [maybeGenerateQR]);

  if (qrPayload == null) {
    return (
      <QRWrap>
        <QRLogoLoading />
      </QRWrap>
    );
  }

  const qrLink = makeEncodedVerifyLink(qrPayload.qrPCD);
  console.log(`Link, ${qrLink.length} bytes: ${qrLink}`);

  return (
    <QRWrap>
      <QR value={qrLink} bgColor={qrBg} fgColor={qrFg} />
      {appConfig.isZuzalu && <QRLogoDone />}
    </QRWrap>
  );
}

function QRLogoLoading() {
  return <QRLogo width="48" height="48" src={icons.qrCenterLoading} />;
}

function QRLogoDone() {
  return <QRLogo width="48" height="48" src={icons.qrCenter} />;
}

const QRLogo = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

// Style constants
const qrSize = "300px";
const [qrBg, qrFg] = (() => {
  const style = getComputedStyle(document.body);
  const bg = style.getPropertyValue("--white");
  const fg = style.getPropertyValue("--bg-dark-primary");
  return [bg, fg];
})();

const QRWrap = styled.div`
  position: relative;
  width: ${qrSize};
  height: ${qrSize};
  margin: 0 auto;
`;