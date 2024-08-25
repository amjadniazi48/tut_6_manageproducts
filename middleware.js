import { NextResponse } from "next/server";
import { getUserMeLoader } from "@/services/get-user-me-loader";

export async function middleware(request) {
  const user = await getUserMeLoader();
  const currentPath = request.nextUrl.pathname;
   console.log("middleware is called",currentPath);
 // console.log("middleware is called dear",user)
  if (currentPath.startsWith("/products") && user.ok === false) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}