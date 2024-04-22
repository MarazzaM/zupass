import { ZuAuthArgs } from "@pcd/zuauth";

/**
 * ZuAuth configuration.
 * Can be found in Podbox in the "ZuAuth Configuration" section of your
 * pipeline dashboard.
 */
export const config: ZuAuthArgs["config"] = [
  {
    pcdType: "eddsa-ticket-pcd",
    publicKey: [
      "1d47687549cb273b6fed3493de5a954920dd0403f8c7eb67c2ff72a26fa4ab62",
      "1144ef5d44e2d8972d7ade8138629ebefb094025ebb4df00ed02e22d9b68e665"
    ],
    eventId: "536c96f5-feb8-4938-bcac-47d4e13847c6",
    eventName: "Test event",
    productId: "9e39949c-b468-4c7e-a6a2-7735521f0bda",
    productName: "GA"
  }
];