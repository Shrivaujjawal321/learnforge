import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/creator/:path*",
    "/learn/:path*",
    "/my-courses/:path*",
    "/certificates/:path*",
    "/student/:path*",
  ],
};
