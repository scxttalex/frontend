// app/api/auth/set-token/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    // Parse the request body to extract the token
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 400 });
    }

    // Use await to get the cookies object
    const cookieStore = await cookies();

    // Set the token in a secure, HttpOnly cookie
    cookieStore.set("x-access-token", `Bearer ${token}`, {secure: true, sameSite:'none', httpOnly: true});

    return NextResponse.json({ message: "Token set in cookie" });
  } catch (error) {
    console.error("Error setting token:", error);
    return NextResponse.json({ error: "Error setting token" }, { status: 500 });
  }
}
