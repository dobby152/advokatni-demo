import crypto from "crypto";

export function makeNonce() {
  return Math.random().toString(16).slice(2, 10) + Date.now().toString(16);
}

export function signTracking(secret: string, payload: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export type TrackingParams = {
  leadId: number;
  slug: string;
  event: string;
  ts: string;
  nonce: string;
  sig: string;
};

export function buildTrackingParams(args: {
  secret: string;
  leadId: number;
  event: string;
  slug: string;
  ts?: string;
  nonce?: string;
}): TrackingParams {
  const ts = args.ts || new Date().toISOString();
  const nonce = args.nonce || makeNonce();
  const payload = `${args.leadId}|${args.event}|${ts}|${nonce}`;
  const sig = signTracking(args.secret, payload);
  return { leadId: args.leadId, event: args.event, slug: args.slug, ts, nonce, sig };
}
