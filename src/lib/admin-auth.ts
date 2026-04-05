import { NextRequest } from "next/server";

export function isAdminRequest(req: NextRequest): boolean {
  const provided = req.headers.get("x-admin-key") || "";
  const expected = process.env.INTERNAL_ADMIN_TOKEN || "";
  return !!expected && provided === expected;
}




