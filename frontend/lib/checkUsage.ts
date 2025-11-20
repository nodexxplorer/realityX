// // lib/checkUsage.ts

// // import { pool } from "@/lib/db";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// export async function checkUsage(req: Request) {
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.email) return null;

//   const user = await db.query.users.findFirst({
//     where: (u, { eq }) => eq(u.email, session.user.email!),
//     columns: { credits: true },
//   });

//   return user?.credits || 0;
// }
// // console.log("User with credits:", user);


