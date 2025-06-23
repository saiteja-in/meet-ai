import "server-only";

import arcjet, {
  detectBot,
  fixedWindow,
  protectSignup,
  sensitiveInfo,
  shield,
  slidingWindow,
} from "@arcjet/next";
import { env } from "./env";

export {
  detectBot,
  fixedWindow,
  protectSignup,
  sensitiveInfo,
  shield,
  slidingWindow,
};

export default arcjet({
  key: env.ARCJET_KEY,

  characteristics: ["fingerprint"],

  //define base rules here, can also be emptry if you dont want to have any base rules
  rules: [
    shield({
      mode: "LIVE",
    }),
  ],
});
