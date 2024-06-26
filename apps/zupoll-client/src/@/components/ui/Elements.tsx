"use client";

import styled from "styled-components";

export const DEFAULT_CONTENT_WIDTH = "520px";

export const Logo = styled.img`
  width: 12rem;
`;

export const RootStyle = styled.div`
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  padding-left: var(--screen-padding);
  padding-right: var(--screen-padding);
  padding-top: var(--screen-padding);
`;

export const ContentContainer = styled.div`
  width: ${DEFAULT_CONTENT_WIDTH};
  max-width: 90%;
  max-width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  flex-direction: column;
  padding-bottom: 64px;
  gap: 1.5rem;
  box-sizing: border-box;
`;
